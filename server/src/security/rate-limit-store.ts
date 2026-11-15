import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

export type RateLimitHit = {
  count: number;
  resetAt: number;
};

export interface RateLimitStore {
  /** Counts one request against `key` and returns the window's running total. */
  hit(key: string, windowMs: number): Promise<RateLimitHit>;
}

/** Per-process counters. Fast, but reset on restart and not shared. */
export class MemoryRateLimitStore implements RateLimitStore {
  private readonly buckets = new Map<string, RateLimitHit>();

  constructor() {
    setInterval(() => this.sweep(), 60 * 1000).unref();
  }

  hit(key: string, windowMs: number): Promise<RateLimitHit> {
    const now = Date.now();
    const entry = this.buckets.get(key);
    if (!entry || entry.resetAt <= now) {
      const fresh = { count: 1, resetAt: now + windowMs };
      this.buckets.set(key, fresh);
      return Promise.resolve({ ...fresh });
    }
    entry.count += 1;
    return Promise.resolve({ ...entry });
  }

  private sweep() {
    const now = Date.now();
    for (const [key, entry] of this.buckets.entries()) {
      if (entry.resetAt <= now) this.buckets.delete(key);
    }
  }
}

const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

/**
 * Counters in the `rate_limit_bucket` table, updated with a single atomic
 * upsert so concurrent requests and multiple instances count correctly.
 * If the database is unreachable it falls back to in-memory counting rather
 * than blocking sign-in for everyone.
 */
export class PostgresRateLimitStore implements RateLimitStore {
  private readonly logger = new Logger(PostgresRateLimitStore.name);
  private lastSweepAt = Date.now();

  constructor(
    private readonly dataSource: DataSource,
    private readonly fallback: RateLimitStore = new MemoryRateLimitStore(),
  ) {}

  async hit(key: string, windowMs: number): Promise<RateLimitHit> {
    try {
      const rows: unknown = await this.dataSource.query(
        `INSERT INTO "rate_limit_bucket" ("key", "count", "resetAt")
         VALUES ($1, 1, now() + ($2::int * interval '1 millisecond'))
         ON CONFLICT ("key") DO UPDATE SET
           "count" = CASE WHEN "rate_limit_bucket"."resetAt" <= now()
             THEN 1 ELSE "rate_limit_bucket"."count" + 1 END,
           "resetAt" = CASE WHEN "rate_limit_bucket"."resetAt" <= now()
             THEN EXCLUDED."resetAt" ELSE "rate_limit_bucket"."resetAt" END
         RETURNING "count", "resetAt"`,
        [key, Math.round(windowMs)],
      );
      const row = (rows as Array<{ count: number; resetAt: Date | string }>)[0];
      this.maybeSweep();
      return {
        count: Number(row.count),
        resetAt: new Date(row.resetAt).getTime(),
      };
    } catch (error) {
      this.logger.warn(
        JSON.stringify({
          event: 'rate_limit_store_unavailable',
          error: error instanceof Error ? error.message : String(error),
        }),
      );
      return this.fallback.hit(key, windowMs);
    }
  }

  private maybeSweep() {
    const now = Date.now();
    if (now - this.lastSweepAt < SWEEP_INTERVAL_MS) return;
    this.lastSweepAt = now;
    void this.dataSource
      .query(`DELETE FROM "rate_limit_bucket" WHERE "resetAt" <= now()`)
      .catch(() => undefined);
  }
}
