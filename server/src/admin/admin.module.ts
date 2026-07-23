import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../appointment/entities/appointment.entity';
import { AuthModule } from '../auth/auth.module';
import { Therapist } from '../therapist/entities/therapist.entity';
import { CaseSheetModule } from '../case-sheet/case-sheet.module';
import { PaymentModule } from '../payment/payment.module';
import { TicketModule } from '../ticket/ticket.module';
import { UserModule } from '../user/user.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ReliabilityModule } from '../reliability/reliability.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Therapist]),
    AuthModule,
    UserModule,
    PaymentModule,
    TicketModule,
    CaseSheetModule,
    ReliabilityModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
