import React from 'react';
import LegalPolicyLayout from '../components/LegalPolicyLayout';

export const meta = {
  title: 'Cancellation and Refund Policy | ORUMA',
  description: 'Read ORUMA’s appointment cancellation window, rescheduling rules, refund eligibility, and payment processing timelines.'
};

const listClassName = 'mt-4 space-y-3 list-disc pl-6 marker:text-[#0A7F7A]';
const sectionHeadingClassName = 'text-2xl md:text-3xl font-heading font-bold text-[#064F4B] mb-5 leading-tight';
const linkClassName = 'font-semibold text-[#0A7F7A] underline underline-offset-4 hover:text-[#064F4B]';

export default function CancellationPolicyPage() {
  return (
    <LegalPolicyLayout
      title="Cancellation and Refund Policy"
      effectiveDate="July 19, 2026"
      introduction="This policy explains how ORUMA Wellness, operating ORUMA.ME, handles appointment cancellations, rescheduling, late arrivals, no-shows, provider-initiated changes, and refunds for counselling and digital wellness services."
    >
      <section id="policy-summary">
        <h2 className={sectionHeadingClassName}>1. Policy Summary</h2>
        <div className="rounded-2xl border border-[#0A7F7A]/20 bg-[#0A7F7A]/5 p-6 md:p-8">
          <ul className="space-y-3 list-disc pl-6 marker:text-[#0A7F7A]">
            <li>Cancel within one (1) hour of successful booking confirmation and before the consultation begins to qualify for a full refund.</li>
            <li>After the one-hour window, the booking is generally non-cancellable and non-refundable, although rescheduling or another remedy may be offered.</li>
            <li>Eligible refunds are initiated within two (2) working days after approval and normally reach the original payment source within five to seven (5–7) working days after initiation.</li>
            <li>UPI and QR refunds are returned to the original UPI-linked account and cannot be redirected to a different account.</li>
          </ul>
        </div>
      </section>

      <section id="scope">
        <h2 className={sectionHeadingClassName}>2. Scope</h2>
        <p>This policy applies to counselling sessions, therapy consultations, wellness appointments, session packages, and related digital services booked through ORUMA.ME.</p>
        <p className="mt-4">It applies to payments made through Razorpay, UPI, QR code, cards, net banking, wallets, or other methods offered at checkout.</p>
      </section>

      <section id="user-cancellation">
        <h2 className={sectionHeadingClassName}>3. User Cancellation Window</h2>
        <p>A user may cancel a booked appointment within one (1) hour of successfully confirming the booking, provided the consultation has not already started. A valid cancellation received within this window is eligible for a full refund of the amount paid for the cancelled appointment.</p>
        <p className="mt-4">The cancellation request timestamp recorded by the ORUMA dashboard, support ticket, contact form, WhatsApp, or email will be used to determine whether the request was made within the permitted window.</p>
        <p className="mt-4">After the one-hour window expires, the cancellation option may no longer be available and the booking will generally be non-refundable. ORUMA may still offer rescheduling, therapist reassignment, account credit, or another remedy after reviewing exceptional circumstances.</p>
        <p className="mt-6">Submit a cancellation request using the dashboard, support-ticket system, official <a className={linkClassName} href="/contact">contact page</a>, or email <a className={linkClassName} href="mailto:cancellation-policy@oruma.me">cancellation-policy@oruma.me</a>.</p>
        <p className="mt-6">Include:</p>
        <ul className={listClassName}>
          <li>Registered name, email address, and phone number</li>
          <li>Appointment date, time, service, and therapist name</li>
          <li>Payment amount and payment date</li>
          <li>Razorpay Payment ID, transaction ID, or UPI UTR/RRN</li>
          <li>Reason for cancellation</li>
        </ul>
      </section>

      <section id="rescheduling">
        <h2 className={sectionHeadingClassName}>4. Rescheduling</h2>
        <p>ORUMA may offer rescheduling instead of cancellation, subject to therapist availability. A rescheduling request should be submitted before the scheduled appointment time.</p>
        <p className="mt-4">If the user accepts a rescheduled appointment, therapist reassignment, or account credit, a separate refund will not be issued for the same booking unless ORUMA is subsequently unable to provide the accepted alternative.</p>
        <p className="mt-4">Repeated rescheduling requests, frequent last-minute changes, or misuse of the scheduling system may be declined.</p>
      </section>

      <section id="late-arrival-and-no-show">
        <h2 className={sectionHeadingClassName}>5. Late Arrival and No-Show</h2>
        <p>Users are expected to join online sessions at the scheduled time using the session link or instructions provided by ORUMA.</p>
        <ul className={listClassName}>
          <li>If a user joins late, the consultation may still end at the original scheduled time, and lost consultation time may not be compensated.</li>
          <li>If a user does not attend without an approved cancellation or rescheduling request, the appointment will be treated as a no-show and the consultation fee will be non-refundable.</li>
          <li>Incorrect contact details, user unavailability, or failure to use the supplied session instructions does not qualify for a refund.</li>
        </ul>
      </section>

      <section id="provider-cancellation">
        <h2 className={sectionHeadingClassName}>6. Therapist or ORUMA Cancellation</h2>
        <p>If ORUMA or the assigned therapist must cancel a confirmed appointment, ORUMA will notify the user as soon as reasonably possible.</p>
        <p className="mt-4">The user may choose an available rescheduled appointment or therapist reassignment. If the user does not accept the available alternative, or if no reasonable alternative can be provided, ORUMA will approve a full refund of the amount paid for the affected appointment.</p>
        <p className="mt-4">For a partially delivered session package, any refund will be limited to the eligible unused portion after deducting completed or commenced sessions.</p>
      </section>

      <section id="technical-issues">
        <h2 className={sectionHeadingClassName}>7. Technical Issues</h2>
        <p>Users are responsible for a stable internet connection, a compatible device, access to the session link, and a suitable private environment.</p>
        <p className="mt-4">If an ORUMA-system or therapist-side technical failure prevents the consultation, ORUMA will offer rescheduling. If rescheduling is not accepted or reasonably possible, the affected appointment will be eligible for a full refund.</p>
        <p className="mt-4">Technical problems caused by the user&apos;s device, internet connection, software, or failure to follow the supplied instructions generally do not qualify for cancellation, rescheduling, or refund.</p>
      </section>

      <section id="refund-process-and-timeline">
        <h2 className={sectionHeadingClassName}>8. Refund Process and Timeline</h2>
        <p>An eligible refund request should be submitted within seven (7) calendar days of the applicable payment, debit, cancellation, or scheduled appointment.</p>
        <ul className={listClassName}>
          <li>ORUMA will acknowledge a complete request within two (2) working days.</li>
          <li>ORUMA will normally communicate approval or rejection within five (5) working days after all required information is received.</li>
          <li>An approved refund will be initiated within two (2) working days of approval.</li>
          <li>The refund will be sent only to the original payment source.</li>
          <li>Normal refunds generally reach the original bank, card, wallet, or UPI account within five to seven (5–7) working days after initiation, subject to Razorpay, the bank, UPI provider, or payment network.</li>
        </ul>
        <p className="mt-5">If the refund is not visible after seven (7) working days from initiation, contact ORUMA with the payment and refund references.</p>
        <p className="mt-4">
          For complete eligibility, duplicate-payment, partial-refund, and dispute details, read the ORUMA{' '}
          <a className={linkClassName} href="/refund-policy">Cancellation and Refund Policy</a>.
        </p>
      </section>

      <section id="upi-qr-payments">
        <h2 className={sectionHeadingClassName}>9. UPI, QR, and Duplicate Payments</h2>
        <p>If a bank or UPI account is debited but no successful payment or confirmed appointment appears, contact ORUMA with the UTR/RRN, Razorpay Payment ID, amount, and date. Do not make repeated payments until the status is checked.</p>
        <p className="mt-4">A verified duplicate or captured failed-booking payment will be refunded to the original payment source. UPI and QR refunds are returned to the originating UPI-linked account and cannot be paid in cash or redirected to another account.</p>
      </section>

      <section id="emergency-disclaimer">
        <h2 className={sectionHeadingClassName}>10. Emergency Disclaimer</h2>
        <div className="rounded-2xl border border-[#0A7F7A]/20 bg-[#0A7F7A]/5 p-6 md:p-8">
          <p className="font-semibold text-[#064F4B]">ORUMA does not provide emergency medical or crisis intervention services.</p>
        </div>
        <p className="mt-6">Anyone experiencing a medical emergency, mental health crisis, risk of self-harm, risk of harm to others, or another immediate safety concern should contact local emergency services, a nearby hospital, or an appropriate crisis-support service immediately.</p>
        <p className="mt-4">The cancellation and rescheduling provisions of this policy do not apply to emergency-response situations because ORUMA is not an emergency-care provider.</p>
      </section>

      <section id="policy-changes">
        <h2 className={sectionHeadingClassName}>11. Changes to this Policy</h2>
        <p>ORUMA may update this policy to reflect operational, legal, payment-network, or business changes. The latest version will be published on this page with its updated Effective Date.</p>
        <p className="mt-4">A change will not reduce or remove a refund already approved before the revised policy takes effect.</p>
      </section>

      <section id="contact">
        <h2 className={sectionHeadingClassName}>12. Contact</h2>
        <p>For cancellation, rescheduling, payment, or refund assistance, contact:</p>
        <div className="mt-6 rounded-2xl bg-[#F5F8F7] border border-[#064F4B]/10 p-6 md:p-8">
          <p className="font-bold text-[#064F4B] text-lg">ORUMA Wellness / ORUMA.ME</p>
          <p className="mt-2">Email: <a className={linkClassName} href="mailto:cancellation-policy@oruma.me">cancellation-policy@oruma.me</a></p>
          <p className="mt-2">Phone/WhatsApp: <a className={linkClassName} href="https://wa.me/918136919987">+91 81369 19987</a></p>
          <p className="mt-2">Location: Trivandrum, Kerala, India</p>
          <p className="mt-2">Support: <a className={linkClassName} href="/contact">Official contact page</a></p>
        </div>
      </section>
    </LegalPolicyLayout>
  );
}

