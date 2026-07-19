import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowRebookingCancelledSlots1784485800000 implements MigrationInterface {
  name = 'AllowRebookingCancelledSlots1784485800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointment" DROP CONSTRAINT IF EXISTS "IDX_appointment_slot_unique"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_appointment_slot_unique"`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_appointment_slot" ON "appointment" ("slotId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_appointment_slot_active_unique" ON "appointment" ("slotId") WHERE "status" <> 'CANCELLED'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_appointment_slot_active_unique"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_appointment_slot"`);
    await queryRunner.query(
      `ALTER TABLE "appointment" ADD CONSTRAINT "IDX_appointment_slot_unique" UNIQUE ("slotId")`,
    );
  }
}
