import { getDatabaseConnectionOptions } from './database-options';

describe('getDatabaseConnectionOptions', () => {
  it('uses DATABASE_URL when provided', () => {
    const options = getDatabaseConnectionOptions((key) => {
      if (key === 'DATABASE_URL')
        return 'postgresql://user:pass@remote.example.com/db?sslmode=require';
      return undefined;
    });

    expect(options).toMatchObject({
      type: 'postgres',
      url: 'postgresql://user:pass@remote.example.com/db?sslmode=require',
      retryAttempts: 5,
      retryDelay: 3000,
    });
    expect(options.ssl).toEqual({ rejectUnauthorized: true });
    expect(options.extra).toEqual({
      options: '-c timezone=Asia/Kolkata',
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  });

  it('uses explicit host credentials when no DATABASE_URL is provided', () => {
    const options = getDatabaseConnectionOptions((key) => {
      if (key === 'DATABASE_HOST') return 'db.example.com';
      if (key === 'DATABASE_PORT') return '5432';
      if (key === 'DATABASE_USER') return 'app_user';
      if (key === 'DATABASE_PASSWORD') return 'secret';
      if (key === 'DATABASE_NAME') return 'oruma';
      return undefined;
    });

    expect(options).toMatchObject({
      type: 'postgres',
      host: 'db.example.com',
      port: 5432,
      username: 'app_user',
      password: 'secret',
      database: 'oruma',
      retryAttempts: 5,
      retryDelay: 3000,
      extra: {
        options: '-c timezone=Asia/Kolkata',
        max: 5,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000,
      },
    });
  });

  it('supports a bounded database pool configuration', () => {
    const options = getDatabaseConnectionOptions((key) => {
      if (key === 'DATABASE_URL')
        return 'postgresql://user:pass@remote.example.com/db';
      if (key === 'DATABASE_POOL_MAX') return '3';
      if (key === 'DATABASE_POOL_IDLE_TIMEOUT_MS') return '15000';
      if (key === 'DATABASE_CONNECTION_TIMEOUT_MS') return '7000';
      return undefined;
    });

    expect(options.extra).toMatchObject({
      max: 3,
      idleTimeoutMillis: 15_000,
      connectionTimeoutMillis: 7_000,
    });
  });

  it('throws when no database configuration is provided', () => {
    expect(() => getDatabaseConnectionOptions(() => undefined)).toThrow(
      'Database configuration is missing. Set DATABASE_URL for a remote connection (recommended) or provide DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, and DATABASE_NAME.',
    );
  });
});
