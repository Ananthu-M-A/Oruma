import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DataRetentionService } from './data-retention.service';
import { PrivacyRequest } from './entities/privacy-request.entity';
import { PrivacyController } from './privacy.controller';
import { PrivacyService } from './privacy.service';

@Module({
  imports: [TypeOrmModule.forFeature([PrivacyRequest]), AuthModule],
  controllers: [PrivacyController],
  providers: [PrivacyService, DataRetentionService],
  exports: [PrivacyService],
})
export class PrivacyModule {}
