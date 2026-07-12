import { API_BASE_URL } from "./auth";

export interface BookingData {
  slotId: string;
  sessionCount?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  service?: string;
  mode?: string;
  notes?: string;
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
    healthInfo?: Record<string, string> | null;
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
  createdAt: string;
}

export interface QuickBookingResponse {
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

export async function getAppointment(
  appointmentId: string,
  accessToken: string,
): Promise<BookingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/appointments/${appointmentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch appointment");
  }

  return response.json();
}

export async function cancelAppointment(
  appointmentId: string,
  accessToken: string,
): Promise<void> {
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
