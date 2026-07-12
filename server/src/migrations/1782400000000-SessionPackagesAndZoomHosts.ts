import { MigrationInterface, QueryRunner } from 'typeorm';

export class SessionPackagesAndZoomHosts1782400000000 implements MigrationInterface {
  name = 'SessionPackagesAndZoomHosts1782400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "appointment"
      ADD COLUMN IF NOT EXISTS "sessionCount" integer NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "packageName" character varying,
      ADD COLUMN IF NOT EXISTS "packageOriginalAmount" integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "packageOfferAmount" integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "packageDiscountPercent" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "therapist"
      ADD COLUMN IF NOT EXISTS "zoomUserId" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "therapist"
      DROP COLUMN IF EXISTS "zoomUserId"
    `);

    await queryRunner.query(`
      ALTER TABLE "appointment"
      DROP COLUMN IF EXISTS "packageDiscountPercent",
      DROP COLUMN IF EXISTS "packageOfferAmount",
      DROP COLUMN IF EXISTS "packageOriginalAmount",
      DROP COLUMN IF EXISTS "packageName",
      DROP COLUMN IF EXISTS "sessionCount"
    `);
  }
}
