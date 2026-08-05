const SITE_URL = "https://oruma.me";
const SITE_NAME = "ORUMA Wellness";
const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/assets/home-lady-striped-shirt-v2.webp`;

export type PageSeo = {
  title: string;
  description: string;
  canonicalPath?: string;
  noIndex?: boolean;
  type?: "website" | "profile";
};

export const publicSeoRoutes: Record<string, PageSeo> = {
  "/": {
    title: "Online Counselling & Therapy in India | ORUMA Wellness",
    description:
      "Connect with qualified psychologists for secure online counselling, individual therapy, couple therapy, and mental health support from ORUMA Wellness.",
  },
  "/about": {
    title: "About ORUMA Wellness | Mental Health Support Team",
    description:
      "Meet the ORUMA Wellness team and learn about our mission to make professional, empathetic mental health support accessible in India and worldwide.",
  },
  "/articles": {
    title: "Mental Health Articles & Resources | ORUMA Wellness",
    description:
      "Read practical articles from ORUMA Wellness about mental health, therapy, emotional wellbeing, relationships, stress, and self-care.",
  },
  "/careers": {
    title: "Therapist Careers | Join ORUMA Wellness",
    description:
      "Explore therapist careers with ORUMA Wellness and help provide ethical, empathetic online counselling and mental health support.",
  },
  "/concerns": {
    title: "Mental Health Concerns & Therapy Support | ORUMA Wellness",
    description:
      "Find professional support for anxiety, depression, relationships, breakup recovery, postpartum wellbeing, student wellness, trauma, and PTSD.",
  },
  "/concerns/all-concerns": {
    title: "Mental Health Concerns & Therapy Support | ORUMA Wellness",
    description:
      "Find professional support for anxiety, depression, relationships, breakup recovery, postpartum wellbeing, student wellness, trauma, and PTSD.",
    canonicalPath: "/concerns",
  },
  "/consultation": {
    title: "Online Mental Health Consultation Worldwide | ORUMA",
    description:
      "Book a private online mental health consultation with ORUMA Wellness from India or abroad and connect with professional support wherever you live.",
  },
  "/contact": {
    title: "Contact ORUMA Wellness | Online Counselling Support",
    description:
      "Contact ORUMA Wellness in Thiruvananthapuram, Kerala by phone, WhatsApp, or email for online counselling, therapist guidance, and booking support.",
  },
  "/online-counselling": {
    title: "Secure Online Counselling in India | ORUMA Wellness",
    description:
      "Access secure, professional online counselling from home with qualified ORUMA Wellness therapists supporting clients in India and worldwide.",
  },
  "/privacy-policy": {
    title: "Privacy Policy | ORUMA Wellness",
    description:
      "Read how ORUMA Wellness collects, uses, protects, and manages personal information for counselling, booking, payment, and support services.",
  },
  "/refund-policy": {
    title: "Refund Policy | ORUMA Wellness",
    description:
      "Read the ORUMA Wellness refund policy for counselling appointments, payment failures, duplicate payments, gateway timelines, and support requests.",
  },
  "/cancellation-policy": {
    title: "Cancellation Policy | ORUMA Wellness",
    description:
      "Read the ORUMA Wellness cancellation policy for counselling appointments, rescheduling, no-shows, late joins, and therapist-initiated changes.",
  },
  "/services": {
    title: "Online Therapy & Counselling Services | ORUMA Wellness",
    description:
      "Explore ORUMA Wellness services including individual therapy, couple therapy, follow-up sessions, sexual wellness, and online consultations.",
  },
  "/services/couple-therapy": {
    title: "Online Couple Therapy & Relationship Counselling | ORUMA",
    description:
      "Reconnect, improve communication, and work through conflict with professional online couple therapy in a safe and supportive environment.",
  },
  "/services/follow-up": {
    title: "Therapy Follow-Up Sessions | ORUMA Wellness",
    description:
      "Continue your progress with an ORUMA Wellness therapy follow-up session and maintain consistent, professional mental health support.",
  },
  "/services/individual-therapy": {
    title: "Online Individual Therapy in India | ORUMA Wellness",
    description:
      "Book confidential individual therapy with qualified psychologists for anxiety, depression, stress, relationships, trauma, and personal growth.",
  },
  "/services/sexual-wellness": {
    title: "Sexual Wellness & Intimacy Counselling | ORUMA",
    description:
      "Explore sexual wellness and intimacy concerns in a safe, confidential, non-judgmental space with professional guidance from ORUMA Wellness.",
  },
  "/therapists": {
    title: "Find an Online Therapist | ORUMA Wellness",
    description:
      "Browse qualified ORUMA Wellness psychologists, compare specializations and fees, view availability, and book a secure online therapy session.",
  },
  "/terms": {
    title: "Terms and Conditions | ORUMA Wellness",
    description:
      "Read the ORUMA Wellness terms for account use, appointments, payments, online consultations, support, and platform responsibilities.",
  },
  "/terms-and-conditions": {
    title: "Terms and Conditions | ORUMA Wellness",
    description:
      "Read the ORUMA Wellness terms for account use, appointments, payments, online consultations, support, and platform responsibilities.",
    canonicalPath: "/terms",
  },
};

const privateSeoRoutes: Record<string, PageSeo> = {
  "/login": {
    title: "Login | ORUMA Wellness",
    description: "Sign in to your ORUMA Wellness account.",
    noIndex: true,
  },
  "/register": {
    title: "Create an Account | ORUMA Wellness",
    description: "Create an ORUMA Wellness patient account.",
    noIndex: true,
  },
  "/profile/patient": {
    title: "Patient Dashboard | ORUMA Wellness",
    description: "Manage your private ORUMA Wellness patient account.",
    noIndex: true,
  },
  "/profile/therapist": {
    title: "Therapist Dashboard | ORUMA Wellness",
    description: "Manage your private ORUMA Wellness therapist account.",
    noIndex: true,
  },
  "/profile/admin": {
    title: "Admin Dashboard | ORUMA Wellness",
    description: "ORUMA Wellness administration area.",
    noIndex: true,
  },
  "/profile/admin/therapists": {
    title: "Manage Therapists | ORUMA Wellness",
    description: "ORUMA Wellness therapist administration area.",
    noIndex: true,
  },
};

function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

export function resolvePageSeo(pathname: string): PageSeo {
  const path = normalizePath(pathname);
  const configured = publicSeoRoutes[path] ?? privateSeoRoutes[path];
  if (configured) return configured;

  if (path.startsWith("/therapists/")) {
    return {
      title: "Therapist Profile & Availability | ORUMA Wellness",
      description:
        "View an ORUMA Wellness therapist profile, specializations, fees, availability, and online session booking options.",
      type: "profile",
    };
  }

  return {
    title: SITE_NAME,
    description: "Professional online counselling and mental health support from ORUMA Wellness.",
    canonicalPath: "/",
    noIndex: true,
  };
}

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }
  element.href = href;
}

function setPageSchema(seo: PageSeo, canonicalUrl: string) {
  let script = document.head.querySelector<HTMLScriptElement>("#oruma-page-schema");
  if (!script) {
    script = document.createElement("script");
    script.id = "oruma-page-schema";
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": seo.type === "profile" ? "ProfilePage" : "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: seo.title,
    description: seo.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-IN",
  });
}

export function applyDocumentSeo(pathname: string) {
  const seo = resolvePageSeo(pathname);
  const currentPath = normalizePath(pathname);
  const canonicalPath = seo.canonicalPath ?? currentPath;
  const canonicalUrl = `${SITE_URL}${canonicalPath === "/" ? "/" : canonicalPath}`;
  const robots = seo.noIndex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  document.documentElement.lang = "en-IN";
  document.title = seo.title;
  setMeta("name", "description", seo.description);
  setMeta("name", "robots", robots);
  setMeta("name", "googlebot", robots);
  setMeta("property", "og:site_name", SITE_NAME);
  setMeta("property", "og:title", seo.title);
  setMeta("property", "og:description", seo.description);
  setMeta("property", "og:type", seo.type ?? "website");
  setMeta("property", "og:url", canonicalUrl);
  setMeta("property", "og:image", DEFAULT_SOCIAL_IMAGE);
  setMeta("property", "og:image:alt", "ORUMA Wellness online counselling and mental health support");
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", seo.title);
  setMeta("name", "twitter:description", seo.description);
  setMeta("name", "twitter:image", DEFAULT_SOCIAL_IMAGE);
  setCanonical(canonicalUrl);
  setPageSchema(seo, canonicalUrl);

  return seo;
}

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

let analyticsId: string | undefined;

function initializeAnalytics() {
  const configuredId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
  if (!configuredId || !/^G-[A-Z0-9]+$/i.test(configuredId)) return undefined;
  if (analyticsId) return analyticsId;

  analyticsId = configuredId;
  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
  analyticsWindow.gtag =
    analyticsWindow.gtag ??
    function gtag(...args: unknown[]) {
      analyticsWindow.dataLayer?.push(args);
    };

  analyticsWindow.gtag("js", new Date());
  analyticsWindow.gtag("config", analyticsId, {
    send_page_view: false,
    anonymize_ip: true,
  });

  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${analyticsId}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`;
    document.head.appendChild(script);
  }

  return analyticsId;
}

export function trackPageView(pathname: string, seo: PageSeo) {
  const measurementId = initializeAnalytics();
  if (!measurementId || seo.noIndex) return;

  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.gtag?.("event", "page_view", {
    page_title: seo.title,
    page_location: window.location.href,
    page_path: pathname,
    send_to: measurementId,
  });
}
