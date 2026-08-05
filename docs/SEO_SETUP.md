# ORUMA SEO Setup and Release Checklist

Code status checked: 5 August 2026

## Implemented in the repository

- A canonical `https://oruma.me` URL, unique title, unique meta description, crawler directives, Open Graph tags, Twitter card tags, and page-level JSON-LD are applied to every public route.
- Duplicate public aliases use one canonical URL: `/concerns/all-concerns` points to `/concerns`, and `/terms-and-conditions` points to `/terms`.
- Public therapist profile routes are indexable. Login, registration, patient, therapist, and admin account routes intentionally use `noindex, nofollow` because they are private or utility pages.
- `client/public/robots.txt` allows public crawling and references the XML sitemap.
- `client/public/sitemap.xml` contains the 18 canonical public landing, service, contact, policy, and therapist-directory URLs. Individual therapist profiles remain crawlable from the therapist directory and are not hard-coded because they are production data.
- Organization, LocalBusiness, WebSite, WebPage, and therapist ProfilePage schema are included without inventing a street address that has not been approved.
- GA4 is loaded only when `VITE_GA_MEASUREMENT_ID` contains a valid `G-...` measurement ID. SPA route changes send `page_view` events.
- Search Console HTML-tag verification is injected into the built HTML when `VITE_GOOGLE_SITE_VERIFICATION` is set. A Search Console Domain property can instead be verified by DNS without this variable.
- All 131 local images are WebP. Every image has alternative text and an explicit loading policy; below-the-fold images and YouTube frames are lazy-loaded, while critical hero media is prioritized.
- Desktop Chrome and Pixel 7 browser checks cover responsiveness, horizontal overflow, navigation, route metadata, crawler files, and private-route indexing.

## Production environment

Set these values in the frontend hosting project before building:

```env
VITE_API_URL=https://api.oruma.me
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GOOGLE_SITE_VERIFICATION=<Search Console HTML verification content>
```

`VITE_GOOGLE_SITE_VERIFICATION` is optional when the domain is verified with a DNS TXT record. Never place a private Analytics service-account key in a `VITE_` variable; frontend variables are public.

## Tasks that require external accounts or the live deployment

1. In Google Analytics, create or select the ORUMA GA4 property and Web data stream, copy its `G-...` measurement ID to the production frontend environment, deploy, and verify the visit in Realtime/DebugView.
2. In Google Search Console, add the `oruma.me` Domain property, verify it by DNS (preferred) or set the HTML verification value above, and confirm ownership.
3. After deployment, submit `https://oruma.me/sitemap.xml` in Search Console. Inspect the home, About, Contact, Services, Concerns, Therapists, and one therapist-profile URL, then request indexing where appropriate.
4. Verify that these live URLs return HTTP 200 and the correct content type: `/robots.txt`, `/sitemap.xml`, `/about`, and `/contact`. Confirm `http://oruma.me` and `https://www.oruma.me` redirect once to `https://oruma.me`.
5. Run PageSpeed Insights for the home, therapist directory, one service page, About, and Contact on mobile and desktop after CDN caching is warm. Record Core Web Vitals and fix any production-only bottleneck.
6. Validate the deployed schema with Schema Markup Validator and Google Rich Results Test. Replace the partial locality-level address only after the official street/postal address is approved for publication.
7. Confirm the privacy/legal basis for GA4 and deploy a consent mechanism if required for the intended audiences and jurisdictions.

## Verification commands

From `client/`:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test -- --run
npm.cmd run build
$env:PLAYWRIGHT_BROWSER_CHANNEL='chrome'; npm.cmd run test:browser
```

The browser-channel variable is only needed when the Playwright-managed Chromium binary is not installed and system Chrome is available.
