# ORUMA Handover Plan

Status checked: 1 November 2026

**Goal:** ORUMA's new build is live at `https://oruma.me`, a real paid booking has been tested from start to finish, and the owners control every account.

**Handover is complete when** the owners sign off in Phase 9. The 30-day support window starts on that date.

**Estimated time:** about 4 working days, if the owners respond quickly. The practitioner evidence and legal review in Phase 4 are the most likely causes of delay.

## Ground rules

These rules apply to every step.

1. **The running site comes first.** `oruma.me` must stay up throughout. If a step could affect it and you are unsure, stop and check.
2. **Do not merge or push until you have completed step 0.3.** A merge could trigger an unplanned deploy.
3. **Do not edit Cloudflare DNS records** unless a step below tells you to.
4. **Test on the preview before the switch.** Visitors stay on the current site until Phase 5.
5. **Do one change at a time** and test it before starting the next.
6. **Make production changes at a quiet hour.**
7. **Never put secrets in this document, the repository, or a chat.**

Each step is marked with who does it:

- **[Dev]** Ananthu
- **[Owner]** the owners or their nominated person
- **[Both]** done together, usually on a call

## Current state

| Area | What was found on 1 November 2026 | Handled in |
|---|---|---|
| `oruma.me` | Up, but serving an old build with no login, booking or payment. It still shows claims that were removed from the new build, such as "24/7" and "anonymous". | Phase 5 |
| New build | Live at `https://oruma-eight.vercel.app`, with the expected security headers and sitemap. | Phases 3 and 5 |
| API | `https://api.oruma.me` reports ready in production mode. It allows requests from the preview URL but not from `oruma.me`. | Phase 2 |
| API hosting | Render. The first request timed out, consistent with sleeping when idle. | Phase 10 |
| Practitioners | One public record, "ANANTHU M A", which is test data. It has no open slots. | Phase 3 |
| Code checks | Server: 85 of 85 unit tests pass, 2 lint errors. Client: 20 of 22 unit tests pass. Builds pass. Playwright and database end-to-end tests were not run. | Phase 1 |
| Dependencies | Production server dependencies: 1 critical and 3 high vulnerabilities. | Phase 1 |
| Real payment flow | Not confirmed as tested on production. | Phase 3 |
| Owner operations | Legal review, care-team person, Zoom and WhatsApp Business are not confirmed. | Phase 4 |

Account ownership, as recalled by the developer. Confirm it in step 0.1.

| Held by owners | Held by developer |
|---|---|
| Vercel, Render, Neon, Cloudinary, Resend, Razorpay | GitHub, Cloudflare, Hostinger |

---

## Phase 0: Prepare (no changes to anything)

**0.1 [Both] Confirm access.** Log in to each service below. Note the account owner, plan and billing method.

- [ ] Vercel
- [ ] Render
- [ ] Neon
- [ ] Cloudinary
- [ ] Resend
- [ ] Razorpay (Live Mode)
- [ ] GitHub
- [ ] Cloudflare
- [ ] Hostinger, including the `oruma.me` expiry date

**0.2 [Dev] Find out how `oruma.me` is being served.** In Vercel, open each project and go to **Settings → Domains**. Write down:

- [ ] Which project has `oruma.me` and `www.oruma.me`
- [ ] Which project has `oruma-eight.vercel.app`
- [ ] Whether they are the same project. This decides which route you take in step 5.3.
- [ ] The deployment ID and URL now serving `oruma.me`. **This is your rollback point.**

**0.3 [Dev] Find out what deploys automatically.** Record the answers below.

| Question | Where to look | Answer |
|---|---|---|
| Vercel production branch for each project | **Settings → Git** | |
| Are production domains auto-assigned, or was a deployment rolled back or pinned? | **Deployments** | |
| Render deploy branch and whether auto-deploy is on | Service → **Settings** | |

**Do not continue if you cannot tell whether a merge would change `oruma.me`.** Turn off the auto-deploy or find the answer first.

**0.4 [Dev] Confirm the old site doesn't depend on the API.** Open `https://oruma.me`, then open browser developer tools → **Network**. Browse several pages and confirm there are no requests to `api.oruma.me`. The old build's code doesn't reference it, but this confirms it in a real browser. If you do see requests, treat every API step below as affecting the live site.

