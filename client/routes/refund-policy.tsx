import React from 'react';
import LegalPolicyLayout from '../components/LegalPolicyLayout';

export const meta = {
  title: 'Cancellation and Refund Policy | ORUMA',
  description: 'Read ORUMA’s cancellation eligibility, refund request process, and payment timelines for counselling and wellness appointments.'
};

const listClassName = 'mt-4 space-y-3 list-disc pl-6 marker:text-[#0A7F7A]';
const sectionHeadingClassName = 'text-2xl md:text-3xl font-heading font-bold text-[#064F4B] mb-5 leading-tight';
const linkClassName = 'font-semibold text-[#0A7F7A] underline underline-offset-4 hover:text-[#064F4B]';

export default function RefundPolicyPage() {
  return (
    <LegalPolicyLayout
      title="Cancellation and Refund Policy"
      effectiveDate="July 19, 2026"
      introduction="This policy explains how ORUMA Wellness, operating ORUMA.ME, handles appointment cancellations, refund requests, duplicate or failed payments, UPI and QR transactions, and other payment-related situations for its digital counselling and wellness services."
    >
      <section id="policy-summary">
        <h2 className={sectionHeadingClassName}>1. Policy Summary</h2>
        <div className="rounded-2xl border border-[#0A7F7A]/20 bg-[#0A7F7A]/5 p-6 md:p-8">
          <ul className="space-y-3 list-disc pl-6 marker:text-[#0A7F7A]">
            <li>A user-requested cancellation must be submitted within one (1) hour of booking confirmation and before the consultation begins.</li>
            <li>Eligible refund requests must be submitted within seven (7) calendar days of the applicable payment, debit, cancellation, or scheduled appointment.</li>
            <li>ORUMA will acknowledge a complete request within two (2) working days and communicate its decision within five (5) working days.</li>
            <li>Approved refunds will be initiated within two (2) working days of approval to the original payment method.</li>
            <li>After initiation, normal refunds generally reach the original bank, card, wallet, or UPI account within five to seven (5–7) working days, subject to the payment provider or bank.</li>
          </ul>
        </div>
      </section>

      <section id="scope">
        <h2 className={sectionHeadingClassName}>2. Scope</h2>
        <p>This policy applies to counselling, therapy, wellness consultations, session packages, and related digital services booked or paid for through ORUMA.ME.</p>
        <p className="mt-4">Payments may be processed through Razorpay, UPI, QR code, cards, net banking, wallets, or other payment methods offered at checkout. Refund eligibility is determined by ORUMA under this policy; Razorpay and other payment providers process the return of funds after ORUMA approves and initiates a refund.</p>
      </section>

      <section id="cancellation-eligibility">
        <h2 className={sectionHeadingClassName}>3. Cancellation Eligibility</h2>
        <p>A booked appointment may be cancelled within one (1) hour of successful booking confirmation, provided the consultation has not already started. A cancellation received within this window is eligible for a full refund of the amount paid for that appointment.</p>
        <p className="mt-4">After the one-hour window, the booking is generally non-cancellable and non-refundable. ORUMA may offer rescheduling, therapist reassignment, account credit, or another remedy at its discretion where justified by the circumstances.</p>
        <p className="mt-4">
          Cancellation requests are also governed by the detailed ORUMA{' '}
          <a className={linkClassName} href="/cancellation-policy">Cancellation Policy</a>.
        </p>
      </section>

      <section id="eligible-refunds">
        <h2 className={sectionHeadingClassName}>4. Eligible Refund Situations</h2>
        <p>A full or partial refund may be approved in the following circumstances:</p>
        <ul className={listClassName}>
          <li>ORUMA or the assigned therapist cannot provide a confirmed and paid consultation, and the user does not accept the offered rescheduling or therapist reassignment.</li>
          <li>A cancellation is submitted within the permitted one-hour cancellation window and before the consultation begins.</li>
          <li>A duplicate payment, accidental overpayment, payment gateway error, or failed booking causes a successful debit without a corresponding confirmed appointment.</li>
          <li>A payment is captured for an incorrect amount and the discrepancy is verified.</li>
          <li>An ORUMA-side or therapist-side technical problem prevents the paid consultation from being delivered and rescheduling is not accepted or reasonably possible.</li>
          <li>ORUMA determines after documented review that a full or partial refund is appropriate.</li>
        </ul>
        <p className="mt-5">For a partially used package, any approved partial refund will be limited to the eligible, unused portion after deducting the value of completed or commenced sessions and any non-refundable third-party charges disclosed at checkout.</p>
      </section>

      <section id="non-refundable-situations">
        <h2 className={sectionHeadingClassName}>5. Non-Refundable Situations</h2>
        <p>Refunds will generally not be provided when:</p>
        <ul className={listClassName}>
          <li>The user does not attend a confirmed appointment or joins so late that the session cannot be completed.</li>
          <li>Incorrect contact information, user unavailability, or failure to access the provided session link prevents the consultation.</li>
          <li>The consultation has started or has been completed.</li>
          <li>The user cancels after the one-hour cancellation window.</li>
          <li>The user voluntarily stops attending, postpones sessions indefinitely, or takes a break from a booked treatment package.</li>
          <li>The request is based only on dissatisfaction with therapeutic progress after the agreed service has been delivered.</li>
          <li>User-side device, internet, software, or connectivity problems prevent attendance.</li>
          <li>Payment gateway, bank, card, currency-conversion, or other third-party fees are non-refundable under the provider&apos;s terms.</li>
        </ul>
      </section>

      <section id="request-window-and-process">
        <h2 className={sectionHeadingClassName}>6. Refund Request Window and Process</h2>
        <p>Eligible refund requests must be submitted within seven (7) calendar days of the relevant payment, successful debit, approved cancellation, or scheduled appointment, whichever applies to the request. Requests received later may be declined unless ORUMA determines that exceptional circumstances justify a review.</p>
        <p className="mt-4">Submit the request through the official ORUMA <a className={linkClassName} href="/contact">contact page</a>, the platform support-ticket system, or email <a className={linkClassName} href="mailto:refund-policy@oruma.me">refund-policy@oruma.me</a>.</p>
        <p className="mt-6">The request should include:</p>
        <ul className={listClassName}>
          <li>Registered name, email address, and phone number</li>
          <li>Appointment date, time, service, and therapist name</li>
          <li>Amount paid and date of payment</li>
          <li>Razorpay Payment ID, payment reference, or transaction ID</li>
          <li>UPI UTR/RRN or QR payment reference, where applicable</li>
          <li>Reason for the refund request and relevant supporting evidence</li>
        </ul>
        <p className="mt-5">ORUMA may review payment records, appointment and attendance history, therapist confirmation, communications, and gateway responses before deciding the request. Missing information may pause the review timeline until the required details are received.</p>
      </section>

      <section id="review-and-refund-timeline">
        <h2 className={sectionHeadingClassName}>7. Review and Refund Timeline</h2>
        <ul className={listClassName}>
          <li>ORUMA will acknowledge a complete request within two (2) working days.</li>
          <li>ORUMA will normally approve or decline the request within five (5) working days after receiving all required information.</li>
          <li>An approved refund will be initiated within two (2) working days of approval.</li>
          <li>Refunds are returned only to the original payment source. A UPI or QR payment will be refunded to the originating UPI-linked account; it cannot be redirected to another account or paid in cash.</li>
          <li>Normal refunds generally reach the original payment source within five to seven (5–7) working days after initiation. The final timing is controlled by Razorpay, the bank, card issuer, wallet, UPI provider, or payment network.</li>
        </ul>
        <p className="mt-5">If an approved refund is not visible after seven (7) working days from initiation, contact ORUMA with the refund reference or Razorpay Refund ID so that its status can be traced.</p>
      </section>

      <section id="upi-qr-and-duplicate-payments">
        <h2 className={sectionHeadingClassName}>8. UPI, QR, Failed, and Duplicate Payments</h2>
        <p>If a bank or UPI account is debited but ORUMA does not show a successful payment or confirmed appointment, the user should not immediately make repeated payments. The user should first check the payment status and contact ORUMA with the UTR/RRN, Razorpay Payment ID, amount, and payment date.</p>
        <p className="mt-4">Where the payment is confirmed as failed, the bank or payment network may automatically reverse the debit. Where ORUMA or Razorpay confirms that funds were captured, ORUMA will either confirm the booking or initiate an eligible refund under the timelines stated above.</p>
        <p className="mt-4">For a verified duplicate payment, ORUMA will refund the duplicate amount to the original payment source. The valid payment for the confirmed appointment will remain unaffected.</p>
      </section>

      <section id="rescheduling-and-alternatives">
        <h2 className={sectionHeadingClassName}>9. Rescheduling and Alternatives</h2>
        <p>Depending on the circumstances, ORUMA may offer rescheduling, therapist reassignment, account credit, a partial refund, or a full refund.</p>
        <p className="mt-4">If the user accepts rescheduling, therapist reassignment, or account credit for a booking, a separate refund will not be issued for the same amount unless the accepted alternative cannot subsequently be provided by ORUMA.</p>
        <p className="mt-4">Refunds for discounted, promotional, bundled, or special-price services will not exceed the amount actually paid.</p>
      </section>

      <section id="disputes-and-chargebacks">
        <h2 className={sectionHeadingClassName}>10. Disputes and Chargebacks</h2>
        <p>Users are encouraged to contact ORUMA before initiating a bank dispute or chargeback so that the payment and appointment can be reviewed promptly.</p>
        <p className="mt-4">If a dispute or chargeback is raised, ORUMA may provide the payment provider or financial institution with relevant invoices, appointment records, attendance information, cancellation history, policy acceptance records, and communications for resolution.</p>
      </section>

      <section id="policy-changes">
        <h2 className={sectionHeadingClassName}>11. Changes to this Policy</h2>
        <p>ORUMA may revise this policy to reflect operational, legal, payment-network, or business changes. The latest version will be published on this page with its updated Effective Date.</p>
        <p className="mt-4">A change will not reduce or remove a refund already approved before the revised policy takes effect.</p>
      </section>

      <section id="contact">
        <h2 className={sectionHeadingClassName}>12. Contact</h2>
        <p>For cancellation, payment, or refund assistance, contact:</p>
        <div className="mt-6 rounded-2xl bg-[#F5F8F7] border border-[#064F4B]/10 p-6 md:p-8">
          <p className="font-bold text-[#064F4B] text-lg">ORUMA Wellness / ORUMA.ME</p>
          <p className="mt-2">Email: <a className={linkClassName} href="mailto:refund-policy@oruma.me">refund-policy@oruma.me</a></p>
          <p className="mt-2">Phone/WhatsApp: <a className={linkClassName} href="https://wa.me/918136919987">+91 81369 19987</a></p>
          <p className="mt-2">Location: Trivandrum, Kerala, India</p>
          <p className="mt-2">Support: <a className={linkClassName} href="/contact">Official contact page</a></p>
        </div>
      </section>
    </LegalPolicyLayout>
  );
}
