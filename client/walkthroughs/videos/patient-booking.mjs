// Patient guide: finding a practitioner, booking a slot and paying.
import {
  createWorld,
  installDemoCheckout,
  installFakeApi,
  sampleToken,
  signIn,
} from "../lib/fixtures.mjs";

export const title = "Booking and paying for a session";

// `say` is spoken; `caption` is shown on screen. Keep captions short.
export const lines = [
  { id: "00-intro", say: "This guide shows how to book and pay for a counselling session on Oruma. It uses sample data." },
  { id: "01-menu", say: "Go to oruma dot me and log in. Then select Book at the top of the page.", caption: "Log in at oruma.me, then select Book" },
  { id: "02-list", say: "This page lists verified practitioners, with their role, languages, fee, and next available time.", caption: "Compare verified practitioners: role, languages, fee and next time" },
  { id: "03-profile", say: "Choose a practitioner and select View Profile.", caption: "Select View Profile" },
  { id: "04-details", say: "The profile shows their qualifications, areas of practice, and session fee.", caption: "Read their qualifications, areas of practice and fee" },
  { id: "05-slot", say: "Pick an open time slot. Times are shown in Indian Standard Time.", caption: "Pick an open slot (times are in IST)" },
  { id: "06-book", say: "Then select Book selected slot.", caption: "Select Book selected slot" },
  { id: "07-service", say: "Choose the service. Couple Therapy appears when the practitioner offers it. Then select Next Step.", caption: "Choose the service, then Next Step" },
  { id: "08-time", say: "Check the date and time, then select Next Step.", caption: "Check the date and time" },
  { id: "09-contact", say: "Check your name, email, and phone number. They come from your account.", caption: "Check your contact details" },
  { id: "10-summary", say: "Review the session summary and the policies, and tick the box to confirm.", caption: "Review the summary and tick to confirm" },
  { id: "11-pay", say: "Select Pay and confirm booking.", caption: "Select Pay & confirm booking" },
  { id: "12-checkout", say: "A secure payment window opens. You can pay by U P I, card, net banking, or wallet.", caption: "Pay securely by UPI, card, net banking or wallet" },
  { id: "13-complete", say: "Complete the payment.", caption: "Complete the payment" },
  { id: "14-done", say: "When the payment succeeds, your booking is saved and your dashboard opens.", caption: "Payment received: your dashboard opens" },
  { id: "15-dashboard", say: "Your dashboard shows the booking and payment status. You can open your invoice here.", caption: "See your booking, payment status and invoice" },
  { id: "16-next", say: "The care team confirms the appointment, then sends your video session link by email, and here in your dashboard.", caption: "Your session link arrives by email and in your dashboard" },
  { id: "17-help", say: "Need help? Message us on WhatsApp, email us, or use the contact form.", caption: "Need help? WhatsApp, email or the contact form" },
  { id: "18-outro", say: "That's it. Your session is booked." },
];

export async function prepare(context) {
  await installFakeApi(context, createWorld());
  await installDemoCheckout(context);
  await signIn(context, sampleToken("PATIENT", "patient-sample-1"));
}

