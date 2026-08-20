import React from "react";
import PolicyPage, { PolicySection } from "../components/PolicyPage";
import { businessConfig } from "../src/config/business";

export const meta = {
  title: `Cancellation Policy | ${businessConfig.brandName}`,
  description: `Cancellation, rescheduling, no-show, technical issue, and practitioner-change rules for ${businessConfig.brandName} bookings.`,
};

const sections: PolicySection[] = [
  {
    title: "1. Scope and booking window",
    body: [
      "This policy applies to online counselling and wellness appointments booked through Oruma.",
      "A customer may cancel in the dashboard during the first one hour after the booking is created, provided the appointment has not started. A cancellation requested at least 24 hours before the scheduled session may also be sent through the listed support channels. The system timestamps control these windows.",
    ],
  },
  {
    title: "2. Requests after the online window",
    body: [
      `After the online window closes, request cancellation or rescheduling through a dashboard ticket, the Contact page, or ${businessConfig.emails.cancellation}. Approval and refund are not guaranteed.`,
      "Provide the booking reference, appointment date and time, and a concise reason. Do not include unrelated health or identity documents.",
    ],
  },
  {
    title: "3. Rescheduling and reassignment",
    body: [
      "Rescheduling is subject to practitioner availability and should be requested before the scheduled start time.",
      "If the selected practitioner becomes unavailable, Oruma may offer a new time, a verified replacement practitioner, or a refund. The customer may decline reassignment and request the remedy available under the Refund Policy.",
    ],
  },
  {
    title: "4. Late arrival and no-show",
    body: [
      "A late session may still finish at the original end time. A customer who does not join a confirmed appointment may be recorded as a no-show.",
      "Late arrival and no-show bookings are normally non-refundable unless the failure was caused by Oruma, the practitioner, or the delivery of joining instructions.",
    ],
  },
  {
    title: "5. Technical and delivery failures",
    body: [
      "Customers are responsible for a compatible device, stable connection, private setting, and checking official joining instructions.",
      "A documented Oruma-side, practitioner-side, or joining-link delivery failure will be reviewed for rescheduling, reassignment, or refund.",
    ],
  },
  {
    title: "6. Payment and refund effect",
    body: [
      "Cancellation changes the appointment status but does not itself confirm that a refund has been initiated. Refund eligibility and processing follow the Refund Policy.",
      "Cancelled records may be retained for booking, payment, refund, security, support, and audit purposes. Released availability may be offered to another customer.",
    ],
  },
  {
    title: "7. Emergency disclaimer and contact",
    body: [
      "Oruma is not an emergency service. For immediate danger, self-harm risk, or medical emergency, contact local emergency services or a nearby hospital.",
      `Cancellation support: ${businessConfig.emails.cancellation} or ${businessConfig.supportPhone.display}. Appointment times use Indian Standard Time.`,
    ],
  },
];

export default function CancellationPolicyPage() {
  return (
    <PolicyPage
      title="Cancellation Policy"
      introduction="This policy explains the online cancellation window, rescheduling, reassignment, no-show handling, and the relationship between cancellation and refunds."
      effectiveDate="August 19, 2026"
      sections={sections}
    />
  );
}
