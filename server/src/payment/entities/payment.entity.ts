import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { User } from '../../user/entities/user.entity';
import { PaymentStatus } from './payment-status.enum';

@Entity()
@Index('IDX_payment_provider_order_unique', ['providerOrderId'], {
  unique: true,
  where: '"providerOrderId" IS NOT NULL',
})
@Index('IDX_payment_provider_payment_unique', ['providerPaymentId'], {
  unique: true,
  where: '"providerPaymentId" IS NOT NULL',
})
@Index('IDX_payment_appointment_active_unique', ['appointment'], {
  unique: true,
  where: `"status" = 'PENDING'`,
})
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Appointment, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  appointment: Appointment | null;

  @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'SET NULL' })
  patient: User | null;

  @Column({ default: 0 })
  amount: number;

  @Column({ default: 0 })
  refundedAmount: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ default: 'manual' })
  provider: string;

  @Column({ type: 'varchar', nullable: true })
  reference: string | null;

  @Column({ type: 'varchar', nullable: true })
  providerOrderId: string | null;

  @Column({ type: 'varchar', nullable: true })
  providerPaymentId: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'jsonb', nullable: true })
  refundHistory: Record<string, unknown>[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
