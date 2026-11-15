# ORUMA Owner Requirements Plan

Prepared: 6 November 2026. **Updated 6 November 2026 after the code work was done.**

**Goal:** deliver every item in the owners' handover and technical review request. That means Google SEO, Google Business, performance, business functions, ownership, and the 8 SEO service pages. Each item is demonstrated with a screenshot or report.

**How this fits with `HANDOVER_PLAN.md`:** that plan covers the code fixes, the switch of `oruma.me` to the new build, account transfer and sign-off. This plan adds the owners' new requirements. A step already in `HANDOVER_PLAN.md` is referred to by number ("HP 1.5").

**The ground rules in `HANDOVER_PLAN.md` still apply.** Keep `oruma.me` up, test on the preview first, don't merge or push before HP 0.3, and make one change at a time.

Who does each step:

- **[Dev]** Ananthu
- **[Owner]** the owners or their nominated person
- **[Both]** done together, usually on a call

---

## Where things stand

**All code work that doesn't need an owner account is done.** It sits on the local branch `handover/final` (created from `release/2026-09-27`), **not yet committed or pushed**.

Checks run on 6 November 2026:

| Check | Result |
|---|---|
| Server lint | Clean (the 2 errors from HP 1.2 are fixed) |
| Server unit tests | 97 of 97 pass (was 85; new tests for payment retry, Meet links, emails, enquiries) |
| Server build | Passes |
| Client lint and typecheck | Clean |
| Client unit tests | 29 of 29 pass (the 2 failures from HP 1.3 are fixed) |
| Client build | Passes. Writes 50 prerendered pages, `404.html` and a 43-URL sitemap. |
| Browser tests (Playwright) | 69 of 69 pass on desktop, phone (Pixel 7) and tablet (iPad) |
| Production dependency audit | Client: 0 findings. Server: 0 findings after the TypeORM 1.1.3 upgrade (15 Nov 2026). |
| Database end-to-end tests | **Not run.** They need a disposable PostgreSQL database (HP 1.10). |

### What the code now does

| Owner requirement | Status | Where |
|---|---|---|
| Payment retry bug (HP 1.5) | ✅ Fixed and tested | `server/src/payment/payment.service.ts` |
| Other HP Phase 1 fixes (1.2–1.4, 1.6–1.9) | ✅ Done | Lint, tests, `npm audit fix`, `ParseUUIDPipe`, seed script removed, `.env.example`, CI audit command, README |
| Search Console verification | ✅ Ready (unchanged) | Needs B2 |
| Google Analytics 4 | ✅ Ready, with events | `client/src/lib/analytics.ts`. Needs B3. |
| Google Tag Manager | ✅ Built | Loads when `VITE_GTM_ID` is set. Needs B4. |
| Cookie consent | ✅ Built | Consent Mode v2, banner, defaults to "denied" |
| XML sitemap | ✅ Generated at build time from the route list | `client/vite.config.ts` |
| Titles and descriptions in the page HTML | ✅ Prerendered per page | Fixes WhatsApp and Facebook link previews |
| Schema markup | ✅ Extended | Service, FAQPage, BreadcrumbList, `sameAs` social links. `hasMap` once B1 gives the Maps link. |
| Real 404 page | ✅ Built | Unknown URLs now return HTTP 404 instead of redirecting home |
| Google Maps / Business Profile links | ✅ Ready | Fill `googleBusinessProfile` in `config/business.json` after B1 |
| WhatsApp | ✅ Restored | Floating button, contact page, service pages. Pre-filled message names the page. On/off switch in `config/business.json`. |
| Phone number on the contact page | ✅ Restored | Same switch |
| Contact form | ✅ Built | Saves the enquiry, emails the care team, sends the visitor a confirmation, appears in the new admin **Enquiries** tab, and is rate-limited with a spam trap |
| Owner email on each new paid booking | ✅ Built | Goes to `OPS_NOTIFICATION_EMAIL`, or the support email if that isn't set |
| "Session link is ready" email to the patient | ✅ Built | |
| Invoice link in the confirmation email | ✅ Built | |
| Google Meet links | ✅ Accepted alongside Zoom (added manually by staff) | Automatic Meet creation is not built (new work) |
| 8 SEO service pages | ✅ Built. **Text is a developer draft and needs owner approval** (A3). | `client/src/content/seoServices.ts` |
| Tablet responsiveness test | ✅ Added | `client/playwright.config.ts` |
| Policies mention the form, WhatsApp, phone and analytics cookies | ✅ Updated. **Needs owner or legal review** (A4). | Privacy, terms, service delivery |
| Speed improvements (C12 in the first version) | ⏸ Waiting for the PageSpeed report (D2) | |

