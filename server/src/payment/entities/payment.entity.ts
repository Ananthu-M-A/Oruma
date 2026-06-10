import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { User } from '../../user/entities/user.entity';
import { PaymentStatus } from './payment-status.enum';

@Entity()
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
