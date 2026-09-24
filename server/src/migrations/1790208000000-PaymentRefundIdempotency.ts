import { MigrationInterface, QueryRunner } from 'typeorm';

export class PaymentRefundIdempotency1790208000000 implements MigrationInterface {
  name = 'PaymentRefundIdempotency1790208000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "payment_refund" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "paymentId" uuid NOT NULL,
      "idempotencyKey" varchar(128) NOT NULL,
      "receipt" varchar(48) NOT NULL,
      "amount" integer NOT NULL,
      "provider" varchar NOT NULL DEFAULT 'manual',
      "providerPaymentId" varchar,
      "providerRefundId" varchar,
      "status" varchar NOT NULL DEFAULT 'REQUESTED',
      "speed" varchar,
      "providerResponse" jsonb,
      "notes" text,
      "lastError" text,
      "attempts" integer NOT NULL DEFAULT 0,
      "submittedAt" timestamptz,
      "completedAt" timestamptz,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "PK_payment_refund" PRIMARY KEY ("id"),
      CONSTRAINT "FK_payment_refund_payment" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE CASCADE
    )`);
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_payment_refund_idempotency_unique" ON "payment_refund" ("idempotencyKey")',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_payment_refund_provider_unique" ON "payment_refund" ("providerRefundId") WHERE "providerRefundId" IS NOT NULL',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_payment_refund_receipt_unique" ON "payment_refund" ("receipt")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_payment_refund_payment_status" ON "payment_refund" ("paymentId", "status")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "payment_refund"');
  }
}
