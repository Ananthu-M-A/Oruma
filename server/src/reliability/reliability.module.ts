import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { ProviderJob } from './entities/provider-job.entity';
import { ProviderJobService } from './provider-job.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderJob]), MailModule],
  providers: [ProviderJobService],
  exports: [ProviderJobService],
})
export class ReliabilityModule {}
