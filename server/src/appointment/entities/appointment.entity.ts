import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { Therapist } from '../../therapist/entities/therapist.entity';
import { AvailabilitySlot } from '../../availability/entities/availability-slot.entity';
import { AppointmentStatus } from './appointment-status.enum';

@Entity()
@Index('IDX_appointment_slot_active_unique', ['slot'], {
  unique: true,
  where: `"status" <> 'CANCELLED'`,
})
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

  @ManyToOne(() => AvailabilitySlot, {
    eager: true,
  })
  @JoinColumn()
  @Index('IDX_appointment_slot')
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

  @Column({ default: 1 })
  sessionCount: number;

  @Column({ type: 'varchar', nullable: true })
  packageName: string | null;

  @Column({ default: 0 })
  packageOriginalAmount: number;

  @Column({ default: 0 })
  packageOfferAmount: number;

  @Column({ default: 0 })
  packageDiscountPercent: number;

  @Column({ type: 'text', nullable: true })
  meetingLink: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
