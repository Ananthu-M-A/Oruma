import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProviderJobKind {
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  ZOOM_MEETING = 'ZOOM_MEETING',
}

export enum ProviderJobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  DEAD = 'DEAD',
}

@Entity()
@Index('IDX_provider_job_due', ['status', 'nextAttemptAt'])
export class ProviderJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  kind: ProviderJobKind;

  @Column({ type: 'varchar', default: ProviderJobStatus.PENDING })
  status: ProviderJobStatus;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ type: 'varchar', nullable: true, unique: true })
  deduplicationKey: string | null;

  @Column({ default: 0 })
  attempts: number;

  @Column({ default: 8 })
  maxAttempts: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  nextAttemptAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lockedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  lastError: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
