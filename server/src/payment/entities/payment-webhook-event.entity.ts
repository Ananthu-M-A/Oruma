import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentWebhookStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  DEAD = 'DEAD',
}

@Entity()
@Index('IDX_payment_webhook_due', ['status', 'nextAttemptAt'])
export class PaymentWebhookEvent {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) eventKey: string;
  @Column({ type: 'varchar', nullable: true }) providerEventId: string | null;
  @Column({ type: 'varchar', nullable: true }) eventType: string | null;
  @Column({ type: 'jsonb' }) payload: Record<string, unknown>;
  @Column({ type: 'varchar', default: PaymentWebhookStatus.PENDING })
  status: PaymentWebhookStatus;
  @Column({ default: 0 }) attempts: number;
  @Column({ default: 8 }) maxAttempts: number;
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  nextAttemptAt: Date;
  @Column({ type: 'text', nullable: true }) lastError: string | null;
  @Column({ type: 'timestamptz', nullable: true }) processedAt: Date | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
