import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

import {
  SITE_URL,
  absoluteImageUrl,
  buildPageSchema,
  canonicalUrlFor,
  gatedSeoRoutes,
  indexablePublicPaths,
  notFoundSeo,
  privateSeoRoutes,
  publicSeoRoutes,
  type PageSeo,
} from "./src/lib/seo-routes";

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function replaceMeta(
  html: string,
  attribute: "name" | "property",
  key: string,
  content: string,
) {
  const tag = `<meta ${attribute}="${key}" content="${escapeHtmlAttribute(content)}" />`;
  const expression = new RegExp(
    `<meta\\s+${attribute}="${key.replace(/[.:]/g, "\\$&")}"[\\s\\S]*?\\/?>`,
    "i",
  );
  return expression.test(html)
    ? html.replace(expression, tag)
    : html.replace("</head>", `${tag}</head>`);
}

function renderSitemap() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = indexablePublicPaths()
    .map(
      (route) =>
        `  <url><loc>${SITE_URL}${route === "/" ? "/" : route}</loc><lastmod>${lastmod}</lastmod></url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function renderSeoHtml(template: string, route: string, seo: PageSeo) {
  const canonicalUrl = canonicalUrlFor(route, seo);
  const image = absoluteImageUrl(seo.image);
  const robots = seo.noIndex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  let html = template.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtmlAttribute(seo.title)}</title>`,
  );
  html = html.replace(
    /<link\s+rel="canonical"[\s\S]*?\/>/i,
    `<link rel="canonical" href="${escapeHtmlAttribute(canonicalUrl)}" />`,
  );
  html = replaceMeta(html, "name", "description", seo.description);
  html = replaceMeta(html, "name", "robots", robots);
  html = replaceMeta(html, "name", "googlebot", robots);
  html = replaceMeta(html, "property", "og:title", seo.title);
  html = replaceMeta(html, "property", "og:description", seo.description);
  html = replaceMeta(html, "property", "og:type", seo.type ?? "website");
  html = replaceMeta(html, "property", "og:url", canonicalUrl);
  html = replaceMeta(html, "property", "og:image", image);
  html = replaceMeta(html, "name", "twitter:title", seo.title);
  html = replaceMeta(html, "name", "twitter:description", seo.description);
  html = replaceMeta(html, "name", "twitter:image", image);
  if (seo.image) {
    // Hero images have their own dimensions; drop the default image's.
    html = html
      .replace(/<meta\s+property="og:image:width"[\s\S]*?\/>\s*/i, "")
      .replace(/<meta\s+property="og:image:height"[\s\S]*?\/>\s*/i, "");
  }
  const schema = JSON.stringify(buildPageSchema(route, seo)).replaceAll(
    "<",
    "\\u003c",
  );
  return html.replace(
    "</head>",
    `<script type="application/ld+json" id="oruma-page-schema">${schema}</script></head>`,
  );
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const configuredApiUrl = env.VITE_API_URL?.trim();
  if (
    mode === "production" &&
    configuredApiUrl &&
    (!configuredApiUrl.startsWith("https://") ||
      /localhost|127\.0\.0\.1/i.test(configuredApiUrl))
  ) {
    throw new Error(
      "Production VITE_API_URL must be an HTTPS public API origin.",
    );
  }
  const businessConfig = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../config/business.json"), "utf8"),
  ) as {
    brandName: string;
    website: string;
    operatorLegalName: string;
    businessStructure: string;
    serviceDescription: string;
    address: {
      lines: string[];
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
    supportPhone: { e164: string };
    emails: { support: string };
    socialProfiles?: string[];
    googleBusinessProfile?: { mapsUrl: string | null };
  };
  const mapsUrl = businessConfig.googleBusinessProfile?.mapsUrl || null;
  const sameAs = [
    ...(businessConfig.socialProfiles ?? []),
    ...(mapsUrl ? [mapsUrl] : []),
  ];
  const searchConsoleVerification = env.VITE_GOOGLE_SITE_VERIFICATION?.trim();
  const searchConsolePlugin: Plugin = {
    name: "oruma-search-console-verification",
    transformIndexHtml(html) {
      const tag = searchConsoleVerification
        ? `<meta name="google-site-verification" content="${escapeHtmlAttribute(searchConsoleVerification)}" />`
        : "";
      return html.replace("<!-- search-console-verification -->", tag);
    },
  };
  const businessStructuredDataPlugin: Plugin = {
    name: "oruma-business-structured-data",
    transformIndexHtml(html) {
      const website = businessConfig.website.replace(/\/$/, "");
      const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "ProfessionalService",
            "@id": `${website}/#business`,
            name: businessConfig.brandName,
            legalName: businessConfig.operatorLegalName,
            description: businessConfig.serviceDescription,
            url: `${website}/`,
            logo: `${website}/assets/Oruma_Primary_Logo.png`,
            image: `${website}/assets/home-lady-striped-shirt-v2.webp`,
            telephone: businessConfig.supportPhone.e164,
            email: businessConfig.emails.support,
            brand: { "@id": `${website}/#brand` },
            address: {
              "@type": "PostalAddress",
              streetAddress: businessConfig.address.lines
                .slice(0, 3)
                .join(", "),
              addressLocality: businessConfig.address.addressLocality,
              addressRegion: businessConfig.address.addressRegion,
              postalCode: businessConfig.address.postalCode,
              addressCountry: businessConfig.address.addressCountry,
            },
            additionalProperty: [
              {
                "@type": "PropertyValue",
                name: "Website operator",
                value: businessConfig.operatorLegalName,
                valueReference: { "@id": `${website}/#operator` },
              },
              {
                "@type": "PropertyValue",
                name: "Business structure",
                value: businessConfig.businessStructure,
              },
            ],
            areaServed: "India",
            ...(sameAs.length ? { sameAs } : {}),
            ...(mapsUrl ? { hasMap: mapsUrl } : {}),
            contactPoint: {
              "@type": "ContactPoint",
              telephone: businessConfig.supportPhone.e164,
              email: businessConfig.emails.support,
              contactType: "customer support",
            },
          },
          {
            "@type": "Brand",
            "@id": `${website}/#brand`,
            name: businessConfig.brandName,
            url: `${website}/`,
          },
          {
            "@type": "Person",
            "@id": `${website}/#operator`,
            name: businessConfig.operatorLegalName,
          },
          {
            "@type": "WebSite",
            "@id": `${website}/#website`,
            url: `${website}/`,
            name: businessConfig.brandName,
            publisher: { "@id": `${website}/#business` },
            inLanguage: "en-IN",
          },
        ],
      };

      return html.replace(
        "<!-- business-structured-data -->",
        `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`,
      );
    },
  };

  // Writes one HTML file per public route with that route's title, meta tags,
  // canonical URL and JSON-LD already in place, so crawlers and link previews
  // (WhatsApp, Facebook, LinkedIn) see the right page without running
  // JavaScript. Vercel serves /about from about.html (cleanUrls) before any
  // rewrite applies. Also generates sitemap.xml and 404.html from the same
  // route list, so they can't drift apart.
  const prerenderSeoPlugin: Plugin = {
    name: "oruma-prerender-seo",
    apply: "build",
    closeBundle() {
      const outDir = path.resolve(__dirname, "dist");
      const templatePath = path.join(outDir, "index.html");
      if (!fs.existsSync(templatePath)) return;
      const template = fs.readFileSync(templatePath, "utf8");

      const writePage = (route: string, seo: PageSeo, fileName: string) => {
        const html = renderSeoHtml(template, route, seo);
        const target = path.join(outDir, fileName);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, html);
      };

      const routes = {
        ...publicSeoRoutes,
        ...gatedSeoRoutes,
        ...privateSeoRoutes,
      };
      for (const [route, seo] of Object.entries(routes)) {
        if (seo.canonicalPath && seo.canonicalPath !== route) continue;
        writePage(route, seo, route === "/" ? "index.html" : `${route.slice(1)}.html`);
      }
      writePage("/404", notFoundSeo, "404.html");
      fs.writeFileSync(path.join(outDir, "sitemap.xml"), renderSitemap());
    },
  };

  // The dev server (also used by the browser tests) serves the same sitemap.
  const devSitemapPlugin: Plugin = {
    name: "oruma-dev-sitemap",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/sitemap.xml", (_req, res) => {
        res.setHeader("Content-Type", "application/xml; charset=utf-8");
        res.end(renderSitemap());
      });
    },
  };

  return {
    plugins: [
      react({
        jsxRuntime: "automatic",
      }),
      searchConsolePlugin,
      businessStructuredDataPlugin,
      prerenderSeoPlugin,
      devSitemapPlugin,
    ],
    server: {
      fs: {
        allow: [path.resolve(__dirname, "..")],
      },
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (proxyPath) => proxyPath.replace(/^\/api/, ""),
        },
      },
    },
    resolve: {
      alias: {
        "@site-builder/icons": path.resolve(__dirname, "src/icons.tsx"),
      },
    },
    // assets/ moved to public/assets/ so /assets/* URLs work
    publicDir: "public",
  };
});
