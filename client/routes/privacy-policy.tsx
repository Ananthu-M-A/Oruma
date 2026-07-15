import React from 'react';
import LegalPolicyLayout from '../components/LegalPolicyLayout';

export const meta = {
  title: 'Privacy Policy | ORUMA',
  description: 'Learn how ORUMA collects, uses, stores, shares, and protects personal and wellness information.'
};

const listClassName = 'mt-4 space-y-3 list-disc pl-6 marker:text-[#0A7F7A]';
const sectionHeadingClassName = 'text-2xl md:text-3xl font-heading font-bold text-[#064F4B] mb-5 leading-tight';

export default function PrivacyPolicyPage() {
  return (
    <LegalPolicyLayout
      title="Privacy Policy"
      effectiveDate="April 14, 2026"
      introduction="This Privacy Policy explains how ORUMA.ME collects, uses, stores, shares, and protects information when users access our digital wellness platform, dashboards, booking tools, payment flows, video consultation workflows, and support services."
    >
      <section id="information-we-collect">
        <h2 className={sectionHeadingClassName}>1. Information We Collect</h2>
        <p>We may collect the following categories of information:</p>
        <ul className={listClassName}>
          <li><strong className="text-[#2E3E3C]">Account and Identity Information:</strong> Name, email address, phone number, age, gender, login credentials, and user role.</li>
          <li><strong className="text-[#2E3E3C]">Appointment and Wellness Information:</strong> Information shared during appointment booking, intake forms, case sheet creation, support requests, therapist communication, and consultation history.</li>
          <li><strong className="text-[#2E3E3C]">Payment Information:</strong> Payment status, transaction references, invoice details, refund records, and payment gateway identifiers. ORUMA does not store complete card details, UPI credentials, net banking passwords, or other sensitive payment credentials.</li>
          <li><strong className="text-[#2E3E3C]">Communication Information:</strong> Email correspondence, WhatsApp/SMS delivery information, support tickets, feedback, and administrative communications.</li>
          <li><strong className="text-[#2E3E3C]">Technical Information:</strong> IP address, browser and device information, approximate location, pages visited, cookies or similar technologies (where applicable), and security logs used to maintain platform reliability and prevent fraud.</li>
        </ul>
      </section>

      <section id="how-we-use-information">
        <h2 className={sectionHeadingClassName}>2. How We Use Your Information</h2>
        <p>We use collected information to:</p>
        <ul className={listClassName}>
          <li>Create and manage user, therapist, and administrator accounts.</li>
          <li>Schedule appointments, prevent duplicate bookings, generate meeting links, maintain case sheets, and coordinate therapy sessions.</li>
          <li>Process payments, invoices, receipts, refunds, and related transaction support.</li>
          <li>Send booking confirmations, OTPs, appointment reminders, session links, payment updates, and customer support communications.</li>
          <li>Improve platform security, detect misuse, troubleshoot technical issues, comply with legal obligations, and maintain operational records.</li>
        </ul>
      </section>

      <section id="sensitive-wellness-information">
        <h2 className={sectionHeadingClassName}>3. Sensitive Wellness Information</h2>
        <p>Mental health information, therapy notes, symptoms, treatment preferences, consultation history, and related wellness records are treated as confidential.</p>
        <p className="mt-4">Access to such information is limited to:</p>
        <ul className={listClassName}>
          <li>Assigned therapists providing care.</li>
          <li>Authorized ORUMA administrators for operational support, dispute resolution, quality assurance, legal compliance, and platform administration.</li>
        </ul>
        <p className="mt-5">Users are encouraged to provide only information that is reasonably necessary for booking, consultation, support, and continuity of care.</p>
      </section>

      <section id="legal-basis-and-consent">
        <h2 className={sectionHeadingClassName}>4. Legal Basis and Consent</h2>
        <p>By creating an account, booking an appointment, submitting forms, contacting support, or using the ORUMA platform, users consent to the collection and processing of their information as described in this Privacy Policy.</p>
        <p className="mt-4">Where applicable, ORUMA processes personal information for:</p>
        <ul className={listClassName}>
          <li>Service delivery.</li>
          <li>User consent.</li>
          <li>Legal and regulatory compliance.</li>
          <li>Payment processing.</li>
          <li>Security and fraud prevention.</li>
          <li>Legitimate business and platform operations.</li>
        </ul>
        <p className="mt-5">Users may withdraw consent or request modifications to their personal information, subject to applicable legal, billing, clinical, dispute resolution, and record-retention requirements.</p>
      </section>

      <section id="sharing-of-information">
        <h2 className={sectionHeadingClassName}>5. Sharing of Information</h2>
        <p>Information may be shared with:</p>
        <ul className={listClassName}>
          <li>Assigned therapists.</li>
          <li>Authorized ORUMA personnel.</li>
          <li>Payment gateway providers.</li>
          <li>Email, SMS, and WhatsApp communication providers.</li>
          <li>Video consultation providers.</li>
          <li>Cloud hosting providers.</li>
          <li>Analytics and security service providers.</li>
          <li>Government or regulatory authorities when legally required.</li>
        </ul>
        <p className="mt-5">Third-party service providers are expected to use personal information only for providing services to ORUMA and in accordance with applicable legal obligations.</p>
        <p className="mt-4 font-semibold text-[#2E3E3C]">ORUMA does not sell users&apos; personal or wellness information.</p>
      </section>

      <section id="data-security">
        <h2 className={sectionHeadingClassName}>6. Data Security</h2>
        <p>ORUMA implements reasonable administrative, technical, and organizational safeguards, including:</p>
        <ul className={listClassName}>
          <li>Role-based access controls.</li>
          <li>Authentication mechanisms.</li>
          <li>Encryption during data transmission where supported.</li>
          <li>Restricted administrative access.</li>
          <li>Security monitoring and operational safeguards.</li>
        </ul>
        <p className="mt-5">While ORUMA takes reasonable measures to protect user information, no online platform can guarantee absolute security. Users are responsible for maintaining the confidentiality of their login credentials and should promptly report any suspected unauthorized access.</p>
      </section>

      <section id="data-retention">
        <h2 className={sectionHeadingClassName}>7. Data Retention</h2>
        <p>ORUMA retains account information, appointment records, case sheets, invoices, payment records, support communications, and related operational data only for as long as necessary to:</p>
        <ul className={listClassName}>
          <li>Deliver services.</li>
          <li>Maintain continuity of care.</li>
          <li>Comply with legal and regulatory obligations.</li>
          <li>Resolve disputes.</li>
          <li>Meet accounting and record-keeping requirements.</li>
        </ul>
        <p className="mt-5">Certain records may continue to be retained after account closure where required by applicable law or legitimate operational needs.</p>
      </section>

      <section id="user-rights">
        <h2 className={sectionHeadingClassName}>8. User Rights</h2>
        <p>Subject to applicable law, users may request:</p>
        <ul className={listClassName}>
          <li>Access to their personal information.</li>
          <li>Correction or updating of inaccurate information.</li>
          <li>Deletion of eligible personal information.</li>
          <li>Restriction of processing where applicable.</li>
          <li>Clarification regarding how their information is collected and used.</li>
        </ul>
        <p className="mt-5">Requests may require identity verification before processing.</p>
      </section>

      <section id="children-and-minors">
        <h2 className={sectionHeadingClassName}>9. Children and Minors</h2>
        <p>ORUMA services are intended for individuals who are legally permitted to consent to counselling and digital wellness services.</p>
        <p className="mt-4">Where services are provided to a minor, parental or legal guardian consent and involvement may be required in accordance with applicable laws.</p>
        <p className="mt-4">ORUMA does not knowingly use minors&apos; information for advertising, profiling, or purposes unrelated to providing wellness services.</p>
      </section>

      <section id="policy-changes">
        <h2 className={sectionHeadingClassName}>10. Changes to this Privacy Policy</h2>
        <p>ORUMA may update this Privacy Policy from time to time to reflect changes in legal requirements, platform functionality, or business practices.</p>
        <p className="mt-4">The updated version will be published on this page with the revised Effective Date. Continued use of the platform after such updates constitutes acceptance of the revised Privacy Policy.</p>
      </section>

      <section id="contact-and-grievances">
        <h2 className={sectionHeadingClassName}>11. Contact and Privacy Grievances</h2>
        <p>For questions regarding this Privacy Policy or to request access, correction, deletion, or other privacy-related assistance, please contact:</p>
        <div className="mt-6 rounded-2xl bg-[#F5F8F7] border border-[#064F4B]/10 p-6 md:p-8">
          <p className="font-bold text-[#064F4B] text-lg">ORUMA</p>
          <p className="mt-2">
            Email:{' '}
            <a className="font-semibold text-[#0A7F7A] underline underline-offset-4 hover:text-[#064F4B]" href="mailto:privacy@oruma.me">
              privacy@oruma.me
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
        <p className="mt-5">Please include sufficient information to enable ORUMA to verify your identity and process your request appropriately.</p>
      </section>
    </LegalPolicyLayout>
  );
}

