import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { ZoomModule } from '../zoom/zoom.module';
import { ProviderJob } from './entities/provider-job.entity';
import { ProviderJobService } from './provider-job.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProviderJob]),
    MailModule,
    WhatsAppModule,
    ZoomModule,
  ],
  providers: [ProviderJobService],
  exports: [ProviderJobService],
})
export class ReliabilityModule {}
