# ORUMA SEO Setup and Release Checklist

Code status checked: 6 November 2026 (branch `handover/final`)

## Implemented in the repository

- **One source for route SEO.** `client/src/lib/seo-routes.ts` holds every route's title, description and canonical URL. The app, the build-time prerender and the sitemap all read it, so they can't drift apart.
- **Prerendered HTML per page.** At build time, `vite.config.ts` writes one HTML file per route (for example `dist/services/marriage-counselling.html`) with that page's title, description, canonical URL, Open Graph and Twitter tags, and JSON-LD already in the HTML. Crawlers and WhatsApp, Facebook and LinkedIn previews see the right page without running JavaScript. Vercel serves these through `cleanUrls`.
- **Generated sitemap.** `sitemap.xml` is generated at build time from the indexable routes, with `lastmod` dates. Private and unpublished pages are left out. The dev server serves the same sitemap. There is no hand-written sitemap any more.
- **Real 404s.** Unknown URLs return HTTP 404 with a "Page not found" page (`dist/404.html`, marked `noindex`). Old aliases redirect permanently: `/terms-and-conditions` → `/terms`, `/concerns/all-concerns` → `/concerns`, `/team` → `/therapists`.
- **Service pages.** 7 pages are built from `client/src/content/seoServices.ts` using the `routes/services/seo-service.tsx` template: Relationship Counselling, Marriage Counselling, Trust Healing, Breakup Recovery, Clinical Hypnotherapy, Premarital Counselling and NRI Online Counselling. Couple Therapy keeps its existing page. Clinical Hypnotherapy has `published: false`, which keeps it `noindex` and out of the sitemap and menus until a practitioner with verified hypnotherapy training is live.
- **Schema.** Site-wide: ProfessionalService (with `sameAs` social profiles, and `hasMap` once the Google Business Profile link is set), Brand, Person (operator) and WebSite. Per page: WebPage plus BreadcrumbList. Service pages also have Service and FAQPage. Practitioner profiles have ProfilePage, Person and BreadcrumbList.
- **No competing pages.** The concern pages `/concerns/relationship-marriage` and `/concerns/breakup-recovery` are educational and titled "…: Signs and Support", so they don't compete in search with the service pages of the same topic.
- **Analytics.** `client/src/lib/analytics.ts` loads Google Tag Manager when `VITE_GTM_ID` is set, or GA4 directly when only `VITE_GA_MEASUREMENT_ID` is set. Never both. Consent Mode v2 defaults to "denied" and a cookie banner asks for consent unless `VITE_ANALYTICS_CONSENT_REQUIRED=false`. Events: `page_view` (public pages only), `whatsapp_click`, `email_click`, `begin_checkout`, `purchase` (booking reference and amount only) and `generate_lead` (contact form).
- **Search Console.** The HTML verification tag is added when `VITE_GOOGLE_SITE_VERIFICATION` is set. A Domain property verified by DNS doesn't need it.
- **Google Business Profile.** Set `googleBusinessProfile.mapsUrl`, `reviewUrl` and, only if the address is public, `mapEmbedUrl` in `config/business.json`. The contact page then shows "Find us on Google", "Leave a Google review" and the map, and the schema gains `hasMap` and `sameAs`.
- **Images.** Every rendered image has alt text and an explicit loading policy. Service page hero images load with high priority.
- **Tests.** Unit tests check title length (60 characters or fewer) and description length (120–160) for every service page, and the schema types. Browser tests run on desktop, phone (Pixel 7) and tablet (iPad) viewports: no horizontal scroll, one H1 per service page, real 404, sitemap content, contact form and WhatsApp link.

## Production environment (Vercel)

```env
VITE_API_URL=https://api.oruma.me
VITE_GTM_ID=GTM-XXXXXXX            # or leave empty and set VITE_GA_MEASUREMENT_ID
VITE_GA_MEASUREMENT_ID=            # only when VITE_GTM_ID is empty
VITE_ANALYTICS_CONSENT_REQUIRED=true
VITE_GOOGLE_SITE_VERIFICATION=     # optional with DNS verification
```

All `VITE_` values are public. Never put a secret or service-account key in one.

## Adding a new service page

1. Add an entry to `client/src/content/seoServices.ts`. Keep `seoTitle` to 60 characters or fewer and `seoDescription` between 120 and 160.
2. Run `npm.cmd test -- --run` (the length checks) and `npm.cmd run build`.
3. The route, menu entry, services-hub card, sitemap entry, prerendered HTML and schema are all created from that one entry.

## Tasks that need external accounts or the live site

See `docs/OWNER_REQUIREMENTS_PLAN.md`, Tracks B and D.

## Verification commands

From `client/`:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test -- --run
npm.cmd run build
$env:PLAYWRIGHT_BROWSER_CHANNEL='chrome'; npm.cmd run test:browser
```
