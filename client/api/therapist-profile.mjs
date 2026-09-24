import { readFile } from "node:fs/promises";
import { join } from "node:path";

const DEFAULT_SITE_URL = "https://oruma.me";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function replaceMeta(html, attribute, key, content) {
  const expression = new RegExp(
    `<meta\\s+${attribute}="${key}"[\\s\\S]*?\\/>`,
    "i",
  );
  return html.replace(
    expression,
    `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`,
  );
}

function renderHead(html, profile) {
  const siteUrl = process.env.ORUMA_SITE_URL || DEFAULT_SITE_URL;
  const canonicalUrl = `${siteUrl}/therapists/${encodeURIComponent(profile.id)}`;
  const areas = profile.areasOfPractice || profile.tags || [];
  const title = `${profile.name}, ${profile.title} | Oruma`;
  const description = `View ${profile.name}'s reviewed ${profile.title} profile${profile.qualifications ? `, ${profile.qualifications}` : ""}${areas.length ? `, areas including ${areas.slice(0, 3).join(", ")}` : ""}, fees, session mode, and current availability.`;
  const image = profile.image
    ? profile.image.startsWith("http")
      ? profile.image
      : `${siteUrl}${profile.image.startsWith("/") ? "" : "/assets/"}${profile.image}`
    : `${siteUrl}/assets/home-lady-striped-shirt-v2.webp`;
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${canonicalUrl}#profile`,
    url: canonicalUrl,
    name: title,
    description,
    mainEntity: {
      "@type": "Person",
      name: profile.name,
      jobTitle: profile.title,
      image,
      description: profile.bio || undefined,
      knowsLanguage: profile.languages || undefined,
      hasCredential: profile.qualifications
        ? {
            "@type": "EducationalOccupationalCredential",
            name: profile.qualifications,
            recognizedBy: profile.awardingInstitution
              ? { "@type": "Organization", name: profile.awardingInstitution }
              : undefined,
          }
        : undefined,
    },
    inLanguage: "en-IN",
  }).replaceAll("<", "\\u003c");

  let rendered = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  rendered = rendered.replace(
    /<link\s+rel="canonical"[\s\S]*?\/>/i,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
  );
  rendered = replaceMeta(rendered, "name", "description", description);
  rendered = replaceMeta(
    rendered,
    "name",
    "robots",
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  );
  rendered = replaceMeta(rendered, "property", "og:title", title);
  rendered = replaceMeta(rendered, "property", "og:description", description);
  rendered = replaceMeta(rendered, "property", "og:type", "profile");
  rendered = replaceMeta(rendered, "property", "og:url", canonicalUrl);
  rendered = replaceMeta(rendered, "property", "og:image", image);
  rendered = replaceMeta(
    rendered,
    "property",
    "og:image:alt",
    `${profile.name} profile image`,
  );
  rendered = replaceMeta(rendered, "name", "twitter:title", title);
  rendered = replaceMeta(rendered, "name", "twitter:description", description);
  rendered = replaceMeta(rendered, "name", "twitter:image", image);
  return rendered.replace(
    "</head>",
    `<script type="application/ld+json" id="oruma-page-schema">${schema}</script></head>`,
  );
}

function renderUnavailableHead(html) {
  const title = "Practitioner Profile Unavailable | Oruma";
  let rendered = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  rendered = replaceMeta(
    rendered,
    "name",
    "description",
    "This practitioner profile is not publicly available.",
  );
  rendered = replaceMeta(rendered, "name", "robots", "noindex, nofollow");
  rendered = replaceMeta(rendered, "name", "googlebot", "noindex, nofollow");
  return rendered;
}

export default {
  async fetch(request) {
    const html = await readFile(join(process.cwd(), "dist", "index.html"), "utf8");
    const requestUrl = new URL(request.url);
    const id = requestUrl.searchParams.get("id") || "";
    const apiBase = (
      process.env.ORUMA_API_URL ||
      process.env.VITE_API_URL ||
      "https://api.oruma.me"
    ).replace(/\/$/, "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return new Response(renderUnavailableHead(html), {
        status: 404,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Robots-Tag": "noindex, nofollow",
        },
      });
    }
    if (!/^https?:\/\//i.test(apiBase)) {
      return new Response(renderUnavailableHead(html), {
        status: 503,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Robots-Tag": "noindex, nofollow",
          "Cache-Control": "no-store",
          "Retry-After": "60",
        },
      });
    }

    try {
      const response = await fetch(`${apiBase}/therapists/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });
      if (response.status === 404) {
        return new Response(renderUnavailableHead(html), {
          status: 404,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "X-Robots-Tag": "noindex, nofollow",
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        });
      }
      if (!response.ok) throw new Error(`Profile API returned ${response.status}`);
      const profile = await response.json();
      return new Response(renderHead(html, profile), {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      });
    } catch {
      return new Response(renderUnavailableHead(html), {
        status: 503,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Robots-Tag": "noindex, nofollow",
          "Cache-Control": "no-store",
          "Retry-After": "60",
        },
      });
    }
  },
};
