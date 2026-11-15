// Patient guide: joining a session, invoices and getting help.
import { closingCard, stepper, titleCard } from "../lib/cards.mjs";
import { createWorld, installFakeApi, sampleToken, signIn } from "../lib/fixtures.mjs";

const GUIDE = "Patient guide";
export const title = "Joining your session and getting help";

export const lines = [
  { id: "00-intro", say: "This guide shows how to join your session, find your invoice, and get help. It uses sample data." },
  { id: "01-confirmed", say: "After the care team confirms your booking, your dashboard shows it as confirmed.", caption: "Your confirmed booking appears in your dashboard" },
  { id: "02-join", say: "Your session link appears here. At the session time, select Join session. We also email you the link.", caption: "At the session time, select Join session" },
  { id: "03-ready", say: "Join from a quiet, private place, and check that your camera and microphone work. The session opens in Google Meet or Zoom.", caption: "Join from a quiet, private place" },
  { id: "04-invoice", say: "Select Invoice to open or print your receipt.", caption: "Select Invoice for your receipt" },
  { id: "05-whatsapp", say: "To message the care team about this booking, select WhatsApp about this booking.", caption: "Message the care team about this booking" },
  { id: "06-tickets", say: "For anything else, raise a support ticket. Open the Tickets tab.", caption: "For other questions, open Tickets" },
  { id: "07-ticket", say: "Enter a subject, choose a category, and write your message. Then select Create ticket.", caption: "Fill in the ticket and select Create ticket" },
  { id: "08-reply", say: "Your ticket appears in the list. The care team's reply shows here, and they may also email you.", caption: "The care team's reply appears here" },
  { id: "09-cancel", say: "Need to cancel or reschedule? Contact us at least twenty-four hours before your session. Refunds follow the cancellation policy.", caption: "Cancel or reschedule at least 24 hours ahead" },
  { id: "10-outro", say: "That's it. We hope your session goes well." },
];

export async function prepare(context) {
  await installFakeApi(context, createWorld());
  await signIn(context, sampleToken("PATIENT", "patient-sample-1"));
}

export async function run(ctx) {
  const { frame } = ctx;
  const step = stepper(ctx, lines);

  await ctx.card(titleCard(GUIDE, title, "Everything you need on the day of your session."));
  await step("00-intro");
  await ctx.open("/profile/patient");
  await ctx.card(null);
  await ctx.sleep(600);

  const booking = frame.getByRole("heading", { name: "Anjali Menon" });
  await booking.waitFor();
  await step("01-confirmed", () => ctx.point(booking, { click: false }));
  await step("02-join", () => ctx.point(frame.getByRole("link", { name: "Join session" }), { click: false }));
  await step("03-ready", () => ctx.unring());
  await step("04-invoice", () => ctx.point(frame.getByRole("button", { name: "Invoice" }), { click: false }));
  await step("05-whatsapp", () =>
    ctx.point(frame.getByRole("link", { name: "WhatsApp about this booking" }), { click: false }),
  );
  await step("06-tickets", () => ctx.point(frame.getByRole("button", { name: "Tickets", exact: true })));

  await frame.getByRole("button", { name: "Create ticket" }).waitFor();
  await step("07-ticket", async () => {
    await ctx.type(frame.getByRole("textbox", { name: "Subject" }), "Invoice in my company's name");
    await ctx.choose(frame.getByRole("combobox", { name: "Category" }), "Payment");
    await ctx.type(
      frame.getByRole("textbox", { name: "Message" }),
      "Please issue the invoice in the name of Nair Designs.",
    );
    await ctx.point(frame.getByRole("button", { name: "Create ticket" }));
  });
  await step("08-reply", () =>
    ctx.point(frame.getByRole("heading", { name: "Invoice in my company's name" }), { click: false }),
  );
  await step("09-cancel", () => ctx.unring());

  await ctx.card(closingCard(GUIDE, "We're here to help", "WhatsApp, email, tickets or the contact form: use whichever suits you."));
  await step("10-outro");
}
