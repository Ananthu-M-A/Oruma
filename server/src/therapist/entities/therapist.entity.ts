import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

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
  specialization: string;

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

  @OneToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  account: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
