# Oruma Server

NestJS API server for Oruma.

## Requirements

- Node.js 20+
- npm
- Neon, PostgreSQL 18 locally, or Docker with Docker Compose

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
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=
DATABASE_SYNC=false
```

For a remote database, set `DATABASE_URL` to your provider connection string and keep `DATABASE_SYNC=false` while the server is running. Use migrations in remote environments instead of schema auto-sync.

## Database

### Option 1: Remote PostgreSQL (recommended)

1. Copy the example environment file:

```bash
copy .env.example .env
```

2. Open `.env` and set a remote connection string:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
DATABASE_SYNC=false
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=true
```

3. Start the server:

```bash
npm run start:dev
```

4. If the server cannot connect, verify the host, port, database name, username, password, and SSL settings in the provider dashboard.

### Option 2: Neon

Copy the connection string from **Neon > Project Dashboard > Connect** and place it in `DATABASE_URL`:

```env
DATABASE_URL=postgresql://user:password@ep-example-pooler.region.aws.neon.tech/dbname?sslmode=require&channel_binding=require
DATABASE_SYNC=false
```

When `DATABASE_URL` is set, it takes precedence over `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, and `DATABASE_NAME`. Neon still uses the PostgreSQL protocol, so the TypeORM driver remains `postgres`.

If you see `password authentication failed`, copy a fresh connection string from Neon and make sure the selected branch, database, and role match the project you want to use.

### Option 3: Local PostgreSQL

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

### Option 4: Docker

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

The browser client is allowed through `CLIENT_ORIGIN`. For multiple origins, use a comma-separated value:

```env
CLIENT_ORIGIN=http://localhost:5173,https://your-client-domain.com
```

## Invoice Generation

Paid and refunded payments can be opened as printable HTML invoices from the patient and admin dashboards. The invoice endpoint is authenticated at:

```text
GET /payments/:id/invoice
```

Optional billing identity values:

```env
ORUMA_LEGAL_NAME=Oruma Wellness
ORUMA_BILLING_ADDRESS=ORUMA.ME Digital Wellness Platform
ORUMA_GSTIN=
```

## Manual Zoom and WhatsApp Operations

The MVP does not connect to the Zoom or WhatsApp APIs. After a paid appointment is confirmed, an administrator creates a unique Zoom meeting and saves its official `https://*.zoom.us/...` link through:

```text
PATCH /appointments/:id/operations
```

The admin dashboard creates click-to-chat WhatsApp links with prepared messages. Staff sends each message from the official ORUMA WhatsApp Business account and records the booking confirmation, link delivery, and reminder timestamps in ORUMA. These timestamps are operational records; WhatsApp does not determine appointment status.

OTP login and quick-booking verification use email only. Keep `RESEND_API_KEY` and `EMAIL_FROM` configured in production. See `../docs/MANUAL_APPOINTMENT_OPERATIONS.md` for the staff procedure.

## Scripts

```bash
npm run build
npm run format
npm run lint
npm run lint:check
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
