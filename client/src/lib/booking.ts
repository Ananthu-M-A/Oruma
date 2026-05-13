import { API_BASE_URL } from './auth';

export interface BookingData {
  slotId: string;
  notes?: string;
}

export interface BookingResponse {
  id: string;
  patient: {
    id: string;
    email: string;
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
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export async function createAppointment(
  bookingData: BookingData,
  accessToken: string
): Promise<BookingResponse> {
  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || 'Failed to create appointment'
    );
  }

  return response.json();
}

export async function getAppointments(accessToken: string): Promise<BookingResponse[]> {
  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || 'Failed to fetch appointments'
    );
  }

  return response.json();
}

export async function getMyAppointments(accessToken: string): Promise<BookingResponse[]> {
  const response = await fetch(`${API_BASE_URL}/appointments/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || 'Failed to fetch your appointments'
    );
  }

  return response.json();
}

export async function getAppointment(
  appointmentId: string,
  accessToken: string
): Promise<BookingResponse> {
  const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || 'Failed to fetch appointment'
    );
  }

  return response.json();
}

export async function cancelAppointment(
  appointmentId: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || 'Failed to cancel appointment'
    );
  }
}
