import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, LessThan, Repository } from 'typeorm';
import { AppointmentStatus } from '../appointment/entities/appointment-status.enum';
import { Appointment } from '../appointment/entities/appointment.entity';
import { formatIstSlotRange } from '../common/ist-date-time';
import { MailService, SendMailInput } from '../mail/mail.service';
import {
  SendWhatsAppInput,
  WhatsAppService,
} from '../whatsapp/whatsapp.service';
import { ZoomService } from '../zoom/zoom.service';
import {
  ProviderJob,
  ProviderJobKind,
  ProviderJobStatus,
} from './entities/provider-job.entity';

type EnqueueOptions = { deduplicationKey?: string; maxAttempts?: number };

@Injectable()
export class ProviderJobService {
  private readonly logger = new Logger(ProviderJobService.name);
  private workerActive = false;

  constructor(
    @InjectRepository(ProviderJob)
    private readonly jobRepository: Repository<ProviderJob>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly whatsAppService: WhatsAppService,
    private readonly zoomService: ZoomService,
  ) {}

  enqueueEmail(input: SendMailInput, options: EnqueueOptions = {}) {
    return this.enqueue(ProviderJobKind.EMAIL, input, options);
  }

  enqueueWhatsApp(input: SendWhatsAppInput, options: EnqueueOptions = {}) {
    return this.enqueue(ProviderJobKind.WHATSAPP, input, options);
  }

  enqueueZoomMeeting(appointmentId: string) {
    return this.enqueue(
      ProviderJobKind.ZOOM_MEETING,
      { appointmentId },
      { deduplicationKey: `zoom:appointment:${appointmentId}` },
    );
  }

  async enqueue(
    kind: ProviderJobKind,
    payload: Record<string, unknown>,
    options: EnqueueOptions = {},
  ) {
    if (options.deduplicationKey) {
      const existing = await this.jobRepository.findOne({
        where: { deduplicationKey: options.deduplicationKey },
      });
      if (existing) {
        if (existing.status === ProviderJobStatus.DEAD) {
          Object.assign(existing, {
            status: ProviderJobStatus.PENDING,
            attempts: 0,
            nextAttemptAt: new Date(),
            lockedAt: null,
            lastError: null,
            completedAt: null,
            payload,
          });
          return this.jobRepository.save(existing);
        }
        return existing;
      }
    }

    const job = this.jobRepository.create({
      kind,
      payload,
      deduplicationKey: options.deduplicationKey ?? null,
      maxAttempts: options.maxAttempts ?? 8,
      status: ProviderJobStatus.PENDING,
      nextAttemptAt: new Date(),
    });
    try {
      return await this.jobRepository.save(job);
    } catch (error) {
      if (!options.deduplicationKey) throw error;
      const raced = await this.jobRepository.findOne({
        where: { deduplicationKey: options.deduplicationKey },
      });
      if (raced) return raced;
      throw error;
    }
  }

  findRecent(limit = 100) {
    return this.jobRepository.find({
      order: { createdAt: 'DESC' },
      take: Math.min(Math.max(limit, 1), 500),
    });
  }

  async retry(id: string) {
    const job = await this.jobRepository.findOneByOrFail({ id });
    if (job.status !== ProviderJobStatus.DEAD) {
      throw new BadRequestException('Only dead provider jobs can be retried');
    }
    Object.assign(job, {
      status: ProviderJobStatus.PENDING,
      attempts: 0,
      nextAttemptAt: new Date(),
      lockedAt: null,
      lastError: null,
      completedAt: null,
    });
    return this.jobRepository.save(job);
  }

  @Interval('provider-job-worker', 5_000)
  async processDueJobs() {
    if (this.workerActive) return;
    if (
      this.configService.get<string>('PROVIDER_WORKER_ENABLED', 'true') ===
      'false'
    )
      return;
    this.workerActive = true;
    try {
      await this.recoverStaleJobs();
      const jobs = await this.claimDueJobs();
      await Promise.all(jobs.map((job) => this.processClaimedJob(job)));
    } finally {
      this.workerActive = false;
    }
  }

  private recoverStaleJobs() {
    return this.jobRepository.update(
      {
        status: ProviderJobStatus.PROCESSING,
        lockedAt: LessThan(new Date(Date.now() - 10 * 60 * 1000)),
      },
      {
        status: ProviderJobStatus.PENDING,
        lockedAt: null,
        nextAttemptAt: new Date(),
        lastError: 'Recovered after a stale worker lock.',
      },
    );
  }

