# ORUMA Production Launch Checklist

The application coding closeout is complete. Use this checklist to finish the infrastructure, provider, policy, data, and live-validation work required for launch.

## 1. Infrastructure

- Deploy `client/` to a static frontend host with `VITE_API_URL=https://api.oruma.me`.
- Deploy `server/` using `server/Dockerfile`.
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
JWT_SECRET=<at-least-32-random-characters>
DATABASE_URL=<production-postgres-url>
DATABASE_SYNC=false
DATABASE_SSL=true
TRUST_PROXY=true
ALLOW_PRODUCTION_DATABASE_CLEAR=false
```

Provider groups to configure:

- `RAZORPAY_*`
- `RESEND_API_KEY` and `EMAIL_FROM`
- `CLOUDINARY_*`
- `ORUMA_*` billing identity

Reliability and privacy policy values to approve:

- `UNPAID_RESERVATION_TTL_MINUTES`, `RESERVATION_CLEANUP_ENABLED`
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

Repeat against production only after staging validation and a backup. Seed the initial administrator with `npm.cmd run seed:admin`, verify login, change the password, and remove the bootstrap password from stored environment configuration.

## 4. Provider dashboards

- Razorpay: complete individual-business KYC without changing the owner identity or business structure. In Live Mode → Account & Settings → Payment Methods, confirm UPI is `Activated` and verify UPI Intent plus Dynamic QR are available. Oruma uses Standard Checkout and also hides the deprecated UPI Collect flow; mobile checkout should use Intent and desktop checkout should display Razorpay's dynamic QR. A `Rejected` request is an account/category/product decision: preserve its exact Dashboard message and reason code because application code cannot activate it. See `razorpay-activation-checklist.md` and `razorpay-qr-use-case.md`.
- Configure `https://api.oruma.me/payments/razorpay/webhook`, enable `payment.captured`, `payment.failed`, `order.paid`, and refund events, and test signature verification plus refunds. Use matching Live Mode keys for a controlled Intent/QR acceptance payment; Razorpay Test Mode simulates UPI and does not prove that live Intent/QR activation is complete.
- Resend: verify the sending domain and DKIM/SPF records, then test OTP and therapist credential delivery.
- Cloudinary: configure a restricted upload preset and validate image/audio type, size, access, and lifecycle rules.

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
