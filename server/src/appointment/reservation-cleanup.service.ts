import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { SlotStatus } from '../availability/entities/slot-status.enum';
import { NotificationType } from '../notification/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { PaymentStatus } from '../payment/entities/payment-status.enum';
import { AppointmentStatus } from './entities/appointment-status.enum';
import { Appointment } from './entities/appointment.entity';

@Injectable()
export class ReservationCleanupService {
  private readonly logger = new Logger(ReservationCleanupService.name);
  private workerActive = false;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
  ) {}

  @Interval('unpaid-reservation-cleanup', 60_000)
  async run() {
    if (this.workerActive) return;
    if (
      this.configService.get<string>('RESERVATION_CLEANUP_ENABLED', 'true') ===
      'false'
    )
      return;
    this.workerActive = true;
    try {
      const expired = await this.expireReservations(new Date());
      if (expired.length)
        this.logger.log(
          JSON.stringify({
            event: 'unpaid_reservations_expired',
            count: expired.length,
            appointmentIds: expired.map((item) => item.id),
          }),
        );
      await Promise.allSettled(
        expired
          .filter((item) => item.patient?.id)
          .map((item) =>
            this.notificationService.create({
              recipientId: item.patient.id,
              type: NotificationType.APPOINTMENT,
              title: 'Booking reservation expired',
              body: 'The unpaid booking reservation expired and its time slot was released.',
              actionUrl: '/therapists',
              metadata: { appointmentId: item.id },
            }),
          ),
      );
    } finally {
      this.workerActive = false;
    }
  }

  expireReservations(now: Date) {
    const configuredGraceMinutes = Number(
      this.configService.get<string>(
        'PAYMENT_RECONCILIATION_GRACE_MINUTES',
        '15',
      ),
    );
    const graceMinutes = Number.isFinite(configuredGraceMinutes)
      ? Math.max(0, configuredGraceMinutes)
      : 15;
    const gatewayCutoff = new Date(now.getTime() - graceMinutes * 60_000);
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Appointment);
      const appointments = await repository
        .createQueryBuilder('appointment')
        .setLock('pessimistic_write', undefined, ['appointment'])
        .setOnLocked('skip_locked')
        .leftJoinAndSelect('appointment.slot', 'slot')
        .leftJoinAndSelect('appointment.patient', 'patient')
        .leftJoinAndSelect('appointment.therapist', 'therapist')
        .where('appointment.status = :status', {
          status: AppointmentStatus.PENDING,
        })
        .andWhere('appointment.reservationExpiresAt IS NOT NULL')
        .andWhere('appointment.reservationExpiresAt <= :now', { now })
        .andWhere(
          `(NOT EXISTS (
            SELECT 1 FROM "payment" pending_payment
            WHERE pending_payment."appointmentId" = appointment.id
              AND pending_payment.status = :pendingStatus
              AND pending_payment."providerOrderId" IS NOT NULL
          ) OR appointment."reservationExpiresAt" <= :gatewayCutoff)`,
          { pendingStatus: PaymentStatus.PENDING, gatewayCutoff },
        )
        .andWhere(
          `NOT EXISTS (
          SELECT 1 FROM "payment" payment
          WHERE payment."appointmentId" = appointment.id
            AND payment.status IN (:...settledStatuses)
        )`,
          { settledStatuses: [PaymentStatus.PAID, PaymentStatus.REFUNDED] },
        )
        .take(100)
        .getMany();
      for (const appointment of appointments) {
        Object.assign(appointment, {
          status: AppointmentStatus.CANCELLED,
          reservationExpiresAt: null,
          cancelledAt: now,
          cancellationReason: 'Unpaid reservation expired',
          meetingLink: null,
        });
        await repository.save(appointment);
        if (appointment.slot?.id)
          await manager
            .getRepository(AvailabilitySlot)
            .update(
              { id: appointment.slot.id, status: SlotStatus.BOOKED },
              { status: SlotStatus.AVAILABLE },
            );
      }
      return appointments;
    });
  }
}