  private claimDueJobs() {
    const configured = Number(
      this.configService.get<string>('PROVIDER_WORKER_BATCH_SIZE', '10'),
    );
    const batchSize = Number.isFinite(configured)
      ? Math.min(Math.max(configured, 1), 50)
      : 10;
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(ProviderJob);
      const jobs = await repository
        .createQueryBuilder('job')
        .setLock('pessimistic_write', undefined, ['job'])
        .setOnLocked('skip_locked')
        .where('job.status = :status', { status: ProviderJobStatus.PENDING })
        .andWhere('job.nextAttemptAt <= :now', { now: new Date() })
        .orderBy('job.nextAttemptAt', 'ASC')
        .take(batchSize)
        .getMany();
      if (!jobs.length) return [];
      const lockedAt = new Date();
      await repository.update(
        { id: In(jobs.map((job) => job.id)) },
        { status: ProviderJobStatus.PROCESSING, lockedAt },
      );
      return jobs.map((job) => ({ ...job, lockedAt }));
    });
  }

  private async processClaimedJob(job: ProviderJob) {
    job.attempts += 1;
    try {
      await this.dispatch(job);
      await this.jobRepository.update(job.id, {
        status: ProviderJobStatus.SUCCEEDED,
        attempts: job.attempts,
        payload: { redacted: true },
        completedAt: new Date(),
        lockedAt: null,
        lastError: null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown provider error';
      const dead = job.attempts >= job.maxAttempts;
      await this.jobRepository.update(job.id, {
        status: dead ? ProviderJobStatus.DEAD : ProviderJobStatus.PENDING,
        attempts: job.attempts,
        lockedAt: null,
        lastError: message.slice(0, 4000),
        nextAttemptAt: this.getNextAttemptAt(job.attempts),
      });
      this.logger.error(
        JSON.stringify({
          event: 'provider_job_failed',
          jobId: job.id,
          kind: job.kind,
          attempt: job.attempts,
          dead,
          error: message,
        }),
      );
    }
  }

  private async dispatch(job: ProviderJob) {
    if (job.kind === ProviderJobKind.EMAIL) {
      if (!(await this.mailService.send(job.payload as SendMailInput)))
        throw new Error('Email provider did not accept the message');
      return;
    }
    if (job.kind === ProviderJobKind.WHATSAPP) {
      if (!(await this.whatsAppService.send(job.payload as SendWhatsAppInput)))
        throw new Error('WhatsApp provider did not accept the message');
      return;
    }
    if (job.kind === ProviderJobKind.ZOOM_MEETING) {
      await this.createZoomMeeting(job.payload);
      return;
    }
    throw new Error(`Unsupported provider job kind: ${String(job.kind)}`);
  }

  private async createZoomMeeting(payload: Record<string, unknown>) {
    const appointmentId = payload.appointmentId;
    if (typeof appointmentId !== 'string' || !appointmentId)
      throw new Error('Zoom job is missing appointmentId');
    const repository = this.dataSource.getRepository(Appointment);
    const appointment = await repository.findOne({
      where: { id: appointmentId },
      relations: ['therapist', 'therapist.account', 'slot', 'patient'],
    });
    if (!appointment) throw new Error('Appointment no longer exists');
    if (appointment.status !== AppointmentStatus.CONFIRMED) return;
    if (!appointment.meetingLink) {
      appointment.meetingLink =
        await this.zoomService.createAppointmentMeeting(appointment);
      if (!appointment.meetingLink)
        throw new Error('Zoom did not return a meeting link');
      await repository.save(appointment);
    }
    await this.enqueueMeetingNotifications(appointment);
  }

  private async enqueueMeetingNotifications(appointment: Appointment) {
    if (!appointment.meetingLink) return;
    const slotRange = formatIstSlotRange(
      appointment.slot.startTime,
      appointment.slot.endTime,
    );
    const service = appointment.service ?? 'Therapy session';
    const patientName =
      appointment.contactName ??
      appointment.patient?.fullName ??
      appointment.patient?.email ??
      'Patient';
    const patientEmail = appointment.contactEmail ?? appointment.patient?.email;
    const patientText = [
      'Your Oruma appointment has been confirmed.',
      `Service: ${service}`,
      `Therapist: ${appointment.therapist.name}`,
      `Slot: ${slotRange}`,
      `Join Zoom session: ${appointment.meetingLink}`,
    ].join('\n');
    if (patientEmail)
      await this.enqueueEmail(
        {
          to: patientEmail,
          subject: 'Your Oruma Zoom session link',
          text: patientText,
          html: `<p>${patientText.replace(/\n/g, '<br />')}</p>`,
        },
        {
          deduplicationKey: `appointment:${appointment.id}:zoom:patient-email`,
        },
      );
    if (appointment.therapist.email) {
      const therapistText = [
        'An Oruma appointment has been confirmed.',
        `Patient: ${patientName}`,
        `Service: ${service}`,
        `Slot: ${slotRange}`,
        `Join Zoom session: ${appointment.meetingLink}`,
      ].join('\n');
      await this.enqueueEmail(
        {
          to: appointment.therapist.email,
          subject: 'Confirmed Oruma appointment Zoom link',
          text: therapistText,
          html: `<p>${therapistText.replace(/\n/g, '<br />')}</p>`,
        },
        {
          deduplicationKey: `appointment:${appointment.id}:zoom:therapist-email`,
        },
      );
    }
    if (appointment.contactPhone)
      await this.enqueueWhatsApp(
        { to: appointment.contactPhone, text: patientText },
        { deduplicationKey: `appointment:${appointment.id}:zoom:whatsapp` },
      );
  }

  private getNextAttemptAt(attempts: number) {
    return new Date(
      Date.now() + Math.min(2 ** Math.max(attempts - 1, 0), 60) * 60_000,
    );
  }
}
