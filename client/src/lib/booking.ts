import { API_BASE_URL } from "./auth";

export const PATIENT_CANCELLATION_WINDOW_MS = 60 * 60 * 1000;
export const POST_PAYMENT_NOTICE_KEY = "oruma_post_payment_notice";
export const BOOKING_LEAD_TIME_MS = 24 * 60 * 60 * 1000;
export const isBookingLeadTimeBypassEnabled =
  import.meta.env.DEV &&
  import.meta.env.VITE_BOOKING_LEAD_TIME_BYPASS_ENABLED === "true";

export function getEarliestBookableSlotTime(now = Date.now()) {
  const cutoff =
    now + (isBookingLeadTimeBypassEnabled ? 0 : BOOKING_LEAD_TIME_MS);

  // datetime-local inputs use minute precision, so round upward to ensure the
  // submitted timestamp never falls just before the server-side cutoff.
  return Math.ceil((cutoff + 1) / 60_000) * 60_000;
}

interface BookingData {
  slotId: string;
  sessionCount?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  service?: string;
  mode?: string;
  notes?: string;
  verificationToken?: string;
}

export interface BookingResponse {
  id: string;
  patient: {
    id: string;
    email: string;
    fullName?: string | null;
    phone?: string | null;
    age?: number | null;
    gender?: string | null;
    healthInfo?: Record<string, unknown> | null;
  };
  therapist: {
    id: string;
    name: string;
  };
  slot: {
    id: string;
    startTime: string;
    endTime: string;
  };
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  service?: string | null;
  mode?: string | null;
  sessionCount: number;
  packageName?: string | null;
  packageOriginalAmount: number;
  packageOfferAmount: number;
  packageDiscountPercent: number;
  meetingLink?: string | null;
  meetingLinkAddedAt?: string | null;
  bookingConfirmationSentAt?: string | null;
  meetingLinkSentAt?: string | null;
  reminderSentAt?: string | null;
  staffNotes?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  createdAt: string;
}

export type AppointmentOperationsUpdate = {
  meetingLink?: string;
  markBookingConfirmationSent?: boolean;
  markMeetingLinkSent?: boolean;
  markReminderSent?: boolean;
  staffNotes?: string;
};

interface QuickBookingResponse {
  appointment: BookingResponse;
  accessToken: string;
  createdAccount: boolean;
  user: {
    id: string;
    email: string;
    role: "PATIENT";
    createdAt: string;
  };
}

export function canPatientCancelAppointment(
  appointment: BookingResponse,
  now = Date.now(),
) {
  if (
    appointment.status === "CANCELLED" ||
    appointment.status === "COMPLETED"
  ) {
    return false;
  }

  const bookedAt = new Date(appointment.createdAt).getTime();
  const startsAt = new Date(appointment.slot?.startTime).getTime();
  if (!Number.isFinite(bookedAt) || !Number.isFinite(startsAt)) return false;

  return (
    now >= bookedAt &&
    now <= bookedAt + PATIENT_CANCELLATION_WINDOW_MS &&
    now < startsAt
  );
}

function cleanBookingData(bookingData: BookingData) {
  return Object.fromEntries(
    Object.entries(bookingData).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
}

export async function createAppointment(
  bookingData: BookingData,
  accessToken: string,
): Promise<BookingResponse> {
  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(cleanBookingData(bookingData)),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create appointment");
  }

  return response.json();
}

export async function getAppointments(
  accessToken: string,
): Promise<BookingResponse[]> {
  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch appointments");
  }

  return response.json();
}

export async function createQuickAppointment(
  bookingData: BookingData,
): Promise<QuickBookingResponse> {
  const response = await fetch(`${API_BASE_URL}/appointments/quick`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cleanBookingData(bookingData)),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create appointment");
  }

  return response.json();
}

export async function getMyAppointments(
  accessToken: string,
): Promise<BookingResponse[]> {
  const response = await fetch(`${API_BASE_URL}/appointments/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch your appointments");
  }

  return response.json();
}

export async function cancelAppointment(
  appointmentId: string,
  accessToken: string,
): Promise<BookingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/appointments/${appointmentId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to cancel appointment");
  }

  return response.json();
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: BookingResponse["status"],
  accessToken: string,
): Promise<BookingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/appointments/${appointmentId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update appointment status");
  }

  return response.json();
}

export async function updateAppointmentOperations(
  appointmentId: string,
  payload: AppointmentOperationsUpdate,
  accessToken: string,
): Promise<BookingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/appointments/${appointmentId}/operations`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = Array.isArray(errorData.message)
      ? errorData.message.join(" ")
      : errorData.message;
    throw new Error(message || "Failed to update staff handoff");
  }

  return response.json();
}

export function buildManualWhatsAppUrl(phone: string | null | undefined, text: string) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (!digits) return null;
  const internationalNumber = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${internationalNumber}?text=${encodeURIComponent(text)}`;
}
