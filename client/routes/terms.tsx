import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const meta = {
  title: 'Terms and Conditions | ORUMA Wellness',
  description:
    'Read the ORUMA terms covering account use, appointments, payments, consultations, support, and platform responsibilities.',
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: [
      'By accessing ORUMA.ME, creating an account, booking an appointment, making a payment, joining a session, or using any dashboard or support feature, the user agrees to these Terms and Conditions.',
      'If a user does not agree with these terms, the user should not use the platform or services.',
    ],
  },
  {
    title: '2. Nature of Services',
    body: [
      'ORUMA provides a digital wellness platform for therapist discovery, appointment booking, online consultations, case management, payment coordination, communication, and support.',
      'Therapy and counselling services are provided by qualified professionals or therapists associated with ORUMA. ORUMA may facilitate technology, scheduling, communication, payments, and support.',
      'The platform is not an emergency service. Users facing a crisis, risk of self-harm, medical emergency, or threat to safety should contact local emergency services, a nearby hospital, or a trusted crisis support resource immediately.',
    ],
  },
  {
    title: '3. Accounts and User Responsibilities',
    body: [
      'Users must provide accurate information during registration, booking, payment, and support interactions.',
      'Users are responsible for maintaining the confidentiality of login credentials and for all activity under their account.',
      'Users must not misuse the platform, impersonate another person, disrupt services, attempt unauthorized access, upload harmful content, or use the platform for unlawful purposes.',
    ],
  },
  {
    title: '4. Appointments and Consultations',
    body: [
      'Appointments are subject to therapist availability, confirmation, successful payment where applicable, and platform scheduling rules.',
      'All appointment times, therapist availability, booking timestamps, cancellation windows, and related schedule information displayed by ORUMA use Indian Standard Time (IST, Asia/Kolkata).',
      'ORUMA may send confirmations, reminders, payment updates, Zoom/session links, and support communications through email, WhatsApp/SMS, dashboard notices, or other configured channels.',
      'Therapists may update case sheets or session notes for continuity of care, administrative review, and lawful record keeping.',
      'Users must join sessions on time and ensure they have a private environment, stable internet connection, and compatible device.',
    ],
  },
  {
    title: '5. Payments, Invoices, Cancellations, and Refunds',
    body: [
      'Fees displayed on the platform may vary by therapist, service type, offer, currency, and administrative decision.',
      'Payments may be processed through third-party payment gateways. Gateway charges, transaction failures, delays, chargebacks, and bank-side issues may be governed by the respective provider policies.',
      'Invoices or receipts may be generated for paid or refunded payments through the platform.',
      'Users may cancel online only during the first one (1) hour after booking and before the appointment starts. Refund eligibility, exceptional cancellation requests, rescheduling, and no-show treatment are governed by the current Cancellation Policy and Refund Policy.',
    ],
  },
  {
    title: '6. Therapist Profiles and Information',
    body: [
      'Therapist profiles may include qualifications, experience, specializations, fees, voice introductions, images, and availability.',
      'ORUMA may review, approve, reject, or edit therapist profile changes for accuracy, compliance, quality, and platform consistency.',
      'Users should not treat public profile information as a guarantee of a particular clinical outcome.',
    ],
  },
  {
    title: '7. User Content and Communications',
    body: [
      'Users may submit intake information, health concerns, support tickets, messages, payment details, and feedback through the platform.',
      'Users confirm that information submitted by them is accurate to the best of their knowledge and does not violate the rights of others.',
      'ORUMA may use submitted information to provide services, operate the platform, respond to support requests, comply with law, and protect safety.',
    ],
  },
  {
    title: '8. Privacy and Data Protection',
    body: [
      'Use of personal information is governed by the ORUMA Privacy Policy.',
      'By using the platform, users consent to the processing of information necessary for account management, booking, consultations, payments, communication, support, security, and compliance.',
    ],
  },
  {
    title: '9. Third-Party Services',
    body: [
      'ORUMA may use third-party services for payments, email, WhatsApp/SMS, video meetings, cloud hosting, media storage, analytics, and security.',
      'ORUMA is not responsible for outages, policy changes, payment gateway behavior, or service interruptions caused by third-party providers, but will make reasonable efforts to support affected users.',
    ],
  },
  {
    title: '10. Intellectual Property',
    body: [
      'The ORUMA name, logo, platform design, text, graphics, workflows, content, and software elements are owned by ORUMA or licensed to ORUMA unless otherwise stated.',
      'Users may not copy, reproduce, resell, modify, scrape, or commercially exploit the platform without written permission.',
    ],
  },
  {
    title: '11. Limitation of Liability',
    body: [
      'The platform is provided on an as-available basis. ORUMA does not guarantee uninterrupted access, error-free operation, or specific therapeutic outcomes.',
      'To the maximum extent permitted by law, ORUMA is not liable for indirect, incidental, consequential, special, or punitive damages arising from platform use, third-party services, missed appointments, technical issues, or user-provided information.',
    ],
  },
  {
    title: '12. Changes to Terms',
    body: [
      'ORUMA may update these terms from time to time. Updated terms will be posted on this page with a revised effective date where appropriate.',
      'Continued use of the platform after changes means the user accepts the updated terms.',
    ],
  },
  {
    title: '13. Governing Law and Contact',
    body: [
      'These terms are governed by the laws of India, subject to applicable jurisdictional rules.',
      'For questions about these terms, users may contact ORUMA at terms-conditions@oruma.me or through the official contact page.',
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F8FBF8] font-body text-[#2E3E3C]">
      <Navbar />
      <section className="bg-[#F5F8F7] px-6 pb-16 pt-36 md:pt-44">
        <div className="mx-auto max-w-4xl">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0A7F7A]">
            Legal
          </p>
          <h1 className="mt-4 text-4xl font-heading font-black leading-tight text-[#064F4B] md:text-6xl">
            Terms and Conditions
          </h1>
          <p className="mt-6 max-w-3xl text-lg font-medium leading-relaxed text-[#5F7F7A]">
            These Terms and Conditions govern use of ORUMA.ME, including
            accounts, bookings, dashboards, digital consultations, payments,
            support tickets, invoices, case sheet workflows, and communication
            features.
          </p>
          <p className="mt-6 text-sm font-bold text-[#064F4B]">
            Effective date: July 19, 2026
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
