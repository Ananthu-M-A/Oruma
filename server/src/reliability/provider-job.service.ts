import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, LessThan, Repository } from 'typeorm';
import { MailService, SendMailInput } from '../mail/mail.service';
import {
  ProviderJob,
  ProviderJobKind,
  ProviderJobStatus,
} from './entities/provider-job.entity';

type EnqueueOptions = { deduplicationKey?: string; maxAttempts?: number };

class ProviderConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ProviderConfigurationError.name;
  }
}

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
  ) {}

  enqueueEmail(input: SendMailInput, options: EnqueueOptions = {}) {
    return this.enqueue(ProviderJobKind.EMAIL, input, options);
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
    if (job.kind !== ProviderJobKind.EMAIL) {
      throw new BadRequestException(
        'This automated provider is disabled by the manual MVP workflow',
      );
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
      await this.deadLetterUnconfiguredJobs();
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

  private async deadLetterUnconfiguredJobs() {
    for (const kind of Object.values(ProviderJobKind)) {
      const message = this.getProviderConfigurationError(kind);
      if (!message) continue;

      const result = await this.jobRepository.update(
        { kind, status: ProviderJobStatus.PENDING },
        {
          status: ProviderJobStatus.DEAD,
          lockedAt: null,
          lastError: message,
        },
      );
      if (result.affected)
        this.logger.warn(
          JSON.stringify({
            event: 'provider_jobs_configuration_missing',
            kind,
            affected: result.affected,
            retryable: false,
            error: message,
          }),
        );
    }
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
      const configurationFailure = error instanceof ProviderConfigurationError;
      const dead = configurationFailure || job.attempts >= job.maxAttempts;
      await this.jobRepository.update(job.id, {
        status: dead ? ProviderJobStatus.DEAD : ProviderJobStatus.PENDING,
        attempts: job.attempts,
        lockedAt: null,
        lastError: message.slice(0, 4000),
        nextAttemptAt: this.getNextAttemptAt(job.attempts),
      });
      const logEntry = JSON.stringify({
        event: configurationFailure
          ? 'provider_job_configuration_missing'
          : 'provider_job_failed',
        jobId: job.id,
        kind: job.kind,
        attempt: job.attempts,
        dead,
        retryable: !configurationFailure && !dead,
        error: message,
      });
      if (configurationFailure) this.logger.warn(logEntry);
      else this.logger.error(logEntry);
    }
  }

  private async dispatch(job: ProviderJob) {
    const configurationError = this.getProviderConfigurationError(job.kind);
    if (configurationError)
      throw new ProviderConfigurationError(configurationError);

    if (job.kind === ProviderJobKind.EMAIL) {
      if (!(await this.mailService.send(job.payload as SendMailInput)))
        throw new Error('Email provider did not accept the message');
      return;
    }
    throw new Error(`Unsupported provider job kind: ${String(job.kind)}`);
  }

  private getProviderConfigurationError(kind: ProviderJobKind): string | null {
    if (kind === ProviderJobKind.EMAIL && !this.mailService.isConfigured())
      return 'Email provider is not configured';
    if (kind === ProviderJobKind.WHATSAPP)
      return 'Automated WhatsApp delivery is disabled; staff handles messages manually';
    if (kind === ProviderJobKind.ZOOM_MEETING)
      return 'Automated Zoom creation is disabled; staff adds meeting links manually';
    return null;
  }

  private getNextAttemptAt(attempts: number) {
    return new Date(
      Date.now() + Math.min(2 ** Math.max(attempts - 1, 0), 60) * 60_000,
    );
  }
}
