# ORUMA Production Launch Checklist

Use this checklist only after the coding tasks marked as release-blocking in `PROJECT_AUDIT.md` are accepted or completed.

## 1. Infrastructure

- Deploy `client/` to a static frontend host with `VITE_API_URL=https://api.oruma.me`.
- Deploy `server/` using `server/Dockerfile`.
- Provision managed PostgreSQL with SSL, automated backups, alerts, and a tested restore path.
- Set `oruma.me`, `www.oruma.me`, and `api.oruma.me` DNS and verify valid TLS certificates.
- Keep `DATABASE_SYNC=false` in staging and production.

## 2. Required backend configuration

Set strong production values for database, JWT, allowed client origins, and provider credentials. Use `server/.env.example` as the canonical variable list.

Minimum application settings:

```env
NODE_ENV=production
CLIENT_ORIGIN=https://oruma.me,https://www.oruma.me
CLIENT_LOGIN_URL=https://oruma.me/login
JWT_SECRET=<at-least-32-random-characters>
DATABASE_URL=<production-postgres-url>
DATABASE_SYNC=false
DATABASE_SSL=true
TRUST_PROXY=true
ALLOW_PRODUCTION_DATABASE_CLEAR=false
```

Provider groups to configure:

- `RAZORPAY_*`
- `ZOOM_*`
- `RESEND_API_KEY` and `EMAIL_FROM`
- `WHATSAPP_*`, including an approved `WHATSAPP_OTP_TEMPLATE_NAME`
- `CLOUDINARY_*`
- `ORUMA_*` billing identity

## 3. Database release

From a controlled release environment pointed at staging first:

```powershell
cd server
npm.cmd ci
npm.cmd run build
npm.cmd run migration:run:prod
```

Repeat against production only after staging validation and a backup. Seed the initial administrator with `npm.cmd run seed:admin`, verify login, change the password, and remove the bootstrap password from stored environment configuration.

## 4. Provider dashboards

- Razorpay: activate live mode, configure `https://api.oruma.me/payments/razorpay/webhook`, enable captured/failed/refund events, and test signature verification plus refunds.
- Zoom: configure Server-to-Server OAuth meeting-write scopes and verify each configured therapist host can start/join meetings.
- Resend: verify the sending domain and DKIM/SPF records, then test OTP and therapist credential delivery.
- WhatsApp: connect the production number and approve appointment confirmation and OTP authentication templates with parameters matching the code.
- Cloudinary: configure a restricted upload preset and validate image/audio type, size, access, and lifecycle rules.

## 5. Release verification

Run locally/CI:

```powershell
cd client
npm.cmd run typecheck
npm.cmd run build

cd ..\server
npm.cmd run lint:check
npm.cmd test -- --runInBand
npm.cmd run build
npm.cmd run test:e2e
```

Then execute the controlled production flow listed in `PROJECT_AUDIT.md`, confirm dashboards and role isolation, and record evidence for every external integration.

## 6. Operations

- Monitor `/health`, application errors, provider failures, database capacity, and certificate expiry.
- Enable daily backups and complete a restore drill before public traffic.
- Keep previous frontend/backend releases available for rollback.
- Assign owners for incidents, refunds, clinical escalation, privacy requests, and customer support.
