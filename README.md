# ORUMA Wellness

ORUMA is a full-stack digital wellness platform for patients, therapists, and administrators. The repository contains a React/Vite client and a NestJS/PostgreSQL API with authentication, scheduling, Razorpay payments, staff-managed Google Meet/Zoom links and WhatsApp handoffs, a website contact form, case sheets, notifications, therapist administration, and support tickets.

## Repository

- `client/` — React 18, React Router, Vite, and TypeScript frontend.
- `server/` — NestJS, TypeORM, and PostgreSQL API.
- `.github/workflows/ci.yml` — client type-check/build plus server lint/build/test workflow.
- [`docs/PROJECT_AUDIT.md`](docs/PROJECT_AUDIT.md) — proposal-to-code completion audit and pending coding/outside-coding work.
- [`docs/PRODUCTION_LAUNCH.md`](docs/PRODUCTION_LAUNCH.md) — production deployment and provider setup checklist.
- [`docs/SEO_SETUP.md`](docs/SEO_SETUP.md) — implemented SEO controls plus Search Console, GA4, sitemap, SSL, and live-validation steps.

- [`docs/MANUAL_APPOINTMENT_OPERATIONS.md`](docs/MANUAL_APPOINTMENT_OPERATIONS.md) — care-team procedure for appointment confirmation, session links, WhatsApp contact, enquiries, and reminders.
- [`docs/HANDOVER_PLAN.md`](docs/HANDOVER_PLAN.md) and [`docs/OWNER_REQUIREMENTS_PLAN.md`](docs/OWNER_REQUIREMENTS_PLAN.md) — launch, handover and owner-requirements plans.

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

Status on 6 November 2026: the API runs at `https://api.oruma.me`, and the new build is on the Vercel preview while `oruma.me` still serves an older build. The MVP uses no Google Meet, Zoom or WhatsApp API credentials: ORUMA remains the booking source of truth while staff create unique meeting links and contact patients from the official WhatsApp Business account. Remaining launch work is tracked in `docs/HANDOVER_PLAN.md` and `docs/OWNER_REQUIREMENTS_PLAN.md`.