**0.5 [Dev] Export the DNS records.** In Cloudflare, go to **DNS → Records → Export** and save the file privately. Take screenshots of the records and of **SSL/TLS → Overview**.

**0.6 [Dev] Save the current settings.** Export the Render and Vercel environment variables to a password manager, not to a file in the repository.

**0.7 [Dev] Check production migrations.** In the Neon SQL editor, run:

```sql
SELECT name FROM migrations ORDER BY id;
```

All 5 migrations in `server/src/migrations/` should be listed. The API does not run migrations on startup. If any are missing, stop and plan a migration run with a backup first.

**0.8 [Dev] Stop running the server locally against production.** Your `server/.env` contains the live Razorpay key and a Neon database that may be production. A local server would also run the background jobs. Keep it stopped, or point it at a separate database, until Phase 8.

---

## Phase 1: Finish the code (no effect on the live site)

**1.1 [Dev] Create a working branch** from the latest release branch:

```powershell
git switch release/2026-09-27
git pull
git switch -c handover/final
```

Do not push it until step 2.1.

**1.2 [Dev] Fix the 2 server lint errors:**

- `server/src/audit/readiness.controller.ts:39` (unnecessary type assertion)
- `server/src/audit/readiness.controller.spec.ts:92` (unsafe `any` assignment)

**1.3 [Dev] Fix the 2 failing client tests:**

- `client/src/lib/seo.test.ts`: a public page has a 67-character description. Lengthen that description in `client/src/lib/seo.ts` to at least 80 characters.
- `client/src/lib/therapists.test.ts`: `getTherapists()` now adds empty `tags`, `areasOfPractice` and `languages` arrays. Update the expected result to include them.

**1.4 [Dev] Update dependencies.** In both `client/` and `server/`:

```powershell
npm.cmd audit fix
npm.cmd audit --omit=dev
```

- Do not use `--force`.
- The remaining `@nestjs/platform-express` and `multer` fixes need a major version upgrade. Don't take that upgrade during handover unless the production audit shows it's the only way to clear a serious issue that affects this app. Record what remains in `docs/HANDOVER.md`.
- CI runs `npm audit --audit-level=low`, which will keep failing on dev-only findings. Change it to `npm audit --omit=dev --audit-level=critical` in `.github/workflows/ci.yml`, and list any known remaining findings in `docs/HANDOVER.md`.

**1.5 [Dev] Fix the payment retry bug.** In `server/src/payment/payment.service.ts`, the checks at lines 500 and 755 reject a capture when the order is linked to a different payment ID. If a failed attempt was recorded on that order, the customer can be charged with no confirmed booking.

- Apply the "different payment" rejection only when the existing payment is not `FAILED`.
- Add tests to `payment.service.spec.ts` for both verification and webhook: a failed attempt followed by a capture on the same order must end as `PAID`.
- Keep the rejection for an order already `PAID` under a different payment ID.

**1.6 [Dev] Fix the 500 error on malformed practitioner IDs.** In `server/src/therapist/therapist.controller.ts`, at `GET :id`, add a `ParseUUIDPipe` that returns 404 for an invalid ID.

**1.7 [Dev] Remove the seed script.** Practitioners will be added by the admin, so delete `server/scripts/upsert-therapists.js` and the two `seed:therapists` scripts in `server/package.json`. Its `--publish` option also deactivates every practitioner not on its list.

**1.8 [Dev] Clean up the configuration examples.** In `server/.env.example`, remove the duplicate `DATABASE_URL=` line and add `DATABASE_MIGRATION_URL=`.

**1.9 [Dev] Correct the documentation:**

- `README.md`: update the current status.
- Check that `service-delivery-policy`, `terms` and `privacy-policy` describe the WhatsApp contact the way the owners actually intend to use it.

**1.10 [Dev] Run all checks.**

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

- [ ] All pass.
- [ ] Database end-to-end tests have run on a **disposable** database, either locally or through CI. Never point them at Neon production.

**1.11 [Dev] Complete `docs/HANDOVER.md`** for the owners. A draft exists: replace every `[FILL]` as the information becomes available. It covers:

- [ ] Every service, what it does, who owns it and what it costs
- [ ] How to deploy and how to roll back
- [ ] Where settings live (names only, no values)
- [ ] Daily operations, linked to `MANUAL_APPOINTMENT_OPERATIONS.md`
- [ ] How to add a practitioner, linked to `practitioner-verification-checklist.md`
- [ ] Backup routine and free-tier limits (Phase 10)
- [ ] Known remaining issues
- [ ] **This wording on Zoom and WhatsApp:** "Zoom meetings and WhatsApp messages are handled manually by staff in this version. There is no automated Zoom or WhatsApp integration in the application. Automating them later is new development work."

