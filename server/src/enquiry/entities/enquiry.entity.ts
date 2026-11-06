import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EnquiryStatus {
  NEW = 'NEW',
  REPLIED = 'REPLIED',
  CLOSED = 'CLOSED',
}

export const ENQUIRY_SUBJECTS = [
  'Choosing a practitioner',
  'Booking or rescheduling',
  'Payment or refund',
  'Services and fees',
  'Programs and workshops',
  'Practitioner application',
  'Something else',
] as const;

export const ENQUIRY_CONTACT_METHODS = ['email', 'phone', 'whatsapp'] as const;

/** A message sent from the public contact form. */
@Entity()
@Index('IDX_enquiry_status_created', ['status', 'createdAt'])
export class Enquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 254 })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 16, default: 'email' })
  preferredContact: string;

  @Column({ length: 64 })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  pagePath: string | null;

  @Column({ type: 'varchar', length: 16, default: EnquiryStatus.NEW })
  status: EnquiryStatus;

  @Column({ type: 'text', nullable: true })
  adminNote: string | null;

  @Column({ type: 'timestamptz' })
  consentedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
