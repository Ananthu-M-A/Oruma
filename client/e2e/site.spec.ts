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

test("unknown routes show a non-indexable not-found page", async ({ page }) => {
  await page.goto("/route-that-does-not-exist");
  await expect(page).toHaveURL(/\/route-that-does-not-exist$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /couldn.t find that page/i }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
});

const seoServicePaths = [
  "/services/relationship-counselling",
  "/services/marriage-counselling",
  "/services/trust-healing",
  "/services/breakup-recovery",
  "/services/premarital-counselling",
  "/services/nri-online-counselling",
];

test("SEO service pages render one heading, FAQ schema and no overflow", async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const path of seoServicePaths) {
    await page.goto(path);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://oruma.me${path}`,
    );
    const schema = await page
      .locator("#oruma-page-schema")
      .evaluate((element) => element.textContent ?? "");
    expect(schema).toContain('"FAQPage"');
    expect(schema).toContain('"BreadcrumbList"');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      ),
      `${path} should not scroll horizontally`,
    ).toBe(false);
  }
});

test("the hypnotherapy page stays out of search until it is approved", async ({
  page,
}) => {
  await page.goto("/services/clinical-hypnotherapy");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
});

test("the WhatsApp button opens a pre-filled chat", async ({ page }) => {
  await page.goto("/services/marriage-counselling");
  const whatsapp = page.getByRole("link", {
    name: "Chat with Oruma on WhatsApp",
  });
  await expect(whatsapp).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/918157039987\?text=.*marriage%20counselling/,
  );
});

test("the contact form sends an enquiry and confirms it", async ({ page }) => {
  let submitted: Record<string, unknown> | null = null;
  await page.route("**/api/enquiries", async (route) => {
    submitted = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({ received: true }),
    });
  });

  await page.goto("/contact");
  await page.getByLabel("Your name").fill("Asha");
  await page.getByLabel("Email", { exact: true }).fill("asha@example.com");
  await page
    .getByLabel("Your message")
    .fill("I would like help choosing a counsellor.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByRole("status")).toContainText("message has been sent");
  expect(submitted).toMatchObject({
    name: "Asha",
    email: "asha@example.com",
    consent: true,
    pagePath: "/contact",
  });
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
  expect(xml).toContain("https://oruma.me/services/marriage-counselling");
  expect(xml).not.toContain("/profile/");
  expect(xml).not.toContain("clinical-hypnotherapy");
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

test("public contact offers email, phone and WhatsApp with matching details", async ({
  page,
}) => {
  // Phone and WhatsApp follow publicContact in config/business.json.
  await page.goto("/contact");
  await expect(
    page.getByRole("link", { name: "oruma9987@gmail.com", exact: true }).first(),
  ).toContainText("oruma9987@gmail.com");
  await expect(page.locator('a[href="tel:+918157039987"]')).toHaveCount(1);
  await expect(
    page.locator('main a[href^="https://wa.me/918157039987"]').first(),
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
