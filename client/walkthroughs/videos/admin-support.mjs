// Admin guide: answering website enquiries and support tickets.
import { closingCard, stepper, titleCard } from "../lib/cards.mjs";
import { createWorld, installFakeApi, sampleToken, signIn } from "../lib/fixtures.mjs";

const GUIDE = "Admin guide";
export const title = "Answering enquiries and tickets";

export const lines = [
  { id: "00-intro", say: "This guide shows admins how to answer website enquiries and support tickets. It uses sample data." },
  { id: "01-enquiries", say: "Messages from the website contact form appear under Enquiries. You also get an email for each one.", caption: "Open Enquiries: contact-form messages" },
  { id: "02-read", say: "Read the message, and note how the person wants a reply. Rohan asked for WhatsApp.", caption: "Read it and note the preferred reply method" },
  { id: "03-reply", say: "Reply from the official account. Then add a short note about what you said.", caption: "Reply, then add a short note" },
  { id: "04-status", say: "Set the status to Replied. Replied enquiries are deleted automatically after the retention period.", caption: "Set the status to Replied" },
  { id: "05-tickets", say: "Patients raise support tickets from their dashboard. Open the Tickets tab.", caption: "Open Tickets: patient support requests" },
  { id: "06-ticket-reply", say: "Write your reply in the admin note, and select Save note. The patient sees it in their dashboard.", caption: "Write the reply and select Save note" },
  { id: "07-resolve", say: "When it's sorted, set the ticket to Resolved.", caption: "Set the ticket to Resolved" },
  { id: "08-check", say: "Check Enquiries and Tickets every working day, so no one waits too long.", caption: "Check both every working day" },
  { id: "09-outro", say: "That's it. Never share clinical details in replies." },
];

export async function prepare(context) {
  await installFakeApi(context, createWorld());
  await signIn(context, sampleToken("ADMIN", "admin-sample-1", { email: "admin@example.com" }));
}

export async function run(ctx) {
  const { frame } = ctx;
  const step = stepper(ctx, lines);

  await ctx.card(titleCard(GUIDE, title, "Reply quickly, record what you said, and close the loop."));
  await step("00-intro");
  await ctx.open("/profile/admin");
  await ctx.card(null);
  await ctx.sleep(600);

  await frame.getByRole("button", { name: "Enquiries", exact: true }).waitFor();
  await step("01-enquiries", () => ctx.point(frame.getByRole("button", { name: "Enquiries", exact: true })));

  const enquiry = frame.locator("article").filter({ hasText: "Rohan Das" });
  await enquiry.waitFor();
  await step("02-read", () => ctx.point(enquiry.getByText(/^Reply by WhatsApp/), { click: false }));
  await step("03-reply", async () => {
    await ctx.type(
      enquiry.getByRole("textbox", { name: "Admin note" }),
      "Replied on WhatsApp: Anjali offers premarital counselling in Malayalam. Shared her profile link.",
    );
    await ctx.point(enquiry.getByRole("button", { name: "Save note" }));
  });
  await step("04-status", () =>
    ctx.choose(enquiry.getByRole("combobox", { name: "Status for enquiry from Rohan Das" }), "REPLIED"),
  );

  await step("05-tickets", () => ctx.point(frame.getByRole("button", { name: "Tickets", exact: true })));
  const ticket = frame.locator("article").filter({ hasText: "Can I change my session time?" });
  await ticket.waitFor();
  await step("06-ticket-reply", async () => {
    await ctx.type(
      ticket.getByRole("textbox", { name: "Admin note" }),
      "Moved to 6:00 pm the same day. A new session link will follow.",
    );
    await ctx.point(ticket.getByRole("button", { name: "Save note" }));
  });
  await step("07-resolve", () => ctx.choose(ticket.getByRole("combobox"), "RESOLVED"));
  await step("08-check", () => ctx.unring());

  await ctx.card(closingCard(GUIDE, "All caught up", "Every enquiry and ticket answered and recorded."));
  await step("09-outro");
}
