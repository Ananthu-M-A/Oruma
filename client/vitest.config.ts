import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@site-builder/icons": path.resolve(__dirname, "src/icons.tsx") } },
  test: { environment: "jsdom", setupFiles: ["./src/test/setup.ts"], css: true, include: ["**/*.test.{ts,tsx}"] },
});
