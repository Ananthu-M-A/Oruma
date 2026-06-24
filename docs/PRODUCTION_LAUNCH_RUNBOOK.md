# ORUMA Production Launch Runbook

This runbook is for launching the current ORUMA codebase on `oruma.me` with a low initial monthly cost and a path to scale without redesigning the system.

## What Is Ready In This Repo

- Client production build passes with `npm run build`.
- Server production build passes with `npm run build`.
- Server tests pass with `npm test -- --runInBand`.
- Server has security headers, origin checks, rate limits, Razorpay integration, Zoom integration, email/WhatsApp notification hooks, and invoice rendering.
- Server has a production Dockerfile at `server/Dockerfile`.
- Server has a health endpoint at `GET /health`.
- Server has TypeORM migration tooling.
- Server has an admin seed script.
- GitHub Actions CI is configured in `.github/workflows/ci.yml`.

## Recommended Affordable Architecture

- Frontend: Vercel, serving `client/dist` on `https://oruma.me`.
- Backend API: Docker-based app service on DigitalOcean App Platform, Render, Railway, or similar.
- Database: managed PostgreSQL.
- API domain: `https://api.oruma.me`.
- Media uploads: Cloudinary.
- Email: Resend.
- Payments: Razorpay live mode.
- WhatsApp: Meta WhatsApp Cloud API.
- Video meetings: Zoom Server-to-Server OAuth.

Start with one API instance and one small managed PostgreSQL instance. Upgrade CPU/RAM first, then database size, then add Redis/Valkey before horizontal API autoscaling.

## Phase 1: Push The Release

From the repository root:

```powershell
git status --short --branch
git add .
git commit -m "chore: add production launch setup"
git push origin main
```

Confirm the GitHub Actions workflow passes after the push.

## Phase 2: Create Production Backend Database

Create a managed PostgreSQL database with these minimum settings:

- Region close to India if available.
- Automatic backups enabled.
- SSL enabled if the provider requires or supports it.
- Public access limited to the backend provider where possible.

Save these values:

```env
DATABASE_HOST=
DATABASE_PORT=5432
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=true
```

Some providers use self-signed managed database certificates. If connection fails with a certificate verification error, set:

```env
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

## Phase 3: Run Database Migrations

Do not use `DATABASE_SYNC=true` in production.

The repository includes the initial production schema migration in `server/src/migrations`.
Point your local `server/.env` or provider job environment to an empty staging/production-equivalent database and set:

```env
DATABASE_SYNC=false
```

Then run:

```powershell
cd server
npm.cmd run migration:run
npm.cmd run build
```

For every future schema change, generate a new migration after editing entities:

```powershell
cd server
npm.cmd run typeorm -- migration:generate src/migrations/DescribeChange
npm.cmd run migration:run
npm.cmd test -- --runInBand
npm.cmd run build
```

If you need to run migrations from a built production container or one-off provider job, use:

```powershell
cd server
npm.cmd run build
npm.cmd run migration:run:prod
```

## Phase 4: Deploy The API

Deploy `server/` as a Docker app using `server/Dockerfile`.

Backend environment variables:

```env
NODE_ENV=production
PORT=3000
CLIENT_ORIGIN=https://oruma.me,https://www.oruma.me
CLIENT_LOGIN_URL=https://oruma.me/login

DATABASE_HOST=
DATABASE_PORT=5432
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=
DATABASE_SYNC=false
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=true

JWT_SECRET=
JWT_EXPIRES_IN=1h
TRUST_PROXY=true
JSON_BODY_LIMIT=1mb
FORM_BODY_LIMIT=256kb
GLOBAL_RATE_LIMIT_PER_MINUTE=300
AUTH_RATE_LIMIT_PER_15_MINUTES=30

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_UPLOAD_PRESET=

RESEND_API_KEY=
EMAIL_FROM=Oruma <no-reply@oruma.me>

ORUMA_LEGAL_NAME=Oruma Wellness
ORUMA_BILLING_ADDRESS=ORUMA.ME Digital Wellness Platform
ORUMA_GSTIN=

WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_APPOINTMENT_TEMPLATE_NAME=appointment_confirmation
WHATSAPP_TEMPLATE_LANGUAGE=en
WHATSAPP_API_VERSION=v20.0
WHATSAPP_DEFAULT_COUNTRY_CODE=91

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_USER_ID=me
ZOOM_TIMEZONE=Asia/Kolkata

