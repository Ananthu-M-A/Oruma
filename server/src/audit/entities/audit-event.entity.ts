import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index('IDX_audit_event_actor_created', ['actorId', 'createdAt'])
export class AuditEvent {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid', nullable: true }) actorId: string | null;
  @Column({ type: 'varchar', nullable: true }) actorRole: string | null;
  @Column({ type: 'varchar' }) action: string;
  @Column({ type: 'varchar' }) resource: string;
  @Column({ type: 'varchar', nullable: true }) resourceId: string | null;
  @Column({ type: 'varchar' }) requestId: string;
  @Column({ type: 'varchar', nullable: true }) ipAddress: string | null;
  @Column({ type: 'jsonb', nullable: true }) metadata: Record<
    string,
    unknown
  > | null;
  @CreateDateColumn() createdAt: Date;
}
