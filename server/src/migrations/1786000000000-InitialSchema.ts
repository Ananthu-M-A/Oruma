import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1786000000000 implements MigrationInterface {
  name = 'InitialSchema1786000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    for (const [name, values] of [
      ['user_role_enum', ['PATIENT', 'THERAPIST', 'ADMIN']],
      [
        'therapist_verificationstatus_enum',
        ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'],
      ],
      ['availability_slot_status_enum', ['AVAILABLE', 'BOOKED', 'BLOCKED']],
      [
        'appointment_status_enum',
        ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
      ],
      ['payment_status_enum', ['PENDING', 'PAID', 'REFUNDED', 'FAILED']],
      ['ticket_status_enum', ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']],
      [
        'notification_type_enum',
        ['APPOINTMENT', 'PAYMENT', 'SUPPORT', 'PROFILE', 'SYSTEM'],
      ],
    ] as Array<[string, string[]]>) {
      const enumValues = values.map((value) => `'${value}'`).join(', ');
      await queryRunner.query(
        `DO $$ BEGIN CREATE TYPE "${name}" AS ENUM (${enumValues}); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
      );
    }

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "user" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" varchar NOT NULL,
      "password" varchar NOT NULL, "role" "user_role_enum" NOT NULL DEFAULT 'PATIENT',
      "fullName" varchar, "phone" varchar, "age" integer, "gender" varchar,
      "healthInfo" jsonb, "anonymizedAt" timestamptz, "disabledAt" timestamptz,
      "mustChangePassword" boolean NOT NULL DEFAULT false,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "PK_user" PRIMARY KEY ("id"), CONSTRAINT "UQ_user_email" UNIQUE ("email")
    )`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "therapist" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" varchar NOT NULL DEFAULT 'Therapist',
      "email" varchar, "title" varchar NOT NULL DEFAULT 'Therapist', "tags" text array,
      "areasOfPractice" text array, "languages" text array,
      "experience" integer NOT NULL DEFAULT 0, "group" integer NOT NULL DEFAULT 1,
      "price" integer NOT NULL DEFAULT 0, "couplePrice" integer, "image" varchar,
      "imagePublicId" varchar, "voiceIntro" varchar, "voiceIntroPublicId" varchar,
      "voiceIntroTranscript" text, "qualifications" varchar, "awardingInstitution" varchar,
      "verifiedExperienceHours" integer, "professionalRegistrationNumber" varchar,
      "registrationAuthority" varchar, "specialization" varchar, "consultationType" varchar,
      "sessionDurationMinutes" integer, "engagementRelationship" varchar,
      "verificationStatus" "therapist_verificationstatus_enum" NOT NULL DEFAULT 'UNVERIFIED',
      "bio" text, "pendingProfileChanges" jsonb, "pendingProfileSubmittedAt" timestamp,
      "nextAvailableSlot" timestamp, "isActive" boolean NOT NULL DEFAULT false,
      "archivedAt" timestamptz, "accountId" uuid, "createdAt" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "PK_therapist" PRIMARY KEY ("id"), CONSTRAINT "UQ_therapist_email" UNIQUE ("email"),
      CONSTRAINT "UQ_therapist_account" UNIQUE ("accountId"),
      CONSTRAINT "FK_therapist_account" FOREIGN KEY ("accountId") REFERENCES "user"("id") ON DELETE SET NULL
    )`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "availability_slot" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "therapistId" uuid NOT NULL,
      "startTime" timestamp NOT NULL, "endTime" timestamp NOT NULL,
      "status" "availability_slot_status_enum" NOT NULL DEFAULT 'AVAILABLE',
      "createdAt" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_availability_slot" PRIMARY KEY ("id"),
      CONSTRAINT "FK_availability_therapist" FOREIGN KEY ("therapistId") REFERENCES "therapist"("id") ON DELETE CASCADE
    )`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "appointment" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patientId" uuid NOT NULL,
      "therapistId" uuid NOT NULL, "slotId" uuid NOT NULL,
      "status" "appointment_status_enum" NOT NULL DEFAULT 'PENDING', "notes" text,
      "contactName" varchar, "contactEmail" varchar, "contactPhone" varchar,
      "service" varchar, "mode" varchar, "sessionCount" integer NOT NULL DEFAULT 1,
      "packageName" varchar, "packageOriginalAmount" integer NOT NULL DEFAULT 0,
      "packageOfferAmount" integer NOT NULL DEFAULT 0, "packageDiscountPercent" integer NOT NULL DEFAULT 0,
      "meetingLink" text, "meetingLinkAddedAt" timestamptz, "bookingConfirmationSentAt" timestamptz,
      "meetingLinkSentAt" timestamptz, "reminderSentAt" timestamptz, "staffNotes" text,
      "reservationExpiresAt" timestamptz, "cancelledAt" timestamptz, "cancellationReason" varchar,
      "createdAt" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_appointment" PRIMARY KEY ("id"),
      CONSTRAINT "FK_appointment_patient" FOREIGN KEY ("patientId") REFERENCES "user"("id"),
      CONSTRAINT "FK_appointment_therapist" FOREIGN KEY ("therapistId") REFERENCES "therapist"("id"),
      CONSTRAINT "FK_appointment_slot" FOREIGN KEY ("slotId") REFERENCES "availability_slot"("id")
    )`);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_appointment_slot" ON "appointment" ("slotId")',
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_appointment_slot_active_unique" ON "appointment" ("slotId") WHERE "status" <> 'CANCELLED'`,
    );
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "login_otp" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "identifier" varchar NOT NULL, "codeHash" varchar NOT NULL,
      "purpose" varchar NOT NULL DEFAULT 'LOGIN', "failedAttempts" integer NOT NULL DEFAULT 0,
      "expiresAt" timestamptz NOT NULL, "used" boolean NOT NULL DEFAULT false,
      "createdAt" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_login_otp" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_login_otp_identifier" ON "login_otp" ("identifier")',
    );
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "case_sheet" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "appointmentId" uuid, "patientId" uuid, "therapistId" uuid,
      "presentingConcern" text, "clinicalNotes" text, "interventionPlan" text, "followUpPlan" text,
      "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "PK_case_sheet" PRIMARY KEY ("id"),
      CONSTRAINT "FK_case_appointment" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE SET NULL,
      CONSTRAINT "FK_case_patient" FOREIGN KEY ("patientId") REFERENCES "user"("id") ON DELETE SET NULL,
      CONSTRAINT "FK_case_therapist" FOREIGN KEY ("therapistId") REFERENCES "therapist"("id") ON DELETE SET NULL
    )`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "notification" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recipientId" uuid NOT NULL,
      "type" "notification_type_enum" NOT NULL DEFAULT 'SYSTEM', "title" varchar NOT NULL,
      "body" text NOT NULL, "actionUrl" varchar, "metadata" jsonb, "readAt" timestamptz,
      "createdAt" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_notification" PRIMARY KEY ("id"),
      CONSTRAINT "FK_notification_recipient" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE CASCADE
    )`);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_notification_recipient" ON "notification" ("recipientId")',
    );
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "payment" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "appointmentId" uuid, "patientId" uuid,
      "amount" integer NOT NULL DEFAULT 0, "refundedAmount" integer NOT NULL DEFAULT 0,
      "status" "payment_status_enum" NOT NULL DEFAULT 'PENDING', "provider" varchar NOT NULL DEFAULT 'manual',
      "reference" varchar, "providerOrderId" varchar, "providerPaymentId" varchar, "notes" text,
      "refundHistory" jsonb, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "PK_payment" PRIMARY KEY ("id"),
      CONSTRAINT "FK_payment_appointment" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE SET NULL,
      CONSTRAINT "FK_payment_patient" FOREIGN KEY ("patientId") REFERENCES "user"("id") ON DELETE SET NULL
    )`);
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_payment_provider_order_unique" ON "payment" ("providerOrderId") WHERE "providerOrderId" IS NOT NULL',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_payment_provider_payment_unique" ON "payment" ("providerPaymentId") WHERE "providerPaymentId" IS NOT NULL',
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_payment_appointment_active_unique" ON "payment" ("appointmentId") WHERE "status" = 'PENDING'`,
    );
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "ticket" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdById" uuid, "subject" varchar NOT NULL,
      "message" text NOT NULL, "category" varchar NOT NULL DEFAULT 'General',
      "status" "ticket_status_enum" NOT NULL DEFAULT 'OPEN', "adminNote" text,
      "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "PK_ticket" PRIMARY KEY ("id"),
      CONSTRAINT "FK_ticket_created_by" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL
    )`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "audit_event" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actorId" uuid, "actorRole" varchar,
      "action" varchar NOT NULL, "resource" varchar NOT NULL, "resourceId" varchar,
      "requestId" varchar NOT NULL, "ipAddress" varchar, "metadata" jsonb,
      "createdAt" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_audit_event" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_audit_event_actor_created" ON "audit_event" ("actorId", "createdAt")',
    );
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "payment_webhook_event" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "eventKey" varchar NOT NULL UNIQUE,
      "providerEventId" varchar, "eventType" varchar, "payload" jsonb NOT NULL,
      "status" varchar NOT NULL DEFAULT 'PENDING', "attempts" integer NOT NULL DEFAULT 0,
      "maxAttempts" integer NOT NULL DEFAULT 8, "nextAttemptAt" timestamptz NOT NULL DEFAULT now(),
      "lastError" text, "processedAt" timestamptz, "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_payment_webhook_event" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_payment_webhook_due" ON "payment_webhook_event" ("status", "nextAttemptAt")',
    );
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "privacy_request" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "requesterId" uuid, "type" varchar NOT NULL,
      "status" varchar NOT NULL DEFAULT 'PENDING', "reason" text, "adminNote" text,
      "scheduledFor" timestamptz, "completedAt" timestamptz,
      "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "PK_privacy_request" PRIMARY KEY ("id"),
      CONSTRAINT "FK_privacy_requester" FOREIGN KEY ("requesterId") REFERENCES "user"("id") ON DELETE SET NULL
    )`);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_privacy_request_status_due" ON "privacy_request" ("status", "scheduledFor")',
    );
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "provider_job" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "kind" varchar NOT NULL,
      "status" varchar NOT NULL DEFAULT 'PENDING', "payload" jsonb NOT NULL, "deduplicationKey" varchar UNIQUE,
      "attempts" integer NOT NULL DEFAULT 0, "maxAttempts" integer NOT NULL DEFAULT 8,
      "nextAttemptAt" timestamptz NOT NULL DEFAULT now(), "lockedAt" timestamptz,
      "lastError" text, "completedAt" timestamptz, "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_provider_job" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_provider_job_due" ON "provider_job" ("status", "nextAttemptAt")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of [
      'provider_job',
      'privacy_request',
      'payment_webhook_event',
      'audit_event',
      'ticket',
      'payment',
      'notification',
      'case_sheet',
      'login_otp',
      'appointment',
      'availability_slot',
      'therapist',
      'user',
    ]) {
      await queryRunner.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }
    for (const type of [
      'notification_type_enum',
      'ticket_status_enum',
      'payment_status_enum',
      'appointment_status_enum',
      'availability_slot_status_enum',
      'therapist_verificationstatus_enum',
      'user_role_enum',
    ]) {
      await queryRunner.query(`DROP TYPE IF EXISTS "${type}"`);
    }
  }
}
