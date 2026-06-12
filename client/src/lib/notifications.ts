import { API_BASE_URL } from "./auth";

type ApiMessage = { message?: string | string[] };

async function readResponse<T>(response: Response, fallback: string): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T | ApiMessage;

  if (!response.ok) {
    const message = Array.isArray((data as ApiMessage).message)
      ? (data as { message: string[] }).message.join(" ")
      : ((data as ApiMessage).message ?? fallback);
    throw new Error(message);
  }

  return data as T;
}

export type AppNotification = {
  id: string;
  type: "APPOINTMENT" | "PAYMENT" | "SUPPORT" | "PROFILE" | "SYSTEM";
  title: string;
  body: string;
  actionUrl: string | null;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

export async function getNotifications(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readResponse<AppNotification[]>(response, "Unable to load notifications.");
}

export async function getUnreadNotificationCount(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readResponse<{ count: number }>(response, "Unable to load notification count.");
}

export async function markNotificationRead(accessToken: string, id: string) {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readResponse<AppNotification>(response, "Unable to update notification.");
}

export async function markAllNotificationsRead(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readResponse<{ updated: number }>(response, "Unable to update notifications.");
}
