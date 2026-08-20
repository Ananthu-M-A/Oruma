import React from "react";
import PolicyPage, { PolicySection } from "../components/PolicyPage";
import { businessConfig } from "../src/config/business";

export const meta = {
  title: `Terms and Conditions | ${businessConfig.brandName}`,
  description: `Terms for ${businessConfig.brandName} accounts, practitioner listings, digital bookings, payments, consultations, and support.`,
};

const sections: PolicySection[] = [
  {
    title: "1. Operator and acceptance",
    body: [
      `${businessConfig.brandName} is a brand operated by ${businessConfig.operatorLegalName} as an individual-owned online counselling and wellness business. No separate legal-person or institutional healthcare status is claimed.`,
      "By using the website, creating an account, booking, paying, or joining a session, the user agrees to these Terms and the linked Privacy, Cancellation, Refund, and Service Delivery Policies.",
    ],
  },
  {
    title: "2. Nature and classification of services",
    body: [
      "Oruma provides online practitioner discovery, scheduling, payment coordination, digitally delivered counselling and wellness sessions, joining instructions, and customer support.",
      "General counselling and wellness support is distinct from clinical psychology, psychiatry, diagnosis, medication management, and other medical services. A regulated or medical service is available only when the selected practitioner's verified profile expressly identifies the applicable qualification, registration, and scope.",
      "Educational courses, webinars, or training, if separately offered, are educational services and are not represented as personal medical care.",
      "Oruma is not an emergency service. For immediate danger, self-harm risk, or medical emergencies, contact local emergency services or a nearby hospital.",
    ],
  },
  {
    title: "3. Practitioner responsibility and relationship",
    body: [
      "Each public practitioner profile should state the person's exact role, verified credentials, areas of practice, consultation type, fee, duration, registration details where legally applicable, and engagement relationship with Oruma.",
      "Where a profile identifies an independent practitioner, that practitioner is responsible for professional judgment, advice, scope of practice, session delivery, and professional-record obligations. Oruma facilitates discovery, booking, payment, communication, and operational support.",
      "A profile, testimonial, or service description is not a guarantee of diagnosis, cure, treatment result, or particular outcome.",
    ],
  },
  {
    title: "4. Accounts and customer responsibilities",
    body: [
      "Users must provide accurate identity, contact, booking, and payment information and must protect their login credentials.",
      "Customers should review the selected service, practitioner profile, date, time, duration, price, discount, cancellation window, and refund conditions before consenting and paying.",
      "Customers must have a compatible device, stable internet connection, private environment, and timely access to joining instructions.",
    ],
  },
  {
    title: "5. Booking and delivery",
    body: [
      "A booking is subject to practitioner availability, the displayed scheduling rules, successful payment where required, and confirmation by Oruma staff.",
      "The booking record and patient dashboard show the booking reference and current appointment and payment status. Staff provides confirmation and joining instructions through the dashboard and official contact channels as described in the Service Delivery Policy.",
      "Dates and times shown by Oruma use Indian Standard Time unless the interface expressly states otherwise.",
    ],
  },
  {
    title: "6. Payments, invoices, cancellation, and refunds",
    body: [
      "The final amount shown before payment is based on the selected practitioner, service, and any displayed package discount. Payment does not override practitioner availability or create a right to an unavailable service.",
      "Online payments may be processed by Razorpay. Oruma sends only non-sensitive booking, invoice, amount, and payment-status information to payment systems; health and consultation content is excluded.",
      "Cancellation eligibility, no-show handling, payment failures, duplicate debits, rescheduling, and refund timelines are governed by the public Cancellation and Refund Policies.",
    ],
  },
  {
    title: "7. Privacy and communications",
    body: [
      "Use of personal and wellness information is governed by the Privacy Policy. Paid consultations and bookings are identified services and are not anonymous.",
      "Oruma may send verification codes, booking updates, payment status, joining instructions, and support responses through the dashboard, email, telephone, or the official WhatsApp number.",
    ],
  },
  {
    title: "8. Third-party services and availability",
    body: [
      "Payment gateways, banks, email providers, video-meeting tools, hosting services, and communications providers may experience delays or outages. Oruma will provide reasonable operational support but cannot control third-party systems.",
      "The website and sessions are provided subject to availability. No uninterrupted-access or specific-outcome guarantee is made.",
    ],
  },
  {
    title: "9. Intellectual property and acceptable use",
    body: [
      "The Oruma brand, site design, original text, graphics, and software are owned by the operator or used with permission. Practitioner and third-party materials remain subject to their respective rights.",
      "Users must not impersonate others, interfere with the service, attempt unauthorised access, scrape private information, upload harmful content, or use the service unlawfully.",
    ],
  },
  {
    title: "10. Governing law and contact",
    body: [
      "These Terms are governed by applicable Indian law, with disputes subject to courts or forums having lawful jurisdiction in Kerala unless mandatory law requires otherwise.",
      `Questions may be sent to ${businessConfig.emails.support} or raised through the authenticated support-ticket system.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms and Conditions"
      introduction={`These terms govern use of ${businessConfig.website}, an online counselling and wellness service operated by ${businessConfig.operatorLegalName}.`}
      effectiveDate="August 19, 2026"
      sections={sections}
    />
  );
}
