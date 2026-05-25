// npx ts-node --transpile-only clear-database.ts --confirm=CLEAR_ORUMA_DATABASE

import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './src/app.module';

const CONFIRMATION_PHRASE = 'CLEAR_ORUMA_DATABASE';

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

function getArgValue(name: string) {
  const prefix = `${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match?.slice(prefix.length);
}

function printHelp() {
  console.log(`
Clear all ORUMA database data.

Usage:
  npx ts-node --transpile-only clear-database.ts --dry-run
  npx ts-node --transpile-only clear-database.ts --confirm=${CONFIRMATION_PHRASE}

Safety:
  - Dry-run mode lists the tables without deleting data.
  - ADMIN users are preserved.
  - Real deletion requires --confirm=${CONFIRMATION_PHRASE}.
  - Production is blocked unless ALLOW_PRODUCTION_DATABASE_CLEAR=true is set.
`);
}

function quoteTablePath(tablePath: string) {
  return tablePath
    .split('.')
    .map((part) => `"${part.replace(/"/g, '""')}"`)
    .join('.');
}

async function clearDatabase() {
  if (hasFlag('--help') || hasFlag('-h')) {
    printHelp();
    return;
  }

  const isDryRun = hasFlag('--dry-run');
  const confirmation = getArgValue('--confirm');
  const isProduction = process.env.NODE_ENV === 'production';
  const allowProductionClear =
    process.env.ALLOW_PRODUCTION_DATABASE_CLEAR === 'true';

  if (!isDryRun && confirmation !== CONFIRMATION_PHRASE) {
    printHelp();
    throw new Error(
      `Refusing to clear database without --confirm=${CONFIRMATION_PHRASE}`,
    );
  }

  if (!isDryRun && isProduction && !allowProductionClear) {
    throw new Error(
      'Refusing to clear a production database. Set ALLOW_PRODUCTION_DATABASE_CLEAR=true only if you are absolutely sure.',
    );
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);
    const allTables = dataSource.entityMetadatas
      .map((metadata) => metadata.tablePath)
      .filter((tablePath, index, all) => all.indexOf(tablePath) === index)
      .sort();
    const tablesToTruncate = allTables.filter((tablePath) => tablePath !== 'user');

    if (allTables.length === 0) {
      console.log('No TypeORM entity tables were found.');
      return;
    }

    console.log(`Database: ${dataSource.options.database ?? 'configured DB'}`);
    console.log(
      `Tables to clear completely: ${tablesToTruncate.join(', ') || 'none'}`,
    );
    console.log(
      'User table: preserving ADMIN users; deleting all other users.',
    );

    if (isDryRun) {
      console.log('Dry run complete. No data was deleted.');
      return;
    }

    if (tablesToTruncate.length > 0) {
      const quotedTables = tablesToTruncate.map(quoteTablePath).join(', ');
      await dataSource.query(
        `TRUNCATE TABLE ${quotedTables} RESTART IDENTITY CASCADE`,
      );
    }

    await dataSource.query(
      `DELETE FROM ${quoteTablePath('user')} WHERE role != $1`,
      ['ADMIN'],
    );

    console.log('Database data cleared successfully.');
    console.log('ADMIN users were preserved.');
  } finally {
    await app.close();
  }
}

clearDatabase().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
