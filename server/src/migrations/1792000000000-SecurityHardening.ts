import { MigrationInterface, QueryRunner } from 'typeorm';

export class SecurityHardening1792000000000 implements MigrationInterface {
  name = 'SecurityHardening1792000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "rate_limit_bucket" (
      "key" varchar(200) NOT NULL,
      "count" integer NOT NULL DEFAULT 0,
      "resetAt" timestamptz NOT NULL,
      CONSTRAINT "PK_rate_limit_bucket" PRIMARY KEY ("key")
    )`);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_rate_limit_bucket_reset_at" ON "rate_limit_bucket" ("resetAt")',
    );
    await queryRunner.query(
      'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "tokenVersion" integer NOT NULL DEFAULT 0',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "user" DROP COLUMN IF EXISTS "tokenVersion"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "IDX_rate_limit_bucket_reset_at"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "rate_limit_bucket"');
  }
}
