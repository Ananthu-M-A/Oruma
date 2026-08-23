import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
});

test("home page renders without horizontal overflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    ),
  ).toBe(false);
});

test("home page follows the requested care journey and exposes working destinations", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main")).toBeVisible({ timeout: 20000 });
  const headings = page.locator("main h1, main h2");
  const headingText = await headings.allTextContents();
  const expectedOrder = [
    "Healing starts here with Oruma.",
    "What brings you here today?",
    "A Little About Oruma",
    "Our Counselling Services",
    "Common Concerns We Help With",
    "Meet Our Psychologists",
    "Learn. Grow. Transform.",
    "What People Say About Oruma",
    "Your healing journey can begin today.",
  ];
  let previousIndex = -1;
  for (const expected of expectedOrder) {
    const index = headingText.findIndex((text) => text.trim() === expected);
    expect(index, `${expected} should appear on the home page`).toBeGreaterThan(
      previousIndex,
    );
    previousIndex = index;
  }

  await expect(
    page.getByRole("link", { name: "Find Your Psychologist" }).first(),
  ).toHaveAttribute("href", "/therapists");
  await expect(
    page.getByRole("link", { name: /Get Started/ }),
  ).toHaveAttribute("href", "/find-your-psychologist");
  await expect(
    page.locator('main a[href="/services/parenting-support"]').first(),
  ).toHaveAttribute("href", "/services/parenting-support");
});

test("primary navigation is keyboard reachable", async ({ page }) => {
  await page.goto("/");
  const items = page
    .getByRole("navigation")
    .first()
    .locator("a[href], button:not([disabled])");
  await items.first().focus();
  await expect(items.first()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
});

test("unknown routes recover to the home page", async ({ page }) => {
  await page.goto("/route-that-does-not-exist");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("main")).toBeVisible();
});

test("public routes expose page-specific indexable SEO metadata", async ({
  page,
}) => {
  await page.goto("/contact");
  await expect(page).toHaveTitle(/Contact Oruma/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /practitioner selection/,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /index, follow/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://oruma.me/contact",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /Contact Oruma/,
  );
  const pageSchema = await page
    .locator("#oruma-page-schema")
    .evaluate((element) => element.textContent);
  expect(pageSchema).toContain('"WebPage"');
});

test("private dashboards are excluded from search indexing", async ({
  page,
}) => {
  await page.goto("/profile/patient");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
});

test("robots and sitemap expose canonical public URLs", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain(
    "Sitemap: https://oruma.me/sitemap.xml",
  );

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  expect(xml).toContain("https://oruma.me/contact");
  expect(xml).not.toContain("/profile/");
});

test("legal routes are public, crawlable, and disclose the individual operator", async ({
  page,
}) => {
  for (const route of [
    "/terms",
    "/privacy-policy",
    "/refund-policy",
    "/cancellation-policy",
    "/service-delivery-policy",
  ]) {
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(
      page.getByText(/brand operated by RANJINI R/i).first(),
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /index, follow/,
    );
  }
});

test("official contact links match the centralized phone, WhatsApp, and email", async ({
  page,
}) => {
  await page.goto("/contact");
  await expect(
    page.getByRole("link", { name: "+91-8157039987", exact: true }).first(),
  ).toHaveAttribute("href", "tel:+918157039987");
  await expect(
    page.locator('a[href^="mailto:oruma9987@gmail.com"]').first(),
  ).toContainText("oruma9987@gmail.com");
  await expect(
    page.locator('a[href^="https://wa.me/918157039987"]').first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Browse and book online", exact: true }),
  ).toHaveAttribute("href", "/therapists");
});

test("core public and policy pages fit desktop and mobile viewports", async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const route of [
    "/about",
    "/contact",
    "/find-your-psychologist",
    "/services",
    "/programs",
    "/services/parenting-support",
    "/services/child-teen-counselling",
    "/services/family-counselling",
    "/services/postpartum-support",
    "/online-counselling",
    "/consultation",
    "/therapists",
    "/terms",
    "/privacy-policy",
    "/refund-policy",
    "/cancellation-policy",
    "/service-delivery-policy",
  ]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      ),
      `${route} should not overflow horizontally`,
    ).toBe(false);
  }
});

test("structured data identifies the brand and individual operator without company schema", async ({
  page,
}) => {
  await page.goto("/");
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const businessSchema = schemas.find((schema) =>
    schema.includes('"ProfessionalService"'),
  );
  expect(businessSchema).toBeTruthy();
  expect(businessSchema).toContain('"name":"Oruma"');
  expect(businessSchema).toContain('"name":"RANJINI R"');
  expect(businessSchema).toContain('"value":"Individual-owned business"');
  expect(businessSchema).not.toMatch(/"(?:Organization|LocalBusiness)"/);
});
