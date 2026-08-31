import { businessConfig } from "../config/business";
import type { Therapist } from "./therapists";
import { splitTherapistTags } from "./therapistProfileOptions";

const SITE_URL = businessConfig.website;
const SITE_NAME = businessConfig.brandName;
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
    title: `Online Counselling & Wellness Services | ${SITE_NAME}`,
    description: `Book confidential online counselling and wellness services from verified practitioners through ${SITE_NAME}.`,
  },
  "/about": {
    title: `About ${SITE_NAME} | Ownership and Online Services`,
    description: `Learn who operates ${SITE_NAME}, how its online counselling and wellness services work, and how to contact the individual owner.`,
  },
  "/articles": {
    title: `Mental Wellness Articles & Resources | ${SITE_NAME}`,
    description: `Read general educational articles from ${SITE_NAME} about emotional wellbeing, relationships, stress, and self-care.`,
  },
  "/careers": {
    title: `Practitioner Applications | ${SITE_NAME}`,
    description: `Review the ${SITE_NAME} practitioner verification and application process for online counselling and wellness services.`,
  },
  "/concerns": {
    title: `Counselling and Wellness Concerns | ${SITE_NAME}`,
    description: `Explore general counselling and wellness topics and review verified practitioner profiles on ${SITE_NAME}.`,
  },
  "/concerns/all-concerns": {
    title: `Counselling and Wellness Concerns | ${SITE_NAME}`,
    description: `Explore general counselling and wellness topics and review verified practitioner profiles on ${SITE_NAME}.`,
    canonicalPath: "/concerns",
  },
  "/consultation": {
    title: `Online Counselling and Wellness Consultations | ${SITE_NAME}`,
    description: `Review availability, identity, booking, payment, and digital-delivery information for ${SITE_NAME} online consultations.`,
  },
  "/contact": {
    title: `Contact ${SITE_NAME} | Online Counselling Support`,
    description: `Contact ${SITE_NAME} by phone, WhatsApp, or email for online counselling, practitioner selection, booking, payment, and refund support.`,
  },
  "/find-your-psychologist": {
    title: `Find the Right Psychologist | ${SITE_NAME}`,
    description: `Share your preferences and ask ${SITE_NAME} for help comparing suitable verified practitioner profiles, fees, and availability.`,
  },
  "/online-counselling": {
    title: `Online Counselling in India | ${SITE_NAME}`,
    description: `Access confidential online counselling from home, subject to verified practitioner scope and availability through ${SITE_NAME}.`,
  },
  "/privacy-policy": {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: `Read how ${SITE_NAME} handles personal information for counselling, booking, payment, and support services.`,
  },
  "/refund-policy": {
    title: `Refund Policy | ${SITE_NAME}`,
    description: `Read the ${SITE_NAME} refund policy for appointments, payment failures, duplicate payments, timelines, and support requests.`,
  },
  "/cancellation-policy": {
    title: `Cancellation Policy | ${SITE_NAME}`,
    description: `Read the ${SITE_NAME} cancellation policy for appointments, rescheduling, no-shows, late joins, and practitioner-initiated changes.`,
  },
  "/service-delivery-policy": {
    title: `Service Delivery Policy | ${SITE_NAME}`,
    description: `Read how ${SITE_NAME} confirms and digitally delivers online counselling and wellness bookings, joining instructions, rescheduling, and support.`,
  },
  "/services": {
    title: `Online Counselling and Wellness Services | ${SITE_NAME}`,
    description: `Explore ${SITE_NAME} individual, couple, follow-up, sexual-wellness, and online consultation categories and their booking information.`,
  },
  "/programs": {
    title: `Courses, Workshops and Webinars | ${SITE_NAME}`,
    description: `Explore courses, offline workshops, webinars, and events created and hosted by ${SITE_NAME}.`,
  },
  "/services/couple-therapy": {
    title: `Online Couple and Relationship Counselling | ${SITE_NAME}`,
    description: `Review verified practitioner profiles, fees, availability, and policies for ${SITE_NAME} relationship counselling.`,
  },
  "/services/follow-up": {
    title: `Counselling Follow-Up Sessions | ${SITE_NAME}`,
    description: `Review practitioner availability, fees, and policies for a ${SITE_NAME} follow-up booking.`,
  },
  "/services/individual-therapy": {
    title: `Online Individual Counselling in India | ${SITE_NAME}`,
    description:
      "Book a confidential individual counselling or wellness session with a verified practitioner whose role and scope are shown on their profile.",
  },
  "/services/parenting-support": {
    title: `Online Parenting Support | ${SITE_NAME}`,
    description: `Explore ${SITE_NAME} parenting support information and compare verified practitioner profiles, fees, and availability.`,
  },
  "/services/child-teen-counselling": {
    title: `Child and Teen Counselling | ${SITE_NAME}`,
    description: `Explore age-appropriate child and teen counselling information and verified practitioner profiles through ${SITE_NAME}.`,
  },
  "/services/family-counselling": {
    title: `Online Family Counselling | ${SITE_NAME}`,
    description: `Explore ${SITE_NAME} family counselling information and compare verified practitioner profiles, fees, and availability.`,
  },
  "/services/postpartum-support": {
    title: `Online Postpartum Support | ${SITE_NAME}`,
    description: `Explore ${SITE_NAME} postpartum support information and compare suitably verified practitioner profiles.`,
  },
  "/services/sexual-wellness": {
    title: `Sexual Wellness & Intimacy Counselling | ${SITE_NAME}`,
    description: `Review confidential ${SITE_NAME} sexual-wellness service information and book only with a suitably verified practitioner.`,
  },
  "/therapists": {
    title: `Find an Online Practitioner | ${SITE_NAME}`,
    description: `Browse verified ${SITE_NAME} practitioner profiles, compare stated areas of practice and fees, view availability, and book an online session.`,
  },
  "/terms": {
    title: `Terms and Conditions | ${SITE_NAME}`,
    description: `Read the ${SITE_NAME} terms for account use, appointments, payments, online consultations, support, and responsibilities.`,
  },
  "/terms-and-conditions": {
    title: `Terms and Conditions | ${SITE_NAME}`,
    description: `Read the ${SITE_NAME} terms for account use, appointments, payments, online consultations, support, and responsibilities.`,
    canonicalPath: "/terms",
  },
};

