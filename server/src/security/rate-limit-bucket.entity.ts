import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * One fixed-window counter per rate-limit key (for example "auth:203.0.113.7").
 * Kept in PostgreSQL so limits survive restarts (Render's free tier sleeps and
 * restarts the API) and are shared if more than one instance runs.
 */
@Entity({ name: 'rate_limit_bucket' })
export class RateLimitBucket {
  @PrimaryColumn('varchar', { length: 200 })
  key: string;

  @Column('integer', { default: 0 })
  count: number;

  @Index('IDX_rate_limit_bucket_reset_at')
  @Column('timestamptz')
  resetAt: Date;
}
