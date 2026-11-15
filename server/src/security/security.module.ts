import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateLimitBucket } from './rate-limit-bucket.entity';

/** Registers the rate-limit table so the schema and entity list stay in sync. */
@Module({
  imports: [TypeOrmModule.forFeature([RateLimitBucket])],
})
export class SecurityModule {}
