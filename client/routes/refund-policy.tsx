import PolicyPage, { PolicySection } from "../components/PolicyPage";
import { businessConfig } from "../src/config/business";

const sections: PolicySection[] = [
  {
    title: "1. Scope",
    body: [
      "This policy applies to digitally delivered counselling and wellness bookings paid for through Oruma.",
      "Refund decisions depend on booking status, practitioner availability, delivery records, cancellation timing, gateway confirmation, and the amount actually captured.",
    ],
  },
  {
    title: "2. Eligible situations",
    body: [
      "A full refund may be approved for a cancellation made within the one-hour online cancellation window, or for a complete cancellation request received at least 24 hours before the scheduled session, provided the session has not started.",
      "A full refund or no-cost rescheduling will be offered when Oruma or the selected practitioner cannot deliver a confirmed paid session and no suitable reassignment is accepted.",
      "Verified duplicate payments, overpayments, or debits for which no valid booking was created may qualify for a full or partial refund after reconciliation.",
    ],
  },
  {
    title: "3. Normally non-refundable situations",
    body: [
      "Late cancellation, no-show, late arrival, incorrect customer contact details, or customer-side device or connectivity problems are normally non-refundable.",
      "A session that has started or been completed is normally non-refundable unless a documented delivery failure attributable to Oruma or the practitioner occurred.",
    ],
  },
  {
    title: "4. How to request and reconcile a refund",
    body: [
      `Send requests to ${businessConfig.emails.refund}, use the Contact page, or create a dashboard support ticket. Include the booking reference, payment reference, appointment date, and a concise reason. Do not send UPI PINs, bank passwords, PAN, Aadhaar, or unrelated health records.`,
      "Oruma may review the booking, payment, cancellation, delivery, and support records before deciding the request.",
      "Requests should normally be made within seven calendar days of the relevant cancellation, failed service, or duplicate debit, without limiting non-waivable legal rights.",
    ],
  },
  {
    title: "5. Timelines and payment channel",
    body: [
      "A complete request is normally acknowledged within two business days and reviewed within five business days. An approved refund is normally initiated within two business days after approval.",
      "A Razorpay payment is refunded to its original payment method. Oruma will not request a replacement UPI ID, QR code, card, or bank account for that refund.",
      "After initiation, a bank or payment provider may require approximately five to seven working days to post the credit. Failed or pending transactions may instead be automatically reversed by the provider.",
    ],
  },
  {
    title: "6. Packages, partial refunds, and disputes",
    body: [
      "Any approved refund for a discounted or bundled booking is based on the amount actually paid and will never exceed the successfully captured amount.",
      "If rescheduling or replacement service is accepted for a booking, a separate refund is not issued for the same undelivered portion unless expressly agreed.",
      "Customers are encouraged to contact support before raising a chargeback so the booking and payment can be traced promptly.",
    ],
  },
  {
    title: "7. Contact and governing terms",
    body: [
      `Refund support: ${businessConfig.emails.refund} or ${businessConfig.supportPhone.display}.`,
      "Appointment timestamps use Indian Standard Time. This policy operates with the Cancellation and Service Delivery Policies and applicable Indian law.",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      title="Refund Policy"
      introduction="This policy explains eligibility, evidence, reconciliation, timelines, and original-payment-method handling for refunds."
      effectiveDate="August 19, 2026"
      sections={sections}
    />
  );
}
