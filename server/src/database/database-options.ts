import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { IST_TIME_ZONE } from '../common/ist-date-time';

type EnvReader = (key: string) => string | undefined;

const readTrimmed = (readEnv: EnvReader, key: string) => {
  const value = readEnv(key)?.trim();
  return value ? value : undefined;
};

export const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);

  return Number.isNaN(parsed) ? fallback : parsed;
};

const toPositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Math.floor(toNumber(value, fallback));
  return parsed > 0 ? parsed : fallback;
};

const getSslModeFromUrl = (databaseUrl: string | undefined) => {
  if (!databaseUrl) return undefined;

  try {
    return new URL(databaseUrl).searchParams.get('sslmode') ?? undefined;
  } catch {
    return undefined;
  }
};

const getDatabaseSsl = (
  readEnv: EnvReader,
): PostgresConnectionOptions['ssl'] => {
  const databaseUrl = readTrimmed(readEnv, 'DATABASE_URL');
  const sslMode = getSslModeFromUrl(databaseUrl);
  const databaseSsl = readTrimmed(readEnv, 'DATABASE_SSL')?.toLowerCase();
  const isNeonHost = databaseUrl?.includes('.neon.tech') ?? false;
  const shouldUseSsl =
    databaseSsl === 'true' ||
    sslMode === 'require' ||
    sslMode === 'verify-ca' ||
    sslMode === 'verify-full' ||
    isNeonHost;

  if (!shouldUseSsl) return undefined;

  if (
    readTrimmed(readEnv, 'DATABASE_SSL_REJECT_UNAUTHORIZED')?.toLowerCase() ===
    'false'
  ) {
    return { rejectUnauthorized: false };
  }

  return { rejectUnauthorized: true };
};

export const getDatabaseConnectionOptions = (
  readEnv: EnvReader,
): TypeOrmModuleOptions &
  Pick<
    PostgresConnectionOptions,
    | 'type'
    | 'url'
    | 'host'
    | 'port'
    | 'username'
    | 'password'
    | 'database'
    | 'ssl'
  > => {
  const databaseUrl = readTrimmed(readEnv, 'DATABASE_URL');
  const ssl = getDatabaseSsl(readEnv);
  const extra = {
    options: `-c timezone=${IST_TIME_ZONE}`,
    max: toPositiveInteger(readTrimmed(readEnv, 'DATABASE_POOL_MAX'), 5),
    idleTimeoutMillis: toPositiveInteger(
      readTrimmed(readEnv, 'DATABASE_POOL_IDLE_TIMEOUT_MS'),
      30_000,
    ),
    connectionTimeoutMillis: toPositiveInteger(
      readTrimmed(readEnv, 'DATABASE_CONNECTION_TIMEOUT_MS'),
      10_000,
    ),
  };

  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      ssl,
      extra,
      retryAttempts: 5,
      retryDelay: 3000,
    };
  }

  const host = readTrimmed(readEnv, 'DATABASE_HOST');
  const username = readTrimmed(readEnv, 'DATABASE_USER');
  const password = readTrimmed(readEnv, 'DATABASE_PASSWORD');
  const database = readTrimmed(readEnv, 'DATABASE_NAME');
  const hasExplicitConnectionSettings = Boolean(
    host || username || password || database,
  );

  if (!hasExplicitConnectionSettings) {
    throw new Error(
      'Database configuration is missing. Set DATABASE_URL for a remote connection (recommended) or provide DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, and DATABASE_NAME.',
    );
  }

  const missingConfig = [
    !host ? 'DATABASE_HOST' : null,
    !username ? 'DATABASE_USER' : null,
    !password ? 'DATABASE_PASSWORD' : null,
    !database ? 'DATABASE_NAME' : null,
  ].filter(Boolean) as string[];

  if (missingConfig.length > 0) {
    throw new Error(
      `Incomplete database configuration. Missing: ${missingConfig.join(', ')}.`,
    );
  }

  return {
    type: 'postgres',
    host,
    port: toNumber(readTrimmed(readEnv, 'DATABASE_PORT'), 5432),
    username,
    password,
    database,
    ssl,
    extra,
    retryAttempts: 5,
    retryDelay: 3000,
  };
};
