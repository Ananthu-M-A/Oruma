// Google Tag Manager / Google Analytics 4 loading, consent and events.
//
// Configuration (all public, set in the Vercel project):
//   VITE_GTM_ID                       GTM-XXXXXXX. When set, GTM is loaded and
//                                     GA4 must be configured inside GTM.
//   VITE_GA_MEASUREMENT_ID            G-XXXXXXXXXX. Used only when VITE_GTM_ID
//                                     is empty, to load GA4 directly.
//   VITE_ANALYTICS_CONSENT_REQUIRED   "false" to skip the consent banner.
//                                     Defaults to requiring consent.
//
// Never load both GTM-with-GA4 and direct GA4: every visit would count twice.

import type { PageSeo } from "./seo-routes";

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

export type ConsentChoice = "granted" | "denied";

const CONSENT_STORAGE_KEY = "oruma-analytics-consent";
const CONSENT_EVENT = "oruma-consent-change";

function readEnv(value: string | undefined) {
  return value?.trim() || undefined;
}

const gtmId = (() => {
  const value = readEnv(import.meta.env.VITE_GTM_ID);
  return value && /^GTM-[A-Z0-9]+$/i.test(value) ? value : undefined;
})();

const gaId = (() => {
  const value = readEnv(import.meta.env.VITE_GA_MEASUREMENT_ID);
  return value && /^G-[A-Z0-9]+$/i.test(value) ? value : undefined;
})();

export const analyticsConfigured = Boolean(gtmId || gaId);
export const consentRequired =
  analyticsConfigured &&
  readEnv(import.meta.env.VITE_ANALYTICS_CONSENT_REQUIRED) !== "false";

let initialized = false;

function analyticsWindow() {
  return window as AnalyticsWindow;
}

function gtag(...args: unknown[]) {
  const target = analyticsWindow();
  target.dataLayer = target.dataLayer ?? [];
  if (target.gtag) {
    target.gtag(...args);
    return;
  }
  // gtag.js reads the `arguments` object, not a plain array.
  // eslint-disable-next-line prefer-rest-params
  target.dataLayer.push(arguments);
}

export function getStoredConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function consentState(choice: ConsentChoice) {
  return {
    analytics_storage: choice,
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
  };
}

export function setConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Storage can be blocked; the choice still applies to this page view.
  }
  if (analyticsConfigured) {
    initializeAnalytics();
    gtag("consent", "update", consentState(choice));
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function onConsentChange(listener: () => void) {
  window.addEventListener(CONSENT_EVENT, listener);
  return () => window.removeEventListener(CONSENT_EVENT, listener);
}

function appendScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function initializeAnalytics() {
  if (initialized || !analyticsConfigured) return;
  initialized = true;
  const target = analyticsWindow();
  target.dataLayer = target.dataLayer ?? [];

  // Consent Mode v2 defaults must be set before any tag loads.
  const stored = getStoredConsent();
  gtag(
    "consent",
    "default",
    consentState(consentRequired ? (stored ?? "denied") : "granted"),
  );

  if (gtmId) {
    target.dataLayer.push({
      "gtm.start": Date.now(),
      event: "gtm.js",
    });
    appendScript(
      `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`,
    );
    return;
  }

  if (gaId) {
    gtag("js", new Date());
    gtag("config", gaId, { send_page_view: false });
    appendScript(
      `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`,
    );
  }
}

/** Sends an analytics event. A no-op when analytics isn't configured. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (!analyticsConfigured) return;
  initializeAnalytics();
  if (gtmId) {
    analyticsWindow().dataLayer?.push({ event: name, ...params });
    return;
  }
  gtag("event", name, { ...params, send_to: gaId });
}

export function trackPageView(pathname: string, seo: PageSeo) {
  if (!analyticsConfigured || seo.noIndex) return;
  trackEvent("page_view", {
    page_title: seo.title,
    page_location: window.location.href,
    page_path: pathname,
  });
}
