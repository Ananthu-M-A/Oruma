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

  @CreateDateColumn()
  createdAt: Date;
}
