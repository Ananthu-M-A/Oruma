import { expect, Page, test } from "@playwright/test";

function tokenFor(role: "PATIENT" | "THERAPIST" | "ADMIN") {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({ userId: `${role.toLowerCase()}-1`, email: `${role.toLowerCase()}@oruma.test`, role, exp: Math.floor(Date.now() / 1000) + 3600 })}.test`;
}

async function mockFailingDashboardApi(page: Page) {
  await page.route("**/api/**", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Fixture API unavailable" }) }),
  );
}

test("patient registration submits and returns to login", async ({ page }) => {
  await page.route("**/api/auth/register", (route) =>
    route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: "patient-1", role: "PATIENT" }) }),
  );
  await page.goto("/register");
  await page.getByPlaceholder("Your name").fill("Test Patient");
  await page.getByPlaceholder("Contact number").fill("9876543210");
  await page.getByPlaceholder("you@example.com").fill("patient@oruma.test");
  await page.getByPlaceholder("Minimum 8 characters").fill("Password123!");
  await page.getByPlaceholder("Repeat password").fill("Password123!");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText("Account created. Please login to continue.")).toBeVisible();
});

test("password login stores the session and reaches the patient dashboard", async ({ page }) => {
  const token = tokenFor("PATIENT");
  await page.route("**/api/**", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Fixture API unavailable" }) }),
  );
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ accessToken: token }) }),
  );
  await page.goto("/login");
  await page.getByRole("button", { name: "Password", exact: true }).click();
  await page.getByPlaceholder("you@example.com").fill("patient@oruma.test");
  await page.getByPlaceholder("Minimum 8 characters").fill("Password123!");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/profile\/patient$/, { timeout: 5000 });
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

for (const dashboard of [
  { role: "PATIENT" as const, path: "/profile/patient", heading: "Welcome back" },
  { role: "THERAPIST" as const, path: "/profile/therapist", heading: "Session desk" },
  { role: "ADMIN" as const, path: "/profile/admin", heading: "Operations overview" },
]) {
  test(`${dashboard.role.toLowerCase()} dashboard is protected and renders its shell`, async ({ page }) => {
    await mockFailingDashboardApi(page);
    await page.addInitScript((token) => localStorage.setItem("oruma_access_token", token), tokenFor(dashboard.role));
    await page.goto(dashboard.path);
    await expect(page.getByRole("heading", { name: dashboard.heading })).toBeVisible();
  });
}

test("booking dialog opens for a live slot and can be cancelled with Escape", async ({ page }) => {
  const startTime = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const slot = {
    id: "slot-1",
    startTime: startTime.toISOString(),
    endTime: new Date(startTime.getTime() + 60 * 60 * 1000).toISOString(),
    status: "AVAILABLE",
    createdAt: new Date().toISOString(),
  };
  const therapist = {
    id: "therapist-1",
    name: "Test Therapist",
    title: "Psychologist",
    tags: ["Anxiety"],
    experience: 60,
    group: 1,
    price: 1200,
    couplePrice: null,
    image: null,
    voiceIntro: null,
    qualifications: "MSc Psychology",
    specialization: "Anxiety",
    bio: "Supportive care",
    nextAvailableSlot: slot.startTime,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  await page.route("**/api/therapists/therapist-1", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(therapist) }),
  );
  await page.route("**/api/availability/therapist-1", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([slot]) }),
  );
  await page.goto("/therapists/therapist-1");
  await page.getByRole("button", { name: /^Open Slot/ }).click();
  await page.getByRole("button", { name: "Book selected slot" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
