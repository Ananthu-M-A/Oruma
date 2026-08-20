# Manual Appointment Operations

ORUMA is the source of truth for bookings, payments, appointment status, and session links. Zoom and WhatsApp are handled by human staff for the MVP; neither service has API credentials in the application.

## Staff workflow

1. Open **Admin dashboard → Appointments** and work from the newest paid appointment.
2. Confirm the appointment only after ORUMA shows **Paid**. Confirmation keeps the booked slot and tells the patient and therapist that the care team is preparing the link.
3. Open the prepared confirmation message, send it from the official ORUMA WhatsApp Business account, and select **Mark confirmation sent**.
4. Create one unique meeting in the owner-controlled Zoom account used for Oruma operations. Enable a waiting room and passcode, do not enable recording by default, and never reuse a patient meeting link.
5. Paste the official HTTPS `zoom.us` meeting link into ORUMA and save it. The patient and therapist can then join from their dashboards.
6. Open the prepared link message, send it to the patient's verified booking number, and select **Mark link sent**.
7. Before the appointment, open the prepared reminder, send it, and select **Mark reminder sent**.
8. The therapist joins from ORUMA, completes the session, updates the appointment status, and maintains the case sheet in ORUMA.

## Changes and cancellations

- Update the appointment in ORUMA first; the website status is authoritative.
- Cancel or change the corresponding Zoom meeting manually.
- Inform the patient through the official WhatsApp Business account.
- Process any eligible refund separately through the payment workflow.
- Do not place clinical notes, diagnoses, or case-sheet information in WhatsApp or private staff-operation notes.

## Daily controls

- Review paid appointments still marked **Pending**.
- Review confirmed appointments without a Zoom link.
- Review links that have not been marked sent.
- Review upcoming appointments without a recorded reminder.
- Escalate missing/invalid phone numbers through email or the support-ticket workflow.
