import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@site-builder/icons": path.resolve(__dirname, "src/icons.tsx"),
    },
  },
  // assets/ moved to public/assets/ so /assets/* URLs work
  publicDir: "public",
});
