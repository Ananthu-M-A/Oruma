import {
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { PaymentService } from './payment.service';
import { PaymentStatus } from './entities/payment-status.enum';
import { Role } from '../user/entities/user.entity';
import { Payment } from './entities/payment.entity';
import { PaymentRefundStatus } from './entities/payment-refund.entity';

describe('PaymentService', () => {
  const secret = 'test_razorpay_secret';
  const patient = {
    userId: 'patient-1',
    email: 'patient@example.com',
    role: Role.PATIENT,
  };

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        id: 'pay_123',
        order_id: 'order_123',
        amount: 120000,
        currency: 'INR',
        status: 'captured',
        captured: true,
      }),
    } as unknown as Response);
  });

  afterEach(() => jest.restoreAllMocks());

  const createService = (payment: Record<string, unknown>) => {
    const paymentRepo = {
      findOne: jest.fn().mockResolvedValue(payment),
      save: jest
        .fn()
        .mockImplementation((value: unknown) => Promise.resolve(value)),
      find: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    const appointmentRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((value: unknown) => value),
    };
    const paymentQueryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(payment),
    };
    paymentRepo.createQueryBuilder.mockReturnValue(paymentQueryBuilder);
    const manager = {
      getRepository: jest.fn((entity: unknown) =>
        entity === Payment ? paymentRepo : appointmentRepo,
      ),
    };
    const dataSource = {
      transaction: jest.fn(
        (callback: (value: typeof manager) => Promise<unknown>) =>
          callback(manager),
      ),
    };
    const webhookEventRepo = {};
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'RAZORPAY_KEY_SECRET') return secret;
        if (key === 'RAZORPAY_KEY_ID') return 'rzp_test_key';
        return undefined;
      }),
    };
    const notificationService = {
      create: jest.fn().mockResolvedValue({}),
      notifyAdmins: jest.fn().mockResolvedValue([]),
    };
    const appointmentService = {
      notifyBookingAfterPayment: jest.fn().mockResolvedValue(undefined),
    };

    const service = new PaymentService(
      paymentRepo as never,
      appointmentRepo as never,
      webhookEventRepo as never,
      {} as never,
      dataSource as never,
      configService as never,
      notificationService as never,
      appointmentService as never,
    );

    return {
      service,
      paymentRepo,
      appointmentService,
      paymentQueryBuilder,
    };
  };

  const signatureFor = (orderId: string, paymentId: string) =>
    createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

  it('queues booking notifications after the first successful Razorpay verification', async () => {
    const payment = {
      id: 'payment-1',
      amount: 1200,
      status: PaymentStatus.PENDING,
      appointment: {
        id: 'appointment-1',
        contactEmail: 'patient@example.com',
      },
      patient: {
        id: 'patient-1',
        email: 'patient@example.com',
      },
      notes: null,
    };
    const { service, paymentRepo, appointmentService, paymentQueryBuilder } =
      createService(payment);

    const result = await service.verifyRazorpayPayment(
      {
        razorpayOrderId: 'order_123',
        razorpayPaymentId: 'pay_123',
        razorpaySignature: signatureFor('order_123', 'pay_123'),
      },
      patient,
    );

    expect(result.status).toBe(PaymentStatus.PAID);
    expect(paymentQueryBuilder.setLock).toHaveBeenCalledWith(
      'pessimistic_write',
      undefined,
      ['payment'],
    );
    expect(paymentRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        providerPaymentId: 'pay_123',
        reference: 'pay_123',
      }),
    );
    expect(appointmentService.notifyBookingAfterPayment).toHaveBeenCalledWith(
      payment.appointment,
      'patient@example.com',
    );
  });

  it('does not duplicate booking notifications when payment is already paid', async () => {
    const payment = {
      id: 'payment-1',
      amount: 1200,
      status: PaymentStatus.PAID,
      appointment: {
        id: 'appointment-1',
        contactEmail: 'patient@example.com',
      },
      patient: {
        id: 'patient-1',
        email: 'patient@example.com',
      },
      notes: 'Razorpay payment verified',
    };
    const { service, appointmentService } = createService(payment);

    await service.verifyRazorpayPayment(
      {
        razorpayOrderId: 'order_123',
        razorpayPaymentId: 'pay_123',
        razorpaySignature: signatureFor('order_123', 'pay_123'),
      },
      patient,
    );

    expect(appointmentService.notifyBookingAfterPayment).not.toHaveBeenCalled();
  });

  it('rejects invalid Razorpay signatures', async () => {
    const payment = {
      id: 'payment-1',
      status: PaymentStatus.PENDING,
      appointment: { id: 'appointment-1' },
      patient: { id: 'patient-1' },
    };
    const { service, paymentRepo } = createService(payment);

    await expect(
      service.verifyRazorpayPayment(
        {
          razorpayOrderId: 'order_123',
          razorpayPaymentId: 'pay_123',
          razorpaySignature: 'bad-signature',
        },
        patient,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(paymentRepo.save).not.toHaveBeenCalled();
  });

  it('returns Razorpay order status only for the owning patient', async () => {
    const payment = {
      providerOrderId: 'order_123',
      status: PaymentStatus.PAID,
      updatedAt: new Date('2026-10-01T12:00:00.000Z'),
    };
    const { service, paymentRepo } = createService(payment);

    await expect(
      service.getRazorpayOrderStatus('order_123', patient),
    ).resolves.toEqual({
      orderId: 'order_123',
      status: PaymentStatus.PAID,
      updatedAt: payment.updatedAt,
    });
    expect(paymentRepo.findOne).toHaveBeenCalledWith({
      where: {
        providerOrderId: 'order_123',
        patient: { id: 'patient-1' },
      },
    });
  });

  it('completes the post-payment flow when the development bypass is enabled', async () => {
    const appointment = {
      id: 'appointment-1',
      patient: { id: 'patient-1', email: 'patient@example.com' },
      therapist: { price: 1200, couplePrice: 1800 },
      service: 'Individual Therapy',
      packageOfferAmount: 0,
      contactEmail: 'patient@example.com',
    };
    const paymentRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockImplementation((value: Record<string, unknown>) => ({
          id: 'test-payment-1',
          ...value,
        })),
      save: jest
        .fn()
        .mockImplementation((value: unknown) => Promise.resolve(value)),
    };
    const appointmentRepo = {
      findOne: jest.fn().mockResolvedValue(appointment),
      save: jest.fn().mockImplementation((value: unknown) => value),
    };
    const appointmentQueryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(appointment),
    };
    Object.assign(appointmentRepo, {
      createQueryBuilder: jest.fn(() => appointmentQueryBuilder),
    });
    const manager = {
      getRepository: jest.fn((entity: unknown) =>
        entity === Payment ? paymentRepo : appointmentRepo,
      ),
    };
    const dataSource = {
      transaction: jest.fn(
        (callback: (value: typeof manager) => Promise<unknown>) =>
          callback(manager),
      ),
    };
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'PAYMENT_BYPASS_ENABLED') return 'true';
        return undefined;
      }),
    };
    const notificationService = {
      create: jest.fn().mockResolvedValue({}),
      notifyAdmins: jest.fn().mockResolvedValue([]),
    };
    const appointmentService = {
      notifyBookingAfterPayment: jest.fn().mockResolvedValue(undefined),
    };
    const service = new PaymentService(
      paymentRepo as never,
      appointmentRepo as never,
      {} as never,
      {} as never,
      dataSource as never,
      configService as never,
      notificationService as never,
      appointmentService as never,
    );

    const result = await service.completeDevelopmentPayment(
      { appointmentId: appointment.id },
      patient,
    );

    expect(result).toEqual(
      expect.objectContaining({
        amount: 1200,
        status: PaymentStatus.PAID,
        provider: 'development-bypass',
      }),
    );
    expect(appointmentRepo.createQueryBuilder).toHaveBeenCalledWith(
      'appointment',
    );
    expect(appointmentQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'appointment.slot',
      'slot',
    );
    expect(appointmentQueryBuilder.setLock).toHaveBeenCalledWith(
      'pessimistic_write',
      undefined,
      ['appointment'],
    );
    expect(appointmentService.notifyBookingAfterPayment).toHaveBeenCalledWith(
      appointment,
      'patient@example.com',
    );
  });

  it('never permits the development bypass in production', async () => {
    const configService = {
      get: jest.fn((key: string) =>
        key === 'NODE_ENV' ? 'production' : 'true',
      ),
    };
    const service = new PaymentService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      configService as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.completeDevelopmentPayment(
        { appointmentId: 'appointment-1' },
        patient,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('does not count pending or failed payments as collected revenue', async () => {
    const { service, paymentRepo } = createService({});
    paymentRepo.find.mockResolvedValue([
      { amount: 1000, refundedAmount: 0, status: PaymentStatus.PAID },
      { amount: 800, refundedAmount: 200, status: PaymentStatus.REFUNDED },
      { amount: 1200, refundedAmount: 0, status: PaymentStatus.PENDING },
      { amount: 500, refundedAmount: 0, status: PaymentStatus.FAILED },
    ]);

    await expect(service.getSummary()).resolves.toEqual({
      collected: 1800,
      refunds: 200,
      pending: 1200,
    });
  });

  it('reconciles a previously requested Razorpay refund instead of submitting it again', async () => {
    const payment = {
      id: 'payment-1',
      provider: 'razorpay',
      providerPaymentId: 'pay_123',
      status: PaymentStatus.PAID,
    };
    const operation = {
      id: 'refund-1',
      status: PaymentRefundStatus.REQUESTED,
      receipt: 'oru_rfnd_existing',
    };
    const { service } = createService(payment);
    const reserveRefundOperation = jest.fn().mockResolvedValue({
      payment,
      operation,
      shouldSubmit: false,
    });
    const reconcileUncertainRefund = jest.fn().mockResolvedValue(payment);
    Object.assign(service, {
      reserveRefundOperation,
      reconcileUncertainRefund,
    });

    await expect(
      service.refund('payment-1', { amount: 500 }, 'same-refund-key'),
    ).resolves.toBe(payment);

    expect(reconcileUncertainRefund).toHaveBeenCalledWith(payment, operation, {
      amount: 500,
    });
  });

  it('marks an ambiguous Razorpay error unknown rather than allowing a blind retry', async () => {
    const payment = {
      id: 'payment-1',
      provider: 'razorpay',
      providerPaymentId: 'pay_123',
      status: PaymentStatus.PAID,
      appointment: { id: 'appointment-1' },
    };
    const operation = {
      id: 'refund-1',
      status: PaymentRefundStatus.REQUESTED,
      receipt: 'oru_rfnd_existing',
    };
    const refundRepo = { update: jest.fn().mockResolvedValue(undefined) };
    const configService = {
      get: jest.fn((key: string) =>
        key === 'RAZORPAY_KEY_ID' ? 'rzp_test_key' : secret,
      ),
    };
    const service = new PaymentService(
      {} as never,
      {} as never,
      {} as never,
      refundRepo as never,
      {} as never,
      configService as never,
      {} as never,
      {} as never,
    );
    Object.assign(service, {
      reserveRefundOperation: jest.fn().mockResolvedValue({
        payment,
        operation,
        shouldSubmit: true,
      }),
    });
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 502,
      json: jest.fn().mockResolvedValue({ error: { description: 'timeout' } }),
    } as unknown as Response);

    await expect(
      service.refund('payment-1', { amount: 500 }, 'ambiguous-refund-key'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(refundRepo.update).toHaveBeenCalledWith(
      { id: operation.id },
      expect.objectContaining({ status: PaymentRefundStatus.UNKNOWN }),
    );
  });
});
