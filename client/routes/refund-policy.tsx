import React from 'react';
import LegalPolicyLayout from '../components/LegalPolicyLayout';

export const meta = {
  title: 'Refund Policy | ORUMA',
  description: 'Learn how ORUMA handles refunds for appointments, consultations, payment failures, duplicate transactions, and eligible cancellations.'
};

const listClassName = 'mt-4 space-y-3 list-disc pl-6 marker:text-[#0A7F7A]';
const sectionHeadingClassName = 'text-2xl md:text-3xl font-heading font-bold text-[#064F4B] mb-5 leading-tight';
const linkClassName = 'font-semibold text-[#0A7F7A] underline underline-offset-4 hover:text-[#064F4B]';

export default function RefundPolicyPage() {
  return (
    <LegalPolicyLayout
      title="Refund Policy"
      effectiveDate="April 14, 2026"
      introduction="This Refund Policy explains how ORUMA.ME handles refund requests for appointments, digital consultations, payment failures, duplicate transactions, cancellations, and other eligible payment-related situations."
    >
      <section id="scope">
        <h2 className={sectionHeadingClassName}>1. Scope</h2>
        <p>This Refund Policy applies to counselling, therapy, wellness consultations, and related digital services booked or paid for through ORUMA.ME.</p>
        <p className="mt-4">Refund eligibility depends on factors including appointment status, therapist availability, payment confirmation, payment gateway verification, cancellation eligibility, user attendance, and administrative review.</p>
      </section>

      <section id="eligible-refund-situations">
        <h2 className={sectionHeadingClassName}>2. Eligible Refund Situations</h2>
        <p>A refund may be considered in the following circumstances:</p>
        <ul className={listClassName}>
          <li>ORUMA or the assigned therapist is unable to provide a confirmed and paid consultation.</li>
          <li>A duplicate payment, accidental overpayment, payment gateway error, or failed booking results in a successful debit without a confirmed appointment.</li>
          <li>A cancellation is approved in accordance with the ORUMA Cancellation Policy.</li>
          <li>ORUMA determines that a refund is appropriate following administrative review of the circumstances.</li>
        </ul>
        <p className="mt-5">If the inability to conduct scheduled sessions or continue the planned course of therapy is due to ORUMA or the assigned therapist, ORUMA may offer a full refund, partial refund, therapist reassignment, or rescheduling, depending on the circumstances.</p>
      </section>

      <section id="non-refundable-situations">
        <h2 className={sectionHeadingClassName}>3. Non-Refundable Situations</h2>
        <p>Refunds will generally not be provided in the following situations:</p>
        <ul className={listClassName}>
          <li>The user does not attend a confirmed appointment.</li>
          <li>The user joins a session significantly late and the session cannot be completed as scheduled.</li>
          <li>Incorrect contact information or user unavailability prevents the consultation from taking place.</li>
          <li>The consultation has already started or has been completed.</li>
          <li>The user has booked multiple sessions as part of a treatment plan but voluntarily stops attending, postpones sessions indefinitely, or takes a break before completing the planned sessions.</li>
          <li>The user fails to attend recommended follow-up sessions or does not reasonably follow the therapist&apos;s treatment plan, therapeutic guidance, or medication instructions (where medication has been lawfully prescribed by a qualified medical professional), and subsequently requests a refund based on the progress or outcome of therapy.</li>
          <li>The refund request relates solely to dissatisfaction with therapeutic progress where the agreed services have already been delivered.</li>
          <li>Payment gateway charges, bank processing fees, currency conversion charges, or other third-party fees that are non-refundable under the respective provider&apos;s policies.</li>
        </ul>
      </section>

      <section id="refund-process">
        <h2 className={sectionHeadingClassName}>4. Refund Process</h2>
        <p>Refund requests may be submitted through:</p>
        <ul className={listClassName}>
          <li>
            The official ORUMA{' '}
            <a className={linkClassName} href="/contact">contact page</a>.
          </li>
          <li>The support ticket system available on the platform.</li>
          <li>
            Email at{' '}
            <a className={linkClassName} href="mailto:Oruma987@gmail.com">Oruma987@gmail.com</a>.
          </li>
        </ul>
        <p className="mt-6">Users should include:</p>
        <ul className={listClassName}>
          <li>Registered name</li>
          <li>Registered email address</li>
          <li>Registered phone number</li>
          <li>Appointment details</li>
          <li>Payment reference or transaction ID</li>
          <li>Reason for the refund request</li>
        </ul>
        <p className="mt-5">ORUMA may review payment records, appointment history, therapist confirmations, communication records, and payment gateway responses before approving or declining a refund request.</p>
      </section>

      <section id="refund-timelines">
        <h2 className={sectionHeadingClassName}>5. Refund Timelines</h2>
        <p>Where a refund is approved:</p>
        <ul className={listClassName}>
          <li>Refunds will generally be processed to the original payment method used for the transaction.</li>
          <li>ORUMA will initiate the refund within a reasonable period after approval.</li>
          <li>The final credit of funds depends on the payment gateway, bank, card issuer, UPI provider, or wallet provider.</li>
        </ul>
        <p className="mt-5">Processing times may vary depending on the financial institution. ORUMA cannot guarantee the exact date on which refunded funds will appear in the user&apos;s account after the refund has been initiated.</p>
      </section>

      <section id="partial-refunds-and-rescheduling">
        <h2 className={sectionHeadingClassName}>6. Partial Refunds and Rescheduling</h2>
        <p>Depending on the circumstances, ORUMA may offer:</p>
        <ul className={listClassName}>
          <li>Full refund</li>
          <li>Partial refund</li>
          <li>Appointment rescheduling</li>
          <li>Therapist reassignment</li>
          <li>Account credit (where applicable)</li>
        </ul>
        <p className="mt-5">Where a user accepts an offered rescheduled appointment or therapist reassignment, a separate refund may not be issued for the same booking.</p>
        <p className="mt-4">Refunds for discounted, promotional, bundled, or special-price services will be limited to the amount actually paid by the user.</p>
      </section>

      <section id="disputes-and-chargebacks">
        <h2 className={sectionHeadingClassName}>7. Disputes and Chargebacks</h2>
        <p>Users are encouraged to contact ORUMA before initiating a payment dispute or chargeback through their bank or payment provider.</p>
        <p className="mt-4">Where a chargeback or payment dispute is raised, ORUMA may provide relevant appointment records, invoices, payment information, cancellation history, and communication records to the payment provider or financial institution for dispute resolution.</p>
      </section>

      <section id="changes-to-refund-policy">
        <h2 className={sectionHeadingClassName}>8. Changes to this Refund Policy</h2>
        <p>ORUMA may revise this Refund Policy from time to time to reflect operational, legal, or business changes.</p>
        <p className="mt-4">The latest version will be published on this page together with the updated Effective Date.</p>
        <p className="mt-4">Continued use of ORUMA services after such changes constitutes acceptance of the revised Refund Policy.</p>
      </section>

      <section id="contact">
        <h2 className={sectionHeadingClassName}>9. Contact</h2>
        <p>For refund requests or questions regarding this Refund Policy, please contact:</p>
        <div className="mt-6 rounded-2xl bg-[#F5F8F7] border border-[#064F4B]/10 p-6 md:p-8">
          <p className="font-bold text-[#064F4B] text-lg">ORUMA</p>
          <p className="mt-2">
            Email:{' '}
            <a className={linkClassName} href="mailto:refund-policy@oruma.me">
              refund-policy@oruma.me
            </a>
          </p>
          <p className="mt-2">
            Or through the official{' '}
            <a className={linkClassName} href="/contact">contact page</a>{' '}
            available on ORUMA.ME.
          </p>
        </div>
      </section>
    </LegalPolicyLayout>
  );
}

