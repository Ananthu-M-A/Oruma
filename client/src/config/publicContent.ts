export const publicTrustPoints = [
  { value: "Verified", label: "Practitioner profiles" },
  { value: "Upfront", label: "Fees and duration" },
  { value: "Digital", label: "Booking and delivery" },
  { value: "Published", label: "Cancellation and refunds" },
] as const;

export const confidentialityCopy = {
  short:
    "Confidential support with limited access. Identified bookings are not anonymous.",
  initialEnquiry:
    "You may ask a general question without describing a personal concern. Contact channels still reveal their associated email address or phone number.",
} as const;

export const availabilityCopy =
  "Appointments and staff support are available during published operations and depend on practitioner availability.";

export const serviceScopeCopy =
  "Oruma provides online counselling and wellness booking services. Regulated psychological or medical services are shown only on profiles with verified credentials and applicable registration details.";
