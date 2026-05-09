import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
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
});
