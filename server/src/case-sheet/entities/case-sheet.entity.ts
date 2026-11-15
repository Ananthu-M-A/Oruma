import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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
  @JoinColumn({ foreignKeyConstraintName: 'FK_case_appointment' })
  appointment: Appointment | null;

  @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ foreignKeyConstraintName: 'FK_case_patient' })
  patient: User | null;

  @ManyToOne(() => Therapist, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ foreignKeyConstraintName: 'FK_case_therapist' })
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
