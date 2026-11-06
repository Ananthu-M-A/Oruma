# ORUMA Owner Requirements Plan

Prepared: 6 November 2026

**Goal:** deliver every item in the owners' handover and technical review request. That means Google SEO, Google Business, performance, business functions, ownership, and the 8 SEO service pages. Each item is demonstrated with a screenshot or report.

**How this fits with `HANDOVER_PLAN.md`:** that plan covers the code fixes, the switch of `oruma.me` to the new build, account transfer and sign-off. This plan adds the owners' new requirements and says when to do each one. Where a step already exists in `HANDOVER_PLAN.md`, this plan refers to it by number ("HP 1.5") instead of repeating it.

**The ground rules in `HANDOVER_PLAN.md` still apply.** Keep `oruma.me` up, test on the preview first, don't merge or push before HP 0.3, and make one change at a time.

Who does each step:

- **[Dev]** Ananthu
- **[Owner]** the owners or their nominated person
- **[Both]** done together, usually on a call

## Fastest route

Three tracks run in parallel. The Google track starts on day 1 because Google Business Profile verification can take several days, and nothing on our side speeds it up.

| Track | What | When |
|---|---|---|
| **A. Decisions** | Owners approve scope, content and the open questions. | Day 1 |
| **B. Google accounts** | Business Profile, Search Console, GA4 and Tag Manager accounts created in the owners' name. | Starts day 1, finishes after the switch |
| **C. Code, in two releases** | **Release 1 (launch):** fixes and quick features, then switch `oruma.me`. **Release 2 (SEO growth):** 8 service pages, prerendered SEO, contact form, extra schema, map. | Release 1: days 1–4. Release 2: days 4–8. |

Then the evidence pack, the walkthrough meeting and sign-off (days 8–9).

