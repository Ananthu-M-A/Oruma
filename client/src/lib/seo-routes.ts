// Route-level SEO data and structured data builders.
//
// This module must not touch the DOM or `import.meta.env`: vite.config.ts
// imports it at build time to prerender metadata into each page's HTML and to
// generate sitemap.xml. Browser-side code lives in ./seo.ts.

import businessConfig from "../../../config/business.json";
import {
  findSeoService,
  seoServices,
  type SeoService,
} from "../content/seoServices";

export const SITE_URL = businessConfig.website.replace(/\/$/, "");
export const SITE_NAME = businessConfig.brandName;
export const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/assets/home-lady-striped-shirt-v2.webp`;

export type PageSeo = {
  title: string;
  description: string;
  canonicalPath?: string;
  noIndex?: boolean;
  type?: "website" | "profile";
  /** Set for pages built from src/content/seoServices.ts. */
  serviceSlug?: string;
  /** Social preview image path, when the page has its own hero image. */
  image?: string;
};

const serviceRoutes = Object.fromEntries(
  seoServices
    .filter((service) => service.published)
    .map((service): [string, PageSeo] => [
      service.path,
      {
        title: service.seoTitle,
        description: service.seoDescription,
        serviceSlug: service.slug,
        image: service.heroImage,
      },
    ]),
);

/** Service pages built but not yet approved for search (owner decision). */
export const gatedSeoRoutes: Record<string, PageSeo> = Object.fromEntries(
  seoServices
    .filter((service) => !service.published)
    .map((service): [string, PageSeo] => [
      service.path,
      {
        title: service.seoTitle,
        description: service.seoDescription,
        serviceSlug: service.slug,
        image: service.heroImage,
        noIndex: true,
      },
    ]),
);

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
  "/resources": {
    title: `Mental Wellness Resources | ${SITE_NAME}`,
    description: `Explore articles, booking information, practitioner resources, and service details from ${SITE_NAME}.`,
  },
  "/careers": {
    title: `Practitioner Applications | ${SITE_NAME}`,
    description: `Review the ${SITE_NAME} practitioner verification and application process for online counselling and wellness services.`,
  },
  "/concerns": {
    title: `Counselling and Wellness Concerns | ${SITE_NAME}`,
    description: `Explore general counselling and wellness topics and review verified practitioner profiles on ${SITE_NAME}.`,
  },
  // The two concern pages below are educational. Their titles avoid the exact
  // service phrases so they don't compete in search with the service pages.
  "/concerns/relationship-marriage": {
    title: `Relationship Problems: Signs and Support | ${SITE_NAME}`,
    description: `Understand common relationship and marriage difficulties, such as communication breakdown, conflict and distance, and when counselling can help, with ${SITE_NAME}.`,
  },
  "/concerns/breakup-recovery": {
    title: `Coping With a Breakup: Signs and Support | ${SITE_NAME}`,
    description: `Understand common reactions after a breakup, from grief and overthinking to low confidence, and how to find supportive counselling with ${SITE_NAME}.`,
  },
  "/concerns/anxiety-stress": {
    title: `Anxiety & Stress Counselling | ${SITE_NAME}`,
    description: `Learn about online counselling support for persistent worry, anxiety symptoms, daily stress, and practical steps toward emotional balance with ${SITE_NAME}.`,
  },
  "/concerns/emotional-wellbeing": {
    title: `Emotional Wellbeing Support | ${SITE_NAME}`,
    description: `Explore emotional wellbeing support for stress, low mood, self-esteem, and life transitions, with links to focused care and verified practitioners at ${SITE_NAME}.`,
  },
  "/concerns/postpartum-support": {
    title: `Postpartum Counselling and Support | ${SITE_NAME}`,
    description: `Find supportive postpartum counselling information for emotional changes, adjustment, relationships, and wellbeing after pregnancy through ${SITE_NAME}.`,
  },
  "/concerns/depression": {
    title: `Depression and Low Mood Support | ${SITE_NAME}`,
    description: `Explore counselling support for depression, low mood, loss of interest, and emotional strain, and review verified practitioner profiles with ${SITE_NAME}.`,
  },
  "/concerns/teenage-wellbeing": {
    title: `Teenage and Student Counselling | ${SITE_NAME}`,
    description: `Review counselling information for teenage and student concerns, including academic pressure, relationships, emotional wellbeing, and family support with ${SITE_NAME}.`,
  },
  "/concerns/trauma-ptsd": {
    title: `Trauma and PTSD Support | ${SITE_NAME}`,
    description: `Explore trauma-informed counselling information for difficult past experiences, trauma symptoms, recovery, and finding an appropriately verified practitioner at ${SITE_NAME}.`,
  },
  "/consultation": {
    title: `Online Counselling and Wellness Consultations | ${SITE_NAME}`,
    description: `Review availability, identity, booking, payment, and digital-delivery information for ${SITE_NAME} online consultations.`,
  },
  "/contact": {
    title: `Contact ${SITE_NAME} | Online Counselling Support`,
    description: `Contact ${SITE_NAME} by form, email, or WhatsApp for online counselling, practitioner selection, booking, payment, and refund support.`,
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
    description: `Explore ${SITE_NAME} relationship, marriage, premarital, couple, individual, breakup recovery, NRI and wellness counselling services and how to book them.`,
  },
  "/programs": {
    title: `Courses, Workshops and Webinars | ${SITE_NAME}`,
    description: `Explore courses, offline workshops, webinars, and events created and hosted by ${SITE_NAME}.`,
  },
  "/programs/courses": {
    title: `Wellbeing Courses | ${SITE_NAME}`,
    description: `Explore learning courses from ${SITE_NAME} about relationships, parenting, emotional wellbeing, and personal growth.`,
  },
  "/programs/workshops": {
    title: `Wellbeing Workshops | ${SITE_NAME}`,
    description: `Explore in-person learning and wellbeing workshops hosted by ${SITE_NAME}, with practical sessions on relationships, emotional health, and personal growth.`,
  },
  "/programs/webinars": {
    title: `Wellbeing Webinars and Events | ${SITE_NAME}`,
    description: `Explore online talks, expert conversations, and wellbeing events offered by ${SITE_NAME}.`,
  },
  "/services/couple-therapy": {
    title: `Couple Therapy Online | ${SITE_NAME}`,
    description: `Book online couple therapy with verified ${SITE_NAME} practitioners. Compare profiles, couple session fees and availability, and attend together from home.`,
    image: "/assets/relationship-healing-connection-v2.webp",
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
  ...serviceRoutes,
  "/therapists": {
    title: `Find an Online Practitioner | ${SITE_NAME}`,
    description: `Browse verified ${SITE_NAME} practitioner profiles, compare stated areas of practice and fees, view availability, and book an online session.`,
  },
  "/terms": {
    title: `Terms and Conditions | ${SITE_NAME}`,
    description: `Read the ${SITE_NAME} terms for account use, appointments, payments, online consultations, support, and responsibilities.`,
  },
};

export const privateSeoRoutes: Record<string, PageSeo> = {
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

export const notFoundSeo: PageSeo = {
  title: `Page Not Found | ${SITE_NAME}`,
  description: `The page you were looking for isn't available on ${SITE_NAME}.`,
  noIndex: true,
};

