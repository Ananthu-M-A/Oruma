import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
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
  slot: AvailabilitySlot;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  meetingLink: string;

  @CreateDateColumn()
  createdAt: Date;
}
