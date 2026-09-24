import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
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
  };
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
            logo: `${website}/assets/oruma-main-logo.webp`,
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

  return {
    plugins: [
      react({
        jsxRuntime: "automatic",
      }),
      searchConsolePlugin,
      businessStructuredDataPlugin,
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
