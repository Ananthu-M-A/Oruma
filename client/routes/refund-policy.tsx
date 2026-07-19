import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const meta = {
  title: 'Refund Policy | ORUMA Wellness',
  description:
    'Read the ORUMA refund policy for counselling appointments, payment failures, duplicate payments, gateway timelines, and support requests.',
};

const sections = [
  {
    title: '1. Scope',
    body: [
      'This Refund Policy applies to counselling, therapy, wellness consultation, and related digital services booked or paid for through ORUMA.ME.',
      'Refund handling may depend on appointment status, therapist availability, payment gateway confirmation, bank processing timelines, and administrative review.',
    ],
  },
  {
    title: '2. Eligible Refund Situations',
    body: [
      'A full refund of the amount actually paid may be approved when a user cancels within the one-hour online cancellation window stated in the Cancellation Policy and before the appointment starts.',
      'A full refund or free rescheduling will be offered when ORUMA or the assigned therapist is unable to provide a confirmed paid session, unless the user accepts another suitable remedy.',
      'A full or partial refund may be approved for a verified duplicate payment, payment gateway error, accidental overpayment, or failed booking where money was debited and no appointment was confirmed.',
    ],
  },
  {
    title: '3. Non-Refundable Situations',
    body: [
      'Fees are normally non-refundable when a user requests cancellation after the one-hour cancellation window, does not attend, joins late, provides incorrect contact details, or is unavailable at the scheduled time.',
      'Fees are non-refundable after a consultation has started or has been completed, except where ORUMA confirms a service failure attributable to ORUMA or the therapist.',
      'User-side device, internet, software, or session-link access issues do not normally qualify for a refund. Any fee or charge that was not collected by ORUMA may remain subject to the relevant third party rules.',
    ],
  },
  {
    title: '4. Refund Process',
    body: [
      'Users can request a refund by contacting ORUMA support through the official contact page, dashboard support ticket, or email at Oruma987@gmail.com.',
      'Refund requests should include the registered name, email address, phone number, appointment details, payment reference, and reason for the request.',
      'ORUMA may verify the payment status, appointment records, communication history, therapist confirmation, and gateway response before approving or declining a refund.',
      'Requests should be submitted within seven (7) calendar days of the cancellation, failed service, duplicate debit, or other event giving rise to the request. This does not limit any non-waivable right available under applicable law.',
    ],
  },
  {
    title: '5. Refund Timelines',
    body: [
      'ORUMA will normally acknowledge a complete refund request within two (2) business days, decide it within five (5) business days, and initiate an approved refund within two (2) business days after approval.',
      'For payments collected through Razorpay, approved refunds are sent through Razorpay to the original payment method used for the transaction. ORUMA will not ask the user to provide a different UPI ID, QR code, card, or bank account for such a refund. A manually recorded or offline payment, if any, will be refunded through the applicable original collection channel.',
      'After initiation, UPI, card, net-banking, or wallet credits normally appear within five (5) to seven (7) working days, subject to Razorpay, the bank, and the payment provider. A failed or pending payment may instead be automatically reversed by the provider.',
      'If the refund is not visible after seven working days, the user should contact ORUMA with the payment and refund reference so the status can be traced.',
    ],
  },
  {
    title: '6. Partial Refunds and Rescheduling',
    body: [
      'ORUMA may offer a partial refund, full refund, or rescheduled appointment depending on the facts of the request.',
      'When rescheduling is available and accepted, a separate refund may not be issued for the same appointment.',
      'Refunds for discounted, promotional, bundled, or special-price services may be calculated based on the actual paid amount.',
      'ORUMA will never refund more than the amount successfully captured for the relevant payment.',
    ],
  },
  {
    title: '7. Disputes and Chargebacks',
    body: [
      'Users are encouraged to contact ORUMA support before raising a chargeback or payment dispute.',
      'If a payment dispute is opened with a bank or gateway, ORUMA may share appointment, payment, invoice, cancellation, and communication records with the relevant provider to respond to the dispute.',
    ],
  },
  {
    title: '8. Changes to this Refund Policy',
    body: [
      'ORUMA may update this Refund Policy from time to time to reflect operational, legal, payment-provider, or business changes. The latest version will be published on this page with its revised effective date.',
      'Continued use of ORUMA services after an update constitutes acceptance of the revised Refund Policy.',
    ],
  },
  {
    title: '9. Contact',
    body: [
      'For refund questions or requests, contact ORUMA at refund-policy@oruma.me, use the dashboard support system, or use the official contact page.',
      'All appointment dates, cancellation windows, and support timestamps referred to in this policy are interpreted in Indian Standard Time (IST, Asia/Kolkata). Payment-provider processing periods are counted in working or business days as stated above.',
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#F8FBF8] font-body text-[#2E3E3C]">
      <Navbar />
      <section className="bg-[#F5F8F7] px-6 pb-16 pt-36 md:pt-44">
        <div className="mx-auto max-w-4xl">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0A7F7A]">
            Legal
          </p>
          <h1 className="mt-4 text-4xl font-heading font-black leading-tight text-[#064F4B] md:text-6xl">
            Refund Policy
          </h1>
          <p className="mt-6 max-w-3xl text-lg font-medium leading-relaxed text-[#5F7F7A]">
            This Refund Policy explains how ORUMA.ME handles refund requests
            for appointments, digital consultations, payment failures, duplicate
            transactions, and approved cancellations.
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
                  <p
                    key={item}
                    className="text-base font-medium leading-relaxed text-[#5F7F7A]"
                  >
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

