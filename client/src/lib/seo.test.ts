import { afterEach, describe, expect, it } from "vitest";
import { applyDocumentSeo, publicSeoRoutes, resolvePageSeo } from "./seo";
import { indexablePublicPaths } from "./seo-routes";
import { seoServices } from "../content/seoServices";

afterEach(() => {
  document.head.innerHTML = "";
  document.title = "";
});

describe("SEO metadata", () => {
  it("defines unique indexable metadata for every canonical public page", () => {
    const canonicalPages = Object.entries(publicSeoRoutes).filter(
      ([path, seo]) => !seo.canonicalPath || seo.canonicalPath === path,
    );
    const titles = canonicalPages.map(([, seo]) => seo.title);
    const descriptions = canonicalPages.map(([, seo]) => seo.description);

    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    for (const [, seo] of canonicalPages) {
      expect(seo.noIndex).not.toBe(true);
      expect(seo.title.length).toBeGreaterThanOrEqual(20);
      expect(seo.description.length).toBeGreaterThanOrEqual(80);
    }
  });

  it("applies canonical, social, and crawler metadata to a public route", () => {
    applyDocumentSeo("/contact/");

    expect(document.title).toContain("Contact Oruma");
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content"),
    ).toContain("practitioner selection");
    expect(
      document.querySelector('meta[name="robots"]')?.getAttribute("content"),
    ).toContain("index, follow");
    expect(
      document
        .querySelector('meta[property="og:url"]')
        ?.getAttribute("content"),
    ).toBe("https://oruma.me/contact");
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe("https://oruma.me/contact");
    expect(document.querySelector("#oruma-page-schema")?.textContent).toContain(
      '"WebPage"',
    );
  });

  it("excludes account pages and unknown routes from search", () => {
    applyDocumentSeo("/profile/patient");
    expect(
      document.querySelector('meta[name="robots"]')?.getAttribute("content"),
    ).toBe("noindex, nofollow");

    expect(resolvePageSeo("/no-such-page").noIndex).toBe(true);
    expect(resolvePageSeo("/no-such-page").title).toContain("Not Found");
  });

  it("keeps service page titles and descriptions within search result limits", () => {
    for (const service of seoServices) {
      expect(service.seoTitle.length, service.path).toBeLessThanOrEqual(60);
      expect(
        service.seoDescription.length,
        service.path,
      ).toBeGreaterThanOrEqual(120);
      expect(service.seoDescription.length, service.path).toBeLessThanOrEqual(
        160,
      );
      expect(service.faqs.length, service.path).toBeGreaterThanOrEqual(3);
    }
  });

  it("indexes published service pages and keeps unpublished ones out", () => {
    for (const service of seoServices) {
      const seo = resolvePageSeo(service.path);
      expect(seo.title).toBe(service.seoTitle);
      expect(Boolean(seo.noIndex), service.path).toBe(!service.published);
      expect(indexablePublicPaths().includes(service.path)).toBe(
        service.published,
      );
    }
  });

  it("adds Service, FAQ and breadcrumb schema to service pages", () => {
    applyDocumentSeo("/services/marriage-counselling");
    const schema = JSON.parse(
      document.querySelector("#oruma-page-schema")?.textContent ?? "{}",
    ) as { "@graph": Array<{ "@type": string }> };
    expect(schema["@graph"].map((node) => node["@type"])).toEqual([
      "WebPage",
      "BreadcrumbList",
      "Service",
      "FAQPage",
    ]);
  });
});