const privateSeoRoutes: Record<string, PageSeo> = {
  "/login": {
    title: `Login | ${SITE_NAME}`,
    description: `Sign in to your ${SITE_NAME} account.`,
    noIndex: true,
  },
  "/register": {
    title: `Create an Account | ${SITE_NAME}`,
    description: `Create a ${SITE_NAME} patient account.`,
    noIndex: true,
  },
  "/profile/patient": {
    title: `Patient Dashboard | ${SITE_NAME}`,
    description: `Manage your private ${SITE_NAME} patient account.`,
    noIndex: true,
  },
  "/profile/therapist": {
    title: `Practitioner Dashboard | ${SITE_NAME}`,
    description: `Manage your private ${SITE_NAME} practitioner account.`,
    noIndex: true,
  },
  "/profile/admin": {
    title: `Admin Dashboard | ${SITE_NAME}`,
    description: `${SITE_NAME} administration area.`,
    noIndex: true,
  },
  "/profile/admin/therapists": {
    title: `Manage Practitioners | ${SITE_NAME}`,
    description: `${SITE_NAME} practitioner administration area.`,
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
      title: `Practitioner Profile & Availability | ${SITE_NAME}`,
      description: `View a verified ${SITE_NAME} practitioner profile, stated qualifications, fees, availability, and online booking options.`,
      type: "profile",
    };
  }

  return {
    title: SITE_NAME,
    description: `Online counselling and wellness booking services from ${SITE_NAME}.`,
    canonicalPath: "/",
    noIndex: true,
  };
}

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }
  element.href = href;
}

