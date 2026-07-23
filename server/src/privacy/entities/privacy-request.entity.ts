import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum PrivacyRequestType {
  EXPORT = 'EXPORT',
  ERASURE = 'ERASURE',
  CORRECTION = 'CORRECTION',
}
export enum PrivacyRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

@Entity()
@Index('IDX_privacy_request_status_due', ['status', 'scheduledFor'])
export class PrivacyRequest {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'SET NULL' })
  requester: User | null;
  @Column({ type: 'varchar' }) type: PrivacyRequestType;
  @Column({ type: 'varchar', default: PrivacyRequestStatus.PENDING })
  status: PrivacyRequestStatus;
  @Column({ type: 'text', nullable: true }) reason: string | null;
  @Column({ type: 'text', nullable: true }) adminNote: string | null;
  @Column({ type: 'timestamptz', nullable: true }) scheduledFor: Date | null;
  @Column({ type: 'timestamptz', nullable: true }) completedAt: Date | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
