import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { DataSource, In, LessThan } from 'typeorm';
import { AuditEvent } from '../audit/entities/audit-event.entity';
import { LoginOtp } from '../auth/entities/login-otp.entity';
import { Notification } from '../notification/entities/notification.entity';
import {
  PaymentWebhookEvent,
  PaymentWebhookStatus,
} from '../payment/entities/payment-webhook-event.entity';
import {
  ProviderJob,
  ProviderJobStatus,
} from '../reliability/entities/provider-job.entity';
import {
  PrivacyRequest,
  PrivacyRequestStatus,
} from './entities/privacy-request.entity';

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);
  private active = false;
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  @Interval('data-retention-worker', 24 * 60 * 60 * 1000)
  async enforceRetention() {
    if (
      this.active ||
      this.configService.get<string>(
        'DATA_RETENTION_WORKER_ENABLED',
        'false',
      ) !== 'true'
    )
      return;
    this.active = true;
    try {
      const cutoff = (name: string, fallback: number) =>
        new Date(Date.now() - this.getDays(name, fallback) * 86_400_000);
      const results = await Promise.all([
        this.dataSource
          .getRepository(AuditEvent)
          .delete({ createdAt: LessThan(cutoff('AUDIT_RETENTION_DAYS', 365)) }),
        this.dataSource.getRepository(Notification).delete({
          createdAt: LessThan(cutoff('NOTIFICATION_RETENTION_DAYS', 180)),
        }),
        this.dataSource
          .getRepository(LoginOtp)
          .delete({ expiresAt: LessThan(cutoff('OTP_RETENTION_DAYS', 7)) }),
        this.dataSource.getRepository(ProviderJob).delete({
          status: In([ProviderJobStatus.SUCCEEDED, ProviderJobStatus.DEAD]),
          updatedAt: LessThan(cutoff('PROVIDER_JOB_RETENTION_DAYS', 90)),
        }),
        this.dataSource.getRepository(PaymentWebhookEvent).delete({
          status: In([
            PaymentWebhookStatus.SUCCEEDED,
            PaymentWebhookStatus.DEAD,
          ]),
          updatedAt: LessThan(cutoff('PAYMENT_WEBHOOK_RETENTION_DAYS', 365)),
        }),
        this.dataSource.getRepository(PrivacyRequest).delete({
          status: In([
            PrivacyRequestStatus.COMPLETED,
            PrivacyRequestStatus.REJECTED,
          ]),
          updatedAt: LessThan(cutoff('PRIVACY_REQUEST_RETENTION_DAYS', 2555)),
        }),
      ]);
      const removed = results.reduce(
        (sum, result) => sum + (result.affected ?? 0),
        0,
      );
      if (removed)
        this.logger.log(
          `Applied configured retention rules to ${removed} rows`,
        );
    } catch (error) {
      this.logger.error(
        `Data-retention worker failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    } finally {
      this.active = false;
    }
  }

  private getDays(name: string, fallback: number) {
    const value = Number(this.configService.get<string>(name, `${fallback}`));
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  }
}
