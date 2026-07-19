# ORUMA Project Audit

Audit date: 19 July 2026

Sources reviewed:

- `ORUMA_Features_Document.pdf`
- `ORUM_PROPOSAL_V3.pdf`
- All tracked client, server, migration, CI, deployment, and test files in this repository

## Overall result

The project is **feature-complete at the core application-code level, but not production-complete**. Role dashboards, authentication, therapist discovery, scheduling, payment workflows, Zoom meeting creation, case sheets, notifications, tickets, and legal routes are present. Local client type-check/build, server lint/build, 46 unit tests, and two controller-level end-to-end smoke tests pass.

Production completion still depends on deeper end-to-end coverage, a few reliability improvements, real infrastructure/provider setup, verified content and legal details, production data, and live smoke testing.

Deployment observation on 19 July 2026: `https://oruma.me` returned HTTP 200 with HTTPS, and `https://www.oruma.me` redirected to the apex domain. `api.oruma.me` did not resolve, so the production API/full-stack workflow was not available at audit time. Local changes from this audit are not deployed by this document.

Masked local configuration observation: the ignored development `.env` has non-empty database, JWT, Resend, Razorpay key, Cloudinary, and admin bootstrap values. WhatsApp access token/phone ID, Razorpay webhook secret, WhatsApp OTP template, and all Zoom credentials are missing. Development payment and booking-lead-time bypasses are enabled locally but are code-blocked when `NODE_ENV=production`. Local values do not prove that any production provider is activated or valid.

## Proposal mapping

| Proposal area | Audit status | Evidence / boundary |
| --- | --- | --- |
| Full-stack foundation | Implemented | React/Vite client, NestJS API, TypeORM/PostgreSQL, migrations, Dockerfile, health endpoint, CI. |
| Patient, therapist, and admin roles | Implemented | JWT authentication, bcrypt passwords, role guards, protected routes, separate dashboards. |
| OTP login | Implemented in code | Email and WhatsApp delivery hooks exist. Production WhatsApp requires an approved OTP template. Social login is explicitly future scope. |
| Admin dashboard | Implemented | User/session metrics, therapist management and approval, appointments, payments/refunds, tickets, and case-sheet monitoring. |
| Therapist dashboard | Implemented | Approved profile workflow, image/audio upload, fees, availability, appointments, Zoom links, and therapist-only case-sheet editing. |
| Patient dashboard | Implemented | Profile/health information, appointments, cancellation, payments/invoices, support tickets, and notifications. |
| Therapist discovery | Implemented | Search/filter UI, public profiles, voice intros, fees, and current next-available slots. Real profile data remains operational work. |
| Booking and scheduling | Implemented with reliability work pending | Transactional slot locking, overlap checks, unique active slot booking, 24-hour lead time, lifecycle validation, and cancellation are present. Expiry of abandoned unpaid reservations is not automated. |
| Razorpay payment | Implemented in code | Order creation, signature verification, webhook handling, invoices, refunds, and admin monitoring exist. Live payment/refund verification is external work. |
| Zoom consultation | Implemented in code | Server-to-Server OAuth and automatic meeting creation on confirmation exist. Live host/scopes and callback behaviour require provider validation. |
| Case sheets | Implemented | Assigned therapists can edit; administrators can monitor/read; patients are denied. |
| Communication | Implemented in code | In-app, Resend email, and WhatsApp Cloud API paths exist. Provider setup and delivery validation remain. |
| Support tickets | Implemented | Authenticated ticket creation, admin updates/resolution, and notifications exist. |
| Legal and security | Partially verified | Privacy, terms, refund, and cancellation routes exist; HTTPS/HSTS is deployment-dependent. Final legal review and data-retention procedures are outside the code audit. |
| UI/UX fixes | Implemented at build level | Navigation, concern anchors, logo assets, WhatsApp actions, fallback routing, and responsive layouts are present. Device/accessibility testing remains. |
| Deployment and documentation | Partially complete | Docker, migrations, env examples, CI, and launch instructions exist. The frontend domain responds, but the expected production API domain did not resolve during the audit. |
| 30-day post-launch support | Not started | Begins only after a real production launch and is an operational/contractual activity. |
| AI recommendations, subscriptions, multilingual UI, mobile app | Future scope | Explicitly excluded from current completion assessment by the feature document. |

