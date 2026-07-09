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
      'A refund may be considered when ORUMA or the assigned therapist is unable to provide a confirmed paid session.',
      'A refund may be considered for duplicate payments, payment gateway errors, accidental overpayment, or a failed booking where money was debited and no appointment was confirmed.',
      'A refund may also be considered when ORUMA approves cancellation under the Cancellation Policy.',
    ],
  },
  {
    title: '3. Non-Refundable Situations',
    body: [
      'Fees may be non-refundable when a user does not attend a confirmed session, joins late, provides incorrect contact details, or is unavailable at the scheduled time.',
      'Fees may be non-refundable after a consultation has started or has been completed.',
      'Gateway fees, bank charges, currency conversion charges, or third-party charges may be non-refundable where applicable.',
    ],
  },
  {
    title: '4. Refund Process',
    body: [
      'Users can request a refund by contacting ORUMA support through the official contact page, dashboard support ticket, or email at Oruma987@gmail.com.',
      'Refund requests should include the registered name, email address, phone number, appointment details, payment reference, and reason for the request.',
      'ORUMA may verify the payment status, appointment records, communication history, therapist confirmation, and gateway response before approving or declining a refund.',
    ],
  },
  {
    title: '5. Refund Timelines',
    body: [
      'Approved refunds are usually initiated to the original payment method.',
      'After ORUMA initiates a refund, the final credit timeline depends on the payment gateway, bank, card network, wallet, or UPI provider.',
      'Typical bank-side processing may take several business days. ORUMA cannot guarantee exact bank settlement dates after the refund is handed to the payment provider.',
    ],
  },
  {
    title: '6. Partial Refunds and Rescheduling',
    body: [
      'ORUMA may offer a partial refund, full refund, or rescheduled appointment depending on the facts of the request.',
      'When rescheduling is available and accepted, a separate refund may not be issued for the same appointment.',
      'Refunds for discounted, promotional, bundled, or special-price services may be calculated based on the actual paid amount.',
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
    title: '8. Contact',
    body: [
      'For refund questions or requests, contact ORUMA at Oruma987@gmail.com or through the official contact page.',
      'ORUMA may update this Refund Policy from time to time. Updated terms will be posted on this page.',
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
            Effective date: July 9, 2026
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

