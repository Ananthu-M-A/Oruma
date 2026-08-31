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

  @Column('varchar', { nullable: true, unique: true, select: false })
  email: string | null;

  @Column({ default: 'Therapist' })
  title: string;

  @Column('text', { array: true, nullable: true })
  tags: string[] | null;

  @Column('text', { array: true, nullable: true })
  areasOfPractice: string[] | null;

  @Column('text', { array: true, nullable: true })
  languages: string[] | null;

  @Column({ default: 0 })
  experience: number;

  @Column({ default: 1 })
  group: number;

  @Column({ default: 0 })
  price: number;

  @Column({ type: 'int', nullable: true })
  couplePrice: number | null;

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  imagePublicId: string | null;

  @Column({ type: 'varchar', nullable: true })
  voiceIntro: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  voiceIntroPublicId: string | null;

  @Column({ type: 'text', nullable: true })
  voiceIntroTranscript: string | null;

  @Column({ type: 'varchar', nullable: true })
  qualifications: string | null;

  @Column({ type: 'varchar', nullable: true })
  awardingInstitution: string | null;

  @Column({ type: 'int', nullable: true })
  verifiedExperienceHours: number | null;

  @Column({ type: 'varchar', nullable: true })
  professionalRegistrationNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  registrationAuthority: string | null;

  @Column({ type: 'varchar', nullable: true })
  specialization: string | null;

  @Column({ type: 'varchar', nullable: true })
  consultationType: string | null;

  @Column({ type: 'int', nullable: true })
  sessionDurationMinutes: number | null;

  @Column({ type: 'varchar', nullable: true })
  engagementRelationship: string | null;

  @Column({
    type: 'enum',
    enum: TherapistVerificationStatus,
    default: TherapistVerificationStatus.UNVERIFIED,
  })
  verificationStatus: TherapistVerificationStatus;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'jsonb', nullable: true, select: false })
  pendingProfileChanges: Record<string, unknown> | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    select: false,
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

  @Column({ type: 'timestamptz', nullable: true, select: false })
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