## Corrections made during this audit

- Prevented public quick booking from issuing a patient JWT for a contact that already belongs to an account.
- Restricted therapist availability writes so therapists can manage only their own slots; arbitrary-therapist creation is admin-only.
- Removed private/unpublished therapist fields from public API responses and made profile availability current.
- Enforced terminal appointment states and valid status transitions; confirmed appointments without a Zoom link can retry meeting creation.
- Restricted case-sheet edits to therapists while retaining administrator read access.
- Prevented duplicate/refunded Razorpay payment flows from being restarted, added constant-time signature comparison, and corrected collected-revenue totals.
- Added support for a dedicated approved WhatsApp OTP template.
- Repaired the inconsistent displayed contact phone number, dead calls to action, article `#` links, contact map placeholder, missing route fallback, and base meta description.
- Replaced README links to deleted documents with the current audit and launch documentation.

## Pending coding tasks

These are the remaining engineering tasks recommended before declaring the software production-complete:

1. Add full application end-to-end tests against an isolated PostgreSQL database. The current `test:e2e` suite covers only root/health controllers and does not exercise authentication, booking, payment, case-sheet, or role boundaries through the real app module.
2. Require OTP/contact ownership before creating a persistent quick-booking patient account, or issue a narrowly scoped temporary booking token. The audit prevents takeover of an existing account, but a new contact is not yet verified before its guest account is created.
3. Add an expiry/reconciliation job for abandoned unpaid appointments so a user who closes the browser or loses connectivity cannot leave a slot reserved indefinitely.
4. Add database-backed idempotency/uniqueness for provider order/payment events and concurrency tests for simultaneous payment-order creation and webhook delivery.
5. Add durable provider retry/queue handling and delivery status tracking for email, WhatsApp, Zoom, and payment webhooks. Current network calls are synchronous and mostly log failures.
6. Replace runtime Tailwind and Lucide CDN dependencies with locally built, versioned production assets; add frontend lint/unit tests and run them in CI. Type-checking and production builds are already enforced in CI.
7. Add automated browser tests for registration/login, each dashboard, booking/payment cancellation paths, responsive layouts, keyboard use, and accessibility.
8. Define archival behaviour for therapists with historical appointments. Hard deletion can conflict with retained clinical/appointment records; production should use an explicit archive/deactivate policy.
9. Add production-grade observability: structured logs with correlation IDs, error reporting, audit events for clinical/admin actions, and health checks that include dependency readiness without exposing secrets.
10. Review and implement the approved retention/deletion/export rules once legal/clinical policy owners define them.

## Pending work outside coding

1. Provision/deploy the production API and managed PostgreSQL database, add `api.oruma.me` DNS/TLS, and configure backups, a restore procedure, and uptime monitoring. The frontend apex/www domains already respond but still need release smoke testing after the API is available.
2. Configure production secrets and accounts: Razorpay live mode/KYC/webhook, Zoom Server-to-Server OAuth/scopes/hosts, Resend sending domain, WhatsApp Cloud API and approved appointment/OTP templates, and Cloudinary upload policy.
3. Run migrations against staging first, then production; seed the first administrator and rotate/remove bootstrap credentials.
4. Load and approve real therapist names, emails, qualifications, specializations, fees, Zoom hosts, images, voice intros, active status, and availability.
5. Confirm the official phone number, general/support/legal email addresses, physical/business address, legal entity name, GSTIN, and all public copy. Obtain legal/clinical review of privacy, terms, cancellation, refund, consent, crisis, and record-retention wording.
6. Perform a controlled live soft launch: registration, password and OTP login, therapist onboarding, booking, real payment, webhook, confirmation, Zoom join, invoice, cancellation/refund, support ticket, case sheet, and role-access checks.
7. Complete security, privacy, accessibility, performance, and mobile-device acceptance testing with documented sign-off.
8. Establish incident response, customer support ownership, backup restore drills, provider billing, refund operations, and the promised 30-day post-launch support window.
