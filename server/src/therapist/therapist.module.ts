import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Appointment } from '../appointment/entities/appointment.entity';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { Therapist } from './entities/therapist.entity';
import { TherapistController } from './therapist.controller';
import { TherapistService } from './therapist.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Therapist, Appointment, AvailabilitySlot]),
    AuthModule,
    UserModule,
    MailModule,
  ],
  controllers: [TherapistController],
  providers: [TherapistService],
  exports: [TherapistService],
})
export class TherapistModule {}
