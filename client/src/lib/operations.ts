import { API_BASE_URL, apiFetch } from "./auth";
import { BookingResponse } from "./booking";

type ApiMessage = { message?: string | string[] };

async function readResponse<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T | ApiMessage;

  if (!response.ok) {
    const apiMessage = (data as ApiMessage).message;
    const message = Array.isArray(apiMessage)
      ? apiMessage.join(" ")
      : (apiMessage ?? fallback);
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

type RazorpayOrder = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  sessionCount?: number;
  packageName?: string | null;
  originalAmount?: number;
  discountPercent?: number;
};

export type RazorpayOrderStatus = {
  orderId: string;
  status: "PENDING" | "PAID" | "REFUNDED" | "FAILED";
  updatedAt: string;
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

export async function getPayments() {
  const response = await apiFetch(`${API_BASE_URL}/payments`, {
  });
  return readResponse<Payment[]>(response, "Unable to load payments.");
}

export async function getMyPayments() {
  const response = await apiFetch(`${API_BASE_URL}/payments/me`, {
  });
  return readResponse<Payment[]>(response, "Unable to load your payments.");
}

export async function openPaymentInvoice(id: string) {
  const response = await apiFetch(`${API_BASE_URL}/payments/${id}/invoice`, {
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
  payload: {
    appointmentId: string;
    amount: number;
    reference?: string;
    notes?: string;
  },
) {
  const response = await apiFetch(`${API_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return readResponse<Payment>(response, "Unable to record payment.");
}

export async function refundPayment(
  id: string,
  payload: {
    amount: number;
    notes?: string;
    receipt?: string;
    speed?: "normal" | "optimum";
  },
  idempotencyKey: string,
) {
  const response = await apiFetch(`${API_BASE_URL}/payments/${id}/refund`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });
  return readResponse<Payment>(response, "Unable to refund payment.");
}

export async function createRazorpayOrder(
  appointmentId: string,
) {
  const response = await apiFetch(`${API_BASE_URL}/payments/razorpay/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ appointmentId }),
  });
  return readResponse<RazorpayOrder>(response, "Unable to start payment.");
}

export async function getRazorpayOrderStatus(
  orderId: string,
  signal?: AbortSignal,
) {
  const response = await fetch(
    `${API_BASE_URL}/payments/razorpay/order/${encodeURIComponent(orderId)}/status`,
    {
      signal,
    },
  );
  return readResponse<RazorpayOrderStatus>(
    response,
    "Unable to check payment status.",
  );
}

export async function completeDevelopmentPayment(
  appointmentId: string,
) {
  const response = await apiFetch(`${API_BASE_URL}/payments/development/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ appointmentId }),
  });
  return readResponse<Payment>(
    response,
    "Unable to complete the test payment.",
  );
}

export async function verifyRazorpayPayment(
  payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  },
) {
  const response = await apiFetch(`${API_BASE_URL}/payments/razorpay/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return readResponse<Payment>(response, "Unable to verify payment.");
}

export async function getTickets() {
  const response = await apiFetch(`${API_BASE_URL}/tickets`, {
  });
  return readResponse<Ticket[]>(response, "Unable to load tickets.");
}

export async function createTicket(
  payload: { subject: string; message: string; category?: string },
) {
  const response = await apiFetch(`${API_BASE_URL}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return readResponse<Ticket>(response, "Unable to create ticket.");
}

export async function updateTicket(
  id: string,
  payload: { status?: Ticket["status"]; adminNote?: string },
) {
  const response = await apiFetch(`${API_BASE_URL}/tickets/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return readResponse<Ticket>(response, "Unable to update ticket.");
}

export async function getCaseSheets() {
  const response = await apiFetch(`${API_BASE_URL}/case-sheets`, {
  });
  return readResponse<CaseSheet[]>(response, "Unable to load case sheets.");
}

export async function upsertCaseSheet(
  payload: {
    appointmentId: string;
    presentingConcern?: string;
    clinicalNotes?: string;
    interventionPlan?: string;
    followUpPlan?: string;
  },
) {
  const response = await apiFetch(`${API_BASE_URL}/case-sheets`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return readResponse<CaseSheet>(response, "Unable to save case sheet.");
}

export const enquirySubjects = [
  "Choosing a practitioner",
  "Booking or rescheduling",
  "Payment or refund",
  "Services and fees",
  "Programs and workshops",
  "Practitioner application",
  "Something else",
] as const;

export type EnquirySubject = (typeof enquirySubjects)[number];
export type EnquiryContactMethod = "email" | "phone" | "whatsapp";

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  preferredContact: EnquiryContactMethod;
  subject: EnquirySubject;
  message: string;
  pagePath: string | null;
  status: "NEW" | "REPLIED" | "CLOSED";
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EnquiryInput = {
  name: string;
  email: string;
  phone?: string;
  preferredContact: EnquiryContactMethod;
  subject: EnquirySubject;
  message: string;
  pagePath?: string;
  consent: boolean;
  /** Hidden honeypot field; people leave it empty. */
  website?: string;
};

/** Public contact form submission. No account needed. */
export async function submitEnquiry(payload: EnquiryInput) {
  const response = await apiFetch(`${API_BASE_URL}/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return readResponse<{ received: boolean }>(
    response,
    "Unable to send your message. Please email us instead.",
  );
}

export async function getEnquiries() {
  const response = await apiFetch(`${API_BASE_URL}/enquiries`, {
  });
  return readResponse<Enquiry[]>(response, "Unable to load enquiries.");
}

export async function updateEnquiry(
  id: string,
  payload: { status?: Enquiry["status"]; adminNote?: string },
) {
  const response = await apiFetch(`${API_BASE_URL}/enquiries/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return readResponse<Enquiry>(response, "Unable to update enquiry.");
}