The last item corrects the earlier update to the owners, which said the integrations were complete and could be enabled later. The API code was removed in commit `c75018b` on 18 August 2026. Tell the owners directly as well, not only in this document.

---

## Phase 2: Prepare production (old site unaffected if step 0.4 passed)

**2.1 [Dev] Deploy the code fixes to the API and preview.** Use the answers from step 0.3.

- Merge `handover/final` into the branch that Render and the new-build project deploy from, **only if** that branch doesn't serve `oruma.me`.
- If it does, deploy the branch manually and leave `oruma.me` as it is.

Confirm afterwards:

- [ ] `https://api.oruma.me/ready` shows `"status":"ready"`
- [ ] `https://api.oruma.me/therapists/search` returns 404
- [ ] `https://oruma.me` still shows the current site
- [ ] `https://oruma-eight.vercel.app` loads the updated build

**2.2 [Dev] Add the live domains to the API's allowed origins.** In Render, set these values, then save (this restarts the API):

```env
CLIENT_ORIGIN=https://oruma-eight.vercel.app,https://oruma.me,https://www.oruma.me
CLIENT_LOGIN_URL=https://oruma.me/login
```

Keep the preview URL in the list until step 6.3.

**2.3 [Dev] Check the other production values.** In Render, confirm these are set, without changing anything else:

```env
NODE_ENV=production
DATABASE_SYNC=false
TRUST_PROXY=true
TRUST_PROXY_HOPS=2
ALLOW_PRODUCTION_DATABASE_CLEAR=false
```

Remove these if present: `PAYMENT_BYPASS_ENABLED`, `BOOKING_LEAD_TIME_BYPASS_ENABLED`, and every `ZOOM_*` and `WHATSAPP_*` value.

Decide the retention settings with the owners. Leave `DATA_RETENTION_WORKER_ENABLED=false` and `PRIVACY_AUTO_ERASURE_ENABLED=false` until the retention periods have been approved.

**2.4 [Dev] Check the frontend settings.** In the new build's Vercel project:

```env
VITE_API_URL=https://api.oruma.me
ORUMA_API_URL=https://api.oruma.me
ORUMA_SITE_URL=https://oruma.me
```

Confirm `VITE_PAYMENT_BYPASS_ENABLED` and `VITE_BOOKING_LEAD_TIME_BYPASS_ENABLED` are not `true`.

Leave `VITE_GA_MEASUREMENT_ID` empty until the owners decide whether a consent banner is needed. Google Analytics is not required for launch.

**2.5 [Owner] Check the Vercel plan.** Vercel's Hobby plan is for non-commercial use only. A site taking payments needs **Pro** on the project serving `oruma.me`.

**2.6 [Dev] Check Razorpay in Live Mode:**

- [ ] **Payment capture is set to automatic.** The app never captures a payment itself, so with manual capture a paid booking would never confirm.
- [ ] The website on the account is `https://oruma.me`.
- [ ] The webhook is `https://api.oruma.me/payments/razorpay/webhook`.
- [ ] These 6 events are on: `payment.captured`, `payment.failed`, `order.paid`, `refund.created`, `refund.processed`, `refund.failed`.
- [ ] UPI Intent and Dynamic QR show as activated.

**2.7 [Dev] Check email and media:**

- [ ] Resend shows `updates.oruma.me` as **Verified**.
- [ ] The Cloudinary upload preset `oruma_therapist_media` exists and is restricted.

**2.8 [Dev] Back up the database.** Use the direct (non-pooled) Neon connection string:

```powershell
pg_dump.exe --dbname "<direct-neon-url>" --format custom --no-owner --file oruma-before-handover.dump
```

Encrypt the file and store it outside the repository. Then restore it into a disposable database to prove it works, as described in `PRODUCTION_LAUNCH.md`.

**2.9 [Dev] Review what's in the database.** In the Neon SQL editor, run:

```sql
SELECT role, COUNT(*) FROM "user" GROUP BY role;
SELECT status, COUNT(*) FROM payment GROUP BY status;
SELECT status, COUNT(*) FROM appointment GROUP BY status;
```

