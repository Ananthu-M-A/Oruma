import { MigrationInterface, QueryRunner } from 'typeorm';

export class ManualAppointmentOperations1787072400000 implements MigrationInterface {
  name = 'ManualAppointmentOperations1787072400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "appointment" ADD COLUMN IF NOT EXISTS "meetingLinkAddedAt" TIMESTAMP WITH TIME ZONE',
    );
    await queryRunner.query(
      'ALTER TABLE "appointment" ADD COLUMN IF NOT EXISTS "bookingConfirmationSentAt" TIMESTAMP WITH TIME ZONE',
    );
    await queryRunner.query(
      'ALTER TABLE "appointment" ADD COLUMN IF NOT EXISTS "meetingLinkSentAt" TIMESTAMP WITH TIME ZONE',
    );
    await queryRunner.query(
      'ALTER TABLE "appointment" ADD COLUMN IF NOT EXISTS "reminderSentAt" TIMESTAMP WITH TIME ZONE',
    );
    await queryRunner.query(
      'ALTER TABLE "appointment" ADD COLUMN IF NOT EXISTS "staffNotes" TEXT',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "appointment" DROP COLUMN IF EXISTS "staffNotes"',
    );
    await queryRunner.query(
      'ALTER TABLE "appointment" DROP COLUMN IF EXISTS "reminderSentAt"',
    );
    await queryRunner.query(
      'ALTER TABLE "appointment" DROP COLUMN IF EXISTS "meetingLinkSentAt"',
    );
    await queryRunner.query(
      'ALTER TABLE "appointment" DROP COLUMN IF EXISTS "bookingConfirmationSentAt"',
    );
    await queryRunner.query(
      'ALTER TABLE "appointment" DROP COLUMN IF EXISTS "meetingLinkAddedAt"',
    );
  }
}
