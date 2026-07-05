import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1782320000000 implements MigrationInterface {
  name = 'InitialSchema1782320000000';

  private async createEnumTypeIfNotExists(
    queryRunner: QueryRunner,
    name: string,
    values: string[],
  ): Promise<void> {
    const enumValues = values
      .map((value) => `''${value.replace(/'/g, "''")}''`)
      .join(', ');

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE n.nspname = 'public' AND t.typname = '${name}'
        ) THEN
          EXECUTE 'CREATE TYPE "public"."${name}" AS ENUM (${enumValues})';
        END IF;
      END
      $$;
    `);
  }

  private async addForeignKeyIfNotExists(
    queryRunner: QueryRunner,
    tableName: string,
    constraintName: string,
    definitionSql: string,
  ): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON t.oid = c.conrelid
          JOIN pg_namespace n ON n.oid = t.relnamespace
          WHERE n.nspname = 'public' AND t.relname = '${tableName}' AND c.conname = '${constraintName}'
        ) THEN
          EXECUTE 'ALTER TABLE "public"."${tableName}" ADD CONSTRAINT "${constraintName}" ${definitionSql}';
        END IF;
      END
      $$;
    `);
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await this.createEnumTypeIfNotExists(queryRunner, 'user_role_enum', [
      'PATIENT',
      'THERAPIST',
      'ADMIN',
    ]);
    await this.createEnumTypeIfNotExists(
      queryRunner,
      'availability_slot_status_enum',
      ['AVAILABLE', 'BOOKED', 'BLOCKED'],
    );
    await this.createEnumTypeIfNotExists(
      queryRunner,
      'appointment_status_enum',
      ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
    );
    await this.createEnumTypeIfNotExists(queryRunner, 'payment_status_enum', [
      'PENDING',
      'PAID',
      'REFUNDED',
      'FAILED',
    ]);
    await this.createEnumTypeIfNotExists(queryRunner, 'ticket_status_enum', [
      'OPEN',
      'IN_PROGRESS',
      'RESOLVED',
      'CLOSED',
    ]);
    await this.createEnumTypeIfNotExists(queryRunner, 'notification_type_enum', [
      'APPOINTMENT',
      'PAYMENT',
      'SUPPORT',
      'PROFILE',
      'SYSTEM',
    ]);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "role" "public"."user_role_enum" NOT NULL DEFAULT 'PATIENT',
        "fullName" character varying,
        "phone" character varying,
        "age" integer,
        "gender" character varying,
        "healthInfo" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_email" UNIQUE ("email"),
        CONSTRAINT "PK_user_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "therapist" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL DEFAULT 'Therapist',
        "email" character varying,
        "title" character varying NOT NULL DEFAULT 'Therapist',
        "tags" text array,
        "experience" integer NOT NULL DEFAULT 0,
        "group" integer NOT NULL DEFAULT 1,
        "price" integer NOT NULL DEFAULT 0,
        "couplePrice" integer,
        "image" character varying,
        "voiceIntro" character varying,
        "qualifications" character varying,
        "specialization" character varying,
        "bio" character varying,
        "pendingProfileChanges" jsonb,
        "pendingProfileSubmittedAt" TIMESTAMP,
        "nextAvailableSlot" TIMESTAMP,
        "isActive" boolean NOT NULL DEFAULT false,
        "accountId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_therapist_email" UNIQUE ("email"),
        CONSTRAINT "REL_therapist_account" UNIQUE ("accountId"),
        CONSTRAINT "PK_therapist_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "availability_slot" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "therapistId" uuid,
        "startTime" TIMESTAMP NOT NULL,
        "endTime" TIMESTAMP NOT NULL,
        "status" "public"."availability_slot_status_enum" NOT NULL DEFAULT 'AVAILABLE',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_availability_slot_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "appointment" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patientId" uuid,
        "therapistId" uuid,
        "slotId" uuid,
        "status" "public"."appointment_status_enum" NOT NULL DEFAULT 'PENDING',
        "notes" text,
        "contactName" character varying,
        "contactEmail" character varying,
        "contactPhone" character varying,
        "service" character varying,
        "mode" character varying,
        "meetingLink" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "IDX_appointment_slot_unique" UNIQUE ("slotId"),
        CONSTRAINT "PK_appointment_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "login_otp" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "identifier" character varying NOT NULL,
        "codeHash" character varying NOT NULL,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "used" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_login_otp_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_login_otp_identifier" ON "login_otp" ("identifier")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "appointmentId" uuid,
        "patientId" uuid,
        "amount" integer NOT NULL DEFAULT 0,
        "refundedAmount" integer NOT NULL DEFAULT 0,
        "status" "public"."payment_status_enum" NOT NULL DEFAULT 'PENDING',
        "provider" character varying NOT NULL DEFAULT 'manual',
        "reference" character varying,
        "providerOrderId" character varying,
        "providerPaymentId" character varying,
        "notes" text,
        "refundHistory" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ticket" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdById" uuid,
        "subject" character varying NOT NULL,
        "message" text NOT NULL,
        "category" character varying NOT NULL DEFAULT 'General',
        "status" "public"."ticket_status_enum" NOT NULL DEFAULT 'OPEN',
        "adminNote" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ticket_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "case_sheet" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "appointmentId" uuid,
        "patientId" uuid,
        "therapistId" uuid,
        "presentingConcern" text,
        "clinicalNotes" text,
        "interventionPlan" text,
        "followUpPlan" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_case_sheet_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notification" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "recipientId" uuid,
        "type" "public"."notification_type_enum" NOT NULL DEFAULT 'SYSTEM',
        "title" character varying NOT NULL,
        "body" text NOT NULL,
        "actionUrl" character varying,
        "metadata" jsonb,
        "readAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notification_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_notification_recipient" ON "notification" ("recipientId")`,
    );

    await this.addForeignKeyIfNotExists(
      queryRunner,
      'therapist',
      'FK_therapist_account',
      `FOREIGN KEY ("accountId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await this.addForeignKeyIfNotExists(
      queryRunner,
      'availability_slot',
      'FK_availability_slot_therapist',
      `FOREIGN KEY ("therapistId") REFERENCES "therapist"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await this.addForeignKeyIfNotExists(
      queryRunner,
      'appointment',
      'FK_appointment_patient',
      `FOREIGN KEY ("patientId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await this.addForeignKeyIfNotExists(
      queryRunner,
      'appointment',
      'FK_appointment_therapist',
      `FOREIGN KEY ("therapistId") REFERENCES "therapist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await this.addForeignKeyIfNotExists(
      queryRunner,
      'appointment',
      'FK_appointment_slot',
      `FOREIGN KEY ("slotId") REFERENCES "availability_slot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await this.addForeignKeyIfNotExists(
      queryRunner,
      'payment',
      'FK_payment_appointment',
      `FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await this.addForeignKeyIfNotExists(
      queryRunner,
      'payment',
      'FK_payment_patient',
      `FOREIGN KEY ("patientId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await this.addForeignKeyIfNotExists(
      queryRunner,
      'ticket',
      'FK_ticket_created_by',
      `FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await this.addForeignKeyIfNotExists(
      queryRunner,
      'case_sheet',
      'FK_case_sheet_appointment',
      `FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await this.addForeignKeyIfNotExists(
      queryRunner,
      'case_sheet',
      'FK_case_sheet_patient',
      `FOREIGN KEY ("patientId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await this.addForeignKeyIfNotExists(
      queryRunner,
      'case_sheet',
      'FK_case_sheet_therapist',
      `FOREIGN KEY ("therapistId") REFERENCES "therapist"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await this.addForeignKeyIfNotExists(
      queryRunner,
      'notification',
      'FK_notification_recipient',
      `FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_notification_recipient"`,
    );
    await queryRunner.query(
      `ALTER TABLE "case_sheet" DROP CONSTRAINT "FK_case_sheet_therapist"`,
    );
    await queryRunner.query(
      `ALTER TABLE "case_sheet" DROP CONSTRAINT "FK_case_sheet_patient"`,
    );
    await queryRunner.query(
      `ALTER TABLE "case_sheet" DROP CONSTRAINT "FK_case_sheet_appointment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket" DROP CONSTRAINT "FK_ticket_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_payment_patient"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_payment_appointment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" DROP CONSTRAINT "FK_appointment_slot"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" DROP CONSTRAINT "FK_appointment_therapist"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" DROP CONSTRAINT "FK_appointment_patient"`,
    );
    await queryRunner.query(
      `ALTER TABLE "availability_slot" DROP CONSTRAINT "FK_availability_slot_therapist"`,
    );
    await queryRunner.query(
      `ALTER TABLE "therapist" DROP CONSTRAINT "FK_therapist_account"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_notification_recipient"`);
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TABLE "case_sheet"`);
    await queryRunner.query(`DROP TABLE "ticket"`);
    await queryRunner.query(`DROP TABLE "payment"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_login_otp_identifier"`);
    await queryRunner.query(`DROP TABLE "login_otp"`);
    await queryRunner.query(`DROP TABLE "appointment"`);
    await queryRunner.query(`DROP TABLE "availability_slot"`);
    await queryRunner.query(`DROP TABLE "therapist"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."ticket_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."appointment_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."availability_slot_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
  }
}
