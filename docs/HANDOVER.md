# ORUMA Website Handover

| | |
|---|---|
| **Website** | https://oruma.me |
| **Handed over on** | [FILL: date] |
| **Prepared by** | Ananthu M A |
| **Developer contact during support** | [FILL: email and phone] |
| **Support period** | 30 days, from [FILL: start date] to [FILL: end date] |

This document explains what you are receiving, how to run the website each day, and what to do when something goes wrong.

**Passwords and keys are not in this document.** They are in a separate credentials sheet, which is delivered privately (see section 3).

---

## 1. What you are receiving

- The ORUMA website at `https://oruma.me`, with patient, practitioner and admin dashboards
- Online booking and payment through Razorpay
- Booking and login emails, case sheets, invoices, support tickets, and privacy request handling
- All source code, and every account the website runs on

### What staff do by hand

**Video meetings (Google Meet or Zoom) and WhatsApp messages are handled manually by staff in this version. There is no automated Google Meet, Zoom or WhatsApp integration in the application. Automating them later is new development work.**

Staff create each Google Meet or Zoom meeting, paste its link into ORUMA, and send messages from the official WhatsApp Business account. The website's WhatsApp buttons only open a chat with +91-8157039987; someone must answer it. Website contact-form messages arrive by email and in the admin **Enquiries** tab.

---

## 2. Your accounts

You now own and pay for each of these accounts. If one is closed or left unpaid, the part of the website that uses it can stop working.

| Service | What it does | If it stops | Sign in at | Plan and cost at handover | Renews or expires |
|---|---|---|---|---|---|
| Vercel | Hosts the website pages | The website goes down | vercel.com | [FILL] | [FILL] |
| Render | Runs the application server | Login, booking and payment stop | dashboard.render.com | [FILL] | [FILL] |
| Neon | Stores all data | Login, booking and payment stop | console.neon.tech | [FILL] | [FILL] |
| Razorpay | Takes payments and refunds | Payments stop | dashboard.razorpay.com | [FILL] | Not applicable |
| Resend | Sends emails | Login codes and booking emails stop | resend.com | [FILL] | [FILL] |
| Cloudinary | Stores practitioner photos and media | Media stops loading or uploading | console.cloudinary.com | [FILL] | [FILL] |
| Cloudflare | Directs `oruma.me` traffic (DNS) | The whole website can become unreachable | dash.cloudflare.com | [FILL] | [FILL] |
| Hostinger | Domain registration for `oruma.me` | **The domain can be lost** | hpanel.hostinger.com | [FILL] | [FILL: domain expiry date] |
| GitHub | Stores the source code | Future updates cannot be deployed | github.com | [FILL] | [FILL] |
| Zoom | Therapy session meetings | Staff cannot create session links | zoom.us | [FILL] | [FILL] |
| WhatsApp Business | Messages to patients on +91-8157039987 | Staff cannot send manual messages | Phone app | [FILL] | Not applicable |

---

## 3. Keeping credentials safe

1. Move everything from the credentials sheet into a password manager, then delete the file and any downloaded copies.
2. Change the password on any account where the developer knew it.
3. Keep 2-factor authentication on for every account, especially Razorpay, Neon, Render, Cloudflare and Hostinger.
4. Give each staff member their own login where the service allows it. Don't share the admin login.
5. Never send passwords or keys by email, WhatsApp or chat, and never add them to the code.
6. When someone with access leaves, remove their access and change anything they knew (see section 9).

---

## 4. Running the website each day

Sign in at `https://oruma.me/login` with the admin account. The admin dashboard has these tabs: **Overview, Appointments, Therapists, Payments, Case sheets, Tickets, Reliability & privacy, Account**.

### Named responsibilities

| Responsibility | Person |
|---|---|
| Bookings, Zoom links and reminders | [FILL] |
| Refunds | [FILL] |
| Support and privacy requests | [FILL] |
| Clinical escalation | [FILL] |
| Backups and the weekly check | [FILL] |

### Handling a booking

Full procedure: [Manual appointment operations](MANUAL_APPOINTMENT_OPERATIONS.md).

