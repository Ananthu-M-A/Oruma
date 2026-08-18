# ORUMA Wellness

ORUMA is a full-stack digital wellness platform for patients, therapists, and administrators. The repository contains a React/Vite client and a NestJS/PostgreSQL API with authentication, scheduling, Razorpay payments, staff-managed Zoom and WhatsApp handoffs, case sheets, notifications, therapist administration, and support tickets.

## Repository

- `client/` — React 18, React Router, Vite, and TypeScript frontend.
- `server/` — NestJS, TypeORM, and PostgreSQL API.
- `.github/workflows/ci.yml` — client type-check/build plus server lint/build/test workflow.
- [`docs/PROJECT_AUDIT.md`](docs/PROJECT_AUDIT.md) — proposal-to-code completion audit and pending coding/outside-coding work.
- [`docs/PRODUCTION_LAUNCH.md`](docs/PRODUCTION_LAUNCH.md) — production deployment and provider setup checklist.
- [`docs/SEO_SETUP.md`](docs/SEO_SETUP.md) — implemented SEO controls plus Search Console, GA4, sitemap, SSL, and live-validation steps.

- [`docs/MANUAL_APPOINTMENT_OPERATIONS.md`](docs/MANUAL_APPOINTMENT_OPERATIONS.md) — care-team procedure for appointment confirmation, Zoom links, WhatsApp contact, and reminders.

## Local verification

```powershell
cd client
npm.cmd ci
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test -- --run
npm.cmd run build
npm.cmd run test:browser

cd ..\server
npm.cmd ci
npm.cmd run lint:check
npm.cmd test -- --runInBand
npm.cmd run build
npm.cmd run test:e2e
```

Copy each `.env.example` to `.env` before running the applications. The server requires PostgreSQL connection settings; production must use migrations with `DATABASE_SYNC=false`.

## Current status

The MVP uses no Zoom or WhatsApp API credentials. ORUMA remains the booking source of truth while administrators create unique Zoom meetings and contact patients from the official WhatsApp Business account. Production launch still requires payment/email/media provider credentials, infrastructure, approved policy/content values, migrations, operational staffing, and live acceptance testing.
