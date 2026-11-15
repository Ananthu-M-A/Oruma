import { MigrationInterface, QueryRunner } from 'typeorm';

export class WebsiteEnquiries1791000000000 implements MigrationInterface {
  name = 'WebsiteEnquiries1791000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "enquiry" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "name" varchar(120) NOT NULL,
      "email" varchar(254) NOT NULL,
      "phone" varchar(20),
      "preferredContact" varchar(16) NOT NULL DEFAULT 'email',
      "subject" varchar(64) NOT NULL,
      "message" text NOT NULL,
      "pagePath" varchar(200),
      "status" varchar(16) NOT NULL DEFAULT 'NEW',
      "adminNote" text,
      "consentedAt" timestamptz NOT NULL,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "PK_enquiry" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_enquiry_status_created" ON "enquiry" ("status", "createdAt")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "IDX_enquiry_status_created"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "enquiry"');
  }
}
