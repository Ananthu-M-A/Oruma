import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { Appointment } from './entities/appointment.entity';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { MailModule } from '../mail/mail.module';
import { User } from '../user/entities/user.entity';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { ZoomModule } from '../zoom/zoom.module';
import { NotificationModule } from '../notification/notification.module';

import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, AvailabilitySlot, User]),
    AuthModule,
    MailModule,
    WhatsAppModule,
    ZoomModule,
    NotificationModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
