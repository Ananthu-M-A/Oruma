import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1782054300650 implements MigrationInterface {
    name = 'InitialSchema1782054300650'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('PATIENT', 'THERAPIST', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'PATIENT', "fullName" character varying, "phone" character varying, "age" integer, "gender" character varying, "healthInfo" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "therapist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL DEFAULT 'Therapist', "email" character varying, "title" character varying NOT NULL DEFAULT 'Therapist', "tags" text array, "experience" integer NOT NULL DEFAULT '0', "group" integer NOT NULL DEFAULT '1', "price" integer NOT NULL DEFAULT '0', "couplePrice" integer, "image" character varying, "voiceIntro" character varying, "qualifications" character varying, "specialization" character varying, "bio" character varying, "pendingProfileChanges" jsonb, "pendingProfileSubmittedAt" TIMESTAMP, "nextAvailableSlot" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "accountId" uuid, CONSTRAINT "UQ_aba2d7b055068009ab1e6928ae3" UNIQUE ("email"), CONSTRAINT "REL_a2d970c7adf8e619f7168a0105" UNIQUE ("accountId"), CONSTRAINT "PK_9d08fe522840812abd402bbf3e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."availability_slot_status_enum" AS ENUM('AVAILABLE', 'BOOKED', 'BLOCKED')`);
        await queryRunner.query(`CREATE TABLE "availability_slot" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "status" "public"."availability_slot_status_enum" NOT NULL DEFAULT 'AVAILABLE', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "therapistId" uuid, CONSTRAINT "PK_62a782c29fd83da5ba7c4ea55f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."appointment_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "appointment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."appointment_status_enum" NOT NULL DEFAULT 'PENDING', "notes" text, "contactName" character varying, "contactEmail" character varying, "contactPhone" character varying, "service" character varying, "mode" character varying, "meetingLink" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" uuid, "therapistId" uuid, "slotId" uuid, CONSTRAINT "REL_b463fce395ead7791607a5c33e" UNIQUE ("slotId"), CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_appointment_slot_unique" ON "appointment" ("slotId") `);
        await queryRunner.query(`CREATE TABLE "login_otp" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "identifier" character varying NOT NULL, "codeHash" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "used" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_49acb4cb74e3df4ed031447dbda" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9e06689af64a83d984ba71962d" ON "login_otp" ("identifier") `);
        await queryRunner.query(`CREATE TABLE "case_sheet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "presentingConcern" text, "clinicalNotes" text, "interventionPlan" text, "followUpPlan" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "appointmentId" uuid, "patientId" uuid, "therapistId" uuid, CONSTRAINT "PK_005d5e2fbfd708ef11c7a635770" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('APPOINTMENT', 'PAYMENT', 'SUPPORT', 'PROFILE', 'SYSTEM')`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."notification_type_enum" NOT NULL DEFAULT 'SYSTEM', "title" character varying NOT NULL, "body" text NOT NULL, "actionUrl" character varying, "metadata" jsonb, "readAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "recipientId" uuid, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ab7cbe7a013ecac5da0a8f8888" ON "notification" ("recipientId") `);
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum" AS ENUM('PENDING', 'PAID', 'REFUNDED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" integer NOT NULL DEFAULT '0', "refundedAmount" integer NOT NULL DEFAULT '0', "status" "public"."payment_status_enum" NOT NULL DEFAULT 'PENDING', "provider" character varying NOT NULL DEFAULT 'manual', "reference" character varying, "providerOrderId" character varying, "providerPaymentId" character varying, "notes" text, "refundHistory" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "appointmentId" uuid, "patientId" uuid, CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."ticket_status_enum" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')`);
        await queryRunner.query(`CREATE TABLE "ticket" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject" character varying NOT NULL, "message" text NOT NULL, "category" character varying NOT NULL DEFAULT 'General', "status" "public"."ticket_status_enum" NOT NULL DEFAULT 'OPEN', "adminNote" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" uuid, CONSTRAINT "PK_d9a0835407701eb86f874474b7c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "therapist" ADD CONSTRAINT "FK_a2d970c7adf8e619f7168a01053" FOREIGN KEY ("accountId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "availability_slot" ADD CONSTRAINT "FK_7341c28b8cf0735bd13e8db8fd0" FOREIGN KEY ("therapistId") REFERENCES "therapist"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_5ce4c3130796367c93cd817948e" FOREIGN KEY ("patientId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_15d2701bb83b7aef5fdfef379d5" FOREIGN KEY ("therapistId") REFERENCES "therapist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_b463fce395ead7791607a5c33eb" FOREIGN KEY ("slotId") REFERENCES "availability_slot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "case_sheet" ADD CONSTRAINT "FK_0719bdedfe061516c9d3caf4e75" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "case_sheet" ADD CONSTRAINT "FK_bc2e242c43516770831ef13403e" FOREIGN KEY ("patientId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "case_sheet" ADD CONSTRAINT "FK_c06e91bc52bfd5a61f92c696650" FOREIGN KEY ("therapistId") REFERENCES "therapist"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_ab7cbe7a013ecac5da0a8f88884" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_66d337cd623beab5f99244699b9" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_b95c94fbe7a1a42e00ff17d7c36" FOREIGN KEY ("patientId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_cdd21a6b9c9d8ccb0de1c695e7e" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_cdd21a6b9c9d8ccb0de1c695e7e"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_b95c94fbe7a1a42e00ff17d7c36"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_66d337cd623beab5f99244699b9"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_ab7cbe7a013ecac5da0a8f88884"`);
        await queryRunner.query(`ALTER TABLE "case_sheet" DROP CONSTRAINT "FK_c06e91bc52bfd5a61f92c696650"`);
        await queryRunner.query(`ALTER TABLE "case_sheet" DROP CONSTRAINT "FK_bc2e242c43516770831ef13403e"`);
        await queryRunner.query(`ALTER TABLE "case_sheet" DROP CONSTRAINT "FK_0719bdedfe061516c9d3caf4e75"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_b463fce395ead7791607a5c33eb"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_15d2701bb83b7aef5fdfef379d5"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_5ce4c3130796367c93cd817948e"`);
        await queryRunner.query(`ALTER TABLE "availability_slot" DROP CONSTRAINT "FK_7341c28b8cf0735bd13e8db8fd0"`);
        await queryRunner.query(`ALTER TABLE "therapist" DROP CONSTRAINT "FK_a2d970c7adf8e619f7168a01053"`);
        await queryRunner.query(`DROP TABLE "ticket"`);
        await queryRunner.query(`DROP TYPE "public"."ticket_status_enum"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ab7cbe7a013ecac5da0a8f8888"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
        await queryRunner.query(`DROP TABLE "case_sheet"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9e06689af64a83d984ba71962d"`);
        await queryRunner.query(`DROP TABLE "login_otp"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_appointment_slot_unique"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
        await queryRunner.query(`DROP TYPE "public"."appointment_status_enum"`);
        await queryRunner.query(`DROP TABLE "availability_slot"`);
        await queryRunner.query(`DROP TYPE "public"."availability_slot_status_enum"`);
        await queryRunner.query(`DROP TABLE "therapist"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
