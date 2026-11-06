import { afterEach, describe, expect, it, vi } from "vitest";

type AnalyticsWindow = Window & { dataLayer?: unknown[] };

async function loadAnalytics(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return import("./analytics");
}

afterEach(() => {
  vi.unstubAllEnvs();
  delete (window as AnalyticsWindow).dataLayer;
  document.head.innerHTML = "";
  window.localStorage.clear();
});

describe("analytics", () => {
  it("does nothing when no analytics ID is configured", async () => {
    const analytics = await loadAnalytics({
      VITE_GTM_ID: "",
      VITE_GA_MEASUREMENT_ID: "",
    });
    analytics.trackEvent("whatsapp_click");
    expect(analytics.analyticsConfigured).toBe(false);
    expect((window as AnalyticsWindow).dataLayer).toBeUndefined();
    expect(document.querySelector("script[src*='googletagmanager']")).toBeNull();
  });

  it("loads Tag Manager with consent denied by default and pushes events", async () => {
    const analytics = await loadAnalytics({
      VITE_GTM_ID: "GTM-TEST123",
      VITE_GA_MEASUREMENT_ID: "G-SHOULDNOTLOAD",
    });
    analytics.trackEvent("generate_lead", { form: "contact" });

    const dataLayer = (window as AnalyticsWindow).dataLayer ?? [];
    const consentDefault = Array.from(dataLayer[0] as ArrayLike<unknown>);
    expect(consentDefault[0]).toBe("consent");
    expect(consentDefault[1]).toBe("default");
    expect(consentDefault[2]).toMatchObject({ analytics_storage: "denied" });
    expect(dataLayer).toContainEqual({ event: "generate_lead", form: "contact" });
    expect(
      document.querySelector("script[src*='gtm.js?id=GTM-TEST123']"),
    ).not.toBeNull();
    // Never load GA4 directly as well: it would double-count visits.
    expect(document.querySelector("script[src*='gtag/js']")).toBeNull();
  });

  it("records and applies the visitor's consent choice", async () => {
    const analytics = await loadAnalytics({ VITE_GTM_ID: "GTM-TEST123" });
    analytics.setConsent("granted");

    expect(analytics.getStoredConsent()).toBe("granted");
    const updates = ((window as AnalyticsWindow).dataLayer ?? [])
      .filter((entry) => typeof entry === "object" && entry && "length" in entry)
      .map((entry) => Array.from(entry as ArrayLike<unknown>));
    expect(updates).toContainEqual([
      "consent",
      "update",
      expect.objectContaining({ analytics_storage: "granted" }),
    ]);
  });

  it("skips page views for private, noindex pages", async () => {
    const analytics = await loadAnalytics({ VITE_GTM_ID: "GTM-TEST123" });
    analytics.trackPageView("/profile/admin", {
      title: "Admin",
      description: "Admin",
      noIndex: true,
    });
    expect(
      ((window as AnalyticsWindow).dataLayer ?? []).some(
        (entry) =>
          typeof entry === "object" &&
          entry !== null &&
          (entry as { event?: string }).event === "page_view",
      ),
    ).toBe(false);
  });
});
