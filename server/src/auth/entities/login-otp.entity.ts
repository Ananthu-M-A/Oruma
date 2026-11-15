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

  @Index('IDX_login_otp_identifier')
  @Column('varchar')
  identifier: string;

  @Column('varchar')
  codeHash: string;

  @Column({ type: 'varchar', default: 'LOGIN' })
  purpose: 'LOGIN' | 'QUICK_BOOKING';

  @Column({ default: 0 })
  failedAttempts: number;

  @Column('timestamptz')
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
