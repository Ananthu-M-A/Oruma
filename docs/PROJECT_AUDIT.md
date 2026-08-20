# ORUMA Project Audit

Audit date: 22 July 2026

Sources reviewed:

- `ORUMA_Features_Document.pdf`
- `ORUM_PROPOSAL_V3.pdf`
- All tracked client, server, migration, CI, deployment, and test files in this repository

## Overall result

The project is **complete at the agreed application-code level, but is not yet operationally launched**. Role dashboards, authentication, verified quick booking, therapist discovery, scheduling, payment workflows, staff-managed Zoom/WhatsApp handoffs, case sheets, notifications, tickets, privacy operations, audit logging, and legal routes are present. The August 2026 MVP decision intentionally replaced the Zoom and WhatsApp API integrations with an administrator operations queue.

Production completion now depends on infrastructure/provider setup, approved policy values and content, production data, release execution, and live acceptance testing rather than unfinished feature coding.

Deployment observation on 19 July 2026: `https://oruma.me` returned HTTP 200 with HTTPS, and `https://www.oruma.me` redirected to the apex domain. `api.oruma.me` did not resolve, so the production API/full-stack workflow was not available at audit time. Local changes from this audit are not deployed by this document.

Masked local configuration observation: the ignored development `.env` has non-empty database, JWT, Resend, Razorpay key, Cloudinary, and admin bootstrap values. Razorpay webhook configuration still requires production validation. Zoom and WhatsApp credentials are intentionally not used by the MVP. Development payment and booking-lead-time bypasses are enabled locally but are code-blocked when `NODE_ENV=production`. Local values do not prove that any production provider is activated or valid.

## Proposal mapping

| Proposal area                                                  | Audit status                 | Evidence / boundary                                                                                                                                                                                                                |
| -------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full-stack foundation                                          | Implemented                  | React/Vite client, NestJS API, TypeORM/PostgreSQL, migrations, Dockerfile, health endpoint, CI.                                                                                                                                    |
| Patient, therapist, and admin roles                            | Implemented                  | JWT authentication, bcrypt passwords, role guards, protected routes, separate dashboards.                                                                                                                                          |
| OTP login                                                      | Implemented in code          | OTP delivery is email-only for the manual MVP. Social login is explicitly future scope.                                                                                                                                            |
| Admin dashboard                                                | Implemented                  | User/session metrics, therapist management and approval, appointments, payments/refunds, tickets, and case-sheet monitoring.                                                                                                       |
| Therapist dashboard                                            | Implemented                  | Approved profile workflow, image/audio upload, fees, availability, appointments, staff-added Zoom links, and therapist-only case-sheet editing.                                                                                    |
| Patient dashboard                                              | Implemented                  | Profile/health information, appointments, cancellation, payments/invoices, support tickets, and notifications.                                                                                                                     |
| Therapist discovery                                            | Implemented                  | Search/filter UI, public profiles, voice intros, fees, and current next-available slots. Real profile data remains operational work.                                                                                               |
| Booking and scheduling                                         | Implemented                  | Transactional slot locking, overlap checks, unique active slot booking, verified quick booking, configurable unpaid-reservation expiry, lifecycle validation, and cancellation are present.                                        |
| Razorpay payment                                               | Implemented in code          | Locked/idempotent order and verification flows, durable signed webhook processing, invoices, refunds, uniqueness constraints, and admin monitoring exist. Live payment/refund verification is external work.                       |
| Zoom consultation                                              | Manual MVP                   | Staff creates a unique Zoom meeting and stores the approved link in ORUMA after paid appointment confirmation. No Zoom API credentials are used.                                                                                   |
| Case sheets                                                    | Implemented                  | Assigned therapists can edit; administrators can monitor/read; patients are denied.                                                                                                                                                |
| Communication                                                  | Manual MVP                   | In-app notifications and durable email jobs remain. Staff uses prepared click-to-chat messages from the official WhatsApp Business account and records each handoff.                                                               |
| Support tickets                                                | Implemented                  | Authenticated ticket creation, admin updates/resolution, and notifications exist.                                                                                                                                                  |
| Legal and security                                             | Implemented at code boundary | Privacy export/request/approved-erasure workflows, retention workers, audit events, correlation IDs, readiness checks, security headers, and legal routes exist. Final policy/legal approval and HTTPS are operational boundaries. |
| UI/UX fixes                                                    | Implemented and automated    | Local Tailwind/Lucide assets, route splitting, navigation, fallback routing, responsive layouts, keyboard checks, component accessibility checks, and desktop/mobile workflow tests are present.                                   |
| Deployment and documentation                                   | Code complete                | Docker, production migration, env examples, PostgreSQL-backed CI, browser CI, and launch instructions exist. The frontend domain responds, but the expected production API domain did not resolve during the audit.                |
| 30-day post-launch support                                     | Not started                  | Begins only after a real production launch and is an operational/contractual activity.                                                                                                                                             |
| AI recommendations, subscriptions, multilingual UI, mobile app | Future scope                 | Explicitly excluded from current completion assessment by the feature document.                                                                                                                                                    |

