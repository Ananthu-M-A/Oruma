import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
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

  return {
    plugins: [
      react({
        jsxRuntime: "automatic",
      }),
      searchConsolePlugin,
    ],
    server: {
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
