import { API_BASE_URL } from "./auth";

export type AdminSummary = {
  patients: number;
  therapistUsers: number;
  therapists: number;
  activeTherapists: number;
  appointments: number;
  sessions: number;
  pendingAppointments: number;
  revenue: number;
  pendingTherapistUpdates: number;
  payments: {
    collected: number;
    refunds: number;
    pending: number;
  };
  tickets: {
    open: number;
    resolved: number;
  };
  caseSheets: {
    monitored: number;
    updated: number;
  };
};

export type ProviderDelivery = { id: string; kind: string; status: "PENDING" | "PROCESSING" | "SUCCEEDED" | "DEAD"; attempts: number; maxAttempts: number; lastError: string | null; createdAt: string };
export type PaymentWebhookEvent = { id: string; eventType: string | null; status: "PENDING" | "PROCESSING" | "SUCCEEDED" | "DEAD"; attempts: number; lastError: string | null; createdAt: string };
export type PrivacyRequest = { id: string; requester: { email: string; fullName?: string | null } | null; type: "EXPORT" | "ERASURE" | "CORRECTION"; status: "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED"; reason: string | null; scheduledFor: string | null; createdAt: string };
export type AuditEvent = { id: string; actorRole: string | null; action: string; resource: string; resourceId: string | null; requestId: string; metadata: { outcome?: string; statusCode?: number } | null; createdAt: string };

async function adminRequest<T>(accessToken: string, path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${accessToken}`, ...init.headers } });
  const data = await response.json().catch(() => ({})) as T & { message?: string | string[] };
  if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(" ") : data.message ?? "Unable to load administrative data.");
  return data;
}

export const getProviderDeliveries = (token: string) => adminRequest<ProviderDelivery[]>(token, "/admin/provider-deliveries");
export const retryProviderDelivery = (token: string, id: string) => adminRequest<ProviderDelivery>(token, `/admin/provider-deliveries/${id}/retry`, { method: "PATCH" });
export const getPaymentWebhookEvents = (token: string) => adminRequest<PaymentWebhookEvent[]>(token, "/payments/admin/webhooks");
export const retryPaymentWebhook = (token: string, id: string) => adminRequest<PaymentWebhookEvent>(token, `/payments/admin/webhooks/${id}/retry`, { method: "PATCH" });
export const getPrivacyRequests = (token: string) => adminRequest<PrivacyRequest[]>(token, "/privacy/admin/requests");
export const reviewPrivacyRequest = (token: string, id: string, status: "APPROVED" | "REJECTED") => adminRequest<PrivacyRequest>(token, `/privacy/admin/requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
export const executePrivacyRequest = (token: string, id: string) => adminRequest<PrivacyRequest>(token, `/privacy/admin/requests/${id}/execute`, { method: "POST" });
export const getAuditEvents = (token: string) => adminRequest<AuditEvent[]>(token, "/admin/audit-events");

export async function getAdminSummary(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/admin/summary`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = (await response.json().catch(() => ({}))) as AdminSummary | {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray((data as { message?: string | string[] }).message)
      ? ((data as { message: string[] }).message).join(" ")
      : (data as { message?: string }).message ?? "Unable to load admin summary.";
    throw new Error(message);
  }

  return data as AdminSummary;
}