export async function run(ctx) {
  const { frame } = ctx;

  await ctx.card(
    `<div class="kicker">Oruma · Patient guide</div><h1>${title}</h1>
     <p>Find a practitioner, choose a time and pay online.</p>
     <div class="note">Sample data: the names and numbers shown are not real.</div>`,
  );
  await ctx.say("00-intro", { caption: "" });

  await ctx.open("/");
  await ctx.card(null);
  await ctx.sleep(600);
  await ctx.say("01-menu", {
    step: "1",
    caption: lines[1].caption,
    action: () => ctx.point(frame.locator('header a[href="/therapists"], nav a[href="/therapists"]').first()),
  });

  await frame.getByRole("link", { name: "View Profile" }).first().waitFor();
  await ctx.say("02-list", {
    step: "2",
    caption: lines[2].caption,
    action: async () => {
      await ctx.sleep(400);
      await ctx.point(frame.getByText("Anjali Menon").first(), { click: false });
    },
  });

  await ctx.say("03-profile", {
    step: "3",
    caption: lines[3].caption,
    action: () => ctx.point(frame.getByRole("link", { name: "View Profile" }).first()),
  });

  await frame.getByRole("button", { name: /^Open Slot/ }).first().waitFor();
  await ctx.say("04-details", {
    step: "4",
    caption: lines[4].caption,
    action: async () => {
      await ctx.sleep(300);
      await ctx.scroll(320);
    },
  });

  await ctx.say("05-slot", {
    step: "5",
    caption: lines[5].caption,
    action: () => ctx.point(frame.getByRole("button", { name: /^Open Slot/ }).first()),
  });

  await ctx.say("06-book", {
    step: "6",
    caption: lines[6].caption,
    action: () => ctx.point(frame.getByRole("button", { name: "Book selected slot" })),
  });

  const dialog = frame.getByRole("dialog");
  await dialog.waitFor();
  const nextStep = dialog.getByRole("button", { name: "Next Step" });
  await ctx.say("07-service", {
    step: "7",
    caption: lines[7].caption,
    action: async () => {
      await ctx.point(dialog.locator("select").first(), { click: false });
      await ctx.sleep(1500);
      await ctx.point(nextStep);
    },
  });

  await ctx.say("08-time", {
    step: "8",
    caption: lines[8].caption,
    action: async () => {
      const selected = dialog.locator('button[aria-pressed="true"]').first();
      const slot = (await selected.count())
        ? selected
        : dialog.locator("button[aria-pressed]").first();
      await ctx.point(slot, { click: !(await selected.count()) });
      await ctx.sleep(800);
      await ctx.point(nextStep);
    },
  });

  await ctx.say("09-contact", {
    step: "9",
    caption: lines[9].caption,
    action: async () => {
      const fields = [
        [dialog.getByPlaceholder("Enter your full name"), "Priya Nair"],
        [dialog.getByPlaceholder("Enter your email"), "patient@example.com"],
      ];
      for (const [field, value] of fields) {
        if (!(await field.inputValue())) await ctx.type(field, value);
        else await ctx.point(field, { click: false });
      }
      const phone = dialog.locator('input[type="tel"]').first();
      if ((await phone.count()) && !(await phone.inputValue())) {
        await ctx.type(phone, "9800000001");
      }
      await ctx.sleep(500);
      await ctx.point(nextStep);
    },
  });

  await ctx.say("10-summary", {
    step: "10",
    caption: lines[10].caption,
    action: async () => {
      await ctx.sleep(1200);
      await ctx.point(dialog.getByRole("checkbox"));
    },
  });

  await ctx.say("11-pay", {
    step: "11",
    caption: lines[11].caption,
    action: () => ctx.point(dialog.getByRole("button", { name: /Pay & confirm booking/ })),
  });

  const payButton = frame.locator("#demo-pay");
  await payButton.waitFor();
  await ctx.say("12-checkout", {
    step: "12",
    caption: lines[12].caption,
    action: () =>
      ctx.point(frame.locator("#demo-checkout div", { hasText: /^UPI/ }).last(), {
        click: false,
      }),
  });

  await ctx.say("13-complete", {
    step: "13",
    caption: lines[13].caption,
    action: async () => {
      await ctx.point(payButton);
      await frame.locator("#demo-checkout").waitFor({ state: "detached" });
    },
  });

  await ctx.say("14-done", {
    step: "14",
    caption: lines[14].caption,
    action: () => frame.getByRole("button", { name: "Invoice" }).waitFor({ timeout: 20000 }),
  });

  await ctx.say("15-dashboard", {
    step: "15",
    caption: lines[15].caption,
    action: () => ctx.point(frame.getByRole("button", { name: "Invoice" }), { click: false }),
  });

  await ctx.say("16-next", {
    step: "16",
    caption: lines[16].caption,
    action: async () => {
      await ctx.unring();
      await ctx.scroll(200);
    },
  });

  await ctx.say("17-help", {
    step: "?",
    caption: lines[17].caption,
    action: async () => {
      // The dashboard may not show the floating buttons; use the public page.
      const whatsapp = frame.getByRole("link", { name: "Chat with Oruma on WhatsApp" });
      if (!(await whatsapp.count())) await ctx.open("/contact");
      await ctx.point(whatsapp.first(), { click: false });
    },
  });

  await ctx.unring();
  await ctx.card(
    `<div class="kicker">Oruma · Patient guide</div><h1>Your session is booked</h1>
     <p>Watch for the confirmation and session link in your email and dashboard.</p>
     <div class="note">Questions? oruma9987@gmail.com · WhatsApp +91-8157039987</div>`,
  );
  await ctx.say("18-outro", { caption: "" });
}
