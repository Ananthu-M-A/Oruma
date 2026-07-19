import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const meta = {
  title: 'Cancellation Policy | ORUMA Wellness',
  description:
    'Read the ORUMA cancellation policy for counselling appointments, rescheduling, no-shows, late joins, and therapist-initiated changes.',
};

const sections = [
  {
    title: '1. Scope',
    body: [
      'This Cancellation Policy applies to appointments, counselling sessions, therapy consultations, and related services booked through ORUMA.ME.',
      'Appointments are subject to therapist availability, successful booking confirmation, payment status where applicable, and ORUMA operational rules.',
    ],
  },
  {
    title: '2. User Cancellation',
    body: [
      'A user may cancel a booked appointment through the dashboard only during the first one (1) hour after the booking request is created and only before the scheduled appointment has started. The one-hour period is measured from the booking creation time recorded by ORUMA.',
      'After this one-hour window expires, online cancellation is unavailable. The user may submit an exceptional request through a support ticket, the contact page, or Oruma987@gmail.com, but approval and refund are not guaranteed.',
      'A cancellation request should include the registered name, contact details, appointment date and time, therapist name where available, and reason for cancellation.',
      'All appointment, booking-window, cancellation, and availability times displayed by ORUMA are in Indian Standard Time (IST, Asia/Kolkata).',
    ],
  },
  {
    title: '3. Rescheduling',
    body: [
      'ORUMA may offer rescheduling instead of cancellation when suitable therapist availability exists.',
      'Rescheduling requests should be made before the appointment start time and are subject to therapist availability.',
      'Repeated rescheduling or short-notice changes may be declined or treated as a cancellation at ORUMA discretion.',
    ],
  },
  {
    title: '4. Late Arrival and No-Show',
    body: [
      'Users are expected to join online sessions on time using the link or instructions shared by ORUMA.',
      'If a user joins late, the session may still end at the originally scheduled time depending on therapist availability.',
      'If a user does not attend a confirmed appointment, the appointment may be treated as a no-show and the fee may be non-refundable.',
    ],
  },
  {
    title: '5. Therapist or ORUMA Cancellation',
    body: [
      'If a therapist or ORUMA needs to cancel or move a confirmed appointment due to unavoidable reasons, ORUMA will make reasonable efforts to notify the user.',
      'In such cases, ORUMA may offer rescheduling, therapist reassignment where appropriate, credit, or refund according to the Refund Policy.',
    ],
  },
  {
    title: '6. Technical Issues',
    body: [
      'Users are responsible for having a private environment, compatible device, stable internet connection, and access to the session link at the scheduled time.',
      'If technical issues are caused by ORUMA systems or therapist-side availability, ORUMA may review the case for rescheduling or refund.',
      'If technical issues are caused by user-side connectivity, device problems, or missed communication, the appointment may not automatically qualify for a refund.',
    ],
  },
  {
    title: '7. Emergency Disclaimer',
    body: [
      'ORUMA is not an emergency service. Users facing a medical emergency, crisis, risk of self-harm, or immediate safety concern should contact local emergency services or a nearby hospital immediately.',
      'Cancellation or rescheduling rules do not apply to emergency response situations because ORUMA does not provide emergency intervention services.',
    ],
  },
  {
    title: '8. Cancellation and Refund Handling',
    body: [
      'A cancellation recorded within the permitted one-hour window may qualify for a full refund of the amount actually paid. Cancellation does not itself mean that money has already been credited; eligible refunds are reviewed, initiated, and tracked separately under the Refund Policy.',
      'Late cancellation, no-show, late arrival, or a user-side technical problem normally does not qualify for a refund. Exceptional cases may be reviewed by ORUMA on supporting evidence.',
      'A cancelled appointment remains in ORUMA records for payment, refund, support, security, and audit purposes. Its released time slot may become available for another booking.',
    ],
  },
  {
    title: '9. Changes to this Cancellation Policy',
    body: [
      'ORUMA may update this Cancellation Policy from time to time. Updated terms will be posted on this page.',
      'Continued use of the platform after an update constitutes acceptance of the revised Cancellation Policy.',
    ],
  },
  {
    title: '10. Contact',
    body: [
      'For cancellation or rescheduling requests, contact ORUMA at cancellation-policy@oruma.me, use the dashboard support system, or use the official contact page.',
    ],
  },
];

export default function CancellationPolicyPage() {
  return (
    <main className="min-h-screen bg-[#F8FBF8] font-body text-[#2E3E3C]">
      <Navbar />
      <section className="bg-[#F5F8F7] px-6 pb-16 pt-36 md:pt-44">
        <div className="mx-auto max-w-4xl">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0A7F7A]">
            Legal
          </p>
          <h1 className="mt-4 text-4xl font-heading font-black leading-tight text-[#064F4B] md:text-6xl">
            Cancellation Policy
          </h1>
          <p className="mt-6 max-w-3xl text-lg font-medium leading-relaxed text-[#5F7F7A]">
            This Cancellation Policy explains how ORUMA.ME handles appointment
            cancellations, rescheduling, late arrival, no-show cases, and
            therapist-initiated changes.
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

