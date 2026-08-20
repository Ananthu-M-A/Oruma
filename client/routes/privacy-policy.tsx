import React from "react";
import PolicyPage, { PolicySection } from "../components/PolicyPage";
import { businessConfig } from "../src/config/business";

export const meta = {
  title: `Privacy Policy | ${businessConfig.brandName}`,
  description: `How ${businessConfig.brandName} handles identity, booking, payment, consultation, wellness, and support information.`,
};

const sections: PolicySection[] = [
  {
    title: "1. Scope and operator",
    body: [
      `${businessConfig.brandName} is the website brand. ${businessConfig.operatorLegalName} is the individual operator and data contact for the online counselling and wellness service described in this policy.`,
      "This policy applies to public enquiries, accounts, practitioner discovery, bookings, payments, online sessions, case records, support requests, and administrative operations.",
    ],
  },
  {
    title: "2. Information collected",
    body: [
      "Account and contact information may include name, email address, telephone number, age, gender, login records, and account role.",
      "Booking information may include the selected service, practitioner, appointment date and time, contact preference, booking reference, payment status, and operational communications.",
      "Where a user chooses to provide it, consultation information may include wellness concerns, symptoms, medication information, previous support, case-sheet content, session notes, and other sensitive information relevant to the service.",
      "Payment records include amount, status, invoice and booking references, gateway payment identifiers, and refund records. Full card credentials, UPI PINs, bank passwords, and complete banking credentials are not stored by Oruma.",
      "Technical and security records may include IP address, device and browser information, pages visited, authentication events, and error logs.",
    ],
  },
  {
    title: "3. Confidentiality—not complete anonymity",
    body: [
      "Oruma protects personal and wellness information through limited access, role controls, authentication, and operational confidentiality. No online service can promise complete anonymity or absolute security.",
      "A person may make a general initial enquiry without describing a health concern, but email, telephone, WhatsApp, and similar channels reveal account or contact identifiers to their providers and to Oruma staff handling the enquiry.",
      "Bookings and paid consultations are identified services because Oruma collects customer contact details, booking information, payment references, and records needed to deliver and support the service.",
    ],
  },
  {
    title: "4. Uses of information",
    body: [
      "Information is used to manage accounts, verify access, display practitioner availability, create and confirm bookings, process payments and refunds, deliver joining instructions, provide consultations, respond to support requests, and maintain records.",
      "Information may also be used to prevent fraud and double booking, investigate incidents, maintain platform security, comply with applicable law, respond to disputes, and improve service reliability.",
      "Sensitive consultation information is not placed in Razorpay order notes, QR descriptions, payment receipts, or other payment metadata. Payment metadata is limited to non-sensitive booking or invoice references and generic service information.",
    ],
  },
  {
    title: "5. Access and sharing",
    body: [
      "Relevant information may be available to the selected practitioner, authorised Oruma staff, and service providers used for payments, email, hosting, video meetings, storage, analytics, and security, only to the extent needed for their functions.",
      "Information may be disclosed to a bank, payment gateway, regulator, court, law-enforcement body, or other authority where legally required or reasonably necessary to handle fraud, disputes, refunds, or safety concerns.",
      "Oruma does not sell sensitive wellness information.",
    ],
  },
  {
    title: "6. Security and customer responsibilities",
    body: [
      "Oruma uses authentication, access restrictions, transport encryption where supported, administrative controls, and audit records. Security controls reduce risk but cannot eliminate it.",
      "Users should protect login credentials, avoid shared devices for sensitive activity, verify messages are from official contact channels, and never share UPI PINs, passwords, or one-time payment credentials with Oruma staff.",
    ],
  },
  {
    title: "7. Retention",
    body: [
      "Account, booking, consultation, payment, invoice, refund, and support records are retained only for as long as reasonably needed for service delivery, continuity, payment reconciliation, disputes, security, and applicable legal or accounting obligations.",
      "Deletion or account closure may not remove records that must be retained for an unresolved payment, refund, complaint, safety matter, professional record obligation, or legal requirement.",
    ],
  },
  {
    title: "8. Rights and requests",
    body: [
      "Subject to identity verification and applicable limitations, users may request access, correction, export, restriction, or deletion of personal information through the dashboard or privacy contact.",
      `Privacy questions and requests should be sent to ${businessConfig.emails.privacy}. Do not email PAN, Aadhaar, bank credentials, UPI PINs, or unrelated medical documents.`,
    ],
  },
  {
    title: "9. Minors and emergencies",
    body: [
      "A parent or lawful guardian may need to consent where the customer cannot independently consent under applicable law or practitioner requirements.",
      "Oruma is not an emergency service. A person facing immediate danger, self-harm risk, or a medical emergency should contact local emergency services or a nearby hospital and should not wait for an Oruma response.",
    ],
  },
  {
    title: "10. Updates and governing law",
    body: [
      "This policy may be updated when services, technology, providers, or legal requirements change. The current version and effective date will remain available on this public page.",
      "This policy is governed by applicable Indian law.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      introduction={`This policy explains how ${businessConfig.brandName} handles personal, booking, payment, consultation, and support information for its digitally delivered services.`}
      effectiveDate="August 19, 2026"
      sections={sections}
    />
  );
}
