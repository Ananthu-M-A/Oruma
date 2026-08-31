import { expect, Page, test } from "@playwright/test";

function tokenFor(role: "PATIENT" | "THERAPIST" | "ADMIN") {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({ userId: `${role.toLowerCase()}-1`, email: `${role.toLowerCase()}@oruma.test`, role, exp: Math.floor(Date.now() / 1000) + 3600 })}.test`;
}

async function mockFailingDashboardApi(page: Page) {
  await page.route("**/api/**", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Fixture API unavailable" }),
    }),
  );
}

test("patient registration submits and returns to login", async ({ page }) => {
  await page.route("**/api/auth/register", (route) =>
    route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ id: "patient-1", role: "PATIENT" }),
    }),
  );
  await page.goto("/register");
  await page.getByPlaceholder("Your name").fill("Test Patient");
  await page.getByPlaceholder("Contact number").fill("9876543210");
  await page.getByPlaceholder("you@example.com").fill("patient@oruma.test");
  await page.getByPlaceholder("Minimum 8 characters").fill("Password123!");
  await page.getByPlaceholder("Repeat password").fill("Password123!");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByText("Account created. Please login to continue."),
  ).toBeVisible();
});

test("password login stores the session and reaches the patient dashboard", async ({
  page,
}) => {
  const token = tokenFor("PATIENT");
  await page.route("**/api/**", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Fixture API unavailable" }),
    }),
  );
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ accessToken: token }),
    }),
  );
  await page.goto("/login");
  await page.getByRole("button", { name: "Password", exact: true }).click();
  await page.getByPlaceholder("you@example.com").fill("patient@oruma.test");
  await page.getByPlaceholder("Minimum 8 characters").fill("Password123!");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/profile\/patient$/, { timeout: 5000 });
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
});

for (const dashboard of [
  {
    role: "PATIENT" as const,
    path: "/profile/patient",
    heading: "Welcome back",
  },
  {
    role: "THERAPIST" as const,
    path: "/profile/therapist",
    heading: "Session desk",
  },
  {
    role: "ADMIN" as const,
    path: "/profile/admin",
    heading: "Operations overview",
  },
]) {
  test(`${dashboard.role.toLowerCase()} dashboard is protected and renders its shell`, async ({
    page,
  }) => {
    await mockFailingDashboardApi(page);
    await page.addInitScript(
      (token) => localStorage.setItem("oruma_access_token", token),
      tokenFor(dashboard.role),
    );
    await page.goto(dashboard.path);
    await expect(
      page.getByRole("heading", { name: dashboard.heading }),
    ).toBeVisible();
  });
}

test("therapist profile uses controlled choices for standard fields", async ({
  page,
}) => {
  await page.route("**/api/**", (route) => {
    if (route.request().url().endsWith("/api/therapists/me/profile")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "therapist-1",
          name: "Test Therapist",
          email: "therapist@oruma.test",
          title: "Counselling Psychologist",
          tags: ["Anxiety", "English", "Malayalam"],
          areasOfPractice: ["Anxiety"],
          languages: ["English", "Malayalam"],
          experience: 5,
          price: 1200,
          couplePrice: 1800,
          image: null,
          voiceIntro: null,
          qualifications: "MSc Psychology",
          awardingInstitution: "Test University",
          specialization: "Anxiety & Stress",
          consultationType: "Video",
          sessionDurationMinutes: 60,
          verifiedExperienceHours: 500,
          engagementRelationship: "Independent practitioner",
          verificationStatus: "VERIFIED",
          bio: "Supportive care",
          pendingProfileChanges: null,
          nextAvailableSlot: null,
          isActive: true,
          createdAt: new Date().toISOString(),
        }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    });
  });
  await page.addInitScript(
    (token) => localStorage.setItem("oruma_access_token", token),
    tokenFor("THERAPIST"),
  );

  await page.goto("/profile/therapist");
  await expect(page.getByLabel("Exact professional role")).toHaveValue(
    "Counselling Psychologist",
  );
  await expect(page.getByLabel("Years of experience")).toHaveValue("5");
  await expect(page.getByLabel("Qualification")).toHaveValue(
    "MSc Psychology",
  );
  await expect(page.getByLabel("Awarding institution")).toHaveValue(
    "Test University",
  );
  await expect(page.getByLabel("Primary specialization")).toHaveValue(
    "Anxiety & Stress",
  );
  await expect(page.getByLabel("Consultation type")).toHaveValue("Video");
  await expect(page.getByLabel("Session duration (minutes)")).toHaveValue("60");
  await expect(page.getByLabel(/Registration authority/i)).toHaveValue("");
  await expect(page.getByText(/500 verified hours/i)).toBeVisible();
  await expect(page.getByText(/Independent practitioner/i)).toBeVisible();
  await expect(
    page.locator('details[aria-label="Areas of practice options"]'),
  ).toContainText("1 selected");
  await expect(
    page.locator('details[aria-label="Languages options"]'),
  ).toContainText("2 selected");
  await expect(page.getByLabel("Voice intro transcript")).toHaveValue("");
});

test("admin verifies a complete therapist before publishing", async ({
  page,
}) => {
  let therapist = {
    id: "therapist-1",
    name: "Test Therapist",
    email: "therapist@oruma.test",
    title: "Counselling Psychologist",
    tags: ["Anxiety", "English"],
    areasOfPractice: ["Anxiety"],
    languages: ["English"],
    experience: 5,
    price: 1200,
    couplePrice: null,
    image: null,
    voiceIntro: null,
    qualifications: "MSc Psychology",
    awardingInstitution: "University of Kerala",
    specialization: "Anxiety & Stress",
    consultationType: "Video",
    sessionDurationMinutes: 60,
    verifiedExperienceHours: 500,
    engagementRelationship: "Independent practitioner",
    verificationStatus: "UNVERIFIED",
    bio: "Supportive care",
    pendingProfileChanges: null,
    nextAvailableSlot: null,
    isActive: false,
    archivedAt: null,
    createdAt: new Date().toISOString(),
  };
  const updatePayloads: Record<string, unknown>[] = [];

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = request.url();

    if (
      request.method() === "PATCH" &&
      url.endsWith("/api/therapists/therapist-1")
    ) {
      const payload = request.postDataJSON() as Record<string, unknown>;
      updatePayloads.push(payload);
      therapist = { ...therapist, ...payload };
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(therapist),
      });
    }

    if (url.endsWith("/api/therapists/admin")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([therapist]),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    });
  });
  await page.addInitScript(
    (token) => localStorage.setItem("oruma_access_token", token),
    tokenFor("ADMIN"),
  );

  await page.goto("/profile/admin/therapists");
  await expect(page.getByText("UNVERIFIED", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish profile" })).toBeDisabled();
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Verification status").selectOption("VERIFIED");
  await page.getByRole("button", { name: "Save therapist" }).click();
  await expect.poll(() => updatePayloads.length).toBe(1);
  expect(updatePayloads[0]).toEqual(
    expect.objectContaining({ verificationStatus: "VERIFIED" }),
  );
  expect(updatePayloads[0]).not.toHaveProperty("isActive");
  await expect(page.getByRole("button", { name: "Publish profile" })).toBeEnabled();
  await page.getByRole("button", { name: "Publish profile" }).click();
  await expect
    .poll(() => updatePayloads[1])
    .toEqual({ isActive: true });
});

test("booking dialog opens for a live slot and can be cancelled with Escape", async ({
  page,
}) => {
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
    awardingInstitution: "Example University",
    verifiedExperienceHours: null,
    specialization: "Anxiety",
    consultationType: "Video",
    verificationStatus: "VERIFIED",
    bio: "Supportive care",
    nextAvailableSlot: slot.startTime,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  await page.route("**/api/therapists/therapist-1", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(therapist),
    }),
  );
  await page.route("**/api/availability/therapist-1", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([slot]),
    }),
  );
  await page.goto("/therapists/therapist-1");
  await page.getByRole("button", { name: /^Open Slot/ }).click();
  await page.getByRole("button", { name: "Book selected slot" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
