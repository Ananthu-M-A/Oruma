import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac } from 'crypto';
import { Repository } from 'typeorm';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Appointment } from '../appointment/entities/appointment.entity';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from './entities/payment-status.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateRazorpayOrderDto } from './dto/create-razorpay-order.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { VerifyRazorpayPaymentDto } from './dto/verify-razorpay-payment.dto';
import { NotificationType } from '../notification/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { AppointmentService } from '../appointment/appointment.service';

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
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly appointmentService: AppointmentService,
  ) {}

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

    if (user.role !== 'ADMIN' && payment.patient?.id !== user.userId) {
      throw new ForbiddenException('You cannot access this invoice');
    }

    if (![PaymentStatus.PAID, PaymentStatus.REFUNDED].includes(payment.status)) {
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
    await this.sendPaymentNotification(savedPayment, 'Payment recorded', 'Your appointment payment has been recorded.');

    return savedPayment;
  }

  async createRazorpayOrder(dto: CreateRazorpayOrderDto, user: JwtPayload) {
    const appointment = await this.appointmentRepo.findOne({
      where: {
        id: dto.appointmentId,
        patient: {
          id: user.userId,
        },
      },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      throw new BadRequestException('Razorpay is not configured');
    }

    const amount = this.resolveAppointmentAmount(appointment);
    if (amount <= 0) {
      throw new BadRequestException('Appointment amount is not configured');
    }

    const existingPayment = await this.paymentRepo.findOne({
      where: {
        appointment: {
          id: appointment.id,
        },
        provider: 'razorpay',
        status: PaymentStatus.PENDING,
      },
    });

    if (existingPayment?.providerOrderId) {
      return {
        keyId,
        orderId: existingPayment.providerOrderId,
        amount: existingPayment.amount,
        currency: 'INR',
      };
    }

    const order = await this.createRazorpayOrderRequest(
      keyId,
      keySecret,
      amount,
      appointment.id,
    );

    if (!order.id) {
      throw new BadRequestException('Unable to create Razorpay order');
    }

    const payment = this.paymentRepo.create({
      appointment,
      patient: appointment.patient,
      amount,
      status: PaymentStatus.PENDING,
      provider: 'razorpay',
      reference: order.id,
      providerOrderId: order.id,
      notes: `Razorpay order created for appointment ${appointment.id}`,
    });

    await this.paymentRepo.save(payment);

    return {
      keyId,
      orderId: order.id,
      amount,
      currency: order.currency ?? 'INR',
    };
  }

  async verifyRazorpayPayment(dto: VerifyRazorpayPaymentDto, user: JwtPayload) {
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (!keySecret) {
      throw new BadRequestException('Razorpay is not configured');
    }

    const expectedSignature = createHmac('sha256', keySecret)
      .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== dto.razorpaySignature) {
      throw new BadRequestException('Payment verification failed');
    }

    const payment = await this.paymentRepo.findOne({
      where: {
        providerOrderId: dto.razorpayOrderId,
        patient: {
          id: user.userId,
        },
      },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    const shouldNotifyBooking = payment.status !== PaymentStatus.PAID;
    payment.status = PaymentStatus.PAID;
    payment.reference = dto.razorpayPaymentId;
    payment.providerPaymentId = dto.razorpayPaymentId;
    payment.notes = [payment.notes, 'Razorpay payment verified']
      .filter(Boolean)
      .join('\n');

    const savedPayment = await this.paymentRepo.save(payment);
    await this.sendPaymentNotification(savedPayment, 'Payment verified', 'Your appointment payment was verified successfully.');

    if (shouldNotifyBooking && payment.appointment) {
      await this.appointmentService.notifyBookingAfterPayment(
        payment.appointment,
        payment.appointment.contactEmail ?? payment.patient?.email,
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

    if (expectedSignature !== input.signature) {
      throw new BadRequestException('Invalid Razorpay webhook signature');
    }

    const payload = input.payload as RazorpayWebhookPayload;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;

    if (payload.event?.startsWith('refund.')) {
      const refundEntity = payload.payload?.refund?.entity;
      if (refundEntity?.payment_id && refundEntity.id) {
        await this.syncRazorpayRefundStatus({
          id: refundEntity.id,
          payment_id: refundEntity.payment_id,
          amount: refundEntity.amount,
          status: refundEntity.status,
        });
      }
      return { received: true };
    }

    if (!orderId) return { received: true };

    const payment = await this.paymentRepo.findOne({
      where: {
        providerOrderId: orderId,
      },
    });

    if (!payment) return { received: true };

    if (payload.event === 'payment.captured') {
      const shouldNotifyBooking = payment.status !== PaymentStatus.PAID;
      payment.status = PaymentStatus.PAID;
      payment.reference = paymentEntity.id ?? payment.reference;
      payment.providerPaymentId = paymentEntity.id ?? payment.providerPaymentId;
      payment.notes = [payment.notes, 'Razorpay webhook captured payment']
        .filter(Boolean)
        .join('\n');
      const savedPayment = await this.paymentRepo.save(payment);
      await this.sendPaymentNotification(savedPayment, 'Payment captured', 'Your appointment payment was captured successfully.');
      if (shouldNotifyBooking && payment.appointment) {
        await this.appointmentService.notifyBookingAfterPayment(
          payment.appointment,
          payment.appointment.contactEmail ?? payment.patient?.email,
        );
      }
    }

    if (payload.event === 'payment.failed') {
      payment.status = PaymentStatus.FAILED;
      payment.reference = paymentEntity.id ?? payment.reference;
      payment.providerPaymentId = paymentEntity.id ?? payment.providerPaymentId;
      payment.notes = [payment.notes, 'Razorpay webhook marked payment failed']
        .filter(Boolean)
        .join('\n');
      const savedPayment = await this.paymentRepo.save(payment);
      await this.sendPaymentNotification(savedPayment, 'Payment failed', 'Your appointment payment failed. Please try again or contact support.');
    }

    return { received: true };
  }

  async refund(id: string, dto: RefundPaymentDto) {
    const payment = await this.paymentRepo.findOne({ where: { id } });

    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === PaymentStatus.FAILED) {
      throw new BadRequestException('Failed payments cannot be refunded');
    }
    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Only paid payments can be refunded');
    }

    const refundable = payment.amount - payment.refundedAmount;
    if (dto.amount <= 0 || dto.amount > refundable) {
      throw new BadRequestException('Refund amount exceeds collected amount');
    }

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

    const savedPayment = await this.paymentRepo.save(payment);
    await this.sendPaymentNotification(savedPayment, 'Refund initiated', `A refund of ${this.formatCurrency(refundResult.amount)} was initiated for your payment.`);

    return savedPayment;
  }

  async getSummary() {
    const payments = await this.paymentRepo.find();

    return {
      collected: payments
        .filter((payment) => payment.status !== PaymentStatus.FAILED)
        .reduce((sum, payment) => sum + payment.amount, 0),
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
    if (
      appointment.service === 'Couple Therapy' &&
      appointment.therapist.couplePrice
    ) {
      return appointment.therapist.couplePrice;
    }

    return appointment.therapist.price;
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
            <p class="muted">Therapist: ${this.escapeHtml(therapist?.name ?? 'Therapist')}</p>
          </td>
          <td>${this.escapeHtml(sessionDate)}</td>
          <td>${this.formatCurrency(amount)}</td>
        </tr>
      </tbody>
    </table>

    <section class="totals">
      <div><span>Subtotal</span><strong>${this.formatCurrency(amount)}</strong></div>
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
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata',
    }).format(date);
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
