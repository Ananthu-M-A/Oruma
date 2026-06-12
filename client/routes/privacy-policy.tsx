import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const meta = {
  title: 'Privacy Policy | ORUMA Wellness',
  description:
    'Read how ORUMA collects, uses, protects, and manages personal information for counselling, booking, payment, and support services.',
};

const sections = [
  {
    title: '1. Information We Collect',
    body: [
      'Account and identity details such as name, email address, phone number, age, gender, login credentials, and role.',
      'Appointment and wellness information shared during booking, intake, case sheet creation, support requests, or therapist communication.',
      'Payment information including payment status, transaction references, invoice details, refund records, and payment gateway identifiers. ORUMA does not store full card, UPI, or banking credentials.',
      'Communication records such as email, WhatsApp/SMS delivery information, support tickets, and administrative notes.',
      'Technical information such as IP address, browser/device information, approximate location, pages visited, and security logs where required for platform reliability and fraud prevention.',
    ],
  },
  {
    title: '2. How We Use Information',
    body: [
      'To create and manage patient, therapist, and administrator accounts.',
      'To schedule appointments, prevent double booking, generate meeting links, maintain case sheets, and coordinate therapy sessions.',
      'To process payments, refunds, invoices, receipts, and transaction support.',
      'To send booking confirmations, OTP/login messages, appointment updates, Zoom/session links, reminders, and support responses.',
      'To improve platform security, prevent misuse, troubleshoot errors, comply with applicable law, and maintain operational records.',
    ],
  },
  {
    title: '3. Sensitive Wellness Information',
    body: [
      'Information about mental health concerns, therapy notes, symptoms, treatment preferences, and session history is treated as confidential wellness information.',
      'Therapists may access only the information reasonably needed to provide services. Administrators may access records only for platform operations, support, compliance, dispute resolution, and quality monitoring.',
      'ORUMA asks users to share only information that is relevant to booking, consultation, support, and care continuity.',
    ],
  },
  {
    title: '4. Legal Basis and Consent',
    body: [
      'By creating an account, booking a session, submitting a form, raising a ticket, or using the platform, users consent to the collection and processing described in this policy.',
      'Where applicable, ORUMA processes personal data for consent-based purposes, service delivery, legal compliance, payment processing, security, and legitimate platform operations.',
      'Users may withdraw consent or request changes to their information, subject to legal, clinical, billing, dispute, and record-retention requirements.',
    ],
  },
  {
    title: '5. Sharing of Information',
    body: [
      'Information may be shared with assigned therapists, authorized administrators, payment gateways, email/SMS/WhatsApp providers, video consultation providers, hosting providers, analytics/security providers, and legal or regulatory authorities where required.',
      'Third-party processors are expected to use information only for the service they provide to ORUMA.',
      'ORUMA does not sell personal wellness information.',
    ],
  },
  {
    title: '6. Data Security',
    body: [
      'ORUMA uses access controls, authentication, role-based restrictions, encryption in transit where available, restricted administrative access, and operational safeguards to protect user information.',
      'No online platform can guarantee absolute security. Users should protect their login credentials and immediately report suspected unauthorized access.',
    ],
  },
  {
    title: '7. Retention',
    body: [
      'ORUMA retains account, appointment, case sheet, payment, invoice, and support information for as long as needed to provide services, comply with law, resolve disputes, maintain clinical continuity, and meet accounting requirements.',
      'Records may be retained even after account closure where required for legal, billing, safety, clinical, or administrative purposes.',
    ],
  },
  {
    title: '8. User Rights',
    body: [
      'Users may request access, correction, update, deletion, or restriction of their personal information, subject to verification and applicable legal or operational limitations.',
      'Users may also request clarification about how their data is used or raise a privacy grievance through the contact details below.',
    ],
  },
  {
    title: '9. Children and Minors',
    body: [
      'ORUMA services are intended for users who can lawfully consent to counselling and digital services. Where a user is a minor, parent/guardian involvement or consent may be required.',
      'ORUMA does not knowingly process minor data for targeted advertising or profiling unrelated to care delivery.',
    ],
  },
  {
    title: '10. Contact and Grievance',
    body: [
      'For privacy questions, correction requests, deletion requests, or grievances, contact ORUMA at Oruma987@gmail.com or through the official contact page.',
      'Users should include enough information for ORUMA to verify the request and respond appropriately.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#F8FBF8] font-body text-[#2E3E3C]">
      <Navbar />
      <section className="bg-[#F5F8F7] px-6 pb-16 pt-36 md:pt-44">
        <div className="mx-auto max-w-4xl">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0A7F7A]">
            Legal
          </p>
          <h1 className="mt-4 text-4xl font-heading font-black leading-tight text-[#064F4B] md:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-6 max-w-3xl text-lg font-medium leading-relaxed text-[#5F7F7A]">
            This Privacy Policy explains how ORUMA.ME collects, uses, stores,
            shares, and protects information when users access our digital
            wellness platform, dashboards, booking tools, payment flows, video
            consultation workflows, and support services.
          </p>
          <p className="mt-6 text-sm font-bold text-[#064F4B]">
            Effective date: June 12, 2026
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-4xl gap-6">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-lg border border-[#E2E8E6] bg-white p-6 shadow-sm md:p-8"
            >
              <h2 className="text-2xl font-heading font-black text-[#064F4B]">
                {section.title}
              </h2>
              <div className="mt-5 grid gap-3">
                {section.body.map((item) => (
                  <p key={item} className="text-base font-medium leading-relaxed text-[#5F7F7A]">
                    {item}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
