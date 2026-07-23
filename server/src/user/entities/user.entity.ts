import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum Role {
  PATIENT = 'PATIENT',
  THERAPIST = 'THERAPIST',
  ADMIN = 'ADMIN',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({
    select: false,
  })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.PATIENT })
  role: Role;

  @Column('varchar', { nullable: true })
  fullName: string | null;

  @Column('varchar', { nullable: true })
  phone: string | null;

  @Column('int', { nullable: true })
  age: number | null;

  @Column('varchar', { nullable: true })
  gender: string | null;

  @Column({ type: 'jsonb', nullable: true })
  healthInfo: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', nullable: true })
  anonymizedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  disabledAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
