// Patient guide: creating an account and logging in with a one-time code.
import { closingCard, stepper, titleCard } from "../lib/cards.mjs";
import { createWorld, installFakeApi } from "../lib/fixtures.mjs";

const GUIDE = "Patient guide";
export const title = "Creating your account and logging in";

export const lines = [
  { id: "00-intro", say: "This guide shows how to create an Oruma account and log in. It uses sample data." },
  { id: "01-login", say: "Go to oruma dot me slash login. If you're new, select Create one here.", caption: "On the login page, select Create one here" },
  { id: "02-details", say: "Enter your full name, phone number, and email address.", caption: "Enter your name, phone number and email" },
  { id: "03-concern", say: "Primary concern is optional. You can leave it blank and share it later, privately.", caption: "Primary concern is optional" },
  { id: "04-password", say: "Choose a password of at least eight characters, and type it again.", caption: "Choose a password (8+ characters) and repeat it" },
  { id: "05-create", say: "Select Create account.", caption: "Select Create account" },
  { id: "06-email", say: "Your account is ready. Patients log in with a one-time code. Enter your email, and select Send login code.", caption: "Enter your email and select Send login code" },
  { id: "07-code", say: "We email you a six-digit code. Enter it, and select Login with code.", caption: "Enter the 6-digit code from your email" },
  { id: "08-dashboard", say: "You're in your dashboard. From here you can book sessions and see your appointments.", caption: "Your dashboard: book sessions and see appointments" },
  { id: "09-personal", say: "Under Personal info, you can update your name, phone, age, and gender at any time.", caption: "Update your details under Personal info" },
  { id: "10-outro", say: "That's it. You're ready to book your first session." },
];

export async function prepare(context) {
  await installFakeApi(context, createWorld());
}

export async function run(ctx) {
  const { frame } = ctx;
  const step = stepper(ctx, lines);

  await ctx.card(titleCard(GUIDE, title, "Sign up once, then log in with a code sent to your email."));
  await step("00-intro");
  await ctx.open("/login");
  await ctx.card(null);
  await ctx.sleep(600);

  await step("01-login", () => ctx.point(frame.getByRole("link", { name: "Create one here" })));
  await frame.getByRole("button", { name: "Create account" }).waitFor();

  await step("02-details", async () => {
    await ctx.type(frame.getByRole("textbox", { name: "Full name" }), "Kavya Raj");
    await ctx.type(frame.getByRole("textbox", { name: "Contact number" }), "9800000021");
    await ctx.type(frame.getByRole("textbox", { name: "Email address" }), "kavya.raj@example.com");
  });
  await step("03-concern", () =>
    ctx.point(frame.getByRole("textbox", { name: "Primary concern" }), { click: false }),
  );
  await step("04-password", async () => {
    await ctx.unring();
    await ctx.type(frame.getByRole("textbox", { name: /^Password/ }), "Kavya#2026");
    await ctx.type(frame.getByRole("textbox", { name: /^Confirm/ }), "Kavya#2026");
  });
  await step("05-create", () => ctx.point(frame.getByRole("button", { name: "Create account" })));

  const sendCode = frame.getByRole("button", { name: "Send login code" });
  await sendCode.waitFor();
  await step("06-email", async () => {
    await ctx.type(frame.getByPlaceholder("you@example.com or +91..."), "kavya.raj@example.com");
    await ctx.point(sendCode);
  });
  await step("07-code", async () => {
    await ctx.type(frame.getByPlaceholder("123456"), "482913");
    await ctx.point(frame.getByRole("button", { name: "Login with code" }));
  });

  await frame.getByRole("heading", { name: /Welcome back/ }).waitFor({ timeout: 15000 });
  await step("08-dashboard", () =>
    ctx.point(frame.getByRole("link", { name: "Book session" }), { click: false }),
  );
  await step("09-personal", async () => {
    await ctx.point(frame.getByRole("button", { name: "Personal info" }));
    await ctx.sleep(800);
    await ctx.scroll(220);
  });

  await ctx.unring();
  await ctx.card(closingCard(GUIDE, "You're all set", "Next: find a practitioner and book your first session."));
  await step("10-outro");
}
