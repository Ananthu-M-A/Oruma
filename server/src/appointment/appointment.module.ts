import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { Appointment } from './entities/appointment.entity';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';

import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, AvailabilitySlot]),
    AuthModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
