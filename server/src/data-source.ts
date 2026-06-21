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

function toNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

loadEnvFile();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: toNumber(process.env.DATABASE_PORT, 5432),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'oruma',
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
  ],
  migrations: [resolve(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
  ssl:
    process.env.DATABASE_SSL === 'true'
      ? {
          rejectUnauthorized:
            process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
        }
      : undefined,
});
