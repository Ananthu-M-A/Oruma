import React from 'react';
import LegalPolicyLayout from '../components/LegalPolicyLayout';

export const meta = {
  title: 'Cancellation Policy | ORUMA',
  description: 'Learn how ORUMA handles appointment cancellations, rescheduling, late arrivals, no-shows, and therapist-initiated changes.'
};

const listClassName = 'mt-4 space-y-3 list-disc pl-6 marker:text-[#0A7F7A]';
const sectionHeadingClassName = 'text-2xl md:text-3xl font-heading font-bold text-[#064F4B] mb-5 leading-tight';
const linkClassName = 'font-semibold text-[#0A7F7A] underline underline-offset-4 hover:text-[#064F4B]';

export default function CancellationPolicyPage() {
  return (
    <LegalPolicyLayout
      title="Cancellation Policy"
      effectiveDate="April 14, 2026"
      introduction="This Cancellation Policy explains how ORUMA.ME handles appointment cancellations, rescheduling, late arrivals, no-show situations, therapist-initiated changes, and related booking matters."
    >
      <section id="scope">
        <h2 className={sectionHeadingClassName}>1. Scope</h2>
        <p>This Cancellation Policy applies to counselling sessions, therapy consultations, wellness appointments, and related services booked through ORUMA.ME.</p>
        <p className="mt-4">All appointments are subject to therapist availability, successful booking confirmation, applicable payment requirements, and ORUMA&apos;s scheduling policies.</p>
      </section>

      <section id="user-cancellation">
        <h2 className={sectionHeadingClassName}>2. User Cancellation</h2>
        <div className="rounded-2xl border border-[#0A7F7A]/20 bg-[#0A7F7A]/5 p-6 md:p-8">
          <p className="font-semibold text-[#064F4B]">Users may cancel a booked appointment only within one (1) hour of successfully confirming the booking.</p>
        </div>
        <p className="mt-6">After the one-hour cancellation window has expired:</p>
        <ul className={listClassName}>
          <li>The cancellation option will no longer be available through the ORUMA platform.</li>
          <li>
            Cancellation requests submitted after this period may not be accepted and will be handled in accordance with ORUMA&apos;s{' '}
            <a className={linkClassName} href="/refund-policy">Refund Policy</a>{' '}
            and applicable operational guidelines.
          </li>
        </ul>
        <p className="mt-6">
          To request cancellation within the permitted period, users may use the dashboard, submit a support ticket, contact ORUMA through the official{' '}
          <a className={linkClassName} href="/contact">contact page</a>, or email{' '}
          <a className={linkClassName} href="mailto:Oruma987@gmail.com">Oruma987@gmail.com</a>.
        </p>
        <p className="mt-6">Cancellation requests should include:</p>
        <ul className={listClassName}>
          <li>Registered name</li>
          <li>Registered email address or phone number</li>
          <li>Appointment date and time</li>
          <li>Therapist name (where available)</li>
          <li>Reason for cancellation</li>
        </ul>
      </section>

      <section id="rescheduling">
        <h2 className={sectionHeadingClassName}>3. Rescheduling</h2>
        <p>Where appropriate, ORUMA may offer rescheduling instead of cancellation, subject to therapist availability.</p>
        <p className="mt-4">Rescheduling requests should be made before the scheduled appointment time and may be approved at ORUMA&apos;s discretion based on therapist availability and operational requirements.</p>
        <p className="mt-4">Repeated rescheduling requests, frequent last-minute changes, or misuse of the scheduling system may result in the request being declined.</p>
      </section>

      <section id="late-arrival-and-no-show">
        <h2 className={sectionHeadingClassName}>4. Late Arrival and No-Show</h2>
        <p>Users are expected to join online sessions at the scheduled time using the session link or instructions provided by ORUMA.</p>
        <p className="mt-6">If a user joins late:</p>
        <ul className={listClassName}>
          <li>The consultation may still end at the originally scheduled time to avoid affecting subsequent appointments.</li>
          <li>Lost consultation time caused by late arrival may not be compensated.</li>
        </ul>
        <p className="mt-5">
          If a user fails to attend a confirmed appointment without prior approval, the appointment may be treated as a no-show, and the applicable consultation fee may be non-refundable in accordance with the{' '}
          <a className={linkClassName} href="/refund-policy">Refund Policy</a>.
        </p>
      </section>

      <section id="therapist-or-oruma-cancellation">
        <h2 className={sectionHeadingClassName}>5. Therapist or ORUMA Cancellation</h2>
        <p>If ORUMA or the assigned therapist must cancel or reschedule a confirmed appointment due to unforeseen circumstances, ORUMA will make reasonable efforts to notify the user as soon as practicable.</p>
        <p className="mt-6">Depending on the circumstances, ORUMA may offer one or more of the following:</p>
        <ul className={listClassName}>
          <li>Appointment rescheduling</li>
          <li>Therapist reassignment</li>
          <li>Account credit (where applicable)</li>
          <li>
            Partial or full refund in accordance with the{' '}
            <a className={linkClassName} href="/refund-policy">Refund Policy</a>
          </li>
        </ul>
      </section>

      <section id="technical-issues">
        <h2 className={sectionHeadingClassName}>6. Technical Issues</h2>
        <p>Users are responsible for ensuring they have:</p>
        <ul className={listClassName}>
          <li>A stable internet connection</li>
          <li>A compatible device</li>
          <li>Access to the session link</li>
          <li>A private and suitable environment for the consultation</li>
        </ul>
        <p className="mt-5">Where technical issues arise due to ORUMA systems or therapist-side connectivity problems, ORUMA may review the matter and, where appropriate, offer rescheduling or a refund.</p>
        <p className="mt-4">Technical issues caused by the user&apos;s device, internet connection, software, or failure to access the session using the provided instructions may not qualify for cancellation, rescheduling, or refund.</p>
      </section>

      <section id="emergency-disclaimer">
        <h2 className={sectionHeadingClassName}>7. Emergency Disclaimer</h2>
        <div className="rounded-2xl border border-[#0A7F7A]/20 bg-[#0A7F7A]/5 p-6 md:p-8">
          <p className="font-semibold text-[#064F4B]">ORUMA does not provide emergency medical or crisis intervention services.</p>
        </div>
        <p className="mt-6">If a user is experiencing:</p>
        <ul className={listClassName}>
          <li>A medical emergency</li>
          <li>A mental health crisis</li>
          <li>Risk of self-harm</li>
          <li>Risk of harm to others</li>
          <li>Any immediate safety concern</li>
        </ul>
        <p className="mt-5">They should immediately contact their local emergency services, a nearby hospital, or an appropriate crisis support service.</p>
        <p className="mt-4">The cancellation and rescheduling provisions of this policy do not apply to emergency response situations because ORUMA is not an emergency care provider.</p>
      </section>

      <section id="changes-to-cancellation-policy">
        <h2 className={sectionHeadingClassName}>8. Changes to this Cancellation Policy</h2>
        <p>ORUMA may update this Cancellation Policy from time to time to reflect operational, legal, or business changes.</p>
        <p className="mt-4">The latest version will be published on this page together with the updated Effective Date.</p>
        <p className="mt-4">Continued use of the platform after such updates constitutes acceptance of the revised Cancellation Policy.</p>
      </section>

      <section id="contact">
        <h2 className={sectionHeadingClassName}>9. Contact</h2>
        <p>For cancellation or rescheduling requests, or if you have questions regarding this Cancellation Policy, please contact:</p>
        <div className="mt-6 rounded-2xl bg-[#F5F8F7] border border-[#064F4B]/10 p-6 md:p-8">
          <p className="font-bold text-[#064F4B] text-lg">ORUMA</p>
          <p className="mt-2">
            Email:{' '}
            <a className={linkClassName} href="mailto:cancellation-policy@oruma.me">
              cancellation-policy@oruma.me
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

