// Practitioner guide: adding the times patients can book.
import { closingCard, stepper, titleCard } from "../lib/cards.mjs";
import { createWorld, installFakeApi, sampleToken, signIn } from "../lib/fixtures.mjs";

const GUIDE = "Practitioner guide";
export const title = "Adding your availability";

export const lines = [
  { id: "00-intro", say: "This guide shows practitioners how to add the times patients can book. It uses sample data." },
  { id: "01-tab", say: "Open the Availability tab.", caption: "Open Availability" },
  { id: "02-list", say: "Your upcoming open slots are listed here, in Indian Standard Time.", caption: "Your open slots, in IST" },
  { id: "03-times", say: "To add a slot, enter the start time. The end time fills in from your session length. Slots must start at least twenty-four hours from now.", caption: "Enter the start time (24+ hours ahead)" },
  { id: "04-add", say: "Select Add. The slot appears in your list, and patients can book it straight away.", caption: "Select Add: patients can book it now" },
  { id: "05-edit", say: "To change a slot, select the pencil. To remove it, select the bin.", caption: "Edit or delete a slot" },
  { id: "06-booked", say: "Once a patient books a slot, it can't be deleted. Contact the care team if you need to change a booked session.", caption: "Booked slots: contact the care team to change" },
  { id: "07-outro", say: "Add slots regularly, so patients can always find a time with you." },
];

export async function prepare(context) {
  await installFakeApi(context, createWorld());
  await signIn(context, sampleToken("THERAPIST", "therapist-user-1", { email: "anjali.menon@example.com" }));
}

/** A datetime-local value N days ahead at the given IST hour. */
function istInput(daysAhead, hour) {
  const date = new Date(Date.now() + daysAhead * 86_400_000);
  const ist = new Date(date.getTime() + 5.5 * 3_600_000);
  const day = ist.toISOString().slice(0, 10);
  return `${day}T${String(hour).padStart(2, "0")}:00`;
}

export async function run(ctx) {
  const { frame } = ctx;
  const step = stepper(ctx, lines);

  await ctx.card(titleCard(GUIDE, title, "Patients can only book the times you add."));
  await step("00-intro");
  await ctx.open("/profile/therapist");
  await ctx.card(null);
  await ctx.sleep(600);

  await frame.getByRole("button", { name: "Availability" }).waitFor();
  await step("01-tab", () => ctx.point(frame.getByRole("button", { name: "Availability", exact: true })));
  await frame.getByRole("button", { name: "Add" }).waitFor();
  await step("02-list", () =>
    ctx.point(frame.getByRole("button", { name: /^Edit slot/ }).first(), { click: false }),
  );
  await step("03-times", async () => {
    const start = frame.getByRole("textbox", { name: "Start (IST)" });
    const end = frame.getByRole("textbox", { name: "End (IST)" });
    await ctx.point(start);
    await start.fill(istInput(5, 14));
    await ctx.sleep(500);
    await ctx.point(end, { click: false });
  });
  await step("04-add", () => ctx.point(frame.getByRole("button", { name: "Add", exact: true })));
  await step("05-edit", async () => {
    await ctx.point(frame.getByRole("button", { name: /^Edit slot/ }).first(), { click: false });
    await ctx.point(frame.getByRole("button", { name: /^Delete slot/ }).first(), { click: false });
  });
  await step("06-booked", () => ctx.unring());

  await ctx.card(closingCard(GUIDE, "Your times are open", "Next: running your sessions and writing case notes."));
  await step("07-outro");
}
