# ORUMA Outside VS Code Setup Guide

Use this checklist for work that must happen in provider dashboards, DNS panels, payment accounts, and hosting consoles before launch.

## 1. Accounts To Prepare

- GitHub repository access with permission to push to `main`.
- Vercel account for the frontend.
- Render, Railway, DigitalOcean App Platform, or another Docker-capable host for the NestJS API.
- Managed PostgreSQL provider.
- Razorpay business account.
- Zoom account with marketplace access.
- Meta Business account with WhatsApp Cloud API.
- Resend account.
- Cloudinary account.
- DNS access for `oruma.me`.

## 2. Production Database

1. Create a managed PostgreSQL database close to India if your provider offers a nearby region.
2. Enable automatic backups.
3. Enable SSL.
4. Copy the connection string.
5. In the backend hosting environment set:

```env
DATABASE_URL=
DATABASE_SYNC=false
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=true
```

If the provider uses a certificate chain that Node cannot validate, change only this value:

```env
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

## 3. Backend Hosting

1. Create a new web service from the repository.
2. Point the service root to `server`.
3. Use the Dockerfile at `server/Dockerfile`.
4. Set the service port to `3000` or let the provider inject `PORT`.
5. Add these required environment variables:

```env
NODE_ENV=production
PORT=3000
CLIENT_ORIGIN=https://oruma.me,https://www.oruma.me
CLIENT_LOGIN_URL=https://oruma.me/login
JWT_SECRET=
JWT_EXPIRES_IN=1h
TRUST_PROXY=true
DATABASE_URL=
DATABASE_SYNC=false
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=true
ALLOW_PRODUCTION_DATABASE_CLEAR=false
```

Generate `JWT_SECRET` locally:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

6. Deploy once.
7. Run migrations against the production database:

```powershell
cd server
npm.cmd run build
npm.cmd run migration:run:prod
```

8. Confirm the API health endpoint:

```powershell
curl.exe -sS https://api.oruma.me/health
```

## 4. Frontend Hosting

1. Create a Vercel project from the repository.
2. Set project root to `client`.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Set:

```env
VITE_API_URL=https://api.oruma.me
```

7. Deploy and check:

```text
https://oruma.me/
https://oruma.me/login
https://oruma.me/therapists
https://oruma.me/profile/admin
```

## 5. DNS And TLS

Set these DNS records in your domain provider:

- `oruma.me` points to Vercel.
- `www.oruma.me` points to Vercel and redirects to `oruma.me`.
- `api.oruma.me` points to the backend host.

After DNS propagates, verify:

```powershell
curl.exe -I https://oruma.me
curl.exe -I https://www.oruma.me
curl.exe -sS https://api.oruma.me/health
```

## 6. Razorpay

1. Complete business/KYC activation.
2. Use test mode first.
3. Copy the key ID and key secret.
4. Create a webhook secret.
5. Add the webhook URL:

```text
https://api.oruma.me/payments/razorpay/webhook
```

6. Enable at least these events:

```text
payment.captured
payment.failed
refund.created
refund.processed
refund.failed
```

7. Set backend env:

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

8. Rehearse one small test booking, payment verification, invoice open, and refund.

## 7. Zoom

1. In Zoom App Marketplace, create a Server-to-Server OAuth app.
2. Copy account ID, client ID, and client secret.
3. Add meeting creation scopes available to your Zoom account.
4. Set:

```env
ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_USER_ID=me
ZOOM_TIMEZONE=Asia/Kolkata
```

5. Confirm an appointment as admin or therapist.
6. Verify that the patient, therapist, and dashboard all receive or show the Zoom join link.

## 8. Resend Email

1. Add a sending domain or subdomain in Resend.
2. Add all DNS records shown by Resend, including DKIM/SPF records.
3. Wait until the domain status is verified.
4. Create an API key.
5. Set:

```env
RESEND_API_KEY=
EMAIL_FROM=Oruma <no-reply@oruma.me>
```

6. Test therapist credential email and patient OTP email.

## 9. WhatsApp Cloud API

1. In Meta Business, configure WhatsApp Cloud API.
2. Add or connect the production phone number.
3. Copy the phone number ID and access token.
4. Create and submit the appointment confirmation template.
5. If WhatsApp OTP login is required in production, create and approve a dedicated authentication/OTP template as well.
6. Set:

```env
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_APPOINTMENT_TEMPLATE_NAME=appointment_confirmation
WHATSAPP_TEMPLATE_LANGUAGE=en
WHATSAPP_API_VERSION=v20.0
WHATSAPP_DEFAULT_COUNTRY_CODE=91
```

7. Test appointment notification and OTP delivery with an internal number before public launch.

## 10. Cloudinary

1. Create a Cloudinary account.
2. Create an unsigned upload preset for image/audio upload, or configure the current preset your team wants to use.
3. Restrict allowed formats to images and audio where possible.
4. Set:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_UPLOAD_PRESET=
```

5. Log in as a therapist and upload one profile photo and one voice intro.

## 11. Admin Seed

Set temporarily for the first seed:

```env
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_FULL_NAME=ORUMA Admin
ADMIN_PHONE=
```

Then run:

```powershell
cd server
npm.cmd run build
npm.cmd run migration:run:prod
npm.cmd run seed:admin
```

After first login:

1. Change the admin password in the dashboard.
2. Remove `ADMIN_PASSWORD` from provider environment variables if it remains stored.

## 12. Operational Data

Prepare these before the public launch:

- Therapist email addresses.
- Therapist names and titles.
- Qualifications.
- Specializations.
- Individual fees.
- Couple therapy fees where applicable.
- Profile images.
- Voice intros.
- Initial weekly availability.
- Legal billing name, address, and GSTIN if applicable.

Optional billing env:

```env
ORUMA_LEGAL_NAME=Oruma Wellness
ORUMA_BILLING_ADDRESS=
ORUMA_GSTIN=
```

## 13. Soft Launch Rehearsal

Run this in order:

1. Register a patient.
2. Login with password.
3. Request login OTP by email.
4. Request login OTP by WhatsApp after WhatsApp is configured.
5. Create a therapist from admin dashboard.
6. Login as therapist.
7. Upload therapist image and voice intro.
8. Submit therapist profile changes.
9. Approve therapist profile changes as admin.
10. Add therapist availability.
11. Book a patient appointment.
12. Complete Razorpay payment.
13. Confirm appointment.
14. Verify Zoom link appears.
15. Open patient invoice.
16. Create a support ticket.
17. Resolve the support ticket as admin.
18. Create or update a case sheet as therapist.
19. Confirm admin can view the case sheet.
20. Confirm patient cannot view case sheets through the API.
21. Refund a payment.
22. Confirm Razorpay webhook updates payment/refund status.

## 14. Go-Live Checklist

- Frontend build passes.
- Server build passes.
- Server tests pass.
- Migrations run successfully.
- Admin account exists.
- At least one active therapist has live availability.
- Razorpay webhook is verified.
- Email domain is verified.
- WhatsApp template is approved.
- Zoom meeting creation works.
- Cloudinary upload works.
- DNS and TLS are healthy.
- Database backup is enabled.
- Uptime monitor watches `https://api.oruma.me/health`.
- Rollback path is known for frontend and backend.
