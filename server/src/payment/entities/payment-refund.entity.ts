import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Payment } from './payment.entity';

export enum PaymentRefundStatus {
  REQUESTED = 'REQUESTED',
  SUBMITTED = 'SUBMITTED',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
  UNKNOWN = 'UNKNOWN',
  RECORDED = 'RECORDED',
}

@Entity()
@Index('IDX_payment_refund_idempotency_unique', ['idempotencyKey'], {
  unique: true,
})
@Index('IDX_payment_refund_provider_unique', ['providerRefundId'], {
  unique: true,
  where: '"providerRefundId" IS NOT NULL',
})
@Index('IDX_payment_refund_receipt_unique', ['receipt'], { unique: true })
@Index('IDX_payment_refund_payment_status', ['payment', 'status'])
export class PaymentRefund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Payment, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'paymentId',
    foreignKeyConstraintName: 'FK_payment_refund_payment',
  })
  payment: Payment;

  @Column({ type: 'uuid' })
  paymentId: string;

  @Column({ type: 'varchar', length: 128 })
  idempotencyKey: string;

  @Column({ type: 'varchar', length: 48 })
  receipt: string;

  @Column({ type: 'integer' })
  amount: number;

  @Column({ type: 'varchar', default: 'manual' })
  provider: string;

  @Column({ type: 'varchar', nullable: true })
  providerPaymentId: string | null;

  @Column({ type: 'varchar', nullable: true })
  providerRefundId: string | null;

  @Column({ type: 'varchar', default: PaymentRefundStatus.REQUESTED })
  status: PaymentRefundStatus;

  @Column({ type: 'varchar', nullable: true })
  speed: string | null;

  @Column({ type: 'jsonb', nullable: true })
  providerResponse: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true })
  lastError: string | null;

  @Column({ default: 0 })
  attempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
