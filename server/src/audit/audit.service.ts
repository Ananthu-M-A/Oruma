import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEvent } from './entities/audit-event.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditEvent)
    private readonly repository: Repository<AuditEvent>,
  ) {}

  record(input: Omit<AuditEvent, 'id' | 'createdAt'>) {
    return this.repository.save(this.repository.create(input));
  }

  findRecent(limit = 200) {
    return this.repository.find({
      order: { createdAt: 'DESC' },
      take: Math.min(Math.max(limit, 1), 500),
    });
  }
}
