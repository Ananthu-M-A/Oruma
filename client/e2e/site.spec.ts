import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
});

test("home page renders without horizontal overflow", async ({ page }) => {
  await page.goto("/"); await expect(page.locator("main")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
});

test("primary navigation is keyboard reachable", async ({ page }) => {
  await page.goto("/");
  const items = page.getByRole("navigation").first().locator('a[href], button:not([disabled])');
  await items.first().focus(); await expect(items.first()).toBeFocused();
  await page.keyboard.press("Tab"); await expect(page.locator(":focus")).toBeVisible();
});

test("unknown routes recover to the home page", async ({ page }) => {
  await page.goto("/route-that-does-not-exist"); await expect(page).toHaveURL(/\/$/); await expect(page.locator("main")).toBeVisible();
});

test("public routes expose page-specific indexable SEO metadata", async ({ page }) => {
  await page.goto("/contact");
  await expect(page).toHaveTitle(/Contact ORUMA Wellness/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Thiruvananthapuram/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index, follow/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://oruma.me/contact");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Contact ORUMA Wellness/);
  const pageSchema = await page.locator("#oruma-page-schema").evaluate((element) => element.textContent);
  expect(pageSchema).toContain('"WebPage"');
});

test("private dashboards are excluded from search indexing", async ({ page }) => {
  await page.goto("/profile/patient");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
});

test("robots and sitemap expose canonical public URLs", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap: https://oruma.me/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  expect(xml).toContain("https://oruma.me/contact");
  expect(xml).not.toContain("/profile/");
});