export function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

export function resolvePageSeo(pathname: string): PageSeo {
  const path = normalizePath(pathname);
  const configured =
    publicSeoRoutes[path] ?? gatedSeoRoutes[path] ?? privateSeoRoutes[path];
  if (configured) return configured;

  if (path.startsWith("/therapists/")) {
    return {
      title: `Practitioner Profile & Availability | ${SITE_NAME}`,
      description: `View a verified ${SITE_NAME} practitioner profile, stated qualifications, fees, availability, and online booking options.`,
      type: "profile",
    };
  }

  return notFoundSeo;
}

export function canonicalUrlFor(pathname: string, seo: PageSeo) {
  const canonicalPath = seo.canonicalPath ?? normalizePath(pathname);
  return `${SITE_URL}${canonicalPath === "/" ? "/" : canonicalPath}`;
}

export function absoluteImageUrl(image?: string) {
  if (!image) return DEFAULT_SOCIAL_IMAGE;
  if (image.startsWith("http")) return image;
  return `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

const sectionNames: Record<string, string> = {
  services: "Services",
  concerns: "Concerns",
  programs: "Programs",
  therapists: "Practitioners",
};

function pageName(seo: PageSeo) {
  return seo.title.replace(new RegExp(`\\s*\\|\\s*${SITE_NAME}$`), "");
}

function breadcrumbSchema(path: string, seo: PageSeo, canonicalUrl: string) {
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  const items: Array<{ name: string; url: string }> = [
    { name: "Home", url: `${SITE_URL}/` },
  ];
  if (segments.length > 1 && sectionNames[segments[0]]) {
    items.push({
      name: sectionNames[segments[0]],
      url: `${SITE_URL}/${segments[0]}`,
    });
  }
  items.push({ name: pageName(seo), url: canonicalUrl });
  return {
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function serviceSchemas(service: SeoService, canonicalUrl: string) {
  return [
    {
      "@type": "Service",
      "@id": `${canonicalUrl}#service`,
      name: service.title,
      serviceType: service.navLabel,
      description: service.seoDescription,
      url: canonicalUrl,
      image: absoluteImageUrl(service.heroImage),
      provider: { "@id": `${SITE_URL}/#business` },
      areaServed:
        service.areaServed === "Worldwide"
          ? "Worldwide"
          : { "@type": "Country", name: "India" },
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: canonicalUrl,
        availableLanguage: ["English", "Malayalam"],
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${canonicalUrl}#faq`,
      mainEntity: service.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];
}

/** JSON-LD for one page: WebPage, breadcrumbs and, for services, Service + FAQ. */
export function buildPageSchema(pathname: string, seo: PageSeo) {
  const path = normalizePath(pathname);
  const canonicalUrl = canonicalUrlFor(path, seo);
  const breadcrumb = breadcrumbSchema(path, seo, canonicalUrl);
  const service = seo.serviceSlug ? findSeoService(seo.serviceSlug) : undefined;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": seo.type === "profile" ? "ProfilePage" : "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: seo.title,
        description: seo.description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#business` },
        ...(breadcrumb ? { breadcrumb: { "@id": breadcrumb["@id"] } } : {}),
        ...(service ? { mainEntity: { "@id": `${canonicalUrl}#service` } } : {}),
        inLanguage: "en-IN",
      },
      ...(breadcrumb ? [breadcrumb] : []),
      ...(service ? serviceSchemas(service, canonicalUrl) : []),
    ],
  };
}

/** Every indexable public path, used for prerendering and the sitemap. */
export function indexablePublicPaths() {
  return Object.entries(publicSeoRoutes)
    .filter(
      ([path, seo]) =>
        !seo.noIndex && (!seo.canonicalPath || seo.canonicalPath === path),
    )
    .map(([path]) => path);
}
