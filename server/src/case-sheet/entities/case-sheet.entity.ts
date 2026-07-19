import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { Therapist } from '../../therapist/entities/therapist.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class CaseSheet {
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

  @ManyToOne(() => Therapist, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  therapist: Therapist | null;

  @Column({ type: 'text', nullable: true })
  presentingConcern: string | null;

  @Column({ type: 'text', nullable: true })
  clinicalNotes: string | null;

  @Column({ type: 'text', nullable: true })
  interventionPlan: string | null;

  @Column({ type: 'text', nullable: true })
  followUpPlan: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
