import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { Appointment } from './entities/appointment.entity';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { User } from '../user/entities/user.entity';
import { NotificationModule } from '../notification/notification.module';
import { ReliabilityModule } from '../reliability/reliability.module';
import { ReservationCleanupService } from './reservation-cleanup.service';

import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, AvailabilitySlot, User]),
    AuthModule,
    NotificationModule,
    ReliabilityModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, ReservationCleanupService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
