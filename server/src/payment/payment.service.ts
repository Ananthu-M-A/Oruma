import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Interval } from '@nestjs/schedule';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { DataSource, LessThan, LessThanOrEqual, Repository } from 'typeorm';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Appointment } from '../appointment/entities/appointment.entity';
import { AppointmentStatus } from '../appointment/entities/appointment-status.enum';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from './entities/payment-status.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateRazorpayOrderDto } from './dto/create-razorpay-order.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { VerifyRazorpayPaymentDto } from './dto/verify-razorpay-payment.dto';
import { NotificationType } from '../notification/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { AppointmentService } from '../appointment/appointment.service';
import { Role } from '../user/entities/user.entity';
import { IST_TIME_ZONE } from '../common/ist-date-time';
import {
  PaymentWebhookEvent,
  PaymentWebhookStatus,
} from './entities/payment-webhook-event.entity';

type RazorpayOrderResponse = {
  id?: string;
  amount?: number;
  currency?: string;
  receipt?: string;
  status?: string;
  error?: {
    description?: string;
  };
};

type RazorpayRefundResponse = {
  id?: string;
  amount?: number;
  currency?: string;
  payment_id?: string;
  status?: 'pending' | 'processed' | 'failed';
  speed_requested?: string;
  speed_processed?: string;
  receipt?: string | null;
  created_at?: number;
  error?: {
    description?: string;
  };
};

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
    refund?: {
      entity?: {
        id?: string;
        payment_id?: string;
        amount?: number;
        status?: 'pending' | 'processed' | 'failed';
      };
    };
  };
};

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(PaymentWebhookEvent)
    private readonly webhookEventRepo: Repository<PaymentWebhookEvent>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly appointmentService: AppointmentService,
  ) {}

  private webhookWorkerActive = false;

  findAll() {
    return this.paymentRepo.find({ order: { createdAt: 'DESC' } });
  }

  findForPatient(user: JwtPayload) {
    return this.paymentRepo.find({
      where: {
        patient: {
          id: user.userId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getInvoice(id: string, user: JwtPayload) {
    const payment = await this.paymentRepo.findOne({ where: { id } });

    if (!payment) throw new NotFoundException('Payment not found');

    if (user.role !== Role.ADMIN && payment.patient?.id !== user.userId) {
      throw new ForbiddenException('You cannot access this invoice');
    }

    if (
      ![PaymentStatus.PAID, PaymentStatus.REFUNDED].includes(payment.status)
    ) {
      throw new BadRequestException(
        'Invoice is available only for paid or refunded payments',
      );
    }

    return this.renderInvoice(payment);
  }

  async create(dto: CreatePaymentDto) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: dto.appointmentId },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    const payment = this.paymentRepo.create({
      appointment,
      patient: appointment.patient,
      amount: dto.amount,
      reference: dto.reference?.trim() || null,
      notes: dto.notes?.trim() || null,
      status: PaymentStatus.PAID,
    });

    const savedPayment = await this.paymentRepo.save(payment);
    await this.sendPaymentNotification(
      savedPayment,
      'Payment recorded',
      'Your appointment payment has been recorded.',
    );
    await this.appointmentService.notifyBookingAfterPayment(
      appointment,
      appointment.contactEmail ?? appointment.patient?.email,
    );

    return savedPayment;
  }

  async createRazorpayOrder(dto: CreateRazorpayOrderDto, user: JwtPayload) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (!keyId || !keySecret) {
      throw new BadRequestException('Razorpay is not configured');
    }
    return this.dataSource.transaction(async (manager) => {
      const appointment = await manager
        .getRepository(Appointment)
        .createQueryBuilder('appointment')
        .setLock('pessimistic_write', undefined, ['appointment'])
        .leftJoinAndSelect('appointment.patient', 'patient')
        .leftJoinAndSelect('appointment.therapist', 'therapist')
        .leftJoinAndSelect('appointment.slot', 'slot')
        .where('appointment.id = :id', { id: dto.appointmentId })
        .andWhere('patient.id = :patientId', { patientId: user.userId })
        .getOne();
      if (!appointment) throw new NotFoundException('Appointment not found');
      if (
        [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED].includes(
          appointment.status,
        )
      ) {
        throw new BadRequestException(
          'Payment cannot be started for this appointment status',
        );
      }
      const repository = manager.getRepository(Payment);
      const completed = await repository.findOne({
        where: [
          { appointment: { id: appointment.id }, status: PaymentStatus.PAID },
          {
            appointment: { id: appointment.id },
            status: PaymentStatus.REFUNDED,
          },
        ],
      });
      if (completed)
        throw new BadRequestException(
          'This appointment already has a completed payment',
        );
      const existing = await repository.findOne({
        where: {
          appointment: { id: appointment.id },
          status: PaymentStatus.PENDING,
        },
      });
      if (existing?.providerOrderId)
        return this.orderResponse(
          keyId,
          existing.providerOrderId,
          existing.amount,
          appointment,
          'INR',
        );
      const amount = this.resolveAppointmentAmount(appointment);
      if (amount <= 0)
        throw new BadRequestException('Appointment amount is not configured');
      const order = await this.createRazorpayOrderRequest(
        keyId,
        keySecret,
        amount,
        appointment.id,
      );
      if (!order.id)
        throw new BadRequestException('Unable to create Razorpay order');
      await repository.save(
        repository.create({
          appointment,
          patient: appointment.patient,
          amount,
          status: PaymentStatus.PENDING,
          provider: 'razorpay',
          reference: order.id,
          providerOrderId: order.id,
          notes: `Razorpay order created for appointment ${appointment.id}`,
        }),
      );
      return this.orderResponse(
        keyId,
        order.id,
        amount,
        appointment,
        order.currency ?? 'INR',
      );
    });
  }

  async completeDevelopmentPayment(
    dto: CreateRazorpayOrderDto,
    user: JwtPayload,
  ) {
    const isEnabled =
      this.configService.get<string>('NODE_ENV') !== 'production' &&
      this.configService.get<string>('PAYMENT_BYPASS_ENABLED') === 'true';

    if (!isEnabled) {
      throw new ForbiddenException('Development payment bypass is disabled');
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const appointment = await manager
        .getRepository(Appointment)
        .createQueryBuilder('appointment')
        .setLock('pessimistic_write', undefined, ['appointment'])
        .leftJoinAndSelect('appointment.patient', 'patient')
        .leftJoinAndSelect('appointment.therapist', 'therapist')
        .leftJoinAndSelect('appointment.slot', 'slot')
        .where('appointment.id = :id', { id: dto.appointmentId })
        .andWhere('patient.id = :patientId', { patientId: user.userId })
        .getOne();
      if (!appointment) throw new NotFoundException('Appointment not found');
      const repository = manager.getRepository(Payment);
      const existing = await repository.findOne({
        where: [
          { appointment: { id: appointment.id }, status: PaymentStatus.PAID },
          {
            appointment: { id: appointment.id },
            status: PaymentStatus.REFUNDED,
          },
        ],
      });
      if (existing) return { payment: existing, appointment, created: false };
      const amount = this.resolveAppointmentAmount(appointment);
      if (amount <= 0)
        throw new BadRequestException('Appointment amount is not configured');
      appointment.reservationExpiresAt = null;
      await manager.getRepository(Appointment).save(appointment);
      const payment = await repository.save(
        repository.create({
          appointment,
          patient: appointment.patient,
          amount,
          status: PaymentStatus.PAID,
          provider: 'development-bypass',
          reference: `TEST-${appointment.id}`,
          providerOrderId: null,
          providerPaymentId: null,
          notes: 'Development-only payment bypass; no funds were collected.',
        }),
      );
      return { payment, appointment, created: true };
    });
    if (result.created) {
      await this.sendPaymentNotification(
        result.payment,
        'Test payment completed',
        'Your appointment was marked paid using the development test bypass.',
      );
      await this.appointmentService.notifyBookingAfterPayment(
        result.appointment,
        result.appointment.contactEmail ?? result.appointment.patient?.email,
      );
    }
    return result.payment;
  }

  async verifyRazorpayPayment(dto: VerifyRazorpayPaymentDto, user: JwtPayload) {
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (!keySecret) {
      throw new BadRequestException('Razorpay is not configured');
    }

    const expectedSignature = createHmac('sha256', keySecret)
      .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
      .digest('hex');

    if (!this.isSignatureValid(expectedSignature, dto.razorpaySignature)) {
      throw new BadRequestException('Payment verification failed');
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const payment = await manager
        .getRepository(Payment)
        .createQueryBuilder('payment')
        .setLock('pessimistic_write', undefined, ['payment'])
        .leftJoinAndSelect('payment.patient', 'patient')
        .leftJoinAndSelect('payment.appointment', 'appointment')
        .leftJoinAndSelect('appointment.patient', 'appointmentPatient')
        .leftJoinAndSelect('appointment.therapist', 'therapist')
        .leftJoinAndSelect('appointment.slot', 'slot')
        .where('payment.providerOrderId = :orderId', {
          orderId: dto.razorpayOrderId,
        })
        .andWhere('patient.id = :patientId', { patientId: user.userId })
        .getOne();
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.status === PaymentStatus.REFUNDED)
        throw new BadRequestException(
          'A refunded payment cannot be re-verified',
        );
      const changed = payment.status !== PaymentStatus.PAID;
      if (changed) {
        payment.status = PaymentStatus.PAID;
        payment.reference = dto.razorpayPaymentId;
        payment.providerPaymentId = dto.razorpayPaymentId;
        payment.notes = [payment.notes, 'Razorpay payment verified']
          .filter(Boolean)
          .join('\n');
        if (payment.appointment) {
          payment.appointment.reservationExpiresAt = null;
          await manager.getRepository(Appointment).save(payment.appointment);
        }
        await manager.getRepository(Payment).save(payment);
      }
      return { payment, changed };
    });
    const savedPayment = result.payment;
    if (!result.changed) return savedPayment;
    await this.sendPaymentNotification(
      savedPayment,
      'Payment verified',
      'Your appointment payment was verified successfully.',
    );

    if (savedPayment.appointment) {
      await this.appointmentService.notifyBookingAfterPayment(
        savedPayment.appointment,
        savedPayment.appointment.contactEmail ?? savedPayment.patient?.email,
      );
    }

    return savedPayment;
  }

  async handleRazorpayWebhook(input: {
    payload: unknown;
    rawBody?: Buffer;
    signature?: string;
  }) {
    const webhookSecret = this.configService.get<string>(
      'RAZORPAY_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new BadRequestException('Razorpay webhook is not configured');
    }

    if (!input.rawBody || !input.signature) {
      throw new BadRequestException('Missing Razorpay webhook signature');
    }

    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(input.rawBody)
      .digest('hex');

    if (!this.isSignatureValid(expectedSignature, input.signature)) {
      throw new BadRequestException('Invalid Razorpay webhook signature');
    }

    const payload = input.payload as RazorpayWebhookPayload & { id?: string };
    const eventKey = payload.id
      ? `razorpay:${payload.id}`
      : `sha256:${createHash('sha256').update(input.rawBody).digest('hex')}`;
    let duplicate = false;
    let event = await this.webhookEventRepo.findOne({ where: { eventKey } });
    if (event) duplicate = true;
    else {
      try {
        event = await this.webhookEventRepo.save(
          this.webhookEventRepo.create({
            eventKey,
            providerEventId: payload.id ?? null,
            eventType: payload.event ?? null,
            payload: payload as Record<string, unknown>,
            status: PaymentWebhookStatus.PENDING,
            nextAttemptAt: new Date(),
          }),
        );
      } catch (error) {
        event = await this.webhookEventRepo.findOne({ where: { eventKey } });
        if (!event) throw error;
        duplicate = true;
      }
    }
    if (event.status !== PaymentWebhookStatus.SUCCEEDED) {
      await this.processWebhookEvent(event);
    }
    return { received: true, duplicate, eventId: event.id };
  }

  findWebhookEvents() {
    return this.webhookEventRepo.find({
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async retryWebhookEvent(id: string) {
    const event = await this.webhookEventRepo.findOneByOrFail({ id });
    if (event.status !== PaymentWebhookStatus.DEAD) {
      throw new BadRequestException('Only dead webhook events can be retried');
    }
    Object.assign(event, {
      status: PaymentWebhookStatus.PENDING,
      attempts: 0,
      nextAttemptAt: new Date(),
      lastError: null,
      processedAt: null,
    });
    return this.webhookEventRepo.save(event);
  }

  @Interval('payment-webhook-worker', 5_000)
  async processPendingWebhookEvents() {
    if (this.webhookWorkerActive) return;
    this.webhookWorkerActive = true;
    try {
      await this.webhookEventRepo.update(
        {
          status: PaymentWebhookStatus.PROCESSING,
          updatedAt: LessThan(new Date(Date.now() - 10 * 60_000)),
        },
        {
          status: PaymentWebhookStatus.PENDING,
          nextAttemptAt: new Date(),
          lastError: 'Recovered after a stale worker lock.',
        },
      );
      const due = await this.webhookEventRepo.find({
        where: {
          status: PaymentWebhookStatus.PENDING,
          nextAttemptAt: LessThanOrEqual(new Date()),
        },
        order: { nextAttemptAt: 'ASC' },
        take: 20,
      });
      for (const event of due) await this.processWebhookEvent(event);
    } finally {
      this.webhookWorkerActive = false;
    }
  }

  private async processWebhookEvent(event: PaymentWebhookEvent) {
    const claimed = await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(PaymentWebhookEvent);
      const current = await repository.findOne({
        where: { id: event.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (
        !current ||
        current.status === PaymentWebhookStatus.SUCCEEDED ||
        current.status === PaymentWebhookStatus.PROCESSING
      )
        return null;
      current.status = PaymentWebhookStatus.PROCESSING;
      current.attempts += 1;
      return repository.save(current);
    });
    if (!claimed) return;
    try {
      await this.applyRazorpayWebhook(claimed.payload);
      claimed.status = PaymentWebhookStatus.SUCCEEDED;
      claimed.payload = { redacted: true, eventType: claimed.eventType };
      claimed.processedAt = new Date();
      claimed.lastError = null;
    } catch (error) {
      claimed.lastError = (
        error instanceof Error ? error.message : 'Unknown webhook error'
      ).slice(0, 4000);
      claimed.status =
        claimed.attempts >= claimed.maxAttempts
          ? PaymentWebhookStatus.DEAD
          : PaymentWebhookStatus.PENDING;
      claimed.nextAttemptAt = new Date(
        Date.now() +
          Math.min(2 ** Math.max(claimed.attempts - 1, 0), 60) * 60_000,
      );
    }
    await this.webhookEventRepo.save(claimed);
  }

  private async applyRazorpayWebhook(payload: RazorpayWebhookPayload) {
    if (payload.event?.startsWith('refund.')) {
      const refund = payload.payload?.refund?.entity;
      if (refund?.payment_id && refund.id)
        await this.syncRazorpayRefundStatus(
          refund as Required<Pick<typeof refund, 'id' | 'payment_id'>> &
            typeof refund,
        );
      return;
    }
    const entity = payload.payload?.payment?.entity;
    if (!entity?.order_id) return;
    const result = await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Payment);
      const payment = await repository
        .createQueryBuilder('payment')
        .setLock('pessimistic_write', undefined, ['payment'])
        .leftJoinAndSelect('payment.appointment', 'appointment')
        .leftJoinAndSelect('payment.patient', 'patient')
        .leftJoinAndSelect('appointment.therapist', 'therapist')
        .leftJoinAndSelect('appointment.slot', 'slot')
        .where('payment.providerOrderId = :orderId', {
          orderId: entity.order_id,
        })
        .getOne();
      if (!payment) return null;
      if (payload.event === 'payment.captured') {
        if (
          [PaymentStatus.PAID, PaymentStatus.REFUNDED].includes(payment.status)
        )
          return { payment, captured: false };
        payment.status = PaymentStatus.PAID;
        payment.reference = entity.id ?? payment.reference;
        payment.providerPaymentId = entity.id ?? payment.providerPaymentId;
        payment.notes = [payment.notes, 'Razorpay webhook captured payment']
          .filter(Boolean)
          .join('\n');
        if (payment.appointment) {
          payment.appointment.reservationExpiresAt = null;
          await manager.getRepository(Appointment).save(payment.appointment);
        }
        await repository.save(payment);
        return { payment, captured: true };
      }
      if (
        payload.event === 'payment.failed' &&
        ![PaymentStatus.PAID, PaymentStatus.REFUNDED].includes(payment.status)
      ) {
        payment.status = PaymentStatus.FAILED;
        payment.reference = entity.id ?? payment.reference;
        payment.providerPaymentId = entity.id ?? payment.providerPaymentId;
        payment.notes = [
          payment.notes,
          'Razorpay webhook marked payment failed',
        ]
          .filter(Boolean)
          .join('\n');
        await repository.save(payment);
      }
      return { payment, captured: false };
    });
    if (!result) return;
    if (result.captured) {
      await this.sendPaymentNotification(
        result.payment,
        'Payment captured',
        'Your appointment payment was captured successfully.',
      );
      if (result.payment.appointment)
        await this.appointmentService.notifyBookingAfterPayment(
          result.payment.appointment,
          result.payment.appointment.contactEmail ??
            result.payment.patient?.email,
        );
    } else if (payload.event === 'payment.failed') {
      await this.sendPaymentNotification(
        result.payment,
        'Payment failed',
        'Your appointment payment failed. Please try again or contact support.',
      );
    }
  }

  async refund(id: string, dto: RefundPaymentDto) {
    const savedPayment = await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Payment);
      const payment = await repository
        .createQueryBuilder('payment')
        .setLock('pessimistic_write', undefined, ['payment'])
        .leftJoinAndSelect('payment.patient', 'patient')
        .leftJoinAndSelect('payment.appointment', 'appointment')
        .where('payment.id = :id', { id })
        .getOne();
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.status === PaymentStatus.FAILED)
        throw new BadRequestException('Failed payments cannot be refunded');
      if (payment.status !== PaymentStatus.PAID)
        throw new BadRequestException('Only paid payments can be refunded');
      const refundable = payment.amount - payment.refundedAmount;
      if (dto.amount <= 0 || dto.amount > refundable)
        throw new BadRequestException('Refund amount exceeds collected amount');
      const refundResult =
        payment.provider === 'razorpay'
          ? await this.createRazorpayRefund(payment, dto)
          : this.createManualRefundRecord(payment, dto);
      payment.refundedAmount += refundResult.amount;
      payment.notes =
        [payment.notes, refundResult.note, dto.notes?.trim()]
          .filter(Boolean)
          .join('\n') || null;
      payment.refundHistory = [
        ...(payment.refundHistory ?? []),
        refundResult.history,
      ];
      payment.status =
        payment.refundedAmount >= payment.amount
          ? PaymentStatus.REFUNDED
          : PaymentStatus.PAID;
      return repository.save(payment);
    });
    await this.sendPaymentNotification(
      savedPayment,
      'Refund initiated',
      `A refund of ${this.formatCurrency(dto.amount)} was initiated for your payment.`,
    );

    return savedPayment;
  }

  async getSummary() {
    const payments = await this.paymentRepo.find();
    const settledPayments = payments.filter((payment) =>
      [PaymentStatus.PAID, PaymentStatus.REFUNDED].includes(payment.status),
    );

    return {
      collected: settledPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      ),
      refunds: payments.reduce(
        (sum, payment) => sum + payment.refundedAmount,
        0,
      ),
      pending: payments
        .filter((payment) => payment.status === PaymentStatus.PENDING)
        .reduce((sum, payment) => sum + payment.amount, 0),
    };
  }

  private resolveAppointmentAmount(appointment: Appointment) {
    if (appointment.packageOfferAmount > 0) {
      return appointment.packageOfferAmount;
    }

    if (
      appointment.service === 'Couple Therapy' &&
      appointment.therapist.couplePrice
    ) {
      return appointment.therapist.couplePrice;
    }

    return appointment.therapist.price;
  }

  private orderResponse(
    keyId: string,
    orderId: string,
    amount: number,
    appointment: Appointment,
    currency: string,
  ) {
    return {
      keyId,
      orderId,
      amount,
      currency,
      sessionCount: appointment.sessionCount,
      packageName: appointment.packageName,
      originalAmount: appointment.packageOriginalAmount,
      discountPercent: appointment.packageDiscountPercent,
    };
  }

  private isSignatureValid(expected: string, received: string) {
    const expectedBuffer = Buffer.from(expected, 'utf8');
    const receivedBuffer = Buffer.from(received, 'utf8');

    return (
      expectedBuffer.length === receivedBuffer.length &&
      timingSafeEqual(expectedBuffer, receivedBuffer)
    );
  }

  private async sendPaymentNotification(
    payment: Payment,
    title: string,
    body: string,
  ) {
    const patientId = payment.patient?.id ?? payment.appointment?.patient?.id;
    if (!patientId) return;

    await Promise.allSettled([
      this.notificationService.create({
        recipientId: patientId,
        type: NotificationType.PAYMENT,
        title,
        body,
        actionUrl: '/profile/patient',
        metadata: {
          paymentId: payment.id,
          appointmentId: payment.appointment?.id,
        },
      }),
      this.notificationService.notifyAdmins({
        type: NotificationType.PAYMENT,
        title,
        body: `${payment.patient?.email ?? 'Patient'}: ${body}`,
        actionUrl: '/profile/admin',
        metadata: {
          paymentId: payment.id,
          appointmentId: payment.appointment?.id,
        },
      }),
    ]);
  }

  private async createRazorpayRefund(payment: Payment, dto: RefundPaymentDto) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    const providerPaymentId = payment.providerPaymentId;

    if (!keyId || !keySecret) {
      throw new BadRequestException('Razorpay is not configured');
    }

    if (!providerPaymentId) {
      throw new BadRequestException(
        'Razorpay payment id is missing for this payment',
      );
    }

    const receipt =
      dto.receipt?.trim() ||
      `oru_rfnd_${payment.id.replace(/-/g, '').slice(0, 18)}_${Date.now()}`;
    const amountInPaise = Math.round(dto.amount * 100);
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${providerPaymentId}/refund`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString(
            'base64',
          )}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          speed: dto.speed ?? 'normal',
          receipt,
          notes: {
            orumaPaymentId: payment.id,
            appointmentId: payment.appointment?.id ?? '',
            adminNotes: dto.notes?.trim() ?? '',
          },
        }),
      },
    );
    const data = (await response
      .json()
      .catch(() => ({}))) as RazorpayRefundResponse;

    if (!response.ok || data.status === 'failed') {
      throw new BadRequestException(
        data.error?.description ?? 'Unable to create Razorpay refund',
      );
    }

    if (!data.id || !data.amount) {
      throw new BadRequestException('Razorpay refund response is incomplete');
    }

    const refundedAmount = data.amount / 100;

    return {
      amount: refundedAmount,
      note: `Razorpay refund ${data.id} created with status ${data.status ?? 'pending'}.`,
      history: {
        provider: 'razorpay',
        providerRefundId: data.id,
        providerPaymentId,
        amount: refundedAmount,
        currency: data.currency ?? 'INR',
        status: data.status ?? 'pending',
        speedRequested: data.speed_requested ?? dto.speed ?? 'normal',
        speedProcessed: data.speed_processed ?? null,
        receipt: data.receipt ?? receipt,
        createdAt: data.created_at
          ? new Date(data.created_at * 1000).toISOString()
          : new Date().toISOString(),
      },
    };
  }

  private createManualRefundRecord(payment: Payment, dto: RefundPaymentDto) {
    return {
      amount: dto.amount,
      note: 'Manual refund recorded.',
      history: {
        provider: payment.provider,
        amount: dto.amount,
        status: 'recorded',
        receipt: dto.receipt?.trim() || null,
        createdAt: new Date().toISOString(),
      },
    };
  }

  private async syncRazorpayRefundStatus(refund: {
    id: string;
    payment_id: string;
    amount?: number;
    status?: 'pending' | 'processed' | 'failed';
  }) {
    const payment = await this.paymentRepo.findOne({
      where: { providerPaymentId: refund.payment_id },
    });

    if (!payment?.refundHistory) return;

    let failedRefundAmount = 0;
    let changed = false;
    payment.refundHistory = payment.refundHistory.map((entry) => {
      if (entry.providerRefundId !== refund.id) return entry;

      const previousStatus = entry.status;
      const nextStatus = refund.status ?? previousStatus;
      if (previousStatus !== nextStatus) changed = true;

      if (
        previousStatus !== 'failed' &&
        nextStatus === 'failed' &&
        typeof entry.amount === 'number'
      ) {
        failedRefundAmount = entry.amount;
      }

      return {
        ...entry,
        status: nextStatus,
        syncedAt: new Date().toISOString(),
      };
    });

    if (!changed) return;

    if (failedRefundAmount > 0) {
      payment.refundedAmount = Math.max(
        0,
        payment.refundedAmount - failedRefundAmount,
      );
      payment.status = PaymentStatus.PAID;
    }

    payment.notes =
      [
        payment.notes,
        `Razorpay refund ${refund.id} webhook status: ${refund.status}.`,
      ]
        .filter(Boolean)
        .join('\n') || null;

    const savedPayment = await this.paymentRepo.save(payment);

    if (refund.status === 'failed') {
      await this.sendPaymentNotification(
        savedPayment,
        'Refund failed',
        'A refund attempt failed at the payment gateway. The Oruma team will review it.',
      );
    }
  }

  private renderInvoice(payment: Payment) {
    const appointment = payment.appointment;
    const patient = payment.patient ?? appointment?.patient ?? null;
    const therapist = appointment?.therapist ?? null;
    const invoiceNumber = this.getInvoiceNumber(payment);
    const businessName = this.configService.get<string>(
      'ORUMA_LEGAL_NAME',
      'Oruma Wellness',
    );
    const billingAddress = this.configService.get<string>(
      'ORUMA_BILLING_ADDRESS',
      'ORUMA.ME Digital Wellness Platform',
    );
    const gstin = this.configService.get<string>('ORUMA_GSTIN');
    const amount = payment.amount;
    const refunded = payment.refundedAmount;
    const netPaid = amount - refunded;
    const serviceName = appointment?.service ?? 'Therapy consultation';
    const sessionCount = appointment?.sessionCount ?? 1;
    const packageName =
      appointment?.packageName ??
      (sessionCount > 1 ? `${sessionCount} sessions` : 'Single session');
    const originalAmount =
      appointment?.packageOriginalAmount &&
      appointment.packageOriginalAmount > 0
        ? appointment.packageOriginalAmount
        : amount;
    const discountPercent = appointment?.packageDiscountPercent ?? 0;
    const sessionDate = appointment?.slot?.startTime
      ? this.formatDate(appointment.slot.startTime)
      : 'To be scheduled';
    const paymentReference =
      payment.providerPaymentId ?? payment.reference ?? payment.providerOrderId;

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice ${this.escapeHtml(invoiceNumber)}</title>
  <style>
    :root { color: #123431; font-family: Arial, sans-serif; }
    body { margin: 0; background: #f5f8f7; }
    main { max-width: 820px; margin: 32px auto; background: #fff; padding: 40px; border: 1px solid #dde8e5; }
    header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #064f4b; padding-bottom: 24px; }
    h1 { margin: 0; color: #064f4b; font-size: 34px; }
    h2 { margin: 0 0 8px; color: #064f4b; font-size: 15px; text-transform: uppercase; letter-spacing: .08em; }
    p { margin: 4px 0; line-height: 1.5; }
    .muted { color: #5f7f7a; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin: 28px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { padding: 14px; border-bottom: 1px solid #dde8e5; text-align: left; }
    th { background: #f5f8f7; color: #064f4b; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
    td:last-child, th:last-child { text-align: right; }
    .totals { margin-left: auto; margin-top: 24px; width: min(360px, 100%); }
    .totals div { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #dde8e5; }
    .total { color: #064f4b; font-size: 20px; font-weight: 700; }
    .actions { display: flex; justify-content: flex-end; margin: 24px auto 0; max-width: 820px; }
    button { border: 0; background: #064f4b; color: white; padding: 12px 20px; border-radius: 999px; font-weight: 700; cursor: pointer; }
    @media print { body { background: #fff; } main { margin: 0; max-width: none; border: 0; } .actions { display: none; } }
    @media (max-width: 720px) { main { margin: 0; padding: 24px; } header, .grid { grid-template-columns: 1fr; display: grid; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Invoice</h1>
        <p class="muted">${this.escapeHtml(invoiceNumber)}</p>
      </div>
      <div>
        <h2>${this.escapeHtml(businessName)}</h2>
        <p>${this.escapeHtml(billingAddress)}</p>
        ${gstin ? `<p>GSTIN: ${this.escapeHtml(gstin)}</p>` : ''}
      </div>
    </header>

    <section class="grid">
      <div>
        <h2>Billed to</h2>
        <p>${this.escapeHtml(patient?.fullName ?? 'Patient')}</p>
        <p class="muted">${this.escapeHtml(patient?.email ?? payment.patient?.email ?? '')}</p>
        ${patient?.phone ? `<p class="muted">${this.escapeHtml(patient.phone)}</p>` : ''}
      </div>
      <div>
        <h2>Payment details</h2>
        <p>Invoice date: ${this.escapeHtml(this.formatDate(payment.createdAt))}</p>
        <p>Status: ${this.escapeHtml(payment.status)}</p>
        <p>Provider: ${this.escapeHtml(payment.provider)}</p>
        ${paymentReference ? `<p>Reference: ${this.escapeHtml(paymentReference)}</p>` : ''}
      </div>
    </section>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Session</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${this.escapeHtml(serviceName)}</strong>
            <p class="muted">${this.escapeHtml(packageName)}</p>
            <p class="muted">Therapist: ${this.escapeHtml(therapist?.name ?? 'Therapist')}</p>
          </td>
          <td>${this.escapeHtml(sessionDate)}</td>
          <td>${this.formatCurrency(amount)}</td>
        </tr>
      </tbody>
    </table>

    <section class="totals">
      <div><span>Subtotal</span><strong>${this.formatCurrency(originalAmount)}</strong></div>
      ${discountPercent > 0 ? `<div><span>Package discount (${discountPercent}%)</span><strong>-${this.formatCurrency(originalAmount - amount)}</strong></div>` : ''}
      <div><span>Refunded</span><strong>${this.formatCurrency(refunded)}</strong></div>
      <div class="total"><span>Net paid</span><span>${this.formatCurrency(netPaid)}</span></div>
    </section>

    <p class="muted" style="margin-top: 32px;">This invoice was generated by ORUMA.ME for a digital wellness consultation payment.</p>
  </main>
  <div class="actions"><button onclick="window.print()">Print or save PDF</button></div>
</body>
</html>`;
  }

  private getInvoiceNumber(payment: Payment) {
    const date = payment.createdAt;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `ORU-${year}${month}-${payment.id.slice(0, 8).toUpperCase()}`;
  }

  private formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private formatDate(date: Date) {
    return `${new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: IST_TIME_ZONE,
    }).format(date)} IST`;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private async createRazorpayOrderRequest(
    keyId: string,
    keySecret: string,
    amount: number,
    appointmentId: string,
  ) {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString(
          'base64',
        )}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: `appointment_${appointmentId.slice(0, 24)}`,
      }),
    });
    const data = (await response
      .json()
      .catch(() => ({}))) as RazorpayOrderResponse;

    if (!response.ok) {
      throw new BadRequestException(
        data.error?.description ?? 'Unable to create Razorpay order',
      );
    }

    return data;
  }
}