function setPageSchema(seo: PageSeo, canonicalUrl: string) {
  let script =
    document.head.querySelector<HTMLScriptElement>("#oruma-page-schema");
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
    about: { "@id": `${SITE_URL}/#business` },
    inLanguage: "en-IN",
  });
}

function setStructuredData(value: Record<string, unknown>) {
  let script =
    document.head.querySelector<HTMLScriptElement>("#oruma-page-schema");
  if (!script) {
    script = document.createElement("script");
    script.id = "oruma-page-schema";
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(value);
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
  setMeta(
    "property",
    "og:image:alt",
    `${SITE_NAME} online counselling and wellness services`,
  );
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", seo.title);
  setMeta("name", "twitter:description", seo.description);
  setMeta("name", "twitter:image", DEFAULT_SOCIAL_IMAGE);
  setCanonical(canonicalUrl);
  setPageSchema(seo, canonicalUrl);

  return seo;
}

export function applyTherapistSeo(therapist: Therapist) {
  const canonicalUrl = `${SITE_URL}/therapists/${therapist.id}`;
  const title = `${therapist.name}, ${therapist.title} | ${SITE_NAME}`;
  const legacyTags = splitTherapistTags(therapist.tags);
  const areas = therapist.areasOfPractice?.length
    ? therapist.areasOfPractice
    : legacyTags.areasOfPractice;
  const languages = therapist.languages?.length
    ? therapist.languages
    : legacyTags.languages;
  const description = [
    `View ${therapist.name}'s reviewed ${therapist.title} profile`,
    therapist.qualifications ? `, ${therapist.qualifications}` : "",
    areas.length > 0 ? `, areas including ${areas.slice(0, 3).join(", ")}` : "",
    ", fees, session mode, and current availability.",
  ].join("");
  const image = therapist.image
    ? therapist.image.startsWith("http")
      ? therapist.image
      : `${SITE_URL}${therapist.image.startsWith("/") ? "" : "/assets/"}${therapist.image}`
    : DEFAULT_SOCIAL_IMAGE;

  document.title = title;
  setMeta("name", "description", description);
  setMeta(
    "name",
    "robots",
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  );
  setMeta("name", "googlebot", "index, follow");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:type", "profile");
  setMeta("property", "og:url", canonicalUrl);
  setMeta("property", "og:image", image);
  setMeta("property", "og:image:alt", `${therapist.name} profile image`);
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", image);
  setCanonical(canonicalUrl);
  setStructuredData({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${canonicalUrl}#profile`,
    url: canonicalUrl,
    name: title,
    description,
    mainEntity: {
      "@type": "Person",
      name: therapist.name,
      jobTitle: therapist.title,
      image,
      description: therapist.bio || undefined,
      knowsLanguage: languages.length ? languages : undefined,
      hasCredential: therapist.qualifications
        ? {
            "@type": "EducationalOccupationalCredential",
            name: therapist.qualifications,
            recognizedBy: therapist.awardingInstitution
              ? { "@type": "Organization", name: therapist.awardingInstitution }
              : undefined,
          }
        : undefined,
    },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "en-IN",
  });
}

export function applyTherapistNotFoundSeo() {
  const title = `Practitioner Profile Unavailable | ${SITE_NAME}`;
  const description = "This practitioner profile is not publicly available.";
  document.title = title;
  setMeta("name", "description", description);
  setMeta("name", "robots", "noindex, nofollow");
  setMeta("name", "googlebot", "noindex, nofollow");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setCanonical(`${SITE_URL}/therapists`);
  setStructuredData({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}/therapists`,
  });
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

  if (
    !document.querySelector(
      `script[src*="googletagmanager.com/gtag/js?id=${analyticsId}"]`,
    )
  ) {
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