### Decisions I made so the code could go ahead

Each one is easy to reverse. Confirm them with the owners in A2.

| Question | Default in the code | How to change it |
|---|---|---|
| Show the WhatsApp button and phone number? | **Shown.** They had been removed on 11 Oct (commit `56f55f7`); the owners' request asks for WhatsApp. | `publicContact.whatsapp` / `publicContact.phone` in `config/business.json` |
| Cookie consent banner? | **On** | `VITE_ANALYTICS_CONSENT_REQUIRED=false` in Vercel |
| Meet or Zoom? | **Both accepted**, entered by hand | No change needed |
| Publish Clinical Hypnotherapy? | **No.** The page is built but hidden from Google, the sitemap and the menus. | `published: true` in `seoServices.ts` once a verified practitioner exists |
| Show a map with the home address? | **No map.** Only "Find us on Google" and review links, once the profile exists. | Set `googleBusinessProfile.mapEmbedUrl` if the owners want the address shown |
| Where do booking and enquiry alerts go? | `oruma9987@gmail.com` | `OPS_NOTIFICATION_EMAIL` in Render |
| Old concern pages for relationships and breakups? | **Kept** as educational pages, retitled "…: Signs and Support" so they don't compete with the new service pages | `client/src/lib/seo-routes.ts` |

---

## Fastest route from here