ALLOW_PRODUCTION_DATABASE_CLEAR=false
```

Generate a strong JWT secret:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

After deployment, verify:

```powershell
curl.exe -sS https://api.oruma.me/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "oruma-api"
}
```

## Phase 5: Seed The First Admin

Set these temporarily in the backend environment or provider job shell:

```env
ADMIN_EMAIL=admin@oruma.me
ADMIN_PASSWORD=use-a-long-temporary-password
ADMIN_FULL_NAME=ORUMA Admin
ADMIN_PHONE=
```

Run after the app has been built and migrations are applied:

```powershell
cd server
npm.cmd run build
npm.cmd run migration:run:prod
npm.cmd run seed:admin
```

Log in at:

```text
https://oruma.me/login
```

After login is confirmed, rotate the password to a secure stored value and remove `ADMIN_PASSWORD` from the production environment if your hosting provider keeps job variables permanently.

## Phase 6: Deploy The Frontend

On Vercel:

- Project root: `client`
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

Frontend environment variable:

```env
VITE_API_URL=https://api.oruma.me
```

Deploy and verify these routes:

```text
https://oruma.me/
https://oruma.me/login
https://oruma.me/therapists
https://oruma.me/profile/admin
```

## Phase 7: Configure DNS And TLS

Required records:

- `oruma.me` points to Vercel.
- `www.oruma.me` points to Vercel and redirects to `oruma.me`.
- `api.oruma.me` points to the backend provider.

Verify:

```powershell
curl.exe -I https://oruma.me
curl.exe -I https://www.oruma.me
curl.exe -sS https://api.oruma.me/health
```

All should use valid HTTPS certificates. `www.oruma.me` should not show a certificate mismatch.

## Phase 8: Configure External Providers

### Razorpay

- Switch to live mode.
- Add live `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
- Create a webhook secret and set `RAZORPAY_WEBHOOK_SECRET`.
- Webhook URL:

```text
https://api.oruma.me/payments/razorpay/webhook
```

- Enable events:
  - `payment.captured`
  - `payment.failed`
  - refund events available for your Razorpay account

### Resend

- Verify `oruma.me`.
- Add required DNS records for DKIM/SPF.
- Set `EMAIL_FROM=Oruma <no-reply@oruma.me>`.
- Send a test OTP email.

### WhatsApp

- Configure Meta WhatsApp Cloud API.
- Add `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`.
- Submit/approve the `appointment_confirmation` template.
- Test appointment booking to an internal phone number.

### Zoom

- Create a Server-to-Server OAuth app.
- Set `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`.
- Grant meeting creation permission.
- Confirm an appointment and verify a Zoom link is created.

### Cloudinary

- Create an upload preset for therapist/profile media.
- Set `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET`.
- Test media upload from the admin/therapist workflow.

## Phase 9: Seed Operational Data

Use the admin dashboard to add or verify:

- Therapist accounts.
- Active therapist profiles.
- Therapist prices.
- Couple therapy prices where applicable.
- Availability slots.
- Therapist images and voice intros.

Then run a full test booking for each important service type.

## Phase 10: Soft Launch Checklist

Run these before public traffic:

- Register a patient.
- Request OTP login by email.
- Request OTP login by WhatsApp.
- Book an appointment.
- Confirm an appointment as admin or therapist.
- Verify Zoom link delivery.
- Pay through Razorpay live test amount or a controlled real payment.
- Verify Razorpay webhook updates payment status.
- Generate invoice.
- Initiate and verify refund.
- Create and resolve a support ticket.
- Confirm admin dashboard metrics.
- Confirm therapist dashboard appointment visibility.
- Confirm patient dashboard appointment/payment visibility.
- Confirm privacy policy and terms are reachable from footer.

## Phase 11: Monitoring, Backups, And Rollback

Minimum launch monitoring:

- Uptime monitor for `https://api.oruma.me/health`.
- Hosting provider alerts for API crashes.
- Database CPU/storage alerts.
- Daily managed PostgreSQL backups.
- Manual restore test before heavy traffic.

Rollback:

- Keep the previous frontend deployment in Vercel.
- Keep the previous backend image/deployment available.
- Do not run destructive migrations without a database backup.

## Phase 12: Scaling Plan

Initial affordable launch:

- One API instance.
- One managed PostgreSQL instance.
- Vercel CDN for frontend.

When traffic grows:

1. Increase API RAM/CPU.
2. Increase PostgreSQL RAM/storage.
3. Add Redis/Valkey for shared rate limiting and background jobs.
4. Add horizontal API autoscaling.
5. Move long-running notifications/webhook retries into a queue.
6. Add read replicas only after real database read pressure appears.

Important: the current in-memory rate limiter is fine for one API instance. Before running multiple API instances, move rate limit state to Redis/Valkey.
