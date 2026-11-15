# Walkthrough videos

Short "how to use Oruma" videos for patients, practitioners and admins. Each one is generated from a script, so you can rebuild it after the website changes instead of re-recording it by hand.

The videos use **sample data only**: invented names, a fake API, and a demonstration payment window in place of Razorpay. Nothing touches a live account, database or payment.

## The videos

| Video | For | What it shows |
|---|---|---|
| `patient-account` | Patients | Create an account, log in with an email code |
| `patient-booking` | Patients | Find a practitioner, book a slot, pay |
| `patient-session` | Patients | Join a session, invoice, WhatsApp, support tickets |
| `therapist-first-login` | Practitioners | First login and changing the temporary password |
| `therapist-profile` | Practitioners | Completing the profile for review |
| `therapist-availability` | Practitioners | Adding bookable time slots |
| `therapist-sessions` | Practitioners | Appointments, joining, case sheets |
| `admin-practitioners` | Admins | Creating, verifying and publishing a practitioner |
| `admin-bookings` | Admins | Confirming a paid booking, session link, reminders |
| `admin-refunds` | Admins | Issuing a refund safely |
| `admin-support` | Admins | Answering enquiries and tickets |

Before a full build, `node walkthroughs/make.mjs <video> --dry` runs the script quickly with no voice or MP4, to check every button and field it uses still exists.

## Make a video

From `client/`, on Windows with Google Chrome installed:

```powershell
node walkthroughs/make.mjs patient-booking
```

The MP4 is saved to `walkthroughs/output/patient-booking.mp4`. A 2-minute video takes about 5 minutes to build, because the final step plays it in real time.

To use the British English voice instead of the default US one:

```powershell
node walkthroughs/make.mjs patient-booking --voice "Microsoft Hazel Desktop"
```

## How it works

1. **Narration:** `lib/narrate.ps1` turns each line in the video script into a WAV file with the built-in Windows voice.
2. **Recording:** `lib/recorder.mjs` starts the site with the fake API (`lib/fixtures.mjs`) and runs the script in a browser. It shows a caption bar, a cursor and title cards. Each step lasts at least as long as its narration.
3. **Combining:** `lib/compose.mjs` plays the recording in Google Chrome, adds each voice clip at its logged time, and saves an MP4 (H.264 and AAC). `lib/fix-mp4.mjs` then writes the correct length into the file.

## Add or change a video

Each video is one file in `videos/`. It exports `lines` (the narration and captions), `prepare` (sample data and fakes) and `run` (the steps). Copy `videos/patient-booking.mjs` to start a new one.

Generated files go in `.work/` and `output/`. Both are ignored by git.
