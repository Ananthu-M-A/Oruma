import { describe, it } from 'node:test';
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
    });
    expect(options.ssl).toEqual({ rejectUnauthorized: true });
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
    });
  });

  it('throws when no database configuration is provided', () => {
    expect(() => getDatabaseConnectionOptions(() => undefined)).toThrow(
      'Database configuration is missing. Set DATABASE_URL for a remote connection (recommended) or provide DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, and DATABASE_NAME.',
    );
  });
});
