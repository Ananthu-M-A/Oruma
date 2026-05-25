import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { Therapist } from '../../therapist/entities/therapist.entity';
import { AvailabilitySlot } from '../../availability/entities/availability-slot.entity';
import { AppointmentStatus } from './appointment-status.enum';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, {
    eager: true,
  })
  patient: User;

  @ManyToOne(() => Therapist, {
    eager: true,
  })
  therapist: Therapist;

  @OneToOne(() => AvailabilitySlot, {
    eager: true,
  })
  @JoinColumn()
  @Index('IDX_appointment_slot_unique', { unique: true })
  slot: AvailabilitySlot;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', nullable: true })
  contactName: string | null;

  @Column({ type: 'varchar', nullable: true })
  contactEmail: string | null;

  @Column({ type: 'varchar', nullable: true })
  contactPhone: string | null;

  @Column({ type: 'varchar', nullable: true })
  service: string | null;

  @Column({ type: 'varchar', nullable: true })
  mode: string | null;

  @Column({ type: 'text', nullable: true })
  meetingLink: string;

  @CreateDateColumn()
  createdAt: Date;
}
