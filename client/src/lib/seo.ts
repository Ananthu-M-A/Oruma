import type { Therapist } from "./therapists";
import { splitTherapistTags } from "./therapistProfileOptions";
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_NAME,
  SITE_URL,
  absoluteImageUrl,
  buildPageSchema,
  canonicalUrlFor,
  normalizePath,
  resolvePageSeo,
} from "./seo-routes";

export {
  publicSeoRoutes,
  gatedSeoRoutes,
  resolvePageSeo,
  type PageSeo,
} from "./seo-routes";
export { trackPageView } from "./analytics";

const INDEXABLE_ROBOTS =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

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
  const canonicalUrl = canonicalUrlFor(currentPath, seo);
  const robots = seo.noIndex ? "noindex, nofollow" : INDEXABLE_ROBOTS;
  const image = absoluteImageUrl(seo.image);

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
  setMeta("property", "og:image", image);
  setMeta(
    "property",
    "og:image:alt",
    `${SITE_NAME} online counselling and wellness services`,
  );
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", seo.title);
  setMeta("name", "twitter:description", seo.description);
  setMeta("name", "twitter:image", image);
  setCanonical(canonicalUrl);
  setStructuredData(buildPageSchema(currentPath, seo));

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
  setMeta("name", "robots", INDEXABLE_ROBOTS);
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
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${canonicalUrl}#profile`,
        url: canonicalUrl,
        name: title,
        description,
        breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
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
                  ? {
                      "@type": "Organization",
                      name: therapist.awardingInstitution,
                    }
                  : undefined,
              }
            : undefined,
        },
        isPartOf: { "@id": `${SITE_URL}/#website` },
        inLanguage: "en-IN",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: "Practitioners",
            item: `${SITE_URL}/therapists`,
          },
          { "@type": "ListItem", position: 3, name: therapist.name, item: canonicalUrl },
        ],
      },
    ],
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
