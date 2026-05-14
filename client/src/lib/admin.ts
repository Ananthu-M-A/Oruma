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