1. Open **Appointments** and start with the newest paid appointment.
2. Confirm it only after ORUMA shows **Paid**.
3. Send the prepared confirmation from WhatsApp Business, then select **Mark confirmation sent**.
4. Create a new Google Meet meeting (from Google Calendar) or Zoom meeting with a waiting room and passcode. Never reuse a meeting link.
5. Paste the `meet.google.com` or `zoom.us` link into ORUMA and save it. The patient is emailed that the link is ready.
6. Send the link to the patient, then select **Mark link sent**.
7. Send the reminder before the session, then select **Mark reminder sent**.

Don't put clinical notes or diagnoses in WhatsApp.

### Daily checks

- [ ] Any paid appointments still **Pending**
- [ ] Any confirmed appointments without a Zoom link
- [ ] Any links not marked as sent
- [ ] Any upcoming appointments with no reminder recorded
- [ ] Open **Tickets**
- [ ] **Reliability & privacy** shows no stuck emails, payment messages or privacy requests

### Cancellations and refunds

1. Update or cancel the appointment in ORUMA first.
2. Cancel the Zoom meeting and tell the patient on WhatsApp.
3. **Cancelling doesn't refund the patient.** Issue any refund separately from **Payments**.
4. **Never start a new refund while one shows `REQUESTED` or `UNKNOWN`.** Doing so risks refunding twice. Check the status in **Payments** and in Razorpay first.

### Adding a practitioner

Complete the [practitioner verification checklist](practitioner-verification-checklist.md) first, and keep the evidence private.

1. In **Therapists**, create the practitioner.
2. The practitioner receives an email with a temporary password, signs in, changes it and completes their profile.
3. Review the profile against the checklist, then mark it verified and public.
4. The practitioner adds slots at least 24 hours ahead.
5. Confirm they appear at `https://oruma.me/therapists`.

Regulated titles, such as Clinical Psychologist, need a real registration number and issuing authority.

### If someone forgets their password

| Who | What to do |
|---|---|
| Patient | Sign in with an emailed login code instead of the password. |
| Practitioner | There is no self-service reset. Contact a developer. |
| Admin | There is no self-service reset. A developer can set a new one with `seed:admin` (section 10). **Keep the admin password safely stored.** |

---

## 5. Weekly checks and backups

### Every week

- [ ] Check usage in Neon, Render, Resend and Cloudinary
- [ ] Confirm a recent backup exists
- [ ] Check the domain expiry date and that billing is working

### Backups

The free Neon plan can only restore about the last 6 hours of data, so your own backups are essential. Someone must take one **each working day**. This needs PostgreSQL's `pg_dump` tool installed, and the direct (non-pooled) connection string from Neon:

```powershell
pg_dump.exe --dbname "<direct-neon-url>" --format custom --no-owner --file oruma-YYYY-MM-DD.dump
```

- Encrypt each backup, because it contains patient and clinical data.
- Store it in private storage that you control. Never store it in the code repository.
- Keep several recent copies.
- Test a restore every month using a new, disposable database. Never test on the live one. Steps are in [the production launch checklist](PRODUCTION_LAUNCH.md).

---

## 6. Plan limits and when to upgrade

Plans at handover are listed in section 2. Check each provider's pricing page, because limits change.

| Service | Limit on the free plan | What you will notice | Upgrade when |
|---|---|---|---|
| Vercel | Hobby is for non-commercial use only | Not permitted for a site taking payments | Pro is needed while the site takes payments |
| Render | Sleeps after 15 minutes idle, and can take up to a minute to wake | Slow first visit; emails, payment updates and practitioner pages can be delayed | Bookings become regular, or visitors complain about speed |
| Neon | About 100 compute hours a month, about 6 hours of restore history | The database can stop until the next month if the quota runs out | Usage passes 70% of quota, or clinical records are building up |
| Resend | Daily and monthly send limits | Login and booking emails can stop | Usage approaches the limit |
| Cloudinary | Storage and bandwidth credits | Media can stop loading | Usage approaches the limit |

**Don't set up a service that pings the website every few minutes while you are on the free Neon plan.** Keeping the server awake also keeps the database awake, and by estimate would use up the month's Neon hours in about 17 days. An uptime alert should check every 30 minutes or less often.