## Corrections made during this audit

- Prevented public quick booking from issuing a patient JWT for a contact that already belongs to an account.
- Restricted therapist availability writes so therapists can manage only their own slots; arbitrary-therapist creation is admin-only.
- Removed private/unpublished therapist fields from public API responses and made profile availability current.
- Enforced terminal appointment states and valid status transitions; only paid appointments can be confirmed, and administrators add official Zoom links manually.
- Restricted case-sheet edits to therapists while retaining administrator read access.
- Prevented duplicate/refunded Razorpay payment flows from being restarted, added constant-time signature comparison, and corrected collected-revenue totals.
- Switched login and quick-booking OTP verification to email-only delivery.
- Repaired the inconsistent displayed contact phone number, dead calls to action, article `#` links, contact map placeholder, missing route fallback, and base meta description.
- Replaced README links to deleted documents with the current audit and launch documentation.

## Coding closeout completed on 22 July 2026

- Added verified email/phone OTP ownership and a short-lived, booking-only token before quick booking can create a patient account.
- Added configurable unpaid-reservation expiry with locked reconciliation and automatic slot release.
- Added payment-row locking, idempotent order/payment handling, provider identifiers and pending-payment uniqueness, signed durable webhook storage, retry/dead-letter behaviour, and admin recovery controls.
- Retained the database-backed provider queue for email with deduplication, exponential retry, stale-lock recovery, payload redaction, and admin monitoring. Legacy WhatsApp/Zoom jobs are dead-lettered as intentionally disabled.
- Replaced therapist hard deletion with archive/restore, account disabling, and future-slot blocking while preserving historical records.
- Added patient data export, reviewed erasure requests, account anonymization, configurable clinical/operational retention, and privacy administration UI.
- Added structured request/error logs, request correlation IDs, mutation audit events, database readiness, and live-account JWT validation.
- Removed runtime Tailwind/Lucide CDNs, added compiled local assets and route-level code splitting, and added frontend lint, unit, accessibility, responsive, keyboard, registration/login, dashboard, and booking-dialog tests.
- Added a production-hardening migration and disposable-PostgreSQL CI coverage for roles, booking/payment concurrency, verified quick booking, webhook deduplication, cancellation, clinical access, privacy export, and readiness.
- Removed the Zoom and WhatsApp provider integrations; manual operations are tracked directly on appointments.

## Pending coding tasks

No unfinished coding task from the audit remains. The retention durations, erasure grace period, provider templates, and production credentials are deliberately configuration/policy inputs; owners must approve and set them during launch. The PostgreSQL full-app suite is committed to CI but could not be executed locally because this workstation has no isolated PostgreSQL or Docker runtime, and the configured development database was intentionally not touched.

SEO and business-identity follow-up completed on 19 August 2026: canonical route metadata, crawler directives, Open Graph/Twitter metadata, ProfessionalService/Brand/Person-operator and page schema, XML sitemap, robots file, centralized business identity, and compliance checks are present. Search Console ownership, GA4 property values, sitemap submission, SSL/redirect confirmation, and production Core Web Vitals remain launch operations documented in `SEO_SETUP.md`.

## Pending work outside coding

1. Provision/deploy the production API and managed PostgreSQL database, add `api.oruma.me` DNS/TLS, and configure backups, a restore procedure, and uptime monitoring. The frontend apex/www domains already respond but still need release smoke testing after the API is available.
2. Configure production secrets and accounts: Razorpay live mode/KYC/webhook, Resend sending domain, and Cloudinary upload policy. Provision an owner-controlled Zoom subscription and use the configured official WhatsApp Business number for staff operations without API credentials.
3. Run migrations against staging first, then production; seed the first administrator and rotate/remove bootstrap credentials.
4. Load practitioner data and complete the verification checklist for exact role, qualifications, awarding institution, experience, applicable registration, areas of practice, consultation type, duration, price, relationship, images, voice intros, and availability before activation.
5. Confirm that RANJINI R exactly matches the owner’s PAN and settlement-bank name; match the operating address to KYC evidence; confirm GST and Udyam applicability; and verify access to the configured official contacts. Obtain legal/professional review of privacy, terms, cancellation, refund, consent, crisis, practitioner-scope, and record-retention wording.
6. Perform a controlled live soft launch: registration, password and email OTP login, therapist onboarding, booking, real payment, webhook, staff confirmation, manual Zoom-link creation, WhatsApp handoff recording, Zoom join, invoice, cancellation/refund, support ticket, case sheet, and role-access checks.
7. Complete security, privacy, accessibility, performance, and mobile-device acceptance testing with documented sign-off.
8. Establish incident response, customer support ownership, backup restore drills, provider billing, refund operations, and the promised 30-day post-launch support window.
