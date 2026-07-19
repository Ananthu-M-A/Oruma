import { API_BASE_URL } from "./auth";
import { BookingResponse } from "./booking";

type ApiMessage = { message?: string | string[] };

async function readResponse<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T | ApiMessage;

  if (!response.ok) {
    const message = Array.isArray((data as ApiMessage).message)
      ? (data as { message: string[] }).message.join(" ")
      : ((data as ApiMessage).message ?? fallback);
    throw new Error(message);
  }

  return data as T;
}

export type Payment = {
  id: string;
  appointment: BookingResponse | null;
  patient: { id: string; email: string; fullName?: string | null } | null;
  amount: number;
  refundedAmount: number;
  status: "PENDING" | "PAID" | "REFUNDED" | "FAILED";
  provider: string;
  reference: string | null;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  notes: string | null;
  refundHistory: Record<string, unknown>[] | null;
  createdAt: string;
  updatedAt: string;
};

export type RazorpayOrder = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  sessionCount?: number;
  packageName?: string | null;
  originalAmount?: number;
  discountPercent?: number;
};

export type Ticket = {
  id: string;
  createdBy: { id: string; email: string; fullName?: string | null } | null;
  subject: string;
  message: string;
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CaseSheet = {
  id: string;
  appointment: BookingResponse | null;
  patient: { id: string; email: string; fullName?: string | null } | null;
  therapist: { id: string; name: string; email?: string | null } | null;
  presentingConcern: string | null;
  clinicalNotes: string | null;
  interventionPlan: string | null;
  followUpPlan: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getPayments(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/payments`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readResponse<Payment[]>(response, "Unable to load payments.");
}

export async function getMyPayments(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/payments/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readResponse<Payment[]>(response, "Unable to load your payments.");
}

export async function openPaymentInvoice(accessToken: string, id: string) {
  const response = await fetch(`${API_BASE_URL}/payments/${id}/invoice`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const text = await response.text();

  if (!response.ok) {
    let message = "Unable to open invoice.";
    try {
      const data = JSON.parse(text) as ApiMessage;
      message = Array.isArray(data.message)
        ? data.message.join(" ")
        : (data.message ?? message);
    } catch {
      message = text || message;
    }
    throw new Error(message);
  }

  const blob = new Blob([text], { type: "text/html" });
  const url = window.URL.createObjectURL(blob);
  const invoiceWindow = window.open(url, "_blank", "noopener,noreferrer");

  window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);

  if (!invoiceWindow) {
    throw new Error("Allow pop-ups to open the invoice.");
  }
}

export async function createPayment(
  accessToken: string,
  payload: {
    appointmentId: string;
    amount: number;
    reference?: string;
    notes?: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  return readResponse<Payment>(response, "Unable to record payment.");
}

export async function refundPayment(
  accessToken: string,
  id: string,
  payload: {
    amount: number;
    notes?: string;
    receipt?: string;
    speed?: "normal" | "optimum";
  },
) {
  const response = await fetch(`${API_BASE_URL}/payments/${id}/refund`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  return readResponse<Payment>(response, "Unable to refund payment.");
}

export async function createRazorpayOrder(
  accessToken: string,
  appointmentId: string,
) {
  const response = await fetch(`${API_BASE_URL}/payments/razorpay/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ appointmentId }),
  });
  return readResponse<RazorpayOrder>(response, "Unable to start payment.");
}

export async function completeDevelopmentPayment(
  accessToken: string,
  appointmentId: string,
) {
  const response = await fetch(`${API_BASE_URL}/payments/development/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ appointmentId }),
  });
  return readResponse<Payment>(
    response,
    "Unable to complete the test payment.",
  );
}

export async function verifyRazorpayPayment(
  accessToken: string,
  payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/payments/razorpay/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  return readResponse<Payment>(response, "Unable to verify payment.");
}

export async function getTickets(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/tickets`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readResponse<Ticket[]>(response, "Unable to load tickets.");
}

export async function createTicket(
  accessToken: string,
  payload: { subject: string; message: string; category?: string },
) {
  const response = await fetch(`${API_BASE_URL}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  return readResponse<Ticket>(response, "Unable to create ticket.");
}

export async function updateTicket(
  accessToken: string,
  id: string,
  payload: { status?: Ticket["status"]; adminNote?: string },
) {
  const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  return readResponse<Ticket>(response, "Unable to update ticket.");
}

export async function getCaseSheets(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/case-sheets`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readResponse<CaseSheet[]>(response, "Unable to load case sheets.");
}

export async function upsertCaseSheet(
  accessToken: string,
  payload: {
    appointmentId: string;
    presentingConcern?: string;
    clinicalNotes?: string;
    interventionPlan?: string;
    followUpPlan?: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/case-sheets`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  return readResponse<CaseSheet>(response, "Unable to save case sheet.");
}
