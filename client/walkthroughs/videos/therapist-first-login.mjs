// Practitioner guide: first login and changing the temporary password.
import { closingCard, stepper, titleCard } from "../lib/cards.mjs";
import { createWorld, installFakeApi } from "../lib/fixtures.mjs";

const GUIDE = "Practitioner guide";
export const title = "Your first login";

export const lines = [
  { id: "00-intro", say: "This guide shows practitioners how to log in for the first time. It uses sample data." },
  { id: "01-email", say: "When Oruma adds you, you receive an email with your login email and a temporary password.", caption: "Oruma emails you a temporary password" },
  { id: "02-password-tab", say: "Go to oruma dot me slash login, and select the Password tab.", caption: "On the login page, select Password" },
  { id: "03-login", say: "Enter your email and the temporary password, then select Login.", caption: "Enter your email and temporary password" },
  { id: "04-change", say: "The first time, you must change your password. Your other tabs unlock after that.", caption: "First, change your temporary password" },
  { id: "05-new", say: "Enter the temporary password, then your new password twice. Select Update password.", caption: "Enter the old password, then the new one twice" },
  { id: "06-again", say: "You're signed out. Log in again with your new password.", caption: "Log in again with your new password" },
  { id: "07-desk", say: "This is your Session desk. It has tabs for your profile, availability, appointments, and case sheets.", caption: "Your Session desk: profile, availability, appointments, notes" },
  { id: "08-safety", say: "Keep your password private. Never share it, or any patient details, by email or chat.", caption: "Keep your password and patient details private" },
  { id: "09-outro", say: "Next, complete your profile so the Oruma team can verify and publish it." },
];

export async function prepare(context) {
  const world = createWorld();
  world.flags.therapistMustChangePassword = true;
  await installFakeApi(context, world);
}

export async function run(ctx) {
  const { frame } = ctx;
  const step = stepper(ctx, lines);
  const email = "anjali.menon@example.com";

  await ctx.card(titleCard(GUIDE, title, "Log in with your temporary password, then choose your own."));
  await step("00-intro");
  await ctx.open("/login");
  await ctx.card(null);
  await ctx.sleep(600);

  await step("01-email", () => ctx.point(frame.getByRole("heading", { name: "Login to Oruma" }), { click: false }));

  const passwordLogin = async () => {
    await ctx.type(frame.getByPlaceholder("you@example.com", { exact: true }), email);
  };
  await step("02-password-tab", () => ctx.point(frame.getByRole("button", { name: "Password", exact: true })));
  await step("03-login", async () => {
    await passwordLogin();
    await ctx.type(frame.getByPlaceholder("Minimum 8 characters"), "Temp-7Q2x9");
    await ctx.point(frame.getByRole("button", { name: "Login", exact: true }));
  });

  const update = frame.getByRole("button", { name: "Update password" });
  await update.waitFor({ timeout: 15000 });
  await step("04-change", () => ctx.point(frame.getByRole("heading", { name: "Change password" }), { click: false }));
  await step("05-new", async () => {
    await ctx.type(frame.getByRole("textbox", { name: /^Current password/ }), "Temp-7Q2x9");
    await ctx.type(frame.getByRole("textbox", { name: /^New password/ }), "Anjali#Oruma26");
    await ctx.type(frame.getByRole("textbox", { name: /^Confirm new password/ }), "Anjali#Oruma26");
    await ctx.point(update);
  });

  await frame.getByRole("button", { name: "Password", exact: true }).waitFor({ timeout: 15000 });
  await step("06-again", async () => {
    await ctx.point(frame.getByRole("button", { name: "Password", exact: true }));
    await passwordLogin();
    await ctx.type(frame.getByPlaceholder("Minimum 8 characters"), "Anjali#Oruma26");
    await ctx.point(frame.getByRole("button", { name: "Login", exact: true }));
  });

  await frame.getByRole("button", { name: "Availability" }).waitFor({ timeout: 15000 });
  await step("07-desk", async () => {
    for (const tab of ["Profile", "Availability", "Appointments", "Case sheets"]) {
      await ctx.point(frame.getByRole("button", { name: tab, exact: true }), { click: false });
    }
  });
  await step("08-safety", () => ctx.unring());

  await ctx.card(closingCard(GUIDE, "You're logged in", "Next: complete your profile for verification."));
  await step("09-outro");
}
