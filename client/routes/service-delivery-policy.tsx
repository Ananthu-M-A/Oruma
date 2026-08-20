import React from "react";
import PolicyPage, { PolicySection } from "../components/PolicyPage";
import { businessConfig } from "../src/config/business";

export const meta = {
  title: `Service Delivery Policy | ${businessConfig.brandName}`,
  description: `How ${businessConfig.brandName} confirms and digitally delivers online counselling and wellness bookings.`,
};

const sections: PolicySection[] = [
  {
    title: "1. Digital delivery—no physical shipping",
    body: [
      "Oruma sells digitally delivered online counselling and wellness services. No physical goods are shipped.",
      "This Service Delivery Policy serves as the delivery and shipping policy for those digital services.",
    ],
  },
  {
    title: "2. Selecting and ordering a service",
    body: [
      "A customer selects a service, reviews a verified practitioner profile, chooses an available date and time, reviews the session duration and final payable amount, accepts the linked policies, and submits the booking.",
      "The booking flow displays the selected service, practitioner, appointment time in IST, duration, fee, any discount, cancellation window, refund conditions, and a booking reference once created.",
    ],
  },
  {
    title: "3. Payment and booking confirmation",
    body: [
      "Where advance payment is required, the booking is held while Razorpay processes the payment. A booking is treated as paid only after successful gateway verification or a confirmed payment webhook.",
      "A failed, cancelled, expired, or unverified payment does not create a paid appointment. Production never uses the development payment simulator.",
      "After payment, the patient dashboard displays the booking and payment status. Oruma staff then confirms the appointment after checking payment and practitioner availability.",
    ],
  },
  {
    title: "4. Joining instructions and fulfilment time",
    body: [
      "For a paid booking, staff normally confirms the appointment and provides a unique video-session link or joining instructions through the dashboard and official contact channels within one business day and before the scheduled session.",
      "Customers should contact support if a paid booking remains unconfirmed or joining instructions are not visible at least two hours before the session.",
    ],
  },
  {
    title: "5. Duration and practitioner availability",
    body: [
      "The applicable session duration is shown in the booking summary and practitioner profile. Duration may vary by service and practitioner and is not inferred where it has not been verified.",
      "All appointment slots depend on current practitioner availability. Displaying a profile does not guarantee a particular future time.",
    ],
  },
  {
    title: "6. Reassignment and rescheduling",
    body: [
      "If the selected practitioner becomes unavailable, Oruma may offer a new time or a verified replacement practitioner with an appropriate stated scope. The customer may accept, request another option, or use the applicable cancellation and refund process.",
      "Oruma does not silently replace a selected practitioner after payment without communicating the change.",
    ],
  },
  {
    title: "7. Customer responsibilities",
    body: [
      "Customers must provide accurate contact details, monitor the dashboard and official messages, join on time, and use a compatible device, stable connection, and private environment.",
      "Customers should verify the booking reference when requesting support and should never share UPI PINs, passwords, or full payment credentials.",
    ],
  },
  {
    title: "8. Failed booking, payment, cancellation, and refund",
    body: [
      "If money is debited but the booking or payment remains unconfirmed, contact support with the non-sensitive booking and payment references so the transaction can be reconciled.",
      "Cancellation windows, no-show rules, duplicate debits, undelivered services, original-method refunds, and processing timelines are governed by the Cancellation and Refund Policies.",
    ],
  },
  {
    title: "9. Support channels",
    body: [
      `Support is available through the patient dashboard, ${businessConfig.emails.support}, ${businessConfig.supportPhone.display}, and the official WhatsApp number ${businessConfig.whatsappPhone.display}. These are support channels, not emergency services.`,
    ],
  },
];

export default function ServiceDeliveryPolicyPage() {
  return (
    <PolicyPage
      title="Service Delivery Policy"
      introduction="This policy explains the end-to-end selection, booking, payment, confirmation, and digital fulfilment process for Oruma services."
      effectiveDate="August 19, 2026"
      sections={sections}
    />
  );
}
