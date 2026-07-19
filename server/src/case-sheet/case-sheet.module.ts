import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentModule } from '../appointment/appointment.module';
import { AuthModule } from '../auth/auth.module';
import { CaseSheetController } from './case-sheet.controller';
import { CaseSheetService } from './case-sheet.service';
import { CaseSheet } from './entities/case-sheet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CaseSheet]),
    AuthModule,
    AppointmentModule,
  ],
  controllers: [CaseSheetController],
  providers: [CaseSheetService],
  exports: [CaseSheetService],
})
export class CaseSheetModule {}
