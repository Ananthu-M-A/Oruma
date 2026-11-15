// Admin guide: adding, verifying and publishing a practitioner.
import { closingCard, stepper, titleCard } from "../lib/cards.mjs";
import { createWorld, installFakeApi, sampleToken, signIn } from "../lib/fixtures.mjs";

const GUIDE = "Admin guide";
export const title = "Adding and publishing a practitioner";

export const lines = [
  { id: "00-intro", say: "This guide shows admins how to add a practitioner and publish their profile. It uses sample data." },
  { id: "01-create", say: "On the admin dashboard, select Create therapist.", caption: "Select Create therapist" },
  { id: "02-email", say: "Enter the practitioner's email, and select Create and email credentials. They receive a temporary password by email.", caption: "Enter their email; Oruma emails a temporary password" },
  { id: "03-manage", say: "The practitioner then logs in and completes their own profile. To review profiles, open Manage therapists.", caption: "Open Manage therapists to review profiles" },
  { id: "04-review", say: "Neha has completed her profile, but she isn't verified yet. Check her evidence against the practitioner verification checklist first.", caption: "Check evidence with the verification checklist" },
  { id: "05-edit", say: "When the checks pass, select Edit, and set Verification status to Verified.", caption: "Select Edit and set Verification status to Verified" },
  { id: "06-save", say: "Select Save therapist.", caption: "Select Save therapist" },
  { id: "07-publish", say: "Now select Publish profile. Neha appears on the website, and patients can book her open slots.", caption: "Select Publish profile: she's now on the website" },
  { id: "08-hide", say: "To take a profile off the website later, select Hide profile. Past bookings are kept.", caption: "Hide profile removes it from the website" },
  { id: "09-outro", say: "That's it. Only publish practitioners whose evidence you've checked." },
];

export async function prepare(context) {
  await installFakeApi(context, createWorld());
  await signIn(context, sampleToken("ADMIN", "admin-sample-1", { email: "admin@example.com" }));
}

export async function run(ctx) {
  const { frame } = ctx;
  const step = stepper(ctx, lines);

  await ctx.card(titleCard(GUIDE, title, "Create the account, verify the evidence, then publish."));
  await step("00-intro");
  await ctx.open("/profile/admin");
  await ctx.card(null);
  await ctx.sleep(600);

  await frame.getByRole("heading", { name: "Operations overview" }).waitFor();
  await step("01-create", () => ctx.point(frame.getByRole("button", { name: "Create therapist" }).first()));
  await frame.getByRole("button", { name: "Create and email credentials" }).waitFor();
  await step("02-email", async () => {
    await ctx.type(frame.getByRole("textbox", { name: "Email address" }), "joseph.mathew@example.com");
    await ctx.point(frame.getByRole("button", { name: "Create and email credentials" }));
    await ctx.sleep(1200);
  });
  await step("03-manage", () => ctx.point(frame.getByRole("link", { name: "Manage therapists" })));

  const card = frame.locator("article, li, section > div").filter({ hasText: "Neha Thomas" }).filter({
    has: frame.getByRole("button", { name: "Edit" }),
  }).last();
  await card.waitFor();
  await step("04-review", () => ctx.point(card.getByText("Neha Thomas").first(), { click: false }));
  await step("05-edit", async () => {
    await ctx.point(card.getByRole("button", { name: "Edit" }));
    await frame.getByRole("button", { name: "Save therapist" }).waitFor();
    await ctx.choose(frame.getByRole("combobox", { name: "Verification status" }), "VERIFIED");
  });
  await step("06-save", () => ctx.point(frame.getByRole("button", { name: "Save therapist" })));
  await step("07-publish", async () => {
    const publish = card.getByRole("button", { name: "Publish profile" });
    await publish.waitFor();
    await ctx.point(publish);
  });
  await step("08-hide", async () => {
    const hide = card.getByRole("button", { name: "Hide profile" });
    await hide.waitFor({ timeout: 10000 });
    await ctx.point(hide, { click: false });
  });

  await ctx.unring();
  await ctx.card(closingCard(GUIDE, "Practitioner published", "Keep each practitioner's evidence private, outside the website."));
  await step("09-outro");
}
