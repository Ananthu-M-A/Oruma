import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { DataSource, LessThanOrEqual, Repository } from 'typeorm';
import { Appointment } from '../appointment/entities/appointment.entity';
import { LoginOtp } from '../auth/entities/login-otp.entity';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CaseSheet } from '../case-sheet/entities/case-sheet.entity';
import { Notification } from '../notification/entities/notification.entity';
import { Payment } from '../payment/entities/payment.entity';
import {
  ProviderJob,
  ProviderJobStatus,
} from '../reliability/entities/provider-job.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import { Role, User } from '../user/entities/user.entity';
import { CreatePrivacyRequestDto } from './dto/create-privacy-request.dto';
import { ReviewPrivacyRequestDto } from './dto/review-privacy-request.dto';
import {
  PrivacyRequest,
  PrivacyRequestStatus,
  PrivacyRequestType,
} from './entities/privacy-request.entity';

@Injectable()
export class PrivacyService {
  private workerActive = false;
  constructor(
    @InjectRepository(PrivacyRequest)
    private readonly repository: Repository<PrivacyRequest>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async exportMyData(user: JwtPayload) {
    const [
      account,
      appointments,
      payments,
      tickets,
      caseSheets,
      notifications,
      requests,
    ] = await Promise.all([
      this.dataSource
        .getRepository(User)
        .findOne({ where: { id: user.userId } }),
      this.dataSource.getRepository(Appointment).find({
        where: { patient: { id: user.userId } },
        order: { createdAt: 'ASC' },
      }),
      this.dataSource.getRepository(Payment).find({
        where: { patient: { id: user.userId } },
        order: { createdAt: 'ASC' },
      }),
      this.dataSource.getRepository(Ticket).find({
        where: { createdBy: { id: user.userId } },
        order: { createdAt: 'ASC' },
      }),
      this.dataSource.getRepository(CaseSheet).find({
        where: { patient: { id: user.userId } },
        order: { createdAt: 'ASC' },
      }),
      this.dataSource.getRepository(Notification).find({
        where: { recipient: { id: user.userId } },
        order: { createdAt: 'ASC' },
      }),
      this.repository.find({
        where: { requester: { id: user.userId } },
        order: { createdAt: 'ASC' },
      }),
    ]);
    if (!account) throw new NotFoundException('Account not found');
    return {
      exportedAt: new Date().toISOString(),
      formatVersion: 1,
      account: {
        id: account.id,
        email: account.email,
        role: account.role,
        fullName: account.fullName,
        phone: account.phone,
        age: account.age,
        gender: account.gender,
        healthInfo: account.healthInfo,
        createdAt: account.createdAt,
      },
      appointments: appointments.map((item) => ({
        id: item.id,
        status: item.status,
        notes: item.notes,
        contactName: item.contactName,
        contactEmail: item.contactEmail,
        contactPhone: item.contactPhone,
        service: item.service,
        mode: item.mode,
        sessionCount: item.sessionCount,
        packageName: item.packageName,
        packageOriginalAmount: item.packageOriginalAmount,
        packageOfferAmount: item.packageOfferAmount,
        packageDiscountPercent: item.packageDiscountPercent,
        meetingLink: item.meetingLink,
        meetingLinkAddedAt: item.meetingLinkAddedAt,
        bookingConfirmationSentAt: item.bookingConfirmationSentAt,
        meetingLinkSentAt: item.meetingLinkSentAt,
        reminderSentAt: item.reminderSentAt,
        reservationExpiresAt: item.reservationExpiresAt,
        cancelledAt: item.cancelledAt,
        cancellationReason: item.cancellationReason,
        therapist: item.therapist
          ? {
              id: item.therapist.id,
              name: item.therapist.name,
              title: item.therapist.title,
            }
          : null,
        slot: item.slot
          ? {
              id: item.slot.id,
              startTime: item.slot.startTime,
              endTime: item.slot.endTime,
              status: item.slot.status,
            }
          : null,
        createdAt: item.createdAt,
      })),
      payments: payments.map((item) => ({
        id: item.id,
        appointmentId: item.appointment?.id ?? null,
        amount: item.amount,
        refundedAmount: item.refundedAmount,
        status: item.status,
        provider: item.provider,
        reference: item.reference,
        providerOrderId: item.providerOrderId,
        providerPaymentId: item.providerPaymentId,
        notes: item.notes,
        refundHistory: item.refundHistory,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      tickets: tickets.map((item) => ({
        id: item.id,
        subject: item.subject,
        message: item.message,
        category: item.category,
        status: item.status,
        adminNote: item.adminNote,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      caseSheets: caseSheets.map((item) => ({
        id: item.id,
        appointmentId: item.appointment?.id ?? null,
        therapist: item.therapist
          ? {
              id: item.therapist.id,
              name: item.therapist.name,
              title: item.therapist.title,
            }
          : null,
        presentingConcern: item.presentingConcern,
        clinicalNotes: item.clinicalNotes,
        interventionPlan: item.interventionPlan,
        followUpPlan: item.followUpPlan,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      notifications: notifications.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        body: item.body,
        actionUrl: item.actionUrl,
        metadata: item.metadata,
        readAt: item.readAt,
        createdAt: item.createdAt,
      })),
      privacyRequests: requests.map((item) => ({
        id: item.id,
        type: item.type,
        status: item.status,
        reason: item.reason,
        adminNote: item.adminNote,
        scheduledFor: item.scheduledFor,
        completedAt: item.completedAt,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    };
  }

  findMine(user: JwtPayload) {
    return this.repository.find({
      where: { requester: { id: user.userId } },
      order: { createdAt: 'DESC' },
    });
  }
  findAll() {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  async create(user: JwtPayload, dto: CreatePrivacyRequestDto) {
    if (user.role !== Role.PATIENT)
      throw new BadRequestException(
        'Automated privacy requests currently support patient accounts only',
      );
    const existing = await this.repository.findOne({
      where: {
        requester: { id: user.userId },
        type: dto.type,
        status: PrivacyRequestStatus.PENDING,
      },
    });
    if (existing)
      throw new ConflictException(
        'A matching privacy request is already pending',
      );
    return this.repository.save(
      this.repository.create({
        requester: { id: user.userId } as User,
        type: dto.type,
        reason: dto.reason?.trim() || null,
        status: PrivacyRequestStatus.PENDING,
      }),
    );
  }

  async review(id: string, dto: ReviewPrivacyRequestDto) {
    const request = await this.repository.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Privacy request not found');
    if (request.status === PrivacyRequestStatus.COMPLETED)
      throw new BadRequestException(
        'A completed privacy request cannot be changed',
      );
    request.status = dto.status;
    request.adminNote = dto.adminNote?.trim() || null;
    request.scheduledFor =
      dto.status === PrivacyRequestStatus.APPROVED &&
      request.type === PrivacyRequestType.ERASURE
        ? this.getErasureScheduleDate()
        : null;
    if (
      dto.status === PrivacyRequestStatus.APPROVED &&
      request.type === PrivacyRequestType.EXPORT
    ) {
      request.status = PrivacyRequestStatus.COMPLETED;
      request.completedAt = new Date();
    }
    return this.repository.save(request);
  }

  @Interval('privacy-erasure-worker', 60 * 60 * 1000)
  async runApprovedErasures() {
    if (
      this.workerActive ||
      this.configService.get<string>(
        'PRIVACY_AUTO_ERASURE_ENABLED',
        'false',
      ) !== 'true'
    )
      return;
    this.workerActive = true;
    try {
      const due = await this.repository.find({
        where: {
          type: PrivacyRequestType.ERASURE,
          status: PrivacyRequestStatus.APPROVED,
          scheduledFor: LessThanOrEqual(new Date()),
        },
        take: 20,
      });
      for (const request of due) await this.executeErasure(request.id);
    } finally {
      this.workerActive = false;
    }
  }

  async executeErasure(id: string) {
    const password = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(PrivacyRequest);
      const request = await repository
        .createQueryBuilder('request')
        .setLock('pessimistic_write', undefined, ['request'])
        .leftJoinAndSelect('request.requester', 'requester')
        .where('request.id = :id', { id })
        .getOne();
      if (!request) throw new NotFoundException('Privacy request not found');
      if (
        request.type !== PrivacyRequestType.ERASURE ||
        request.status !== PrivacyRequestStatus.APPROVED
      )
        throw new BadRequestException('Erasure request must be approved first');
      if (!request.requester)
        throw new BadRequestException('The requester account is unavailable');
      const user = request.requester;
      const originalEmail = user.email;
      const originalPhone = user.phone?.replace(/\D/g, '') || null;
      await manager.getRepository(Appointment).update(
        { patient: { id: user.id } },
        {
          contactName: 'Deleted User',
          contactEmail: null,
          contactPhone: null,
          notes: null,
        },
      );
      await manager.getRepository(Ticket).update(
        { createdBy: { id: user.id } },
        {
          message: '[Removed following an approved privacy request]',
          adminNote: null,
        },
      );
      await manager
        .getRepository(Notification)
        .delete({ recipient: { id: user.id } });
      await manager
        .getRepository(LoginOtp)
        .delete([
          { identifier: originalEmail },
          ...(originalPhone ? [{ identifier: originalPhone }] : []),
        ]);
      const jobRepository = manager.getRepository(ProviderJob);
      const jobs = await jobRepository
        .createQueryBuilder('job')
        .where("job.payload ->> 'to' = :email", { email: originalEmail })
        .orWhere(
          originalPhone
            ? "regexp_replace(COALESCE(job.payload ->> 'to', ''), '\\D', '', 'g') = :phone"
            : 'FALSE',
          { phone: originalPhone },
        )
        .getMany();
      for (const job of jobs) {
        job.payload = { redacted: true };
        job.status = ProviderJobStatus.DEAD;
        job.lastError = job.lastError ? '[Redacted privacy-related job]' : null;
      }
      if (jobs.length) await jobRepository.save(jobs);
      const retentionDays = this.getClinicalRetentionDays();
      await manager
        .getRepository(CaseSheet)
        .createQueryBuilder()
        .update(CaseSheet)
        .set({
          presentingConcern: null,
          clinicalNotes: null,
          interventionPlan: null,
          followUpPlan: null,
        })
        .where('"patientId" = :patientId', { patientId: user.id })
        .andWhere('"updatedAt" < :cutoff', {
          cutoff: new Date(Date.now() - retentionDays * 86_400_000),
        })
        .execute();
      Object.assign(user, {
        email: `deleted+${user.id}@privacy.oruma.local`,
        password,
        fullName: 'Deleted User',
        phone: null,
        age: null,
        gender: null,
        healthInfo: null,
        disabledAt: new Date(),
        anonymizedAt: new Date(),
      });
      await manager.getRepository(User).save(user);
      Object.assign(request, {
        reason: null,
        status: PrivacyRequestStatus.COMPLETED,
        completedAt: new Date(),
        scheduledFor: null,
      });
      await repository.save(request);
      return {
        id: request.id,
        status: request.status,
        completedAt: request.completedAt,
      };
    });
  }

  private getErasureScheduleDate() {
    const value = Number(
      this.configService.get<string>('ACCOUNT_ERASURE_GRACE_DAYS', '7'),
    );
    return new Date(
      Date.now() +
        (Number.isFinite(value) && value >= 0 ? value : 7) * 86_400_000,
    );
  }
  private getClinicalRetentionDays() {
    const value = Number(
      this.configService.get<string>('CLINICAL_RECORD_RETENTION_DAYS', '2555'),
    );
    return Number.isFinite(value) && value >= 0 ? value : 2555;
  }
}
