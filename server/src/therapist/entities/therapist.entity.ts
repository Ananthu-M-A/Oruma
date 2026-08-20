import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { TherapistVerificationStatus } from './therapist-verification-status.enum';

@Entity()
export class Therapist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Therapist' })
  name: string;

  @Column('varchar', { nullable: true, unique: true })
  email: string | null;

  @Column({ default: 'Therapist' })
  title: string;

  @Column('text', { array: true, nullable: true })
  tags: string[];

  @Column({ default: 0 })
  experience: number;

  @Column({ default: 1 })
  group: number;

  @Column({ default: 0 })
  price: number;

  @Column({ nullable: true })
  couplePrice: number;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  voiceIntro: string;

  @Column({ nullable: true })
  qualifications: string;

  @Column({ nullable: true })
  awardingInstitution: string;

  @Column({ type: 'int', nullable: true })
  verifiedExperienceHours: number | null;

  @Column({ nullable: true })
  professionalRegistrationNumber: string;

  @Column({ nullable: true })
  registrationAuthority: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  consultationType: string;

  @Column({ type: 'int', nullable: true })
  sessionDurationMinutes: number | null;

  @Column({ nullable: true })
  engagementRelationship: string;

  @Column({
    type: 'enum',
    enum: TherapistVerificationStatus,
    default: TherapistVerificationStatus.UNVERIFIED,
  })
  verificationStatus: TherapistVerificationStatus;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'jsonb', nullable: true })
  pendingProfileChanges: Record<string, unknown> | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  pendingProfileSubmittedAt: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  nextAvailableSlot: Date | null;

  @Column({
    default: false,
  })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  archivedAt: Date | null;

  @OneToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  account: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
