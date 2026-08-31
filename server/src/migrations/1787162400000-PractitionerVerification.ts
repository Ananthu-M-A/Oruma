import { MigrationInterface, QueryRunner } from 'typeorm';

export class PractitionerVerification1787162400000 implements MigrationInterface {
  name = 'PractitionerVerification1787162400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "therapist_verificationstatus_enum" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    );
    await queryRunner.query(
      `ALTER TABLE "therapist" ADD COLUMN IF NOT EXISTS "awardingInstitution" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "therapist" ADD COLUMN IF NOT EXISTS "verifiedExperienceHours" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "therapist" ADD COLUMN IF NOT EXISTS "professionalRegistrationNumber" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "therapist" ADD COLUMN IF NOT EXISTS "registrationAuthority" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "therapist" ADD COLUMN IF NOT EXISTS "consultationType" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "therapist" ADD COLUMN IF NOT EXISTS "sessionDurationMinutes" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "therapist" ADD COLUMN IF NOT EXISTS "engagementRelationship" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "therapist" ADD COLUMN IF NOT EXISTS "verificationStatus" "therapist_verificationstatus_enum" NOT NULL DEFAULT 'UNVERIFIED'`,
    );
    await queryRunner.query(
      `UPDATE "therapist" SET "isActive" = false WHERE "isActive" = true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "therapist" DROP COLUMN "verificationStatus"`,
    );
    await queryRunner.query(
      `ALTER TABLE "therapist" DROP COLUMN "engagementRelationship"`,
    );
    await queryRunner.query(
      `ALTER TABLE "therapist" DROP COLUMN "sessionDurationMinutes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "therapist" DROP COLUMN "consultationType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "therapist" DROP COLUMN "registrationAuthority"`,
    );
    await queryRunner.query(
      `ALTER TABLE "therapist" DROP COLUMN "professionalRegistrationNumber"`,
    );
    await queryRunner.query(
      `ALTER TABLE "therapist" DROP COLUMN "verifiedExperienceHours"`,
    );
    await queryRunner.query(
      `ALTER TABLE "therapist" DROP COLUMN "awardingInstitution"`,
    );
    await queryRunner.query(`DROP TYPE "therapist_verificationstatus_enum"`);
  }
}
