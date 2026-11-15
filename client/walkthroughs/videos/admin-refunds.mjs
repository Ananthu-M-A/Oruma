// Admin guide: issuing a refund.
import { closingCard, stepper, titleCard } from "../lib/cards.mjs";
import { createWorld, installFakeApi, sampleToken, signIn } from "../lib/fixtures.mjs";

const GUIDE = "Admin guide";
export const title = "Issuing a refund";

export const lines = [
  { id: "00-intro", say: "This guide shows admins how to issue a refund. It uses sample data." },
  { id: "01-cancelled", say: "Sneha cancelled her session two days ahead. Under the cancellation policy, she gets a full refund.", caption: "Check the cancellation policy applies" },
  { id: "02-not-automatic", say: "Cancelling a booking does not refund it automatically. Refunds are a separate step.", caption: "Cancelling does not refund automatically" },
  { id: "03-tab", say: "Open the Payments tab.", caption: "Open Payments" },
  { id: "04-find", say: "Find the payment by the patient's email, and check the amount paid.", caption: "Find the payment and check the amount" },
  { id: "05-amount", say: "Enter the refund amount. For a full refund, enter the whole amount.", caption: "Enter the refund amount" },
  { id: "06-refund", say: "Select Refund. Razorpay returns the money to the original payment method, usually within five to seven working days.", caption: "Select Refund: Razorpay returns it to the payer" },
  { id: "07-status", say: "The refunded amount updates here. You can also check it in the Razorpay dashboard.", caption: "Check the refunded amount" },
  { id: "08-warning", say: "Important: never start a second refund while one shows Requested or Unknown. Check Razorpay first, or you may refund twice.", caption: "Never refund twice: check Razorpay first" },
  { id: "09-outro", say: "That's it. Let the patient know the refund is on its way." },
];

export async function prepare(context) {
  await installFakeApi(context, createWorld());
  await signIn(context, sampleToken("ADMIN", "admin-sample-1", { email: "admin@example.com" }));
}

export async function run(ctx) {
  const { frame } = ctx;
  const step = stepper(ctx, lines);

  await ctx.card(titleCard(GUIDE, title, "Refunds are always a separate, deliberate step."));
  await step("00-intro");
  await ctx.open("/profile/admin");
  await ctx.card(null);
  await ctx.sleep(600);

  await frame.getByRole("button", { name: "Appointments", exact: true }).waitFor();
  await ctx.point(frame.getByRole("button", { name: "Appointments", exact: true }));
  const cancelled = frame.getByRole("heading", { name: "Sneha Pillai with Fathima Rasheed" });
  await cancelled.waitFor();
  await step("01-cancelled", () => ctx.point(cancelled, { click: false }));
  await step("02-not-automatic", () => ctx.unring());
  await step("03-tab", () => ctx.point(frame.getByRole("button", { name: "Payments", exact: true })));

  const payment = frame.locator("article").filter({ hasText: "sneha.p@example.com" });
  await payment.waitFor();
  await step("04-find", () => ctx.point(payment.getByText("sneha.p@example.com"), { click: false }));
  await step("05-amount", () => ctx.type(payment.getByRole("spinbutton"), "1000"));
  await step("06-refund", () => ctx.point(payment.getByRole("button", { name: "Refund" })));
  await step("07-status", async () => {
    await ctx.sleep(1200);
    await ctx.point(payment.getByText("Refunded", { exact: true }).first(), { click: false });
  });
  await step("08-warning", () => ctx.unring());

  await ctx.card(closingCard(GUIDE, "Refund issued", "Razorpay usually completes refunds in 5–7 working days."));
  await step("09-outro");
}
