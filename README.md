# ORUMA Wellness

ORUMA is a full-stack digital wellness platform for patients, therapists, and administrators. The repository contains a React/Vite client and a NestJS/PostgreSQL API with authentication, scheduling, Razorpay payments, Zoom meeting creation, case sheets, notifications, therapist administration, and support tickets.

## Repository

- `client/` — React 18, React Router, Vite, and TypeScript frontend.
- `server/` — NestJS, TypeORM, and PostgreSQL API.
- `.github/workflows/ci.yml` — client type-check/build plus server lint/build/test workflow.
- [`docs/PROJECT_AUDIT.md`](docs/PROJECT_AUDIT.md) — proposal-to-code completion audit and pending coding/outside-coding work.
- [`docs/PRODUCTION_LAUNCH.md`](docs/PRODUCTION_LAUNCH.md) — production deployment and provider setup checklist.
- [`docs/SEO_SETUP.md`](docs/SEO_SETUP.md) — implemented SEO controls plus Search Console, GA4, sitemap, SSL, and live-validation steps.

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

The agreed proposal scope and audit coding backlog are implemented, and the local build/test baseline passes. Production launch still requires real provider credentials, infrastructure, approved policy/content values, migrations, operational data, and live acceptance testing. See the project audit for the exact boundary.
