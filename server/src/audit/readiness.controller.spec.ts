import { ServiceUnavailableException } from '@nestjs/common';
import { ReadinessController } from './readiness.controller';

describe('ReadinessController', () => {
  const configuredValues: Record<string, string> = {
    NODE_ENV: 'production',
    RESEND_API_KEY: 'resend-key',
    EMAIL_FROM: 'Oruma <support@oruma.me>',
    RAZORPAY_KEY_ID: 'rzp_live_key',
    RAZORPAY_KEY_SECRET: 'payment-secret',
    RAZORPAY_WEBHOOK_SECRET: 'webhook-secret',
    PROVIDER_WORKER_ENABLED: 'true',
    RESERVATION_CLEANUP_ENABLED: 'true',
  };

  const createController = (values = configuredValues) => {
    const dataSource = {
      query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };
    const configService = {
      get: jest.fn((key: string, fallback?: string) => values[key] ?? fallback),
    };
    return {
      controller: new ReadinessController(
        dataSource as never,
        configService as never,
      ),
      dataSource,
    };
  };

  it('reports provider configuration with database readiness', async () => {
    const { controller } = createController();
    const response = await controller.ready();
    expect(response.status).toBe('ready');
    expect(response.database).toBe('available');
    expect(response.providers.email).toBe(true);
    expect(response.providers.razorpay).toBe(true);
    expect(response.providers.razorpayWebhook).toBe(true);
  });

  it('fails production readiness when email or Razorpay is absent', async () => {
    const { controller } = createController({ NODE_ENV: 'production' });
    await expect(controller.ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('fails production readiness for Razorpay Test Mode credentials', async () => {
    const { controller } = createController({
      ...configuredValues,
      RAZORPAY_KEY_ID: 'rzp_test_key',
    });
    await expect(controller.ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('fails readiness when PostgreSQL is unavailable', async () => {
    const { controller, dataSource } = createController();
    dataSource.query.mockRejectedValue(new Error('database unavailable'));
    await expect(controller.ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