- If it contains **any real customer or payment data**, don't clear anything. Archive or remove only the test records individually.
- If everything is confirmed test data, and the owners agree in writing, you may use `server/clear-database.ts`. Run `--dry-run` first and read the output.

`clear-database.ts` is only blocked when `NODE_ENV=production`. Your local `.env` uses `development`, so it won't protect you if `DATABASE_URL` points at production. Check the target before running it.

---

## Phase 3: Test real payments on the preview (visitors unaffected)

**3.1 [Dev] Archive the dummy record.** Log in as admin at `https://oruma-eight.vercel.app/login`. Go to **Therapists** and archive "ANANTHU M A".

**3.2 [Dev] Create a temporary practitioner.** On the admin therapist page:

- Name: `Test Practitioner`
- Title: `Counsellor`
- Email: an address you control that isn't already registered
- Price: `10`
- Fill in the other publication fields with obvious test values, then mark it verified and public.

Keep this record public for as short a time as possible. It appears in the public API while it's published, and the preview shows it.

**3.3 [Dev] Set up the practitioner account:**

- [ ] The credentials email arrives. Check the spam folder and the sender.
- [ ] Log in and change the temporary password when prompted.
- [ ] Go to **Availability** and add 2 slots, each at least 24 hours ahead.

**3.4 [Dev] Run the customer flow** in a private browser window, with a second email address:

- [ ] Register a patient account, then log out.
- [ ] Log in with a password, then log in with an email OTP.
- [ ] Book slot 1 and start payment. Cancel or fail the UPI payment on purpose.
- [ ] Retry and pay ₹10 for real by UPI. **If Razorpay refuses checkout from the preview domain, stop here and finish Phase 3 straight after the switch, in step 6.1.**
- [ ] The booking shows **Paid** in the patient dashboard.
- [ ] The confirmation email arrives.
- [ ] As admin, **Payments** shows the payment, and **Reliability & privacy** shows no stuck webhooks or email jobs.

**3.5 [Dev] Run the staff flow** as admin, under **Appointments**:

- [ ] Confirm the appointment.
- [ ] Mark the confirmation as sent.
- [ ] Add a `zoom.us` meeting link and mark it as sent.
- [ ] Record the reminder.
- [ ] Both patient and practitioner dashboards show the link, and it opens.

**3.6 [Dev] Finish the checks:**

- [ ] As the practitioner, write and save a case sheet.
- [ ] The patient can't see the case sheet.
- [ ] As the patient, open the invoice. Check the operator name, address and amount.
- [ ] As the patient, raise a support ticket. As admin, reply and resolve it.
- [ ] As the patient, try opening `/profile/admin` and confirm access is refused.
- [ ] As admin, refund the ₹10 from **Payments**. Razorpay shows the refund and ORUMA updates its status.
- [ ] The refund reaches the paying account. This can take several working days, so don't hold the switch for it.
- [ ] Cancel the test appointment and confirm the slot is released.

**3.7 [Dev] Clean up:**

- [ ] Delete the remaining future test slot.
- [ ] **Archive `Test Practitioner`.**
- [ ] Confirm `https://api.oruma.me/therapists` returns an empty list.
- [ ] Keep the payment and refund records. Don't delete them.

**Stop if any payment check fails.** Don't start Phase 5 until it's fixed and retested.

---

## Phase 4: Owner readiness

Phase 5 can go ahead without the first practitioner, but paid bookings can't start until it's done.

**4.1 [Owner] Approve the business and legal details:**

- [ ] `RANJINI R` exactly matches the PAN and settlement bank account.
- [ ] The address, phone and email in `config/business.json` are correct and approved for publication.
- [ ] A lawyer or adviser has reviewed the privacy, terms, refund, cancellation and service delivery pages.
- [ ] GST and Udyam position confirmed with a tax adviser.
- [ ] Retention periods approved (step 2.3).

**4.2 [Owner] Set up operations:**

- [ ] Named person for bookings, Zoom links and reminders
- [ ] Named person for refunds
- [ ] Named person for support and privacy requests
- [ ] Named person for clinical escalation
- [ ] Paid Zoom account in the owners' name, for sessions over 40 minutes
- [ ] WhatsApp Business running on +91-8157039987, with the care team having access
- [ ] Access to the `oruma9987@gmail.com` inbox confirmed

