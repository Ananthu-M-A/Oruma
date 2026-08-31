import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Appointment } from '../appointment/entities/appointment.entity';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { Therapist } from './entities/therapist.entity';
import { TherapistController } from './therapist.controller';
import { TherapistService } from './therapist.service';
import { ReliabilityModule } from '../reliability/reliability.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Therapist, Appointment, AvailabilitySlot]),
    AuthModule,
    UserModule,
    NotificationModule,
    ReliabilityModule,
    MediaModule,
  ],
  controllers: [TherapistController],
  providers: [TherapistService],
  exports: [TherapistService],
})
export class TherapistModule {}
