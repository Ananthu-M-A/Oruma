import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { Appointment } from './appointment/entities/appointment.entity';
import { LoginOtp } from './auth/entities/login-otp.entity';
import { AvailabilitySlot } from './availability/entities/availability-slot.entity';
import { CaseSheet } from './case-sheet/entities/case-sheet.entity';
import { Notification } from './notification/entities/notification.entity';
import { Payment } from './payment/entities/payment.entity';
import { Therapist } from './therapist/entities/therapist.entity';
import { Ticket } from './ticket/entities/ticket.entity';
import { User } from './user/entities/user.entity';
import { getDatabaseConnectionOptions } from './database/database-options';
import { IST_TIME_ZONE } from './common/ist-date-time';
import { AuditEvent } from './audit/entities/audit-event.entity';
import { PaymentWebhookEvent } from './payment/entities/payment-webhook-event.entity';
import { PrivacyRequest } from './privacy/entities/privacy-request.entity';
import { ProviderJob } from './reliability/entities/provider-job.entity';
import { PaymentRefund } from './payment/entities/payment-refund.entity';

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^(['"])(.*)\1$/, '$2');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();
process.env.TZ = IST_TIME_ZONE;
const migrationDatabaseUrl = process.env.DATABASE_MIGRATION_URL?.trim();
const readMigrationEnv = (key: string) => {
  if (key === 'DATABASE_URL' && migrationDatabaseUrl) {
    return migrationDatabaseUrl;
  }
  return process.env[key];
};

export default new DataSource({
  ...getDatabaseConnectionOptions(readMigrationEnv),
  entities: [
    Appointment,
    LoginOtp,
    AvailabilitySlot,
    CaseSheet,
    Notification,
    Payment,
    Therapist,
    Ticket,
    User,
    AuditEvent,
    PaymentWebhookEvent,
    PrivacyRequest,
    ProviderJob,
    PaymentRefund,
  ],
  migrations: [resolve(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
});
