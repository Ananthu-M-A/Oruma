import { afterEach, describe, expect, it } from "vitest";
import { applyDocumentSeo, publicSeoRoutes, resolvePageSeo } from "./seo";

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

    expect(document.title).toContain("Contact ORUMA Wellness");
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toContain(
      "Thiruvananthapuram",
    );
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toContain("index, follow");
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe(
      "https://oruma.me/contact",
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://oruma.me/contact",
    );
    expect(document.querySelector("#oruma-page-schema")?.textContent).toContain('"WebPage"');
  });

  it("canonicalizes duplicate routes and excludes account pages", () => {
    expect(resolvePageSeo("/concerns/all-concerns").canonicalPath).toBe("/concerns");
    applyDocumentSeo("/profile/patient");

    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe(
      "noindex, nofollow",
    );
  });
});
