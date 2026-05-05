# Oruma Server

NestJS API server for Oruma.

## Requirements

- Node.js 20+
- npm
- PostgreSQL 18 locally, or Docker with Docker Compose

## Setup

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
copy .env.example .env
```

Default database configuration:

```env
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_USER=your_database_user
DATABASE_PASSWORD=your_database_password
DATABASE_NAME=oruma
DATABASE_SYNC=true
```

`DATABASE_SYNC=true` is useful for local development because TypeORM can sync entity schema changes automatically. Disable it in production and use migrations instead.

## PostgreSQL

### Option 1: Local PostgreSQL

Start the PostgreSQL Windows service:

```powershell
Start-Service postgresql-x64-18
```

Check that PostgreSQL is accepting connections:

```powershell
D:\TOOLS\PostgreSQL\18\bin\pg_isready.exe -h 127.0.0.1 -p 5432
```

Create the app user and database if they do not exist:

```powershell
D:\TOOLS\PostgreSQL\18\bin\psql.exe -U postgres
```

```sql
CREATE USER teamoruma WITH PASSWORD 'Pswd4teamorum@';
CREATE DATABASE oruma OWNER teamoruma;
GRANT ALL PRIVILEGES ON DATABASE oruma TO teamoruma;
```

Verify the app credentials:

```powershell
$env:PGPASSWORD='Pswd4teamorum@'
D:\TOOLS\PostgreSQL\18\bin\psql.exe -h 127.0.0.1 -U teamoruma -d oruma -c "select current_database(), current_user;"
```

### Option 2: Docker

If Docker is installed, start PostgreSQL from the compose file:

```bash
docker compose up -d postgres
```

The compose service reads the same database values from `.env`.

## Running The App

Development mode:

```bash
npm run start:dev
```

Production build:

```bash
npm run build
npm run start:prod
```

The server listens on `PORT` from `.env`, or `3000` by default.

## Scripts

```bash
npm run build
npm run format
npm run lint
npm test
npm run test:e2e
```

If Jest worker spawning fails on Windows, run tests in-band:

```bash
npm test -- --runInBand
```

## Database Integration

PostgreSQL is configured through `@nestjs/typeorm` in `src/database/database.module.ts`.

Entities should be registered through feature modules with `TypeOrmModule.forFeature([...])`. The root connection uses `autoLoadEntities: true`, so imported feature entities are automatically included in the connection.
