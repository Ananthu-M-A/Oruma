import React from 'react';
import LegalPolicyLayout from '../components/LegalPolicyLayout';

export const meta = {
  title: 'Terms and Conditions | ORUMA',
  description: 'Read the terms governing accounts, bookings, consultations, payments, and use of the ORUMA digital wellness platform.'
};

const listClassName = 'mt-4 space-y-3 list-disc pl-6 marker:text-[#0A7F7A]';
const sectionHeadingClassName = 'text-2xl md:text-3xl font-heading font-bold text-[#064F4B] mb-5 leading-tight';

export default function TermsAndConditionsPage() {
  return (
    <LegalPolicyLayout
      title="Terms and Conditions"
      effectiveDate="April 14, 2026"
      introduction="These Terms and Conditions govern the use of ORUMA.ME, including user accounts, appointment bookings, therapist dashboards, digital consultations, payments, invoices, case sheet workflows, support services, and all related platform features."
    >
      <section id="acceptance-of-terms">
        <h2 className={sectionHeadingClassName}>1. Acceptance of Terms</h2>
        <p>By accessing ORUMA.ME, creating an account, booking an appointment, making a payment, joining a consultation, or using any feature of the platform, you agree to be bound by these Terms and Conditions.</p>
        <p className="mt-4">If you do not agree to these Terms, you should discontinue use of the platform and its services.</p>
      </section>

      <section id="nature-of-services">
        <h2 className={sectionHeadingClassName}>2. Nature of Services</h2>
        <p>ORUMA provides a digital wellness platform that facilitates therapist discovery, appointment scheduling, online consultations, payment processing, communication, case management, and customer support.</p>
        <p className="mt-4">Therapy and counselling services are delivered by qualified therapists associated with ORUMA. ORUMA provides the technology platform and administrative support necessary to facilitate these services.</p>
        <div className="mt-6 rounded-2xl border border-[#0A7F7A]/20 bg-[#0A7F7A]/5 p-6 md:p-8">
          <p className="font-semibold text-[#064F4B]">ORUMA is not an emergency service.</p>
          <p className="mt-2">If you are experiencing a medical emergency, mental health crisis, risk of self-harm, or any immediate threat to your safety or the safety of others, you should immediately contact your local emergency services, a nearby hospital, or an appropriate crisis support provider.</p>
        </div>
      </section>

      <section id="user-accounts-and-responsibilities">
        <h2 className={sectionHeadingClassName}>3. User Accounts and Responsibilities</h2>
        <p>Users agree to:</p>
        <ul className={listClassName}>
          <li>Provide accurate, complete, and up-to-date information during registration, appointment booking, payment, and communications.</li>
          <li>Maintain the confidentiality of their login credentials.</li>
          <li>Be responsible for all activities carried out through their account.</li>
          <li>Notify ORUMA immediately of any unauthorized access or suspected security breach.</li>
        </ul>
        <p className="mt-6">Users must not:</p>
        <ul className={listClassName}>
          <li>Impersonate another individual.</li>
          <li>Attempt unauthorized access to any part of the platform.</li>
          <li>Upload malicious software or harmful content.</li>
          <li>Disrupt platform operations.</li>
          <li>Use the platform for unlawful or fraudulent activities.</li>
        </ul>
      </section>

      <section id="appointments-and-consultations">
        <h2 className={sectionHeadingClassName}>4. Appointments and Consultations</h2>
        <p>Appointments are subject to therapist availability, successful booking confirmation, payment verification where applicable, and ORUMA&apos;s scheduling policies.</p>
        <p className="mt-4">ORUMA may send appointment confirmations, reminders, payment notifications, session links, invoices, and support communications through email, SMS, WhatsApp, dashboard notifications, or other approved communication channels.</p>
        <p className="mt-4">Therapists may maintain consultation notes and case sheets to support continuity of care, lawful record keeping, and administrative review.</p>
        <p className="mt-6">Users are responsible for:</p>
        <ul className={listClassName}>
          <li>Joining scheduled sessions on time.</li>
          <li>Ensuring they have a stable internet connection and compatible device.</li>
          <li>Attending sessions in a private and appropriate environment.</li>
          <li>Following the therapist&apos;s recommended treatment plan, scheduled follow-up appointments, and lawful therapeutic instructions where applicable.</li>
        </ul>
        <p className="mt-5">
          Failure to attend scheduled sessions, discontinue a planned course of therapy, or fail to follow recommended follow-up appointments or therapist instructions may affect eligibility for refunds or other remedies under ORUMA&apos;s{' '}
          <a className="font-semibold text-[#0A7F7A] underline underline-offset-4 hover:text-[#064F4B]" href="/refund-policy">Refund Policy</a>.
        </p>
      </section>

      <section id="payments-cancellations-and-refunds">
        <h2 className={sectionHeadingClassName}>5. Payments, Invoices, Cancellations, and Refunds</h2>
        <p>Service fees displayed on the platform may vary depending on the therapist, consultation type, promotional offers, currency, or administrative decisions.</p>
        <p className="mt-4">Payments are processed through third-party payment service providers. Transaction failures, payment delays, gateway charges, chargebacks, and bank-related issues may be governed by the policies of the respective payment providers.</p>
        <p className="mt-4">Invoices or payment receipts may be generated for completed payments, refunds, or other eligible transactions.</p>
        <p className="mt-4">
          Cancellation requests are permitted only within the time limits specified in ORUMA&apos;s{' '}
          <a className="font-semibold text-[#0A7F7A] underline underline-offset-4 hover:text-[#064F4B]" href="/cancellation-policy">Cancellation Policy</a>.
        </p>
        <p className="mt-4">
          Refund eligibility is determined in accordance with ORUMA&apos;s{' '}
          <a className="font-semibold text-[#0A7F7A] underline underline-offset-4 hover:text-[#064F4B]" href="/refund-policy">Refund Policy</a>{' '}
          and may depend on factors including appointment status, attendance, therapist availability, payment verification, treatment continuity, administrative review, and compliance with applicable policies.
        </p>
      </section>

      <section id="therapist-profiles-and-information">
        <h2 className={sectionHeadingClassName}>6. Therapist Profiles and Information</h2>
        <p>Therapist profiles may include qualifications, professional experience, specializations, consultation fees, profile photographs, voice introductions, and available appointment slots.</p>
        <p className="mt-4">ORUMA reserves the right to review, approve, modify, or reject therapist profile information to maintain platform quality, accuracy, compliance, and consistency.</p>
        <p className="mt-4">Information displayed on therapist profiles should not be interpreted as a guarantee of any particular therapeutic outcome.</p>
      </section>

      <section id="user-content-and-communications">
        <h2 className={sectionHeadingClassName}>7. User Content and Communications</h2>
        <p>Users may submit information including intake forms, health concerns, appointment details, support requests, feedback, payment information, and communications through the platform.</p>
        <p className="mt-4">Users represent that information submitted is accurate to the best of their knowledge and does not violate the rights of any third party.</p>
        <p className="mt-4">ORUMA may use submitted information for providing services, managing appointments, responding to support requests, complying with legal obligations, protecting users, and operating the platform.</p>
      </section>

      <section id="privacy-and-data-protection">
        <h2 className={sectionHeadingClassName}>8. Privacy and Data Protection</h2>
        <p>
          Collection, processing, storage, and protection of personal information are governed by the ORUMA{' '}
          <a className="font-semibold text-[#0A7F7A] underline underline-offset-4 hover:text-[#064F4B]" href="/privacy-policy">
            Privacy Policy
          </a>.
        </p>
        <p className="mt-4">By using the platform, users consent to the processing of information necessary for account management, appointments, consultations, communication, payment processing, customer support, platform security, and legal compliance.</p>
      </section>

      <section id="third-party-services">
        <h2 className={sectionHeadingClassName}>9. Third-Party Services</h2>
        <p>ORUMA may rely on third-party service providers for:</p>
        <ul className={listClassName}>
          <li>Payment processing</li>
          <li>Video consultations</li>
          <li>Email, SMS, and WhatsApp communications</li>
          <li>Cloud hosting</li>
          <li>Media storage</li>
          <li>Analytics</li>
          <li>Security monitoring</li>
        </ul>
        <p className="mt-5">Although ORUMA selects reputable service providers, it is not responsible for interruptions, outages, delays, policy changes, or failures caused solely by third-party services. ORUMA will make reasonable efforts to assist users in resolving such issues where possible.</p>
      </section>

      <section id="intellectual-property">
        <h2 className={sectionHeadingClassName}>10. Intellectual Property</h2>
        <p>The ORUMA name, logo, branding, platform design, website content, software, graphics, workflows, documentation, and related materials are owned by ORUMA or licensed to ORUMA unless otherwise stated.</p>
        <p className="mt-4">Users may not reproduce, copy, distribute, modify, scrape, reverse engineer, resell, or commercially exploit any part of the platform without prior written permission from ORUMA.</p>
      </section>

      <section id="limitation-of-liability">
        <h2 className={sectionHeadingClassName}>11. Limitation of Liability</h2>
        <p>The ORUMA platform is provided on an &quot;as available&quot; and &quot;as is&quot; basis.</p>
        <p className="mt-4">ORUMA does not guarantee uninterrupted platform availability, error-free operation, uninterrupted internet connectivity, or any specific counselling or therapeutic outcome.</p>
        <p className="mt-4">To the fullest extent permitted by applicable law, ORUMA shall not be liable for indirect, incidental, consequential, exemplary, special, or punitive damages arising from:</p>
        <ul className={listClassName}>
          <li>Platform downtime</li>
          <li>Missed appointments</li>
          <li>Technical failures</li>
          <li>Third-party service interruptions</li>
          <li>User-provided information</li>
          <li>Payment gateway issues</li>
          <li>Therapist availability</li>
          <li>User decisions regarding treatment or follow-up</li>
        </ul>
      </section>

      <section id="changes-to-terms">
        <h2 className={sectionHeadingClassName}>12. Changes to these Terms</h2>
        <p>ORUMA may revise these Terms and Conditions from time to time to reflect operational, legal, technological, or regulatory changes.</p>
        <p className="mt-4">The revised version will be published on this page together with the updated Effective Date.</p>
        <p className="mt-4">Continued use of the platform after such updates constitutes acceptance of the revised Terms.</p>
      </section>

      <section id="governing-law-and-contact">
        <h2 className={sectionHeadingClassName}>13. Governing Law and Contact</h2>
        <p>These Terms and Conditions shall be governed by and interpreted in accordance with the laws of India, without prejudice to applicable jurisdictional requirements.</p>
        <p className="mt-4">For questions regarding these Terms and Conditions, please contact:</p>
        <div className="mt-6 rounded-2xl bg-[#F5F8F7] border border-[#064F4B]/10 p-6 md:p-8">
          <p className="font-bold text-[#064F4B] text-lg">ORUMA</p>
          <p className="mt-2">
            Email:{' '}
            <a className="font-semibold text-[#0A7F7A] underline underline-offset-4 hover:text-[#064F4B]" href="mailto:terms-conditions@oruma.me">
              terms-conditions@oruma.me
            </a>
          </p>
          <p className="mt-2">
            Or through the official{' '}
            <a className="font-semibold text-[#0A7F7A] underline underline-offset-4 hover:text-[#064F4B]" href="/contact">
              contact page
            </a>{' '}
            available on ORUMA.ME.
          </p>
        </div>
      </section>
    </LegalPolicyLayout>
  );
}
