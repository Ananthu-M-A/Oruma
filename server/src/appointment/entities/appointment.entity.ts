import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Therapist } from '../../therapist/entities/therapist.entity';
import { User } from '../../user/entities/user.entity';
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

  @Column({
    type: 'timestamp',
  })
  appointmentDate: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  notes: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  meetingLink: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
