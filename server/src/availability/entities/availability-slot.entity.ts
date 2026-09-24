import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';

import { Therapist } from '../../therapist/entities/therapist.entity';
import { SlotStatus } from './slot-status.enum';

@Entity()
export class AvailabilitySlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Therapist, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ foreignKeyConstraintName: 'FK_availability_therapist' })
  therapist: Therapist;

  @Column({
    type: 'timestamp',
  })
  startTime: Date;

  @Column({
    type: 'timestamp',
  })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: SlotStatus,
    default: SlotStatus.AVAILABLE,
  })
  status: SlotStatus;

  @CreateDateColumn()
  createdAt: Date;
}
