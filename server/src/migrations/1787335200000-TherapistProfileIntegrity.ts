import { MigrationInterface, QueryRunner } from 'typeorm';

export class TherapistProfileIntegrity1787335200000 implements MigrationInterface {
  name = 'TherapistProfileIntegrity1787335200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "mustChangePassword" boolean NOT NULL DEFAULT false',
    );
    await queryRunner.query(
      'ALTER TABLE "therapist" ADD COLUMN IF NOT EXISTS "areasOfPractice" text array',
    );
    await queryRunner.query(
      'ALTER TABLE "therapist" ADD COLUMN IF NOT EXISTS "languages" text array',
    );
    await queryRunner.query(
      'ALTER TABLE "therapist" ADD COLUMN IF NOT EXISTS "imagePublicId" varchar',
    );
    await queryRunner.query(
      'ALTER TABLE "therapist" ADD COLUMN IF NOT EXISTS "voiceIntroPublicId" varchar',
    );
    await queryRunner.query(
      'ALTER TABLE "therapist" ADD COLUMN IF NOT EXISTS "voiceIntroTranscript" text',
    );
    await queryRunner.query(
      'ALTER TABLE "therapist" ALTER COLUMN "bio" TYPE text',
    );
    await queryRunner.query(`
      UPDATE "therapist"
      SET "areasOfPractice" = COALESCE(
            "areasOfPractice",
            ARRAY(
              SELECT tag FROM unnest(COALESCE("tags", ARRAY[]::text[])) AS tag
              WHERE lower(trim(tag)) NOT IN ('english', 'malayalam', 'hindi', 'tamil', 'kannada', 'telugu', 'arabic')
            )
          ),
          "languages" = COALESCE(
            "languages",
            ARRAY(
              SELECT tag FROM unnest(COALESCE("tags", ARRAY[]::text[])) AS tag
              WHERE lower(trim(tag)) IN ('english', 'malayalam', 'hindi', 'tamil', 'kannada', 'telugu', 'arabic')
            )
          )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "therapist" DROP COLUMN IF EXISTS "voiceIntroTranscript"',
    );
    await queryRunner.query(
      'ALTER TABLE "therapist" DROP COLUMN IF EXISTS "voiceIntroPublicId"',
    );
    await queryRunner.query(
      'ALTER TABLE "therapist" DROP COLUMN IF EXISTS "imagePublicId"',
    );
    await queryRunner.query(
      'ALTER TABLE "therapist" DROP COLUMN IF EXISTS "languages"',
    );
    await queryRunner.query(
      'ALTER TABLE "therapist" DROP COLUMN IF EXISTS "areasOfPractice"',
    );
    await queryRunner.query(
      'ALTER TABLE "user" DROP COLUMN IF EXISTS "mustChangePassword"',
    );
  }
}
