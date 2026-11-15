// Admin guide: handling a new paid booking.
import { closingCard, stepper, titleCard } from "../lib/cards.mjs";
import { createWorld, installFakeApi, sampleToken, signIn } from "../lib/fixtures.mjs";

const GUIDE = "Admin guide";
export const title = "Handling a new booking";

export const lines = [
  { id: "00-intro", say: "This guide shows admins how to handle a new paid booking. It uses sample data." },
  { id: "01-tab", say: "Open the Appointments tab. New bookings are at the top.", caption: "Open Appointments" },
  { id: "02-paid", say: "Arjun has paid for a session with Anjali. Only confirm a booking once it shows as paid.", caption: "Check the booking is paid" },
  { id: "03-confirm", say: "Select Confirm paid appointment.", caption: "Select Confirm paid appointment" },
  { id: "04-message", say: "Send the confirmation from the official WhatsApp Business account. Then select Mark confirmation sent.", caption: "Send the confirmation, then Mark confirmation sent" },
  { id: "05-link", say: "Create a new meeting in Google Meet or Zoom. Paste its link here, and select Save session link. Oruma emails the patient that the link is ready.", caption: "Paste a new Meet or Zoom link and save it" },
  { id: "06-link-sent", say: "Send the link to the patient, then select Mark link sent.", caption: "Send the link, then Mark link sent" },
  { id: "07-reminder", say: "Before the session, send a reminder and select Mark reminder sent.", caption: "Before the session, send the reminder" },
  { id: "08-notes", say: "Use private staff notes for anything the team should know. Patients and practitioners don't see them.", caption: "Private staff notes are for the team only" },
  { id: "09-outro", say: "That's it. Never reuse a meeting link, and never send clinical details over WhatsApp." },
];

export async function prepare(context) {
  await installFakeApi(context, createWorld());
  await signIn(context, sampleToken("ADMIN", "admin-sample-1", { email: "admin@example.com" }));
}

export async function run(ctx) {
  const { frame } = ctx;
  const step = stepper(ctx, lines);

  await ctx.card(titleCard(GUIDE, title, "Confirm, add the session link, and send reminders."));
  await step("00-intro");
  await ctx.open("/profile/admin");
  await ctx.card(null);
  await ctx.sleep(600);

  await frame.getByRole("button", { name: "Appointments", exact: true }).waitFor();
  await step("01-tab", () => ctx.point(frame.getByRole("button", { name: "Appointments", exact: true })));

  const booking = frame.locator("article").filter({
    has: frame.getByRole("heading", { name: "Arjun Krishnan with Anjali Menon" }),
  });
  await booking.waitFor();
  await step("02-paid", () =>
    ctx.point(booking.getByRole("heading", { name: "Arjun Krishnan with Anjali Menon" }), { click: false }),
  );
  await step("03-confirm", () => ctx.point(booking.getByRole("button", { name: "Confirm paid appointment" })));

  const markConfirmation = booking.getByRole("button", { name: "Mark confirmation sent" });
  await markConfirmation.waitFor();
  await ctx.page.waitForTimeout(500);
  await step("04-message", async () => {
    await ctx.point(booking.getByRole("button", { name: "Open WhatsApp" }), { click: false });
    await ctx.point(markConfirmation);
  });
  await step("05-link", async () => {
    await ctx.type(booking.getByPlaceholder("https://meet.google.com/abc-defg-hij"), "https://meet.google.com/xyz-abcd-efg");
    await ctx.point(booking.getByRole("button", { name: "Save session link" }));
  });
  await step("06-link-sent", async () => {
    await ctx.sleep(800);
    await ctx.point(booking.getByRole("button", { name: "Mark link sent" }));
  });
  await step("07-reminder", async () => {
    await ctx.sleep(800);
    await ctx.point(booking.getByRole("button", { name: "Mark reminder sent" }));
  });
  await step("08-notes", () =>
    ctx.point(booking.getByRole("textbox", { name: "Private staff notes" }), { click: false }),
  );

  await ctx.unring();
  await ctx.card(closingCard(GUIDE, "Booking handled", "The patient and practitioner can now join from their dashboards."));
  await step("09-outro");
}
