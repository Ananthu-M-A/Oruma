import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Interval } from '@nestjs/schedule';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import {
  DataSource,
  EntityManager,
  LessThan,
  LessThanOrEqual,
  Repository,
} from 'typeorm';
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
import { businessAddress, businessConfig } from '../config/business.config';
import { buildApprovedPaymentMetadata } from './payment-metadata';
import {
  PaymentWebhookEvent,
  PaymentWebhookStatus,
} from './entities/payment-webhook-event.entity';
import {
  PaymentRefund,
  PaymentRefundStatus,
} from './entities/payment-refund.entity';

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

type RazorpayRefundCollectionResponse = {
  items?: RazorpayRefundResponse[];
  error?: { description?: string };
};

type RazorpayPaymentResponse = {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  captured?: boolean;
  error?: { description?: string };
};

type RefundSubmission = {
  amount: number;
  note: string;
  status: PaymentRefundStatus;
  providerRefundId: string | null;
  providerResponse: Record<string, unknown> | null;
  history: Record<string, unknown>;
};

class ConfirmedRefundFailure extends Error {}

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        currency?: string;
        captured?: boolean;
        status?: string;
        method?: string;
        error_code?: string | null;
        error_description?: string | null;
        error_reason?: string | null;
        error_source?: string | null;
        error_step?: string | null;
      };
    };
    refund?: {
      entity?: {
        id?: string;
        payment_id?: string;
        amount?: number;
        status?: 'pending' | 'processed' | 'failed';
        receipt?: string | null;
      };
    };
  };
};

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(PaymentWebhookEvent)
    private readonly webhookEventRepo: Repository<PaymentWebhookEvent>,
    @InjectRepository(PaymentRefund)
    private readonly paymentRefundRepo: Repository<PaymentRefund>,
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

    const providerPayment = await this.fetchRazorpayPayment(
      dto.razorpayPaymentId,
    );
    if (
      providerPayment.order_id !== dto.razorpayOrderId ||
      providerPayment.status !== 'captured' ||
      providerPayment.captured === false
    ) {
      throw new ConflictException(
        'Razorpay has not confirmed this payment as captured yet',
      );
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
      if (
        providerPayment.amount !== Math.round(payment.amount * 100) ||
        providerPayment.currency !== 'INR'
      ) {
        throw new BadRequestException(
          'Captured payment amount or currency does not match the booking',
        );
      }
      if (
        payment.providerPaymentId &&
        payment.providerPaymentId !== dto.razorpayPaymentId
      ) {
        throw new ConflictException(
          'This order is already linked to a different payment',
        );
      }
      if (payment.status === PaymentStatus.REFUNDED)
        throw new BadRequestException(
          'A refunded payment cannot be re-verified',
        );
      if (payment.appointment) {
        const lockedAppointment = await manager
          .getRepository(Appointment)
          .findOne({
            where: { id: payment.appointment.id },
            relations: ['patient', 'therapist', 'slot'],
            lock: { mode: 'pessimistic_write' },
          });
        if (lockedAppointment) payment.appointment = lockedAppointment;
      }
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
      return {
        payment,
        changed,
        cancelled: payment.appointment?.status === AppointmentStatus.CANCELLED,
      };
    });
    const savedPayment = result.payment;
    if (result.cancelled) {
      return this.refundCancelledCapture(savedPayment);
    }
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

  findRefundOperations() {
    return this.paymentRefundRepo.find({
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
          entity.status !== 'captured' ||
          entity.captured === false ||
          entity.amount !== Math.round(payment.amount * 100) ||
          entity.currency !== 'INR'
        ) {
          throw new BadRequestException(
            'Razorpay webhook payment details do not match the booking',
          );
        }
        if (
          payment.providerPaymentId &&
          entity.id &&
          payment.providerPaymentId !== entity.id
        ) {
          throw new ConflictException(
            'This order is already linked to a different payment',
          );
        }
        if (payment.appointment) {
          const lockedAppointment = await manager
            .getRepository(Appointment)
            .findOne({
              where: { id: payment.appointment.id },
              relations: ['patient', 'therapist', 'slot'],
              lock: { mode: 'pessimistic_write' },
            });
          if (lockedAppointment) payment.appointment = lockedAppointment;
        }
        if (
          [PaymentStatus.PAID, PaymentStatus.REFUNDED].includes(payment.status)
        )
          return {
            payment,
            captured: false,
            failed: false,
            cancelled:
              payment.appointment?.status === AppointmentStatus.CANCELLED,
          };
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
        return {
          payment,
          captured: true,
          failed: false,
          cancelled:
            payment.appointment?.status === AppointmentStatus.CANCELLED,
        };
      }
      if (
        payload.event === 'payment.failed' &&
        ![PaymentStatus.PAID, PaymentStatus.REFUNDED].includes(payment.status)
      ) {
        payment.status = PaymentStatus.FAILED;
        payment.reference = entity.id ?? payment.reference;
        payment.providerPaymentId = entity.id ?? payment.providerPaymentId;
        const failureDetails = [
          entity.method && `method=${entity.method}`,
          entity.error_code && `code=${entity.error_code}`,
          entity.error_reason && `reason=${entity.error_reason}`,
          entity.error_source && `source=${entity.error_source}`,
          entity.error_step && `step=${entity.error_step}`,
          entity.error_description &&
            `description=${entity.error_description.slice(0, 300)}`,
        ]
          .filter(Boolean)
          .join(', ');
        payment.notes = [
          payment.notes,
          `Razorpay webhook marked payment failed${
            failureDetails ? ` (${failureDetails})` : ''
          }`,
        ]
          .filter(Boolean)
          .join('\n');
        await repository.save(payment);
        return {
          payment,
          captured: false,
          failed: true,
          cancelled: false,
        };
      }
      return {
        payment,
        captured: false,
        failed: false,
        cancelled: false,
      };
    });
    if (!result) return;
    if (result.cancelled) {
      await this.refundCancelledCapture(result.payment);
    } else if (result.captured) {
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
    } else if (result.failed) {
      await this.sendPaymentNotification(
        result.payment,
        'Payment failed',
        'Your appointment payment failed. Please try again or contact support.',
      );
    }
  }

  async refund(id: string, dto: RefundPaymentDto, idempotencyKey?: string) {
    const key = this.validateRefundIdempotencyKey(idempotencyKey);
    const reservation = await this.reserveRefundOperation(id, dto, key);

    if (!reservation.shouldSubmit) {
      if (
        reservation.operation.status === PaymentRefundStatus.UNKNOWN ||
        reservation.operation.status === PaymentRefundStatus.REQUESTED
      ) {
        if (
          reservation.operation.status === PaymentRefundStatus.REQUESTED &&
          reservation.payment.provider !== 'razorpay'
        ) {
          const finalized = await this.finalizeRefundOperation(
            reservation.operation.id,
            dto,
            this.createManualRefundRecord(
              reservation.payment,
              dto,
              reservation.operation.receipt,
            ),
          );
          if (finalized.changed) {
            await this.sendPaymentNotification(
              finalized.payment,
              'Refund initiated',
              `A refund of ${this.formatCurrency(dto.amount)} was initiated for your payment.`,
            );
          }
          return finalized.payment;
        }
        return this.reconcileUncertainRefund(
          reservation.payment,
          reservation.operation,
          dto,
        );
      }
      return reservation.payment;
    }

    let refundResult: RefundSubmission;
    try {
      refundResult =
        reservation.payment.provider === 'razorpay'
          ? await this.createRazorpayRefund(
              reservation.payment,
              dto,
              reservation.operation.receipt,
            )
          : this.createManualRefundRecord(
              reservation.payment,
              dto,
              reservation.operation.receipt,
            );
    } catch (error) {
      const confirmed = error instanceof ConfirmedRefundFailure;
      await this.markRefundOperationError(
        reservation.operation.id,
        error,
        confirmed ? PaymentRefundStatus.FAILED : PaymentRefundStatus.UNKNOWN,
      );
      if (confirmed) throw new BadRequestException(error.message);
      throw new ServiceUnavailableException(
        'The refund result is not yet known. Do not submit a new refund; retry with the same Idempotency-Key so it can be reconciled.',
      );
    }

    const finalized = await this.finalizeRefundOperation(
      reservation.operation.id,
      dto,
      refundResult,
    );
    if (finalized.changed) {
      await this.sendPaymentNotification(
        finalized.payment,
        'Refund initiated',
        `A refund of ${this.formatCurrency(dto.amount)} was initiated for your payment.`,
      );
    }

    return finalized.payment;
  }

  private validateRefundIdempotencyKey(value?: string) {
    const key = value?.trim();
    if (!key || !/^[A-Za-z0-9:_-]{8,128}$/.test(key)) {
      throw new BadRequestException(
        'A valid Idempotency-Key header is required for refunds',
      );
    }
    return key;
  }

  private async reserveRefundOperation(
    paymentId: string,
    dto: RefundPaymentDto,
    idempotencyKey: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const paymentRepository = manager.getRepository(Payment);
      const refundRepository = manager.getRepository(PaymentRefund);
      const payment = await paymentRepository
        .createQueryBuilder('payment')
        .setLock('pessimistic_write', undefined, ['payment'])
        .leftJoinAndSelect('payment.patient', 'patient')
        .leftJoinAndSelect('payment.appointment', 'appointment')
        .where('payment.id = :id', { id: paymentId })
        .getOne();
      if (!payment) throw new NotFoundException('Payment not found');

      const existing = await refundRepository.findOne({
        where: { idempotencyKey },
        lock: { mode: 'pessimistic_write' },
      });
      if (existing) {
        if (
          existing.paymentId !== payment.id ||
          existing.amount !== dto.amount
        ) {
          throw new ConflictException(
            'This Idempotency-Key was already used for a different refund request',
          );
        }
        if (existing.status === PaymentRefundStatus.FAILED) {
          Object.assign(existing, {
            status: PaymentRefundStatus.REQUESTED,
            lastError: null,
            completedAt: null,
            attempts: existing.attempts + 1,
          });
          await refundRepository.save(existing);
          return { payment, operation: existing, shouldSubmit: true };
        }
        return { payment, operation: existing, shouldSubmit: false };
      }

      const unresolved = await refundRepository.findOne({
        where: [
          { paymentId: payment.id, status: PaymentRefundStatus.REQUESTED },
          { paymentId: payment.id, status: PaymentRefundStatus.UNKNOWN },
        ],
        order: { createdAt: 'DESC' },
      });
      if (unresolved) {
        throw new ConflictException(
          'This payment has an unresolved refund. Do not submit another refund; reconcile the existing operation from the admin refund log.',
        );
      }

      if (payment.status === PaymentStatus.FAILED) {
        throw new BadRequestException('Failed payments cannot be refunded');
      }
      if (payment.status !== PaymentStatus.PAID) {
        throw new BadRequestException('Only paid payments can be refunded');
      }

      const reserved = await refundRepository
        .createQueryBuilder('refund')
        .select('COALESCE(SUM(refund.amount), 0)', 'total')
        .where('refund.paymentId = :paymentId', { paymentId: payment.id })
        .andWhere('refund.status IN (:...statuses)', {
          statuses: [
            PaymentRefundStatus.REQUESTED,
            PaymentRefundStatus.SUBMITTED,
            PaymentRefundStatus.PROCESSED,
            PaymentRefundStatus.UNKNOWN,
            PaymentRefundStatus.RECORDED,
          ],
        })
        .getRawOne<{ total: string }>();
      const refundable = payment.amount - Number(reserved?.total ?? 0);
      if (dto.amount <= 0 || dto.amount > refundable) {
        throw new BadRequestException('Refund amount exceeds collected amount');
      }

      const receipt = `oru_rfnd_${createHash('sha256')
        .update(`${payment.id}:${idempotencyKey}`)
        .digest('hex')
        .slice(0, 24)}`;
      const operation = await refundRepository.save(
        refundRepository.create({
          payment,
          paymentId: payment.id,
          idempotencyKey,
          receipt,
          amount: dto.amount,
          provider: payment.provider,
          providerPaymentId: payment.providerPaymentId,
          providerRefundId: null,
          status: PaymentRefundStatus.REQUESTED,
          speed: dto.speed ?? null,
          providerResponse: null,
          notes: dto.notes?.trim() || null,
          lastError: null,
          attempts: 1,
          submittedAt: null,
          completedAt: null,
        }),
      );
      return { payment, operation, shouldSubmit: true };
    });
  }

  private async markRefundOperationError(
    operationId: string,
    error: unknown,
    status: PaymentRefundStatus.FAILED | PaymentRefundStatus.UNKNOWN,
  ) {
    await this.paymentRefundRepo.update(
      { id: operationId },
      {
        status,
        lastError: (error instanceof Error
          ? error.message
          : 'Unknown error'
        ).slice(0, 4000),
        completedAt: status === PaymentRefundStatus.FAILED ? new Date() : null,
      },
    );
  }

  private async finalizeRefundOperation(
    operationId: string,
    dto: RefundPaymentDto,
    result: RefundSubmission,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const refundRepository = manager.getRepository(PaymentRefund);
      const operation = await refundRepository.findOne({
        where: { id: operationId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!operation) throw new NotFoundException('Refund operation not found');
      const paymentRepository = manager.getRepository(Payment);
      const payment = await paymentRepository
        .createQueryBuilder('payment')
        .setLock('pessimistic_write', undefined, ['payment'])
        .leftJoinAndSelect('payment.patient', 'patient')
        .leftJoinAndSelect('payment.appointment', 'appointment')
        .where('payment.id = :id', { id: operation.paymentId })
        .getOne();
      if (!payment) throw new NotFoundException('Payment not found');

      if (
        [
          PaymentRefundStatus.SUBMITTED,
          PaymentRefundStatus.PROCESSED,
          PaymentRefundStatus.RECORDED,
        ].includes(operation.status)
      ) {
        return { payment, changed: false };
      }

      Object.assign(operation, {
        providerRefundId: result.providerRefundId,
        providerResponse: result.providerResponse,
        status: result.status,
        lastError: null,
        submittedAt: new Date(),
        completedAt:
          result.status === PaymentRefundStatus.PROCESSED ||
          result.status === PaymentRefundStatus.RECORDED
            ? new Date()
            : null,
      });
      await refundRepository.save(operation);

      const history = {
        ...result.history,
        idempotencyKey: operation.idempotencyKey,
        operationId: operation.id,
      };
      const alreadyRecorded = (payment.refundHistory ?? []).some(
        (entry) => entry.operationId === operation.id,
      );
      if (!alreadyRecorded) {
        payment.refundHistory = [...(payment.refundHistory ?? []), history];
        payment.notes =
          [payment.notes, result.note, dto.notes?.trim()]
            .filter(Boolean)
            .join('\n') || null;
      }

      await this.recalculateRefundedAmount(manager, payment);
      return { payment: await paymentRepository.save(payment), changed: true };
    });
  }

  private async recalculateRefundedAmount(
    manager: EntityManager,
    payment: Payment,
  ) {
    const total = await manager
      .getRepository(PaymentRefund)
      .createQueryBuilder('refund')
      .select('COALESCE(SUM(refund.amount), 0)', 'total')
      .where('refund.paymentId = :paymentId', { paymentId: payment.id })
      .andWhere('refund.status IN (:...statuses)', {
        statuses: [
          PaymentRefundStatus.SUBMITTED,
          PaymentRefundStatus.PROCESSED,
          PaymentRefundStatus.RECORDED,
        ],
      })
      .getRawOne<{ total: string }>();
    payment.refundedAmount = Number(total?.total ?? 0);
    payment.status =
      payment.refundedAmount >= payment.amount
        ? PaymentStatus.REFUNDED
        : PaymentStatus.PAID;
  }

  private async reconcileUncertainRefund(
    payment: Payment,
    operation: PaymentRefund,
    dto: RefundPaymentDto,
  ) {
    if (payment.provider !== 'razorpay' || !payment.providerPaymentId) {
      throw new ConflictException(
        'The refund outcome is not confirmed and requires administrator reconciliation',
      );
    }
    const refunds = await this.fetchRazorpayRefunds(payment.providerPaymentId);
    const match = refunds.find(
      (refund) => refund.receipt === operation.receipt,
    );
    if (!match) {
      throw new ConflictException(
        'Razorpay has not returned a matching refund yet. Do not create another refund; check the gateway dashboard and retry this same Idempotency-Key later.',
      );
    }
    return (
      await this.finalizeRefundOperation(
        operation.id,
        dto,
        this.toRazorpayRefundSubmission(payment, dto, operation.receipt, match),
      )
    ).payment;
  }

  private async refundCancelledCapture(payment: Payment) {
    const amount = payment.amount - payment.refundedAmount;
    if (amount <= 0) return payment;
    this.logger.warn(
      `Captured payment ${payment.id} belongs to a cancelled appointment; initiating an idempotent full refund.`,
    );
    return this.refund(
      payment.id,
      {
        amount,
        speed: 'normal',
        notes: 'Automatic refund for a capture received after cancellation.',
      },
      `late-capture:${payment.id}`,
    );
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

  private async createRazorpayRefund(
    payment: Payment,
    dto: RefundPaymentDto,
    receipt: string,
  ) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    const providerPaymentId = payment.providerPaymentId;

    if (!keyId || !keySecret) {
      throw new ConfirmedRefundFailure('Razorpay is not configured');
    }

    if (!providerPaymentId) {
      throw new ConfirmedRefundFailure(
        'Razorpay payment id is missing for this payment',
      );
    }

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
          notes: buildApprovedPaymentMetadata({
            bookingReference: payment.appointment?.id,
            invoiceReference: this.getInvoiceNumber(payment),
            amount: dto.amount,
            paymentStatus: 'refund_requested',
          }),
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    const data = (await response
      .json()
      .catch(() => ({}))) as RazorpayRefundResponse;

    if (data.status === 'failed') {
      throw new ConfirmedRefundFailure(
        data.error?.description ?? 'Unable to create Razorpay refund',
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error?.description ??
          `Razorpay returned an ambiguous refund response (${response.status})`,
      );
    }

    if (!data.id || !data.amount) {
      throw new Error('Razorpay refund response is incomplete');
    }

    return this.toRazorpayRefundSubmission(payment, dto, receipt, data);
  }

  private createManualRefundRecord(
    payment: Payment,
    dto: RefundPaymentDto,
    operationReceipt: string,
  ): RefundSubmission {
    const receipt = dto.receipt?.trim() || operationReceipt;
    return {
      amount: dto.amount,
      note: 'Manual refund recorded.',
      status: PaymentRefundStatus.RECORDED,
      providerRefundId: null,
      providerResponse: null,
      history: {
        provider: payment.provider,
        amount: dto.amount,
        status: 'recorded',
        receipt,
        createdAt: new Date().toISOString(),
      },
    };
  }

  private toRazorpayRefundSubmission(
    payment: Payment,
    dto: RefundPaymentDto,
    receipt: string,
    data: RazorpayRefundResponse,
  ): RefundSubmission {
    if (!data.id || !data.amount) {
      throw new Error('Razorpay refund response is incomplete');
    }
    const refundedAmount = data.amount / 100;
    if (refundedAmount !== dto.amount) {
      throw new Error('Razorpay refund amount does not match the request');
    }
    const status =
      data.status === 'processed'
        ? PaymentRefundStatus.PROCESSED
        : data.status === 'failed'
          ? PaymentRefundStatus.FAILED
          : PaymentRefundStatus.SUBMITTED;
    return {
      amount: refundedAmount,
      note: `Razorpay refund ${data.id} created with status ${data.status ?? 'pending'}.`,
      status,
      providerRefundId: data.id,
      providerResponse: data,
      history: {
        provider: 'razorpay',
        providerRefundId: data.id,
        providerPaymentId: payment.providerPaymentId,
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

  private async fetchRazorpayPayment(paymentId: string) {
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: { Authorization: this.getRazorpayAuthorization() },
        signal: AbortSignal.timeout(10_000),
      },
    );
    const data = (await response
      .json()
      .catch(() => ({}))) as RazorpayPaymentResponse;
    if (!response.ok) {
      throw new ServiceUnavailableException(
        data.error?.description ?? 'Unable to verify payment with Razorpay',
      );
    }
    return data;
  }

  private async fetchRazorpayRefunds(paymentId: string) {
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refunds?count=100`,
      {
        headers: { Authorization: this.getRazorpayAuthorization() },
        signal: AbortSignal.timeout(10_000),
      },
    );
    const data = (await response
      .json()
      .catch(() => ({}))) as RazorpayRefundCollectionResponse;
    if (!response.ok) {
      throw new ServiceUnavailableException(
        data.error?.description ?? 'Unable to reconcile refunds with Razorpay',
      );
    }
    return data.items ?? [];
  }

  private getRazorpayAuthorization() {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (!keyId || !keySecret) {
      throw new BadRequestException('Razorpay is not configured');
    }
    return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
  }

  private async syncRazorpayRefundStatus(refund: {
    id: string;
    payment_id: string;
    amount?: number;
    status?: 'pending' | 'processed' | 'failed';
    receipt?: string | null;
  }) {
    const operation = await this.paymentRefundRepo.findOne({
      where: [
        { providerRefundId: refund.id },
        ...(refund.receipt ? [{ receipt: refund.receipt }] : []),
      ],
      relations: ['payment'],
    });

    if (operation) {
      const result = await this.dataSource.transaction(async (manager) => {
        const refundRepository = manager.getRepository(PaymentRefund);
        const lockedOperation = await refundRepository.findOne({
          where: { id: operation.id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!lockedOperation) return null;
        const paymentRepository = manager.getRepository(Payment);
        const payment = await paymentRepository
          .createQueryBuilder('payment')
          .setLock('pessimistic_write', undefined, ['payment'])
          .leftJoinAndSelect('payment.patient', 'patient')
          .leftJoinAndSelect('payment.appointment', 'appointment')
          .where('payment.id = :id', { id: lockedOperation.paymentId })
          .getOne();
        if (!payment) return null;

        const nextStatus =
          refund.status === 'processed'
            ? PaymentRefundStatus.PROCESSED
            : refund.status === 'failed'
              ? PaymentRefundStatus.FAILED
              : PaymentRefundStatus.SUBMITTED;
        const terminal = [
          PaymentRefundStatus.PROCESSED,
          PaymentRefundStatus.FAILED,
          PaymentRefundStatus.RECORDED,
        ].includes(lockedOperation.status);
        if (terminal && lockedOperation.status !== nextStatus) {
          return { payment, failed: false, changed: false };
        }

        const changed =
          lockedOperation.status !== nextStatus ||
          lockedOperation.providerRefundId !== refund.id;
        Object.assign(lockedOperation, {
          providerRefundId: refund.id,
          status: nextStatus,
          providerResponse: {
            ...(lockedOperation.providerResponse ?? {}),
            ...refund,
          },
          lastError:
            nextStatus === PaymentRefundStatus.FAILED
              ? 'Razorpay reported that the refund failed.'
              : null,
          submittedAt: lockedOperation.submittedAt ?? new Date(),
          completedAt:
            nextStatus === PaymentRefundStatus.PROCESSED ||
            nextStatus === PaymentRefundStatus.FAILED
              ? new Date()
              : null,
        });
        await refundRepository.save(lockedOperation);

        const history = payment.refundHistory ?? [];
        const index = history.findIndex(
          (entry) =>
            entry.operationId === lockedOperation.id ||
            entry.providerRefundId === refund.id,
        );
        const update = {
          provider: 'razorpay',
          providerRefundId: refund.id,
          providerPaymentId: refund.payment_id,
          operationId: lockedOperation.id,
          idempotencyKey: lockedOperation.idempotencyKey,
          amount: (refund.amount ?? lockedOperation.amount * 100) / 100,
          receipt: refund.receipt ?? lockedOperation.receipt,
          status: refund.status ?? 'pending',
          syncedAt: new Date().toISOString(),
        };
        payment.refundHistory =
          index >= 0
            ? history.map((entry, entryIndex) =>
                entryIndex === index ? { ...entry, ...update } : entry,
              )
            : [...history, update];
        await this.recalculateRefundedAmount(manager, payment);
        payment.notes =
          [
            payment.notes,
            changed &&
              `Razorpay refund ${refund.id} webhook status: ${refund.status ?? 'pending'}.`,
          ]
            .filter(Boolean)
            .join('\n') || null;
        return {
          payment: await paymentRepository.save(payment),
          failed: nextStatus === PaymentRefundStatus.FAILED,
          changed,
        };
      });
      if (result?.failed && result.changed) {
        await this.sendPaymentNotification(
          result.payment,
          'Refund failed',
          'A refund attempt failed at the payment gateway. The Oruma team will review it.',
        );
      }
      return;
    }

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
    const invoiceNumber = this.getInvoiceNumber(payment);
    const amount = payment.amount;
    const refunded = payment.refundedAmount;
    const netPaid = amount - refunded;
    const serviceName = 'Online counselling or wellness session';
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
        <h2>${this.escapeHtml(businessConfig.brandName)}</h2>
        <p><strong>Operated by:</strong> ${this.escapeHtml(businessConfig.operatorLegalName)}</p>
        <p>${this.escapeHtml(businessConfig.serviceDescription)}</p>
        <p>${this.escapeHtml(businessAddress)}</p>
        <p>${this.escapeHtml(businessConfig.emails.support)} · ${this.escapeHtml(businessConfig.supportPhone.display)}</p>
        ${businessConfig.gstin ? `<p>GSTIN: ${this.escapeHtml(businessConfig.gstin)}</p>` : ''}
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
        ${appointment?.id ? `<p>Booking reference: ${this.escapeHtml(appointment.id)}</p>` : ''}
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

    <p class="muted" style="margin-top: 32px;">This invoice was generated by ${this.escapeHtml(businessConfig.brandName)}, operated by ${this.escapeHtml(businessConfig.operatorLegalName)}, for a digitally delivered counselling or wellness service.</p>
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
        receipt: `booking_${appointmentId.slice(0, 24)}`,
        notes: buildApprovedPaymentMetadata({
          bookingReference: appointmentId,
          serviceCategory: 'counselling',
          amount,
          paymentStatus: 'pending',
        }),
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
