import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

type EnvReader = (key: string) => string | undefined;

const readTrimmed = (readEnv: EnvReader, key: string) => {
  const value = readEnv(key)?.trim();
  return value ? value : undefined;
};

export const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);

  return Number.isNaN(parsed) ? fallback : parsed;
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

  return true;
};

export const getDatabaseConnectionOptions = (
  readEnv: EnvReader,
): Pick<
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

  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      ssl,
    };
  }

  return {
    type: 'postgres',
    host: readTrimmed(readEnv, 'DATABASE_HOST') ?? 'localhost',
    port: toNumber(readTrimmed(readEnv, 'DATABASE_PORT'), 5432),
    username: readTrimmed(readEnv, 'DATABASE_USER') ?? 'postgres',
    password: readTrimmed(readEnv, 'DATABASE_PASSWORD') ?? 'postgres',
    database: readTrimmed(readEnv, 'DATABASE_NAME') ?? 'oruma',
    ssl,
  };
};
