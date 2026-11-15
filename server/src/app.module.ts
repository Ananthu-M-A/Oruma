import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TherapistModule } from './therapist/therapist.module';
import { AppointmentModule } from './appointment/appointment.module';
import { AvailabilityModule } from './availability/availability.module';
import { AdminModule } from './admin/admin.module';
import { PaymentModule } from './payment/payment.module';
import { TicketModule } from './ticket/ticket.module';
import { EnquiryModule } from './enquiry/enquiry.module';
import { CaseSheetModule } from './case-sheet/case-sheet.module';
import { MediaModule } from './media/media.module';
import { NotificationModule } from './notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuditModule } from './audit/audit.module';
import { PrivacyModule } from './privacy/privacy.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    TherapistModule,
    AppointmentModule,
    AvailabilityModule,
    PaymentModule,
    TicketModule,
    EnquiryModule,
    CaseSheetModule,
    MediaModule,
    NotificationModule,
    AdminModule,
    AuditModule,
    PrivacyModule,
    SecurityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