**4.3 [Both] Train the admin** (about 1 hour), using `MANUAL_APPOINTMENT_OPERATIONS.md`:

- [ ] Add and publish a practitioner.
- [ ] Handle a paid booking from confirmation through to reminder.
- [ ] Cancel a booking and issue a refund. Cancelling doesn't refund automatically.
- [ ] Never start a new refund while one shows `REQUESTED` or `UNKNOWN`.
- [ ] Answer a support ticket and a privacy request.
- [ ] Check **Reliability & privacy** daily.

**4.4 [Owner] Prepare the first real practitioner.** Complete `practitioner-verification-checklist.md` for at least one person, and keep the evidence private. Regulated titles such as Clinical Psychologist need a real registration number and authority.

The practitioner can be added after Phase 5 (step 6.4), but it's needed before handover.

---

## Phase 5: Switch `oruma.me` to the new build

Pick a quiet hour. Have Vercel, Cloudflare and Render open. Keep the rollback details from step 0.2 ready.

**5.1 [Dev] Run the pre-switch checks:**

- [ ] Phase 3 passed, or only the preview-domain payment step is outstanding.
- [ ] The new build shows the correct version on `oruma-eight.vercel.app`.
- [ ] `CLIENT_ORIGIN` includes `https://oruma.me` (step 2.2).
- [ ] `https://api.oruma.me/ready` shows ready. Open it a minute before the switch so the API is awake.
- [ ] Owners know the switch is happening.

**5.2 [Dev] Don't change DNS.** The switch happens in Vercel. If Vercel asks for a DNS change, stop and compare its request with your export from step 0.5 before doing anything.

**5.3 [Dev] Make the switch.** Use the route that matches step 0.2.

**Route A: `oruma.me` and the new build are in the same project.** Open **Deployments**, select the new build's deployment, and choose **Promote to Production**. This is the lower-risk route.

**Route B: they are in different projects.** In the new build's project, go to **Settings → Domains** and add `oruma.me` and `www.oruma.me`, moving them from the old project when Vercel prompts. Keep `www.oruma.me` redirecting to `oruma.me`. There may be a short gap while the domain moves and its certificate is issued. Don't delete the old project.

**5.4 [Dev] Check straight away.** Use a private window, then a phone on mobile data:

- [ ] `https://oruma.me` loads the new build.
- [ ] `https://www.oruma.me` and `http://oruma.me` redirect to `https://oruma.me`.
- [ ] The padlock shows a valid certificate.
- [ ] The footer shows the operator disclosure.
- [ ] `/login`, `/register`, `/therapists`, `/contact`, `/terms` and `/refund-policy` load.
- [ ] Logging in works, which proves the API accepts requests from the new domain.
- [ ] `/sitemap.xml` returns XML.
- [ ] `/robots.txt` still includes the sitemap line. If Cloudflare's managed robots.txt removes it, switch that setting off or adjust it.

**If any check fails and you can't fix it within 15 minutes, roll back** (see the Rollback section).

---

## Phase 6: After the switch

**6.1 [Dev] Finish any payment test that couldn't run on the preview.** Repeat the relevant parts of Phase 3 on `https://oruma.me`, using `Test Practitioner`, then archive the record straight away (step 3.7). If this fails, roll back.

**6.2 [Dev] Monitor for 24 hours.** Check these at least twice:

- [ ] `/ready` shows ready.
- [ ] Render logs show no repeated errors.
- [ ] **Reliability & privacy** shows no stuck email or webhook jobs.
- [ ] Neon usage looks as expected.

**6.3 [Dev] Tidy up:**

- [ ] Remove the preview URL from `CLIENT_ORIGIN`, leaving `https://oruma.me,https://www.oruma.me`.
- [ ] Merge the final code into `main`, once you've confirmed from step 0.3 that the production branch and domain assignment are what you expect.
- [ ] Confirm CI passes on `main`.
- [ ] Set the Vercel production branch to `main`, and the same for Render.
- [ ] Keep the old branch `temporary-update-from-last-successfull-commit` and the old deployment until sign-off.

**6.4 [Owner] Publish the first real practitioner:**

1. The admin creates the practitioner.
2. The practitioner receives the email, changes the password and completes the profile.
3. The admin reviews it against the checklist, then marks it verified and public.
4. The practitioner adds slots at least 24 hours ahead.
5. The admin confirms it appears on `https://oruma.me/therapists`.

