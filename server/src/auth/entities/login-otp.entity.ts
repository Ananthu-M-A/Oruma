import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class LoginOtp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('varchar')
  identifier: string;

  @Column('varchar')
  codeHash: string;

  @Column('timestamptz')
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
