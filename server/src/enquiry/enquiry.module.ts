import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { ReliabilityModule } from '../reliability/reliability.module';
import { Enquiry } from './entities/enquiry.entity';
import { EnquiryController } from './enquiry.controller';
import { EnquiryService } from './enquiry.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enquiry]),
    AuthModule,
    NotificationModule,
    ReliabilityModule,
  ],
  controllers: [EnquiryController],
  providers: [EnquiryService],
})
export class EnquiryModule {}