---

## 7. When something goes wrong

First, open `https://api.oruma.me/ready`. It should show `"status":"ready"`. It may take up to a minute if the server was asleep.

| Problem | What to check | What to do |
|---|---|---|
| Website doesn't open | Vercel deployments, Cloudflare, domain expiry in Hostinger | Don't change DNS records. Contact your developer if the cause isn't clear. |
| First page or login is slow | Render free plan waking up | Wait a minute, then try again. Upgrade if it happens often. |
| Website opens but login fails | `/ready` page, then Render logs and Neon usage | If Neon's quota has run out, upgrade the plan. |
| Login code or booking email missing | Spam folder, **Reliability & privacy**, Resend dashboard | Select **Retry** on any item marked `DEAD`. |
| Patient paid but booking isn't **Paid** | Razorpay payment, **Payments** tab, webhook list in **Reliability & privacy** | Select **Retry** on any webhook marked `DEAD`. Don't delete records. Contact the patient and refund if the booking can't be honoured. |
| Refund shows `UNKNOWN` | **Payments** and the Razorpay dashboard | Don't issue a second refund. Contact your developer. |
| Photos won't load or upload | Cloudinary usage | Upgrade if credits have run out. |
| Possible data breach or leaked key | Who had access | Change the affected credential straight away (section 9), then get legal and technical advice on your notification duties. |

---

## 8. Business details on the website

Your legal name, address, phone number and support email are stored in `config/business.json`. Changing them needs a code update and a new deployment of both the website and the server.

Have an adviser check your policy pages and details again whenever your business changes. If you register for GST, the GSTIN must be added here as well.

---

## 9. Changing a key or password

Most settings live in **Render → service → Environment**. Saving a change restarts the server. Afterwards, confirm `/ready` shows ready.

| Item | How | Then test |
|---|---|---|
| Resend API key | Create a new key, update Render, revoke the old one | A login code email arrives |
| Cloudinary API secret | Create a new key, update Render, remove the old one | Upload a practitioner photo |
| Neon password | Reset it, then immediately update `DATABASE_URL` and `DATABASE_MIGRATION_URL`. The server has no database access until you do. | `/ready` shows ready |
| Razorpay webhook secret | Change it in Razorpay and Render together | Webhook deliveries succeed |
| Razorpay API key | Generate a new Live key, then update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` | A small real payment and refund succeed |
| `JWT_SECRET` | Set a new random value of at least 32 characters. **This logs everyone out.** | Login works |

Make these changes at a quiet hour, with no payments in progress.

---

## 10. Technical reference for a developer

### Architecture

| Part | Technology | Hosted on | Location in the code |
|---|---|---|---|
| Website | React, Vite, TypeScript | Vercel, project [FILL: name] | `client/` |
| API (`api.oruma.me`) | NestJS, TypeORM | Render behind Cloudflare, service [FILL: name] | `server/` |
| Database | PostgreSQL | Neon | `server/src/migrations/` |
| Business identity | JSON file | Packaged with both | `config/business.json` |

### Deploying

- Repository: [FILL: final GitHub URL]
- Production branch: [FILL: normally `main`]
- Vercel and Render deploy from: [FILL: branch, and whether auto-deploy is on]

Run all checks before releasing:

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
```

**Migrations don't run on startup.** After taking a backup, from `server/`, with `DATABASE_MIGRATION_URL` pointing at the direct Neon connection:

```powershell
npm.cmd run build
npm.cmd run migration:run:prod
```

### Rolling back

- **Website:** in Vercel **Deployments**, use **Instant Rollback** or promote the last good deployment.
- **API:** in Render **Events**, roll back to the last good deploy.
- **Database:** a new release's migrations aren't undone by a rollback. Use `npm.cmd run migration:revert:prod` only if you've reviewed what the migration's revert does, and after a backup.

### Settings (names only)

**Render, required in production:**

