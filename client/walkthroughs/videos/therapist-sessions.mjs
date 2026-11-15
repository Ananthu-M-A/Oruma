// Practitioner guide: appointments, joining sessions and case sheets.
import { closingCard, stepper, titleCard } from "../lib/cards.mjs";
import { createWorld, installFakeApi, sampleToken, signIn } from "../lib/fixtures.mjs";

const GUIDE = "Practitioner guide";
export const title = "Running sessions and writing case notes";

export const lines = [
  { id: "00-intro", say: "This guide shows practitioners how to run sessions and keep case notes. It uses sample data." },
  { id: "01-tab", say: "Open the Appointments tab to see your booked sessions.", caption: "Open Appointments" },
  { id: "02-list", say: "Each booking shows the patient, the date and time in Indian Standard Time, and its status.", caption: "Each booking: patient, time (IST) and status" },
  { id: "03-join", say: "The care team adds the session link. At the session time, select Join session.", caption: "At the session time, select Join session" },
  { id: "04-status", say: "After a session, update its status, for example to Completed.", caption: "After the session, update its status" },
  { id: "05-cases", say: "Write your notes under Case sheets. Patients can't see them. Only you and authorised Oruma staff can.", caption: "Open Case sheets: private session notes" },
  { id: "06-fill", say: "Choose the appointment, then add the presenting concern, your notes, the plan, and the follow-up.", caption: "Choose the appointment and write your notes" },
  { id: "07-save", say: "Select Save case sheet. You can update it after later sessions.", caption: "Select Save case sheet" },
  { id: "08-privacy", say: "Keep clinical notes here only. Don't put them in WhatsApp, email, or payment notes.", caption: "Keep clinical notes in Oruma only" },
  { id: "09-outro", say: "That's it. Thank you for caring for Oruma's patients." },
];

export async function prepare(context) {
  await installFakeApi(context, createWorld());
  await signIn(context, sampleToken("THERAPIST", "therapist-user-1", { email: "anjali.menon@example.com" }));
}

export async function run(ctx) {
  const { frame } = ctx;
  const step = stepper(ctx, lines);

  await ctx.card(titleCard(GUIDE, title, "From joining the call to writing your notes."));
  await step("00-intro");
  await ctx.open("/profile/therapist");
  await ctx.card(null);
  await ctx.sleep(600);

  await frame.getByRole("button", { name: "Appointments" }).waitFor();
  await step("01-tab", () => ctx.point(frame.getByRole("button", { name: "Appointments", exact: true })));
  const priya = frame.getByRole("heading", { name: "Priya Nair" });
  await priya.waitFor();
  await step("02-list", () => ctx.point(frame.getByRole("heading", { name: "Arjun Krishnan" }), { click: false }));
  await step("03-join", () => ctx.point(frame.getByRole("link", { name: "Join session" }).first(), { click: false }));
  await step("04-status", () =>
    ctx.point(frame.getByRole("combobox", { name: "Update status for Meera Suresh" }), { click: false }),
  );

  await step("05-cases", () => ctx.point(frame.getByRole("button", { name: "Case sheets", exact: true })));
  await frame.getByRole("button", { name: "Save case sheet" }).waitFor();
  await step("06-fill", async () => {
    await ctx.choose(frame.getByRole("combobox", { name: "Appointment" }), "b6f1a2c3-0000-4000-8000-00000000a103");
    await ctx.type(frame.getByRole("textbox", { name: "Presenting concern" }), "Work stress affecting sleep.");
    await ctx.type(frame.getByRole("textbox", { name: "Clinical notes" }), "Explored triggers; practised a breathing routine.");
    await ctx.type(frame.getByRole("textbox", { name: "Intervention plan" }), "Sleep diary and wind-down routine.");
    await ctx.type(frame.getByRole("textbox", { name: "Follow-up plan" }), "Review in two weeks.");
  });
  await step("07-save", () => ctx.point(frame.getByRole("button", { name: "Save case sheet" })));
  await step("08-privacy", () => ctx.unring());

  await ctx.card(closingCard(GUIDE, "Session complete", "Your notes are saved privately in Oruma."));
  await step("09-outro");
}