| Day | Dev | Owner |
|---|---|---|
| 1 | A1 message, C1 review and commit, HP Phase 0 | A2 decisions, B1 Business Profile, B2 Search Console |
| 2 | C2 deploy to preview, C3 preview checks, HP Phases 2–3 | A3 approve page text, A4 policy review, B3 GA4, B4 Tag Manager |
| 3 | Apply A3/A4 changes, HP Phases 5–6 (switch `oruma.me`) | |
| 4 | C4 analytics live, B5 sitemap, D1–D6 reports | B6 request indexing |
| 5 | E1 handover doc, E2 walkthrough | Business Profile verification finishes (Google's timing) |
| 5–6 | HP Phases 7–9 | Sign-off |

**The most likely delays:** the owners approving the page text and policies (A3, A4), Google Business Profile verification (B1), and the practitioner evidence in HP 4.4.

---

## Track A: Scope and decisions (day 1)

**A1 [Dev] Send the owners a status message.** Say plainly:

- **Done and ready to test:** everything in "What the code now does" above.
- **Needs their Google accounts:** Search Console, GA4, Tag Manager, Business Profile (Track B).
- **Needs their approval:** the text of the 7 new service pages, and the policy changes.
- **Still manual:** Google Meet or Zoom links, and WhatsApp replies. Staff create the meeting and paste the link; someone has to answer WhatsApp. Automating either is new work.
- **Not built:** automatic Google Meet creation through the Google Calendar API (about 3–5 days, quote separately if wanted).
- If the new work is outside the original agreement, agree how it's charged.

**A2 [Owner] Confirm the defaults** in "Decisions I made" above, plus:

| # | Question | Affects |
|---|---|---|
| 1 | Is there a practitioner with verified hypnotherapy training? | Publishing the hypnotherapy page |
| 2 | Accept international cards from NRI clients? Needs Razorpay **International Payments** activation. | NRI page FAQ text, Razorpay |
| 3 | A Google Workspace account for ORUMA? Recommended for Meet: free Gmail calls with 3 or more people (couple sessions) stop at 60 minutes. | Meet usage |
| 4 | Who answers WhatsApp, and within what time? | HP 4.2 |

**A3 [Owner] Approve the text of the 7 new service pages.** Draft text is in `client/src/content/seoServices.ts` and can be reviewed on the preview after C2. Pages: Relationship Counselling, Marriage Counselling, Trust Healing, Breakup Recovery, Clinical Hypnotherapy, Premarital Counselling, NRI Online Counselling. Couple Therapy keeps its existing page.

- [ ] Every claim is accurate and acceptable for a health-related service.
- [ ] Owners supply any extra text they want, especially for Couple Therapy.
- [ ] Owners confirm the hero images can be used. The pages reuse existing site images.
- [Dev] Apply their changes. The page, menu, sitemap and schema update from the one file. The unit tests check title and description lengths.

**A4 [Owner] Review the policy changes** with whoever reviews legal text (HP 4.1). Changed: the privacy policy (contact form, WhatsApp, analytics cookies, enquiry retention), the terms, and the service delivery policy (contact channels).

- [ ] Approved.
- [Dev] **Update the effective date** in `client/routes/privacy-policy.tsx` and the other changed policies to the deploy date.

---

## Track B: Google accounts (owners' Google account, from day 1)

Create every Google account **in the owners' Google account**, not the developer's, so nothing needs transferring later.

**B1 [Owner] Create the Google Business Profile.** Start this first, because verification takes days.

1. Go to `business.google.com` and sign in with the owners' account.
2. Business name: **Oruma**, exactly as on the website. No added keywords: Google can suspend profiles for that.
3. Category: **Counselor**, or **Marriage counselor**. Choose **Psychologist** only if a registered psychologist runs the service.
4. Location: choose "I deliver goods and services to my customers" and **don't show the address**, unless the owners decided in A2 to show it. Service area: Kerala and India.
5. Phone `+91-8157039987`. Website `https://oruma.me/?utm_source=google&utm_medium=organic&utm_campaign=gbp`.
6. Add the 8 services, a description of 750 characters or fewer, opening hours, the logo, a cover photo and 3–5 more photos.
7. Complete verification (video, phone or postcard).
8. Once verified, send the developer the **Maps link** and the **review link**.

- [ ] Created
- [ ] Verification started (date: ______)
- [ ] Verified, links sent
- [Dev] Put the links in `googleBusinessProfile.mapsUrl` and `reviewUrl` in `config/business.json`, then redeploy. The contact page shows the links and the schema gains `hasMap` and `sameAs`.

**B2 [Both] Verify Search Console by DNS.** This works before the switch.

1. [Owner] `search.google.com/search-console` → **Add property** → **Domain** → `oruma.me`. Copy the TXT record.
2. [Dev] In Cloudflare **DNS → Records**, add one **TXT** record on `oruma.me` with that value. **Don't change any other record.**
3. [Owner] Click **Verify**. If it fails, wait 30 minutes and try again.
4. [Owner] Under **Settings → Users and permissions**, add the developer as a **Full** user.

- [ ] Verified. Screenshot saved.

**B3 [Owner] Create the GA4 property,** with the developer on a call.

1. `analytics.google.com` → **Admin → Create → Property**: `ORUMA`, time zone India, currency INR.
2. Create a **Web** data stream for `https://oruma.me`. Copy the measurement ID (`G-…`).
3. In **Enhanced measurement**, **turn off "Page changes based on browser history events"**. The site sends its own page views; leaving this on counts every page twice.
4. **Admin → Data retention:** 14 months.
5. **Admin → Product links:** link Search Console (after B2).
6. Add the developer as an **Editor**.

**B4 [Owner] Create the Tag Manager container.**

1. `tagmanager.google.com` → **Create account** `ORUMA`, container `oruma.me`, type **Web**.
2. Send the container ID (`GTM-…`) to the developer, and add the developer as a user.

---

## Track C: Deploy the code

**C1 [Dev] Review and commit** (day 1).

1. Read the diff on `handover/final`: `git diff release/2026-09-27`. Check in particular:
   - `client/src/content/seoServices.ts` (page text)
   - `client/vercel.json` (routing changes, see C3)
   - `config/business.json` (contact switches)
2. Commit on `handover/final`. **Don't push until HP 0.3 is answered.**

**C2 [Dev] Deploy to the API and the preview,** following HP 2.1. Order matters:

1. **Back up the database** (HP 2.8).
2. **Run the new migrations** `1791000000000-WebsiteEnquiries` (adds the `enquiry` table) and `1792000000000-SecurityHardening` (adds the `rate_limit_bucket` table and the `user.tokenVersion` column): `npm.cmd run migration:run:prod` with `DATABASE_MIGRATION_URL` pointing at the direct Neon connection. Confirm it in HP 0.7's query, which should now list **7** migrations. **Run them before deploying the API:** the new build signs nobody in until `tokenVersion` exists, and `/ready` reports `schema: not_ready` until both are there.
3. In Render, add `OPS_NOTIFICATION_EMAIL` (from A2), `TRUST_PROXY_HOPS=2`, and optionally `ENQUIRY_RETENTION_DAYS` (default 365). While the owners test on `oruma-eight.vercel.app` against `api.oruma.me`, also set `SESSION_COOKIE_SAMESITE=none` (the preview is a different site, so the default `lax` cookie would not be sent). Set it back to `lax`, or remove it, after the switch to `oruma.me`. Deploy the API.
   - Sign-in now uses an httpOnly cookie instead of a token in the browser, so **everyone has to sign in again once** after this deploy.
4. Deploy the client to the preview.

If the API is deployed before the migration, everything works except the contact form, which returns an error until the migration runs.

**C3 [Dev] Check the preview.** The routing changed: Vercel now serves a prerendered file for each page, and **any URL not on the site returns 404** instead of the home page.

- [ ] Every menu link loads, on a phone and on a computer.
- [ ] A practitioner profile `/therapists/<id>` loads.
- [ ] `/login`, `/register` and the dashboards load after logging in.
- [ ] `/route-that-does-not-exist` shows the "Page not found" page and returns status 404 (browser developer tools → **Network**).
- [ ] `/terms-and-conditions` redirects to `/terms`.
- [ ] `curl -s <preview>/services/marriage-counselling | findstr "<title>"` shows "Marriage Counselling Online | Oruma".
- [ ] Paste a service page URL into WhatsApp: the preview shows that page's title and image.
- [ ] `<preview>/sitemap.xml` lists 43 URLs and no hypnotherapy page.
- [ ] Send the contact form. The care-team email, the visitor confirmation and the admin **Enquiries** entry all arrive.
- [ ] The WhatsApp button opens WhatsApp with the message filled in.
- [ ] During the HP Phase 3 payment test, the owners' "New paid booking" email arrives, and after adding a Meet link, the patient's "session link is ready" email arrives.

**Old URLs:** the current `oruma.me` build is older, and some of its URLs may not exist in the new build. Before the switch, list the old site's pages (browse it, or check Search Console **Pages** once B2 is done). Add a permanent redirect in `client/vercel.json` for each one that has no new equivalent. After the switch, watch Search Console for new 404s for two weeks.

**C4 [Dev] Switch on analytics** after the HP Phase 5 switch.

1. In Vercel, set `VITE_GTM_ID` (from B4) and leave `VITE_GA_MEASUREMENT_ID` **empty**. Without Tag Manager, set only `VITE_GA_MEASUREMENT_ID` instead. Redeploy.
2. [Both] In Tag Manager:
   - Add a **Google tag** with the GA4 measurement ID, firing on **Initialization – All Pages**, with "Send page view" **unticked**.
   - Add a **GA4 Event** tag named `{{Event}}` (enable the built-in **Event** variable), firing on a **Custom Event** trigger matching `page_view|whatsapp_click|email_click|begin_checkout|purchase|generate_lead` (regex). Pass the event parameters through as needed.
   - Use **Preview** (Tag Assistant) on `oruma.me`: accept cookies in the banner, then check the events arrive. Then **Submit → Publish**.
3. In GA4, mark `purchase`, `generate_lead` and `whatsapp_click` as **key events**.
4. [Both] Confirm a visit appears in GA4 **Realtime**. Screenshot it.

**Each new marketing tag added in Tag Manager later (for example Meta Pixel or Google Ads) needs its domains added to the Content-Security-Policy in `client/vercel.json`.** Otherwise the browser blocks it. This is written in `HANDOVER.md`.

**B5 [Owner] Submit the sitemap** right after the switch: Search Console → **Sitemaps** → `sitemap.xml` → **Submit**. The status should be **Success**. Screenshot it.

**B6 [Owner] Request indexing.** In **URL Inspection**, inspect and **Request indexing** for: home, `/services`, the 7 published service pages, `/about`, `/contact`, `/therapists`. Google allows about 10 requests a day, so spread them over 2 days. Check the **Pages** report after 3–7 days and screenshot it.

**B7 [Owner, optional] Bing Webmaster Tools:** at `bing.com/webmasters`, choose **Import from Google Search Console** (5 minutes).

---

## Track D: Reports and screenshots (after the switch)

Save everything in one shared folder owned by the owners, `ORUMA handover evidence`, with one subfolder per section of their request.

**D1 [Dev] Responsiveness.** The browser tests already cover desktop, phone and tablet (`npm.cmd run test:browser`). For the owners, take screenshots of each key page at 375 px, 768 px and 1280 px in Chrome DevTools device mode: home, `/services`, 2 service pages, `/therapists`, a practitioner profile, `/contact`, the booking pop-up.

**D2 [Dev] Speed.** Run PageSpeed Insights (`pagespeed.web.dev`) on mobile and desktop for: home, `/services`, 2 service pages, `/therapists`, `/contact`. Save each as PDF. Target: mobile Performance 80 or more; LCP under 2.5 s, INP under 200 ms, CLS under 0.1. If the API is asleep (Render Free), practitioner lists load slowly; note this as a hosting limit (HP Phase 10). Then make only the fixes the report points to, for example:

- Self-host the Inter and Playfair fonts instead of loading them from Google Fonts.
- Remove the `images.unsplash.com` preconnect in `client/index.html` if no page uses Unsplash images.
- Serve a smaller hero image on mobile if it's the slowest element.

**D3 [Dev] Security.** `ssllabs.com/ssltest` on `oruma.me` and `api.oruma.me` (target: A), and `securityheaders.com` on `https://oruma.me` (target: A). Screenshot both, and the browser padlock.

**D4 [Dev] Broken links.** Run `npx linkinator https://oruma.me --recurse --skip "^(?!https://oruma.me)"` and save the output. Fix every broken link, and run it again until clean.

**D5 [Dev] Schema.** Run Google's Rich Results Test and the Schema Markup Validator on home, one service page and one practitioner profile. Screenshot them with no errors. Tell the owners that Google now rarely shows FAQ rich results for sites like this one; the markup is still valid.

**D6 [Dev] Page-by-page SEO audit.** A spreadsheet with one row per sitemap URL: title (with length), description (with length), H1, canonical, indexable, schema types, images without alt text, PageSpeed mobile score. A Screaming Frog crawl (free for up to 500 URLs) fills the first columns; D2 fills the last.

**D7 [Owner] Google screenshots:** Search Console verification, sitemap **Success** and Pages report; GA4 Realtime and key events; Tag Manager published version; Business Profile verified status.

**D8 [Dev] Business functions,** captured during the HP Phase 3 test or the first real booking:

- The booking flow.
- Razorpay checkout and the admin **Payments** record.
- The confirmation email (with invoice link) and the owners' "New paid booking" email.
- The invoice.
- The "session link is ready" email and the dashboard link.
- The WhatsApp button opening the app.
- A contact form enquiry in the inbox and in **Enquiries**.
- A refund.

---

## Track E: Walkthrough and handover

**E1 [Dev] Finish `docs/HANDOVER.md`** (HP 1.11). Already updated for Meet links, WhatsApp, enquiries, analytics and the remaining audit findings. Still to add:

- An **integrations table**: service, purpose, account owner, where its settings live (names only), cost and plan. Include Google Analytics, Tag Manager, Search Console, Business Profile, Razorpay, Resend, Cloudinary, Neon, Render, Vercel, Cloudflare, Hostinger, GitHub.
- How to add a service page (see `docs/SEO_SETUP.md`).
- The remaining `[FILL]` values.

**E2 [Both] Walkthrough meeting** (about 90 minutes, recorded), in the order of the owners' request:

1. **Google SEO:** Search Console, GA4 Realtime, Tag Manager, sitemap, a page's title in the raw HTML, schema test results.
2. **Google Business:** the profile, the "Find us on Google" and review links, matching details.
3. **Technical:** reports D1–D6.
4. **Business functions:** a live ₹10 booking (payment, emails, invoice, Meet link), WhatsApp, the contact form, then the refund.
5. **Ownership:** log in to each account together (HP Phase 7).
6. **SEO pages:** each service page on a phone.

End with the list of what remains, if anything, for example Business Profile verification still pending, or the hypnotherapy page waiting for a practitioner.

**E3 [Both] Transfer accounts, rotate secrets, sign off:** HP Phases 7, 8 and 9. Add these to the HP 9.2 confirmation:

- [ ] Google Analytics, Tag Manager, Search Console and Business Profile are in the owners' Google account.
- [ ] Evidence folder handed over.
- [ ] Work agreed as out of scope listed, such as automatic Meet creation and WhatsApp Business API automation.

---

## Requirement checklist

| Owner requirement | Code | Remaining step |
|---|---|---|
| Search Console verification | ✅ | B2 |
| Google Analytics 4 | ✅ | B3, C4 |
| Google Tag Manager | ✅ | B4, C4 |
| XML sitemap and robots.txt | ✅ | B5 |
| Titles and descriptions for all pages | ✅ | D6 |
| Image alt text | ✅ | D6 |
| Schema markup | ✅ | D5 (and B1 for `hasMap`) |
| Indexing and sitemap submission | — | B5, B6 |
| Google Business Profile | ✅ links ready | B1 |
| Google Maps | ✅ link ready, embed optional | B1, A2 |
| Business details | ✅ | A2, B1 (must match the site exactly) |
| Responsiveness | ✅ tested on 3 viewports | D1 |
| Speed and Core Web Vitals | — | D2 |
| Security and SSL | ✅ headers | D3 |
| Broken links and errors | ✅ real 404 | C3, D4 |
| Page-by-page SEO audit | — | D6 |
| WhatsApp | ✅ | A2-4 (who answers) |
| Appointment booking | ✅ | HP Phase 3, D8 |
| Google Meet | ✅ manual links | A2-3 |
| Payment gateway and receipts | ✅ bug fixed, invoice link emailed | HP Phase 3, D8 |
| Contact forms and email notifications | ✅ | C2 migration, C3 |
| Domain and DNS access | — | HP 7.2, 7.3 |
| Vercel access | — | HP 2.5, 7.1 |
| GitHub access | — | HP 7.4 |
| API and third-party details | partly | E1 |
| Backups and maintenance documentation | partly | E1, HP Phase 10 |
| 8 SEO service pages | ✅ built (draft text) | A3 |
| Completed, pending and new items | — | A1, E2 |
| Practical demonstration and screenshots | — | Track D, E2 |
