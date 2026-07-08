# ORUMA Project Completion Status

This document maps the proposal milestones to the current repository state after the development completion pass.

## Proposal Milestone Status

| Proposal milestone | Current status |
| --- | --- |
| Foundation and setup | Complete in code. React/Vite client, NestJS API, TypeORM/PostgreSQL setup, Docker backend deployment path, migrations, CI, health endpoint, security middleware, env examples, and launch runbook are present. |
| Core dashboards | Complete in code. Admin, therapist, and patient profile/dashboard routes are implemented with role-protected access. |
| Appointment and scheduling | Complete in code. Patient booking, quick booking, therapist/admin appointment views, availability slots, status updates, and cancellation paths are implemented. |
| Payment integration | Complete in code. Razorpay order creation, payment verification, signed webhooks, invoices, manual payment recording, refunds, and admin payment summary are implemented. |
| Video consultation | Complete in code. Zoom meeting creation is wired into appointment confirmation and notification flows. Production use requires Zoom Server-to-Server OAuth credentials. |
| Case sheet module | Complete in code. Admins and therapists can manage/view clinical case sheets. Patients are now blocked from direct case-sheet reads. |
| Communication system | Complete in code. In-app notifications, Resend email, WhatsApp Cloud API hooks, appointment notifications, OTP delivery, and admin notifications are implemented. |
| Support and ticketing | Complete in code. Patient ticket creation and admin ticket management are implemented. |
| UI/UX polish and responsive frontend | Complete in code. Public website routes, therapist discovery/detail pages, auth pages, dashboard routes, and responsive production build are present. |
| Testing and deployment | Complete for local verification and release readiness. Server tests, server build, and client build pass. Production launch still requires provider dashboard setup, credentials, DNS, and live smoke testing. |

## Remaining Milestones Before Public Launch

The remaining work is outside VS Code and cannot be completed from the repository without production account access:

1. Create/configure production hosting, database, DNS, and TLS.
2. Add live provider credentials for Razorpay, Zoom, Resend, WhatsApp Cloud API, and Cloudinary.
3. Run production migrations and seed the first admin.
4. Add real therapist profile data, fees, voice intros, profile images, and availability.
5. Complete soft-launch testing with real provider callbacks and a controlled Razorpay payment/refund.

Use `docs/OUTSIDE_VSCODE_SETUP.md` for the step-by-step external setup checklist and `docs/PRODUCTION_LAUNCH_RUNBOOK.md` for the deployment runbook.

## Final Local Verification

Run these before every release:

```powershell
cd server
npm.cmd test -- --runInBand
npm.cmd run build

cd ..\client
npm.cmd run build
```

