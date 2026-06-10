import {
  BadRequestException,
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

    return this.paymentRepo.save(payment);
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

    payment.status = PaymentStatus.PAID;
    payment.reference = dto.razorpayPaymentId;
    payment.providerPaymentId = dto.razorpayPaymentId;
    payment.notes = [payment.notes, 'Razorpay payment verified']
      .filter(Boolean)
      .join('\n');

    return this.paymentRepo.save(payment);
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

    if (!orderId) return { received: true };

    const payment = await this.paymentRepo.findOne({
      where: {
        providerOrderId: orderId,
      },
    });

    if (!payment) return { received: true };

    if (payload.event === 'payment.captured') {
      payment.status = PaymentStatus.PAID;
      payment.reference = paymentEntity.id ?? payment.reference;
      payment.providerPaymentId = paymentEntity.id ?? payment.providerPaymentId;
      payment.notes = [payment.notes, 'Razorpay webhook captured payment']
        .filter(Boolean)
        .join('\n');
      await this.paymentRepo.save(payment);
    }

    if (payload.event === 'payment.failed') {
      payment.status = PaymentStatus.FAILED;
      payment.reference = paymentEntity.id ?? payment.reference;
      payment.providerPaymentId = paymentEntity.id ?? payment.providerPaymentId;
      payment.notes = [payment.notes, 'Razorpay webhook marked payment failed']
        .filter(Boolean)
        .join('\n');
      await this.paymentRepo.save(payment);
    }

    return { received: true };
  }

  async refund(id: string, dto: RefundPaymentDto) {
    const payment = await this.paymentRepo.findOne({ where: { id } });

    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === PaymentStatus.FAILED) {
      throw new BadRequestException('Failed payments cannot be refunded');
    }

    const refundable = payment.amount - payment.refundedAmount;
    if (dto.amount <= 0 || dto.amount > refundable) {
      throw new BadRequestException('Refund amount exceeds collected amount');
    }

    payment.refundedAmount += dto.amount;
    payment.notes =
      [payment.notes, dto.notes?.trim()].filter(Boolean).join('\n') || null;
    payment.status =
      payment.refundedAmount >= payment.amount
        ? PaymentStatus.REFUNDED
        : PaymentStatus.PAID;

    return this.paymentRepo.save(payment);
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
