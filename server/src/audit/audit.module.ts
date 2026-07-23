import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuditController } from './audit.controller';
import { AuditInterceptor } from './audit.interceptor';
import { AuditService } from './audit.service';
import { AuditEvent } from './entities/audit-event.entity';
import { ReadinessController } from './readiness.controller';
import { RequestLogInterceptor } from './request-log.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([AuditEvent]), AuthModule],
  controllers: [AuditController, ReadinessController],
  providers: [
    AuditService,
    { provide: APP_INTERCEPTOR, useClass: RequestLogInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
  exports: [AuditService],
})
export class AuditModule {}