`NODE_ENV`, `CLIENT_ORIGIN`, `CLIENT_LOGIN_URL`, `TRUST_PROXY`, `TRUST_PROXY_HOPS`, `JWT_SECRET`, `DATABASE_URL`, `DATABASE_MIGRATION_URL`, `DATABASE_SYNC`, `DATABASE_SSL`, `RESEND_API_KEY`, `EMAIL_FROM`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_UPLOAD_PRESET`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**Vercel:**

`VITE_API_URL`, `ORUMA_API_URL`, `ORUMA_SITE_URL`, and optionally `VITE_GA_MEASUREMENT_ID` and `VITE_GOOGLE_SITE_VERIFICATION`

Optional settings and their defaults are listed in `server/.env.example` and `client/.env.example`.

**Must stay off in production:** `DATABASE_SYNC`, `PAYMENT_BYPASS_ENABLED`, `BOOKING_LEAD_TIME_BYPASS_ENABLED`, `ALLOW_PRODUCTION_DATABASE_CLEAR`, `OTP_DEV_CODE_ENABLED`, `VITE_PAYMENT_BYPASS_ENABLED`, `VITE_BOOKING_LEAD_TIME_BYPASS_ENABLED`.

**Set on Render:** `TRUST_PROXY=true` and `TRUST_PROXY_HOPS=2` (Cloudflare proxies `api.oruma.me`, then Render). Rate limits then key on the real visitor IP. If Cloudflare proxying (orange cloud) is ever turned off, change it to 1.

**Sign-in cookie:** the API keeps the session in an httpOnly cookie, `oruma_session`. Leave `SESSION_COOKIE_SAMESITE` unset (`lax`) for `oruma.me`. Use `none` only while testing a preview on another domain such as `*.vercel.app`. Changing a password signs that account out everywhere.

**Off until the owners approve retention periods:** `DATA_RETENTION_WORKER_ENABLED`, `PRIVACY_AUTO_ERASURE_ENABLED`.

### Razorpay requirements

- Payment capture must be **automatic**. The application never captures payments itself.
- Webhook URL: `https://api.oruma.me/payments/razorpay/webhook`
- Events: `payment.captured`, `payment.failed`, `order.paid`, `refund.created`, `refund.processed`, `refund.failed`

### Dangerous commands

- `server/clear-database.ts` deletes data. Its production block depends only on `NODE_ENV`, so check which database your local `DATABASE_URL` points at before running anything.
- `seed:admin` sets a new password and the admin role on whatever user has `ADMIN_EMAIL`. Don't use it with a patient's or practitioner's email.
- Don't run the server locally against the production database. Its background jobs would run too.

---

## 11. Known limitations at handover

- Google Meet, Zoom and WhatsApp are manual (section 1).
- Admins and practitioners have no self-service password reset (section 4).
- Cancelling a booking doesn't refund it automatically (section 4).
- Automatic data retention and erasure are off until retention periods are approved.
- Google Analytics and Tag Manager are off until their IDs are set in Vercel. A cookie consent banner is built in and on by default.
- Dependency audit (15 Nov 2026): no findings in the client or server production dependencies. The server was upgraded to TypeORM 1.1.3 to clear the earlier `glob` and `minimatch` findings.
- Each new marketing tag added in Tag Manager (for example Meta Pixel or Google Ads) needs its domains added to the Content-Security-Policy in `client/vercel.json`, or the browser will block it.
- [FILL: anything else still open at handover, or "None"]

---

## 12. Support and costs

- **Reporting an issue:** [FILL: how to report it, and expected response time]
- **Covered for 30 days:** [FILL: agreed scope, such as defects in delivered work]
- **Not covered:** new features and integrations, which are separate work
- **Hosting and provider costs** are paid by the owners

---

## 13. Sign-off

The owners confirm that:

- [ ] The new website is live at `https://oruma.me`.
- [ ] A real payment and refund worked. Evidence: [FILL: link or attachment]
- [ ] At least one practitioner is published and can be booked.
- [ ] The owners can log in to every account in section 2.
- [ ] The credentials sheet has been received and moved to a password manager.
- [ ] Hosting and provider costs are now the owners' responsibility.
- [ ] Zoom and WhatsApp are manual in this version.
- [ ] Milestone payments are settled.

| | Name | Signature | Date |
|---|---|---|---|
| **Owner** | | | |
| **Developer** | Ananthu M A | | |