**6.5 [Both] Run the first real customer booking.** The care team handles it using only the written procedure, with the developer watching. Fix any gaps in the procedure.

**6.6 [Owner] Set up search and monitoring:**

- [ ] Add `oruma.me` to Google Search Console. DNS verification needs one new TXT record, added by whoever holds Cloudflare.
- [ ] Submit `https://oruma.me/sitemap.xml`.
- [ ] Set up an alert for failures, keeping Phase 10's warning about ping frequency in mind.

---

## Phase 7: Transfer accounts

Do these **one at a time**, after Phase 6, and check `oruma.me` after each.

**7.1 [Both] Vercel, Render, Neon, Cloudinary, Resend, Razorpay.** Confirm that the owners hold the login and billing, that recovery email and phone numbers are theirs, and that 2-factor authentication is on. Remove your access at the end, or keep limited access for the 30-day support window if the owners agree.

**7.2 [Both] Cloudflare.** Add the owner as a **Super Administrator** on the account. **Don't move the domain to a new Cloudflare account during handover**, because a move can involve changing nameservers. Move it later if the owners want to, as a separate planned job.

**7.3 [Both] Hostinger.** Transfer `oruma.me` to the owners' account, or have them take over the account login. **Keep the nameservers unchanged.**

- [ ] The domain doesn't expire soon, and auto-renew is on with the owners' payment method.
- [ ] `oruma.me` and `api.oruma.me` still resolve.
- [ ] Any Hostinger mailbox still works. MX records currently point there.

**7.4 [Both] GitHub.** Have the owners create or choose a GitHub account, then transfer `Ananthu-M-A/Oruma` to it. The owners can add you as a collaborator for the support window.

- [ ] Reconnect the repository in Vercel and Render if needed.
- [ ] Push a small harmless commit and confirm that deploys still work.

**The running site doesn't depend on this connection, but future deploys do.** If deploys fail, fix the connection before moving on.

Settle the Milestone 2 invoice status with the owners before this phase.

---

## Phase 8: Rotate every secret

This is the last technical step. It ensures only the owners hold live credentials, including anything saved on your machine. Do it at a quiet hour, with no payments in progress, and check after each change.

Rotate in this order. After each one, wait for Render to restart, then confirm `/ready` shows ready.

| # | Secret | How | Then check |
|---|---|---|---|
| 1 | Resend API key | Create a new key, update Render, then revoke the old one. | An OTP email arrives. |
| 2 | Cloudinary API secret | Create a new key, update Render, then remove the old one. | Upload a practitioner photo. |
| 3 | Neon password | Reset it, then update `DATABASE_URL` and `DATABASE_MIGRATION_URL` straight away. The API can't reach the database until this is done. | `/ready` shows the database available. |
| 4 | Razorpay webhook secret | Change it in Razorpay and Render together. | Webhook deliveries succeed. |
| 5 | Razorpay API key | Generate a new Live key, update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. | Opening checkout works. |
| 6 | `JWT_SECRET` | Set a new random value of at least 32 characters. **This logs everyone out**, including anyone mid-booking. | Logging in works. |
| 7 | Admin password | The owner changes it under **Account**. Remove `ADMIN_PASSWORD` from Render if present. | The owner can log in. |

To generate a new JWT secret:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

Then finish off:

- [ ] Delete `server/.env` and `client/.env` from your machine, or replace them with development-only values.
- [ ] Revoke the old Zoom app credentials in Zoom, if they're still active.
- [ ] Delete local database backups, or hand them to the owners and delete your copy.
- [ ] Remove credentials from your password manager once the owners have confirmed they hold them.
- [ ] Run one more ₹10 test payment and refund. The new keys haven't been tested until this passes.

---

## Phase 9: Sign off

**9.1 [Both] Hand over:**

- [ ] `docs/HANDOVER.md`
- [ ] `docs/private/ORUMA_CREDENTIALS.md`, filled in after Phase 8 and delivered as its first section describes. This file is gitignored and must never be committed.
- [ ] A list of all accounts, with the owners confirming they can log in to each
- [ ] Test evidence: screenshots of the Phase 3 payment, refund and emails
- [ ] A list of known remaining issues

**9.2 [Owner] Confirm in writing:**

