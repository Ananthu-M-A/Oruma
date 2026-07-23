import { defineConfig, devices } from "@playwright/test";

const browserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL === "chrome" ? "chrome" : process.env.PLAYWRIGHT_BROWSER_CHANNEL === "msedge" ? "msedge" : undefined;
export default defineConfig({
  testDir: "./e2e", fullyParallel: true, retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://127.0.0.1:4173", trace: "on-first-retry" },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], channel: browserChannel } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"], channel: browserChannel } },
  ],
});
