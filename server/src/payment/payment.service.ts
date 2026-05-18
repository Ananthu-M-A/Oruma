import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../appointment/entities/appointment.entity';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from './entities/payment-status.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  findAll() {
    return this.paymentRepo.find({ order: { createdAt: 'DESC' } });
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
    payment.notes = [payment.notes, dto.notes?.trim()].filter(Boolean).join('\n') || null;
    payment.status =
      payment.refundedAmount >= payment.amount ? PaymentStatus.REFUNDED : PaymentStatus.PAID;

    return this.paymentRepo.save(payment);
  }

  async getSummary() {
    const payments = await this.paymentRepo.find();

    return {
      collected: payments
        .filter((payment) => payment.status !== PaymentStatus.FAILED)
        .reduce((sum, payment) => sum + payment.amount, 0),
      refunds: payments.reduce((sum, payment) => sum + payment.refundedAmount, 0),
      pending: payments
        .filter((payment) => payment.status === PaymentStatus.PENDING)
        .reduce((sum, payment) => sum + payment.amount, 0),
    };
  }
}