| Day | Dev | Owner |
|---|---|---|
| 1 | A1 scope message, HP Phase 0, start HP Phase 1 | A2 decisions, B1 Business Profile, B2 Search Console |
| 2 | Finish HP Phase 1, Release 1 features (C1–C6) | B3 GA4, B4 Tag Manager, A3 page content starts |
| 3 | Release 1 on the preview, HP Phases 2–3 | Approve content for the first 4 pages |
| 4 | HP Phases 5–6 (switch `oruma.me`), B5 sitemap submission | Approve content for the last 4 pages |
| 5–7 | Release 2 (C7–C12) | Review pages on the preview |
| 7–8 | Deploy Release 2, B6 indexing, D reports | Business Profile verification finishes (Google's timing) |
| 8–9 | E walkthrough, HP Phases 7–9 | Sign-off |

**The most likely delays:** the owners' page content and approvals (A3), Google Business Profile verification (B1), and the practitioner evidence in HP 4.4.

---

## Track A: Scope and decisions (day 1)

**A1 [Dev] Send the owners a scope message** before any work starts. Base it on the code review of 6 November 2026. It must say plainly:

- Already complete: booking, Razorpay payments and refunds, invoice in the patient dashboard, booking confirmation email, titles and descriptions, image alt text, sitemap, robots.txt, base schema, security headers.
- Ready in the code, needing only their Google accounts: Search Console, GA4.
- **New work:** Google Tag Manager, Google Meet, a contact form, the WhatsApp button, Google Maps, owner booking alerts, and 6 of the 8 service pages (Couple Therapy and Breakup Recovery already exist).
- Zoom and WhatsApp are handled manually by staff. There is no automated integration (see HP 1.11).
- The cost and timeline for the new work, if it's outside the original agreement. **Agree this before starting Release 2.**

**A2 [Owner] Answer these questions.** Each answer changes what gets built.

| # | Question | Options | Affects |
|---|---|---|---|
| 1 | Should the address in `config/business.json` (a home address) be shown publicly? | **Hide it** and use a service-area Business Profile (recommended for online-only services), or show it | B1, C11 |
| 2 | Video sessions on Google Meet or Zoom? | **Meet links added manually** (recommended now), keep Zoom, or automatic Meet creation (several days of extra work) | C5 |
| 3 | Is a cookie consent banner wanted? | **Yes, with Google Consent Mode** (recommended for NRI visitors from the EU and UK), or no | C6, B3 |
| 4 | Bring back the floating WhatsApp button? | Yes, next to the email button, or no | C2 |
| 5 | Which inbox gets booking and enquiry alerts? | `oruma9987@gmail.com`, or another one | C3, C9 |
| 6 | Clinical Hypnotherapy: is there a practitioner with recognised hypnotherapy training who can be verified? | Yes (name and evidence), or not yet | C8 |
| 7 | NRI clients: accept international cards? | Yes (needs Razorpay international payments activated), or Indian payment methods only | C8 |
| 8 | Google Workspace account for ORUMA? | Recommended if using Meet. Free Gmail Meet calls with 3 or more people (couple sessions) are limited to 60 minutes. | C5 |

**A3 [Owner] Supply or approve the text for the 8 pages.** The developer can draft it, but the owners must approve every claim, because this is health-related content. Each page needs:

- 800–1,200 words of original text, not copied from another site.
- 4–6 frequently asked questions with answers.
- One hero image they have the rights to.
- Who the service is for, what a session involves, length, price and language.

Pages: Relationship Counselling, Couple Therapy, Marriage Counselling, Trust Healing, Breakup Recovery, Clinical Hypnotherapy, Premarital Counselling, NRI Online Counselling.

**Content rules:** the build's compliance check (`client/scripts/validate-compliance.mjs`) blocks claims such as "licensed psychologists" and "24/7 support". Also avoid cure or success-rate claims, and any medical claims for hypnotherapy.

---

## Track B: Google accounts (owners' Google account, starting day 1)

Create every Google account **in the owners' Google account**, not the developer's, so nothing needs transferring later. Add the developer as a user only where a step needs it.

**B1 [Owner] Create the Google Business Profile.** Start this first, because verification takes days.

1. Go to `business.google.com` and sign in with the owners' account.
2. Business name: **Oruma**, exactly as on the website. Don't add keywords such as "Oruma Counselling Kerala". Google can suspend profiles for that.
3. Category: **Counselor**, or **Marriage counselor**. Choose **Psychologist** only if a registered psychologist runs the service.
4. Location, using answer A2-1:
   - **Hidden address (recommended):** choose "I deliver goods and services to my customers" and don't show the address. Set the service area to Kerala and India.
   - **Public address:** enter it exactly as in `config/business.json`.
5. Phone `+91-8157039987`, website `https://oruma.me/?utm_source=google&utm_medium=organic&utm_campaign=gbp`.
6. Add the 8 services, a description of 750 characters or fewer, opening hours, the logo, a cover photo and 3–5 more photos.
7. Complete verification (video, phone or postcard, whichever Google offers).
8. Once verified, copy the **Maps link** and the **review link**, and send both to the developer for C11.

- [ ] Profile created
- [ ] Verification started (date: ______)
- [ ] Verified, and Maps link and review link sent to the developer

**B2 [Both] Verify Search Console by DNS.** This can be done **before** the switch, because a Domain property covers `oruma.me` whichever build is serving it.

1. [Owner] Go to `search.google.com/search-console` → **Add property** → **Domain** → `oruma.me`. Copy the TXT record.
2. [Dev] In Cloudflare **DNS → Records**, add one **TXT** record on `oruma.me` with that value. **Don't edit or delete any other record.**
3. [Owner] Click **Verify**. If it fails, wait 30 minutes and try again.
4. [Owner] Under **Settings → Users and permissions**, add the developer as a **Full** user.

- [ ] Verified. Screenshot of the verification saved.

**B3 [Owner] Create the GA4 property,** with the developer on a call.

1. Go to `analytics.google.com` → **Admin → Create → Property**. Name: `ORUMA`. Time zone: India. Currency: INR.
2. Create a **Web** data stream for `https://oruma.me`. Copy the measurement ID (`G-…`).
3. In the stream's **Enhanced measurement** settings, **turn off "Page changes based on browser history events"**. The site sends its own page views, so leaving this on would count every page twice.
4. **Admin → Data retention:** 14 months.
5. **Admin → Product links:** link Search Console (after B2).
6. Add the developer as an **Editor**.

- [ ] Measurement ID sent to the developer (it is public, so sending it in a message is fine)

**B4 [Owner] Create the Tag Manager container** (if Tag Manager is in scope).

1. Go to `tagmanager.google.com` → **Create account**: `ORUMA`. Container: `oruma.me`, type **Web**.
2. Copy the container ID (`GTM-…`) and send it to the developer.
3. The developer sets up the tags in C6. The owners or their marketing agency publish further tags later.

**B5 [Owner] Submit the sitemap.** Do this right after the switch (HP 5), and again after Release 2.

1. In Search Console, open **Sitemaps**, enter `sitemap.xml`, and click **Submit**.
2. The status should be **Success**. Screenshot it.

**B6 [Owner] Request indexing** after Release 2 is live.

1. In Search Console, open **URL Inspection**.
2. Inspect each of these, then click **Request indexing**: home, `/services`, the 8 service pages, `/about`, `/contact`, `/therapists`.
3. Google allows about 10 requests a day, so spread them over 2 days.
4. Check the **Pages** report after 3–7 days and screenshot it.

**B7 [Owner, optional] Bing Webmaster Tools.** At `bing.com/webmasters`, choose **Import from Google Search Console**. It takes 5 minutes and also covers Bing and DuckDuckGo.

---

## Track C: Code

### Branches

- **Release 1:** use the `handover/final` branch from HP 1.1. Add C1–C6 after the HP Phase 1 fixes.
- **Release 2:** create `feature/seo-growth` from `handover/final` once Release 1 is merged.

Before each deploy, run the full check list in HP 1.10 and add the new tests named below.

### Release 1: needed to launch

**C1 [Dev] Finish HP Phase 1 first** (HP 1.2–1.10): the payment retry bug, the 2 failing client tests, the 2 server lint errors, the dependency audit, `ParseUUIDPipe`, removing the seed script, the `.env.example` duplicate and the CI audit command.

**The payment retry bug (HP 1.5) is the top priority.** It can charge a customer without confirming a booking.

**C2 [Dev] WhatsApp button** (if A2-4 is yes).

1. In `client/components/FloatingActions.tsx`, add a WhatsApp button above the email button. Use the existing `createWhatsAppUrl()` from `client/src/config/business.ts`, with a pre-filled message that names the page.
2. Use `aria-label="Chat with Oruma on WhatsApp"` and `target="_blank" rel="noopener noreferrer"`.
3. Send a `whatsapp_click` analytics event on click (see C6).
4. Check that the privacy, terms and service-delivery policies describe WhatsApp the way the owners use it (HP 1.9).
5. Test it on a phone. It should open the WhatsApp app with the message filled in.

**C3 [Dev] Booking alert email to the owners.**

1. In `sendBookingNotifications` in `server/src/appointment/appointment.service.ts`, queue a second email to the address from A2-5. Add a server setting, `OPS_NOTIFICATION_EMAIL`, and fall back to `businessConfig.emails.support` if it's not set.
2. Include the booking reference, service, practitioner, slot, amount and a link to `/profile/admin`. **Don't include the patient's concern or any clinical notes.**
3. Add a unit test that checks both emails are queued.

**C4 [Dev] Session link email to the patient.**

1. In `sendMeetingLinkReadyNotifications` (same file), also email the patient when a meeting link is added. Include the session time and a link to `/profile/patient`, where the meeting link itself appears.
2. Add a link to the invoice in the booking confirmation email.

**C5 [Dev] Google Meet links** (if A2-2 is "Meet links added manually").

1. In `server/src/appointment/appointment-operations.ts`, rename `normalizeManualZoomLink` to `normalizeManualMeetingLink`. Accept `https://meet.google.com/xxx-xxxx-xxx` as well as `zoom.us` links, and still reject every other domain.
2. Update the error message in `validateManualZoomLink` (`appointment.service.ts:859`) and the tests in `appointment-operations.spec.ts`.
3. Change user-facing text from "Zoom link" to "session link": `client/routes/profile-patient.tsx`, `client/routes/profile-admin.tsx`, `client/components/BookingModal.tsx`, the notification text in `appointment.service.ts`, and the policy pages.
4. Update `docs/MANUAL_APPOINTMENT_OPERATIONS.md`: staff create the meeting in Google Calendar from the ORUMA Google account, then paste the link in **Appointments**.
5. **Automatic Meet creation** (Google Calendar API) is a separate job of about 3–5 days. Quote it separately if the owners want it.

**C6 [Dev] Tag Manager, GA4 events and consent.**

1. Add `VITE_GTM_ID` to `client/.env.example`.
2. In `client/src/lib/seo.ts`:
   - If `VITE_GTM_ID` is set, load the GTM container, and push a `page_view` event with the page path and title to `dataLayer` on each route change.
   - If only `VITE_GA_MEASUREMENT_ID` is set, keep the current direct GA4 loading.
   - **Never load both GA4 paths at once.** Doing so counts every visit twice.
3. Add a small `trackEvent(name, params)` helper. Send these events:

   | Event | When |
   |---|---|
   | `whatsapp_click` | WhatsApp button clicked |
   | `email_click` | Email button clicked |
   | `begin_checkout` | Razorpay checkout opened |
   | `purchase` | Payment confirmed. Send the amount and an internal reference only, never the patient's name or email. |
   | `generate_lead` | Contact form sent (Release 2) |

4. **Consent** (if A2-3 is yes): set Google Consent Mode defaults to `denied` before the tags load. Add a small banner with **Accept** and **Reject** that stores the choice and updates consent. Link it to the privacy policy, and update the privacy policy to name Google Analytics.
5. Update the security policy in `client/vercel.json`:
   - `script-src`: add `https://tagmanager.google.com`
   - `img-src`: add `https://www.googletagmanager.com` and `https://*.google-analytics.com`
   - `connect-src`: add `https://*.google-analytics.com`, `https://*.analytics.google.com` and `https://www.googletagmanager.com`
   - `frame-src`: add `https://www.googletagmanager.com`

   **Each tag the marketing team adds to Tag Manager later, such as a Meta Pixel or Google Ads, will need its domain added here too.** Write this in `HANDOVER.md`.
6. [Both] In Tag Manager: add a **Google tag** with the GA4 ID, firing on the custom `page_view` event, plus one GA4 event tag per event above. Use **Preview** (Tag Assistant) on the Vercel preview, then **Submit → Publish**.
7. In GA4, mark `purchase`, `generate_lead` and `whatsapp_click` as **key events**.

**C7 [Dev] A real 404 page.** At the moment, every unknown URL redirects to the home page. Google treats these as "soft 404s".

1. Create `client/routes/not-found.tsx` with a short message and links to home, services and contact. Give it `noindex` in `seo.ts`.
2. In `client/src/App.tsx`, replace `<Route path="*" element={<Navigate to="/" replace />} />` with the new page.
3. In `client/vercel.json`, replace the catch-all rewrite `/(.*)` with rewrites for the known route patterns only. Add `client/public/404.html` so unknown URLs get a true **404** status.
4. Add a browser test: `/this-page-does-not-exist` returns 404 and shows the page.

**Then deploy Release 1:** follow HP Phases 2–6 (preview payment test, owner readiness, switch `oruma.me`, monitoring). After the switch:

- [Dev] Set `VITE_GTM_ID` (or `VITE_GA_MEASUREMENT_ID`) in Vercel and redeploy.
- [Both] Confirm visits appear in GA4 **Realtime**.
- [Owner] Do B5.

### Release 2: SEO growth

**C8 [Dev] The 8 service pages.**

URLs:

| Page | URL | Notes |
|---|---|---|
| Relationship Counselling | `/services/relationship-counselling` | New |
| Couple Therapy | `/services/couple-therapy` | Exists. Rewrite it with the approved content and FAQs. |
| Marriage Counselling | `/services/marriage-counselling` | New |
| Trust Healing | `/services/trust-healing` | New |
| Breakup Recovery | `/services/breakup-recovery` | New service page (see redirects below) |
| Clinical Hypnotherapy | `/services/clinical-hypnotherapy` | **Publish only if A2-6 is yes.** Otherwise build it but keep it out of the sitemap, navigation and Google (`noindex`) until a verified practitioner exists. |
| Premarital Counselling | `/services/premarital-counselling` | New |
| NRI Online Counselling | `/services/nri-online-counselling` | New. Show session times in IST and the visitor's own time zone. State which payment methods work from abroad (A2-7). |

Steps:

1. **Build one template, not 8 separate pages.** Create `client/routes/services/seo-service.tsx`, following the pattern in `supporting-service.tsx`, with a content record per page. Each page has:
   - A single `<h1>` with the service name.
   - Hero image with descriptive alt text, loaded with priority.
   - Sections: who it's for, common concerns, what sessions involve, how online sessions work, price and length, FAQs.
   - `TherapistGrid` filtered by the matching area of practice.
   - Calls to action: **Book a session**, WhatsApp, email.
   - Links to 2–3 related service pages and the relevant policies.
   - `ServiceScopeNotice` (the existing disclaimer).
2. **Practice areas:** add `Marriage Counselling`, `Premarital Counselling`, `Trust & Infidelity Recovery`, `Clinical Hypnotherapy` and `NRI Counselling` to `client/src/lib/therapistProfileOptions.ts`, and to the matching server list if the server validates practice areas. This lets practitioners be tagged and appear on the right page.
3. **Routes:** add each URL in `client/src/App.tsx`, and add the route patterns to the `vercel.json` rewrites from C7.
4. **SEO data:** add each page to `publicSeoRoutes` in `client/src/lib/seo.ts`. Titles must be 60 characters or fewer. Descriptions must be 120–160 characters, unique and include the main phrase. Example: `Marriage Counselling Online | Oruma`.
5. **Avoid competing pages.** Redirect (permanent, in `vercel.json`) `/concerns/breakup-recovery` → `/services/breakup-recovery` and `/concerns/relationship-marriage` → `/services/relationship-counselling`. Update any links to them in `client/src/lib/concerns.ts`, `Navbar.tsx` and `HomeSections.tsx`.
6. **Navigation:** add the pages to the services menu in `Navbar.tsx`, the `/services` hub page and the footer.
7. **NRI payments:** if A2-7 is yes, [Owner] request **International Payments** activation in the Razorpay dashboard. [Dev] Then test a payment with an international test card in Test Mode.
8. **Tests:** extend `seo.test.ts` to check each new route has a title and description within the limits. Extend `e2e/site.spec.ts` so each page loads, has one `<h1>` and has no horizontal scroll on a phone.

**C9 [Dev] Contact form.**

1. Server: create a public `POST /enquiries` endpoint in a new `enquiry` module.
   - Fields: name, email, phone (optional), preferred contact method, subject (a fixed list), message of 1,000 characters or fewer, and a consent checkbox.
   - Protection: rate-limit by IP address, add a hidden honeypot field to catch spam bots, and validate fields the same way the existing DTOs do.
   - Save each enquiry with a new entity and migration (the 6th migration; record it in HP 0.7).
   - Queue an alert email to the A2-5 address, and an acknowledgement email to the visitor.
2. Admin: add an **Enquiries** tab to `client/routes/profile-admin.tsx` with the status values *new*, *replied* and *closed*.
3. Client: add the form to `client/routes/contact.tsx` and `ContactSection.tsx`. Keep the email and WhatsApp options. Put a privacy notice under the form: "Please don't share medical details here." Send `generate_lead` when the form is sent.
4. Make the "Find your psychologist" form (`client/routes/find-your-psychologist.tsx`) submit to the same endpoint, with its answers in the message.
5. Data retention: include enquiries in the retention rules in `server/src/privacy/data-retention.service.ts`. Mention them in the privacy policy.
6. Tests: unit tests for validation and the honeypot. One browser test that sends the form and gets a success message.

**C10 [Dev] SEO in the HTML before JavaScript runs.** At the moment, titles and descriptions are set by JavaScript, so WhatsApp, Facebook and LinkedIn previews show the home page text for every page.

1. Move the route SEO data from `seo.ts` into `client/src/lib/seo-routes.json` so the app and a Node build script can both read it.
2. Add `client/scripts/prerender-seo.mjs`, run after `vite build`. For each public route, write `dist/<route>/index.html` from `dist/index.html`, with that route's title, description, canonical URL, Open Graph tags and page schema. Reuse `replaceMeta()` from `client/api/therapist-profile.mjs`. Vercel serves these files before applying rewrites.
3. Have the same script **generate `sitemap.xml`** from the route list, with `lastmod` dates, and leave out `noindex` routes. Delete the hand-written `client/public/sitemap.xml`.
4. Test: run `curl https://<preview>/services/marriage-counselling` and check that the raw HTML has the right `<title>`. Paste the URL into WhatsApp and check the preview.

**C11 [Dev] More schema, and the map.**

1. On each service page, add `Service` schema: `name`, `description`, `provider` → `#business`, `areaServed`. Use India, or worldwide for the NRI page.
2. Add `BreadcrumbList` schema to the service, concern and practitioner pages.
3. Add `FAQPage` schema wherever an FAQ section shows (`FAQSection.tsx`, `FollowUpFAQ.tsx`, the new pages). **Tell the owners that Google now rarely shows FAQ rich results** for sites like this one. The markup is still valid and harmless.
4. In `vite.config.ts`, add `sameAs` with the 4 social links from `Footer.tsx` and, after B1, the Business Profile Maps link. Add `hasMap` with the Maps link too.
5. **Map**, based on answer A2-1:
   - **Public address:** embed the map from Google Maps (**Share → Embed a map**) on `/contact`, with `loading="lazy"` and a `title`. Add `https://www.google.com` to `frame-src` in `vercel.json`. No API key is needed.
   - **Hidden address:** don't embed a map. Add a **"Find us on Google"** link and a **"Leave a review"** link using the B1 links.
6. Keep the address, phone and email on the site, in the schema and in the Business Profile **exactly the same**.

**C12 [Dev] Speed improvements,** after measuring in D2. Do only what the report points to:

- Self-host the Inter and Playfair fonts instead of Google Fonts. This removes a connection and a CSP domain.
- Remove the `images.unsplash.com` preconnect in `index.html` if no page uses Unsplash images any more.
- Check the hero image size on mobile (D2 will show if it's the slowest element) and add a smaller `srcset` version.

**Then deploy Release 2:** preview first (HP 2.1 pattern), check every new page on a phone, then production. After that:

- [Owner] Do B5 again and B6.
- [Dev] Update `docs/SEO_SETUP.md` (the route count, GTM, the prerendering).

---

## Track D: Reports and screenshots (after Release 2 is live)

Save everything in one shared folder owned by the owners, named `ORUMA handover evidence`. Use one subfolder per section of their request.

**D1 [Dev] Responsiveness.** Run `npm.cmd run test:browser` and screenshot each key page at 375 px (phone), 768 px (tablet) and 1280 px (desktop). Use Chrome DevTools device mode, or a Playwright script. Pages: home, `/services`, one new service page, `/therapists`, a practitioner profile, `/contact`, and the booking pop-up.

**D2 [Dev] Speed.** Run PageSpeed Insights (`pagespeed.web.dev`) on mobile and desktop for: home, `/services`, 2 new service pages, `/therapists`, `/contact`. Save each as PDF. Target: mobile Performance 80 or more; LCP under 2.5 s, INP under 200 ms, CLS under 0.1. If the API is asleep (Render Free), the practitioner pages will be slow. Note this as a hosting limit (HP Phase 10).

**D3 [Dev] Security.**

- Run `ssllabs.com/ssltest` on `oruma.me` and `api.oruma.me` (target: A).
- Run `securityheaders.com` on `https://oruma.me` (target: A).
- Screenshot both, and the browser padlock.

**D4 [Dev] Broken links.** Run `npx linkinator https://oruma.me --recurse --skip "^(?!https://oruma.me)"` and save the output. Fix every broken link, then run it again until it's clean. Also check that `/this-page-does-not-exist` returns 404.

**D5 [Dev] Schema.** Run Google's Rich Results Test (`search.google.com/test/rich-results`) and the Schema Markup Validator (`validator.schema.org`) on home, one service page and one practitioner profile. Screenshot them with no errors.

**D6 [Dev] Page-by-page SEO audit.** Make a spreadsheet with one row per sitemap URL. Columns: title (with length), description (with length), H1, canonical, indexable (yes/no), schema types, images with no alt text, PageSpeed mobile score. Get the first columns from a Screaming Frog crawl (free for up to 500 URLs). Fill in PageSpeed from D2.

**D7 [Owner] Google screenshots:**

- Search Console: verification, sitemap **Success**, Pages report.
- GA4: Realtime showing a visit, and the key events list.
- Tag Manager: published container version.
- Business Profile: dashboard, with its verified status.

**D8 [Dev] Business functions,** captured during the HP Phase 3 test or the first real booking:

- The booking flow.
- Razorpay checkout, and the payment record in the admin **Payments** tab.
- The confirmation email, and the owners' booking alert (C3).
- The invoice.
- The session link email (C4) and the dashboard link.
- The WhatsApp button opening the app.
- A contact form enquiry arriving in the inbox and in the admin **Enquiries** tab.
- A refund.

---

## Track E: Walkthrough and handover (days 8–9)

**E1 [Dev] Complete `docs/HANDOVER.md`** (HP 1.11), plus:

- An **integrations table**: service, purpose, account owner, where its settings live (setting names only, no values), cost and plan. Include Google Analytics, Tag Manager, Search Console, Business Profile, Razorpay, Resend, Cloudinary, Neon, Render, Vercel, Cloudflare, Hostinger and GitHub.
- How to add a new service page using the C8 template.
- How to add a marketing tag in Tag Manager, including the security-policy step from C6.
- Backups (HP 2.8 and Phase 10) and the weekly owner check.

**E2 [Both] Walkthrough meeting** (about 90 minutes, recorded). Follow the order of the owners' request:

1. **Google SEO:** Search Console, GA4 Realtime, Tag Manager, sitemap, a page's title and description in the source, schema test results.
2. **Google Business:** the profile, the map or review link, and matching details.
3. **Technical:** reports D1–D5 and the D6 audit.
4. **Business functions:** a live ₹10 booking with payment, emails, invoice, Meet link, WhatsApp, contact form, then the refund.
5. **Ownership:** log in to each account together (HP Phase 7).
6. **SEO pages:** each of the 8 pages on a phone.

Finish with a list of what remains, if anything: for example Business Profile verification still pending, or Clinical Hypnotherapy waiting for a practitioner.

**E3 [Both] Transfer accounts, rotate secrets, sign off:** HP Phases 7, 8 and 9. Add these items to the HP 9.2 confirmation:

- [ ] Google Analytics, Tag Manager, Search Console and Business Profile are in the owners' Google account.
- [ ] Evidence folder handed over.
- [ ] Work agreed as out of scope listed, such as automatic Meet creation and WhatsApp Business API automation.

---

## Requirement checklist

Each row is one item from the owners' request, mapped to the step that delivers it.

| Owner requirement | Step |
|---|---|
| Search Console verification | B2 |
| Google Analytics 4 | B3, C6 |
| Google Tag Manager | B4, C6 |
| XML sitemap and robots.txt | Exist. Generated sitemap in C10. Submission in B5. |
| Titles and descriptions for all pages | Exist. New pages in C8. Prerendered in C10. Audit in D6. |
| Image alt text | Exists. New pages in C8. Checked in D6. |
| Schema markup | Exists. Extended in C11. Tested in D5. |
| Indexing and sitemap submission | B5, B6 |
| Google Business Profile | B1 |
| Google Maps | C11 |
| Business details | A2-1, C11 step 6 |
| Responsiveness | D1 |
| Speed and Core Web Vitals | D2, C12 |
| Security and SSL | D3 |
| Broken links and errors | C7, D4 |
| Page-by-page SEO audit | D6 |
| WhatsApp | C2 |
| Appointment booking | Exists. Tested in HP Phase 3 and D8. |
| Google Meet | C5 |
| Payment gateway and receipts | Exist. Bug fixed in HP 1.5. Emails in C3 and C4. |
| Contact forms and email notifications | C9, C3, C4 |
| Domain and DNS access | HP 7.2, 7.3 |
| Vercel access | HP 2.5, 7.1 |
| GitHub access | HP 7.4 |
| API and third-party details | E1 |
| Backups and maintenance documentation | E1, HP Phase 10 |
| 8 SEO service pages | A3, C8 |
| Completed, pending and new items | A1, E2 |
| Practical demonstration and screenshots | Track D, E2 |
