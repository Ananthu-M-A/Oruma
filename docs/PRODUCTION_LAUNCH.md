# ORUMA Production Launch Checklist

The application coding closeout is complete. Use this checklist to finish the infrastructure, provider, policy, data, and live-validation work required for launch.

## 1. Infrastructure

- Deploy `client/` to a static frontend host with `VITE_API_URL=https://api.oruma.me`.
- Build and deploy the API image from the repository root so the approved business identity is included: `docker build -f server/Dockerfile -t oruma-api:<release> .`. A `server/`-only build context is intentionally unsupported because it cannot package `config/business.json`.
- Provision managed PostgreSQL with SSL, automated backups, alerts, and a tested restore path.
- Set `oruma.me`, `www.oruma.me`, and `api.oruma.me` DNS and verify valid TLS certificates.
- Keep `DATABASE_SYNC=false` in staging and production.

Frontend SEO environment values:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GOOGLE_SITE_VERIFICATION=<optional HTML-tag verification content>
```

See `SEO_SETUP.md` for Search Console ownership, sitemap submission, Analytics validation, schema checks, and live PageSpeed work.

## 2. Required backend configuration

Set strong production values for database, JWT, allowed client origins, and provider credentials. Use `server/.env.example` as the canonical variable list.

Minimum application settings:

```env
NODE_ENV=production
CLIENT_ORIGIN=https://oruma.me,https://www.oruma.me
CLIENT_LOGIN_URL=https://oruma.me/login
ORUMA_API_URL=https://api.oruma.me
ORUMA_SITE_URL=https://oruma.me
JWT_SECRET=<at-least-32-random-characters>
DATABASE_URL=<production-postgres-url>
DATABASE_SYNC=false
DATABASE_SSL=true
TRUST_PROXY=true
ALLOW_PRODUCTION_DATABASE_CLEAR=false
```

Provider groups to configure:

- Live Mode `RAZORPAY_KEY_ID` (`rzp_live_...`), matching `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`
- `RESEND_API_KEY` and `EMAIL_FROM`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_UPLOAD_PRESET`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`
- `ORUMA_*` billing identity

Reliability and privacy policy values to approve:

- `UNPAID_RESERVATION_TTL_MINUTES`, `RESERVATION_CLEANUP_ENABLED`
- `PAYMENT_RECONCILIATION_GRACE_MINUTES` (default `15`)
- `PROVIDER_WORKER_ENABLED`, `PROVIDER_WORKER_BATCH_SIZE`
- `PRIVACY_AUTO_ERASURE_ENABLED`, `ACCOUNT_ERASURE_GRACE_DAYS`
- `DATA_RETENTION_WORKER_ENABLED` and every `*_RETENTION_DAYS` value

## 3. Database release

From a controlled release environment pointed at staging first:

```powershell
cd server
npm.cmd ci
npm.cmd run build
npm.cmd run migration:run:prod
```

Before promoting the image, start it once with production configuration and confirm `/ready` reports the database, email, Razorpay, webhook, worker, reservation-cleanup, and business-config checks as ready. Production startup fails if `config/business.json` or any required email/Razorpay setting is absent.

Repeat against production only after staging validation and a backup. Seed the initial administrator with `npm.cmd run seed:admin`, verify login, change the password, and remove the bootstrap password from stored environment configuration.

## 4. Provider dashboards

- Razorpay: complete individual-business KYC without changing the owner identity or business structure. In Live Mode → Account & Settings → Payment Methods, confirm UPI is `Activated` and verify UPI Intent plus Dynamic QR are available. Oruma uses Standard Checkout and also hides the deprecated UPI Collect flow; mobile checkout should use Intent and desktop checkout should display Razorpay's dynamic QR. A `Rejected` request is an account/category/product decision: preserve its exact Dashboard message and reason code because application code cannot activate it. See `razorpay-activation-checklist.md` and `razorpay-qr-use-case.md`.
- Configure `https://api.oruma.me/payments/razorpay/webhook`; enable `payment.captured`, `payment.failed`, `order.paid`, `refund.created`, `refund.processed`, and `refund.failed`; then test signature verification and refunds. Use matching Live Mode keys for a controlled Intent/QR acceptance payment; Razorpay Test Mode simulates UPI and does not prove that live Intent/QR activation is complete.
- Every admin refund request must include a stable `Idempotency-Key`. Review durable attempts at `GET /payments/admin/refunds`; never create a new refund while an operation is `REQUESTED` or `UNKNOWN`. Reuse its key so the API can reconcile the stable receipt without submitting a second gateway refund.
- Resend: verify the sending domain and DKIM/SPF records, then test OTP and therapist credential delivery.
- Cloudinary: configure a restricted upload preset that honors the per-account `oruma/therapists/<account-id>` folder. Keep the API secret server-only; it is required to remove replaced, rejected, and abandoned media.

