import { expect, test } from "@playwright/test";

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