- [ ] The new site is live at `oruma.me`.
- [ ] A real payment and refund worked.
- [ ] At least one practitioner is published and can be booked.
- [ ] The owners hold all accounts and credentials.
- [ ] Hosting and provider costs are now the owners' responsibility.
- [ ] Zoom and WhatsApp are manual in this version.
- [ ] Milestone payments are settled.

**9.3 [Both] Agree the 30-day support terms:** the start and end dates, how to report issues, response times, what's covered, and that new features are separate work.

**9.4 [Dev] Clean up:** after sign-off, remove the old Vercel project or deployment, and delete the old branches `temporary-update-from-last-successfull-commit` and `copilot/worktree-2026-07-12T13-27-46`.

---

## Rollback

Use this if the new site fails after the switch and can't be fixed within 15 minutes.

1. **Route A:** in Vercel **Deployments**, promote or use Instant Rollback on the deployment recorded in step 0.2.
2. **Route B:** move `oruma.me` and `www.oruma.me` back to the old project in **Settings → Domains**.
3. Confirm `https://oruma.me` loads in a private window and on a phone.
4. Don't change DNS unless the DNS itself was changed. If it was, restore it from the export in step 0.5.
5. Keep the API changes in place. They shouldn't affect the old site if step 0.4 passed.
6. Tell the owners what happened. Find and fix the cause on the preview, then try the switch again.

**If a customer paid during the failed window,** check Razorpay and the **Payments** tab, and don't delete any records. Contact the customer, and refund if the booking can't be honoured.

---

## Phase 10: Free-tier limits

The owners should read this section and confirm they accept these limits. Plan limits change, so check the current pricing pages.

| Service | Limit | Effect | Upgrade when |
|---|---|---|---|
| **Vercel** | Hobby is non-commercial only. | Not allowed for a paid booking site. | **At launch (step 2.5).** |
| **Render Free** | Sleeps after 15 minutes idle; takes up to a minute to wake; 750 hours a month. | Slow first visit, delayed webhooks, background jobs paused while asleep, and practitioner pages can return 503 during a wake-up. | Bookings become regular, or there are complaints about slowness. |
| **Neon Free** | About 100 CU-hours a month; 6-hour restore window. | Heavy use can exhaust the monthly quota. Mistakes older than 6 hours can't be undone without your own backup. | Usage passes 70% of quota, or real clinical records are building up. |
| **Resend Free** | Daily and monthly send limits. | OTP and booking emails could stop if exceeded. | Usage approaches the limit. |
| **Cloudinary Free** | Storage and bandwidth credits. | Media could stop loading if exceeded. | Usage approaches the limit. |

**Don't add a frequent keep-alive ping while on Neon Free.** The API checks the database every 5 seconds whenever it's awake, so a ping that keeps it awake all day would also keep the database awake. By estimate, that uses Neon's monthly hours in about 17 days. Neon could then stop until the next month. Check the Neon usage graph during the first week to confirm how it behaves. Any uptime alert should check infrequently, such as every 30 minutes or more.

**Backups:** because Neon Free only keeps 6 hours of history, a named person takes a manual backup each working day using the command in step 2.8, encrypts it and stores it in private owner-controlled storage. Keep several recent copies. Test a restore monthly.

**Weekly owner check:**

- [ ] Neon, Render, Resend and Cloudinary usage
- [ ] Recent backup exists
- [ ] **Reliability & privacy** shows no stuck jobs
- [ ] Domain expiry date and billing are fine

---

## Schedule

| Day | Work | Who |
|---|---|---|
| 1 | Phases 0 and 1 | Dev, with owner logins |
| 2 | Phases 2 and 3 | Dev |
| 2–3 | Phase 4 | Owners, with Dev for training |
| 3 | Phases 5 and 6 | Dev, with owners available |
| 4 | Phases 7, 8 and 9 | Both |

## References

- [Production launch checklist](PRODUCTION_LAUNCH.md)
- [Manual appointment operations](MANUAL_APPOINTMENT_OPERATIONS.md)
- [Practitioner verification checklist](practitioner-verification-checklist.md)
- [SEO setup](SEO_SETUP.md)
- [Owner requirements plan](OWNER_REQUIREMENTS_PLAN.md)
- [Vercel fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
- [Render free tier](https://render.com/docs/free)
- [Neon plans](https://neon.com/docs/introduction/plans)
- [Neon free plan limits](https://neon.com/faqs/free-plan-limits-and-quotas)
