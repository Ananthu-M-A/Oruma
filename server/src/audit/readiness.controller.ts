import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import {
  businessConfig,
  validateBusinessConfig,
} from '../config/business.config';

@Controller('ready')
export class ReadinessController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}
  @Get()
  async ready() {
    const strict = this.configService.get<string>('NODE_ENV') === 'production';
    const razorpayKeyId = this.configService
      .get<string>('RAZORPAY_KEY_ID')
      ?.trim();
    const providers = {
      email: this.hasConfig('RESEND_API_KEY', 'EMAIL_FROM'),
      razorpay:
        this.hasConfig('RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET') &&
        (!strict || Boolean(razorpayKeyId?.startsWith('rzp_live_'))),
      razorpayWebhook: this.hasConfig('RAZORPAY_WEBHOOK_SECRET'),
      providerWorker:
        this.configService.get<string>('PROVIDER_WORKER_ENABLED', 'true') !==
        'false',
      reservationCleanup:
        this.configService.get<string>(
          'RESERVATION_CLEANUP_ENABLED',
          'true',
        ) !== 'false',
      businessConfig: validateBusinessConfig(businessConfig).length === 0,
    };
    try {
      await this.dataSource.query('SELECT 1');
      const [schema] = (await this.dataSource.query(`SELECT
        to_regclass('public.migrations') IS NOT NULL AS "migrations",
        to_regclass('public.provider_job') IS NOT NULL AS "providerJob",
        to_regclass('public.payment_webhook_event') IS NOT NULL AS "paymentWebhookEvent"
      `)) as Array<{
        migrations: boolean;
        providerJob: boolean;
        paymentWebhookEvent: boolean;
      }>;
      const schemaReady = Boolean(
        schema?.migrations && schema.providerJob && schema.paymentWebhookEvent,
      );
      if (!schemaReady) {
        throw new ServiceUnavailableException({
          status: 'not_ready',
          database: 'available',
          schema: 'not_ready',
          providers,
        });
      }
      if (strict && Object.values(providers).some((value) => !value)) {
        throw new ServiceUnavailableException({
          status: 'not_ready',
          database: 'available',
          schema: 'ready',
          providers,
        });
      }
      return {
        status: 'ready',
        database: 'available',
        schema: 'ready',
        providers,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException({
        status: 'not_ready',
        database: 'unavailable',
        schema: 'unknown',
        providers,
      });
    }
  }

  private hasConfig(...keys: string[]) {
    return keys.every((key) =>
      Boolean(this.configService.get<string>(key)?.trim()),
    );
  }
}
