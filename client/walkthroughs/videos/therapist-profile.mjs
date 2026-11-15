// Practitioner guide: completing and updating your profile.
import { closingCard, stepper, titleCard } from "../lib/cards.mjs";
import { createWorld, installFakeApi, sampleToken, signIn } from "../lib/fixtures.mjs";

const GUIDE = "Practitioner guide";
export const title = "Completing your profile";

export const lines = [
  { id: "00-intro", say: "This guide shows practitioners how to complete their profile. It uses sample data." },
  { id: "01-profile", say: "Open the Profile tab. Patients read this before they book, so keep it complete and accurate.", caption: "Open Profile: patients read it before booking" },
  { id: "02-role", say: "Check your name, your exact professional role, and your years of experience.", caption: "Check your name, role and experience" },
  { id: "03-fees", say: "Set your fees. Leave the couple fee blank if you don't offer couple sessions.", caption: "Set your fees (couple fee is optional)" },
  { id: "04-media", say: "Add a clear profile photo. A short voice introduction is optional but helps patients choose.", caption: "Add a photo and an optional voice intro" },
  { id: "05-lists", say: "Choose your qualification, specialization, areas of practice, and languages from the lists.", caption: "Choose qualification, areas of practice and languages" },
  { id: "06-registration", say: "If your role is regulated, such as Clinical Psychologist, add your registration number and authority.", caption: "Regulated roles: add your registration details" },
  { id: "07-bio", say: "Write a short bio in plain language: who you help, and how.", caption: "Write a short, plain-language bio" },
  { id: "08-save", say: "Select Save profile. Your changes go to the Oruma team for review before they appear on the website.", caption: "Select Save profile; Oruma reviews changes" },
  { id: "09-outro", say: "Next, add the times when patients can book you." },
];

export async function prepare(context) {
  await installFakeApi(context, createWorld());
  await signIn(context, sampleToken("THERAPIST", "therapist-user-1", { email: "anjali.menon@example.com" }));
}

export async function run(ctx) {
  const { frame } = ctx;
  const step = stepper(ctx, lines);

  await ctx.card(titleCard(GUIDE, title, "Your profile is how patients choose you."));
  await step("00-intro");
  await ctx.open("/profile/therapist");
  await ctx.card(null);
  await ctx.sleep(600);

  await frame.getByRole("button", { name: "Save profile" }).waitFor();
  await step("01-profile", () => ctx.point(frame.getByRole("button", { name: "Profile", exact: true })));
  await step("02-role", async () => {
    await ctx.point(frame.getByRole("textbox", { name: "Name" }), { click: false });
    await ctx.point(frame.getByRole("combobox", { name: "Exact professional role" }), { click: false });
    await ctx.point(frame.getByRole("spinbutton", { name: "Years of experience" }), { click: false });
  });
  await step("03-fees", async () => {
    await ctx.type(frame.getByRole("spinbutton", { name: "Individual fee" }), "1300");
    await ctx.point(frame.getByRole("spinbutton", { name: /^Couple fee/ }), { click: false });
  });
  await step("04-media", async () => {
    await ctx.point(frame.getByRole("button", { name: "Choose Profile image" }), { click: false });
    await ctx.point(frame.getByRole("button", { name: "Choose Voice intro" }), { click: false });
  });
  await step("05-lists", async () => {
    await ctx.point(frame.getByRole("combobox", { name: "Qualification" }), { click: false });
    await ctx.point(frame.getByRole("group", { name: "Areas of practice options" }), { click: false });
    await ctx.point(frame.getByRole("group", { name: "Languages options" }), { click: false });
  });
  await step("06-registration", () =>
    ctx.point(frame.getByRole("textbox", { name: /^Professional registration number/ }), { click: false }),
  );
  await step("07-bio", () => ctx.point(frame.getByRole("textbox", { name: "Bio" }), { click: false }));
  await step("08-save", async () => {
    await ctx.point(frame.getByRole("button", { name: "Save profile" }));
    await ctx.sleep(1500);
  });

  await ctx.unring();
  await ctx.card(closingCard(GUIDE, "Profile saved", "The Oruma team reviews it, then verifies and publishes it."));
  await step("09-outro");
}