Zoom and WhatsApp are manual MVP operations, not API providers. Use an owner-controlled Zoom subscription and the configured official WhatsApp Business number, then train staff using `MANUAL_APPOINTMENT_OPERATIONS.md`.

## 5. Release verification

Run locally/CI:

```powershell
cd client
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test -- --run
npm.cmd run build
npm.cmd run test:browser

cd ..\server
npm.cmd run lint:check
npm.cmd test -- --runInBand
npm.cmd run build
npm.cmd run test:e2e
```

The six full-module database scenarios run when `RUN_DATABASE_E2E=true` and must point only to a disposable PostgreSQL database. The repository CI provisions that database, runs every migration from empty state, and then runs the suite automatically.

Then execute the controlled production flow listed in `PROJECT_AUDIT.md`, confirm dashboards and role isolation, and record evidence for every external integration.

For the frontend release, also verify `/robots.txt`, `/sitemap.xml`, route-specific canonical/meta tags, the ProfessionalService/Brand/Person-operator schema, GA4 Realtime events, Search Console URL Inspection, apex/www redirects, TLS, and mobile/desktop PageSpeed results.

Official Razorpay references checked on 19 August 2026: [UPI migration and supported flows](https://razorpay.com/docs/payments/payment-methods/upi/), [UPI FAQs](https://razorpay.com/docs/payments/payment-methods/upi/faqs/), and [QR configuration](https://razorpay.com/docs/payments/qr-codes/create/).

## 6. Operations

- Monitor `/health`, `/ready`, structured application errors, provider/webhook dead-letter items, database capacity, and certificate expiry.
- Assign an administrator to review the reliability, privacy-request, and audit-event panels.
- Enable daily backups and complete a restore drill before public traffic.
- Keep previous frontend/backend releases available for rollback.
- Assign owners for incidents, refunds, clinical escalation, privacy requests, and customer support.
- Staff the paid-appointment queue during published operating hours, use unique Zoom meetings, and record every manual WhatsApp handoff in ORUMA.

### Backup and restore drill

Use managed point-in-time recovery plus an encrypted logical backup stored outside the database provider. A release-time logical backup and isolated restore can be exercised with the provider's PostgreSQL binaries:

```powershell
pg_dump.exe --dbname $env:DATABASE_URL --format custom --no-owner --file oruma-release.dump
createdb.exe --host <restore-host> --username <restore-admin> oruma_restore_test
pg_restore.exe --host <restore-host> --username <restore-admin> --dbname oruma_restore_test --no-owner --exit-on-error oruma-release.dump
psql.exe --host <restore-host> --username <restore-admin> --dbname oruma_restore_test -c 'SELECT COUNT(*) FROM migrations;'
```

The restore target must be a new disposable database, never production. Verify the migration count, critical tables, representative row counts, and `/ready` using the restored database; record the backup identifier, checksum, start/end times, and operator, then destroy the restore target. Alert on backup failure or age, restore-drill failure, `/health` or `/ready` failure, HTTP 5xx/error rate, webhook/provider dead letters, PostgreSQL capacity/connection pressure, and TLS expiry.
