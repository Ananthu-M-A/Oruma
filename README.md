# ORUMA Wellness

ORUMA is a full-stack digital wellness platform for patients, therapists, and administrators. The repository contains a React/Vite client and a NestJS/PostgreSQL API with authentication, scheduling, Razorpay payments, Zoom meeting creation, case sheets, notifications, therapist administration, and support tickets.

## Repository

- `client/` — React 18, React Router, Vite, and TypeScript frontend.
- `server/` — NestJS, TypeORM, and PostgreSQL API.
- `.github/workflows/ci.yml` — client type-check/build plus server lint/build/test workflow.
- [`docs/PROJECT_AUDIT.md`](docs/PROJECT_AUDIT.md) — proposal-to-code completion audit and pending coding/outside-coding work.
- [`docs/PRODUCTION_LAUNCH.md`](docs/PRODUCTION_LAUNCH.md) — production deployment and provider setup checklist.

## Local verification

```powershell
cd client
npm.cmd ci
npm.cmd run typecheck
npm.cmd run build

cd ..\server
npm.cmd ci
npm.cmd run lint:check
npm.cmd test -- --runInBand
npm.cmd run build
npm.cmd run test:e2e
```

Copy each `.env.example` to `.env` before running the applications. The server requires PostgreSQL connection settings; production must use migrations with `DATABASE_SYNC=false`.

## Current status

The core proposal features are implemented in code and the local build/test baseline passes. The project is not yet verified as production-complete: real provider credentials, production infrastructure, migrations, operational data, and live end-to-end smoke testing are still required. See the project audit for the exact boundary.
