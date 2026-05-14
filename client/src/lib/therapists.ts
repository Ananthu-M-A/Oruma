import { API_BASE_URL } from "./auth";

export type Therapist = {
  id: string;
  name: string;
  email: string | null;
  title: string;
  tags: string[] | null;
  experience: number;
  group: number;
  price: number;
  couplePrice: number | null;
  image: string | null;
  voiceIntro: string | null;
  qualifications: string | null;
  specialization: string | null;
  bio: string | null;
  pendingProfileChanges: Partial<TherapistPayload> | null;
  pendingProfileSubmittedAt: string | null;
  nextAvailableSlot: string | null;
  isActive: boolean;
  createdAt: string;
  credentialsSent?: boolean;
};

export type TherapistPayload = {
  name: string;
  email: string;
  title: string;
  tags?: string[];
  experience: number;
  group: number;
  price: number;
  couplePrice?: number | null;
  image?: string;
  voiceIntro?: string;
  qualifications?: string;
  specialization?: string;
  bio?: string;
  nextAvailableSlot?: string | null;
  isActive?: boolean;
};

export type TherapistPerformance = {
  therapistId: string;
  therapistName: string;
  email: string;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  completionRate: number;
  estimatedCompletedRevenue: number;
};

export type AvailabilitySlot = {
  id: string;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "BOOKED" | "BLOCKED";
  createdAt: string;
};

export async function getTherapists() {
  const response = await fetch(`${API_BASE_URL}/therapists`);
  const data = (await response.json().catch(() => ({}))) as Therapist[] | {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray((data as { message?: string | string[] }).message)
      ? ((data as { message: string[] }).message).join(" ")
      : (data as { message?: string }).message ?? "Unable to load therapists.";
    throw new Error(message);
  }

  return (data as Therapist[]).filter((therapist) => therapist.isActive);
}

export async function getAdminTherapists(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/therapists/admin`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = (await response.json().catch(() => ({}))) as Therapist[] | {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray((data as { message?: string | string[] }).message)
      ? ((data as { message: string[] }).message).join(" ")
      : (data as { message?: string }).message ?? "Unable to load therapists.";
    throw new Error(message);
  }

  return data as Therapist[];
}

export async function getTherapistPerformance(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/therapists/admin/performance`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = (await response.json().catch(() => ({}))) as TherapistPerformance[] | {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray((data as { message?: string | string[] }).message)
      ? ((data as { message: string[] }).message).join(" ")
      : (data as { message?: string }).message ?? "Unable to load therapist performance.";
    throw new Error(message);
  }

  return data as TherapistPerformance[];
}

async function writeTherapist(
  path: string,
  accessToken: string,
  method: "POST" | "PATCH",
  payload: Partial<TherapistPayload>
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => ({}))) as Therapist | {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray((data as { message?: string | string[] }).message)
      ? ((data as { message: string[] }).message).join(" ")
      : (data as { message?: string }).message ?? "Unable to save therapist.";
    throw new Error(message);
  }

  return data as Therapist;
}

export function createTherapist(accessToken: string, payload: { email: string }) {
  return writeTherapist("/therapists", accessToken, "POST", payload);
}

export function updateTherapist(accessToken: string, id: string, payload: Partial<TherapistPayload>) {
  return writeTherapist(`/therapists/${id}`, accessToken, "PATCH", payload);
}

export function approveTherapistProfileChanges(accessToken: string, id: string) {
  return writeTherapist(`/therapists/${id}/profile-changes/approve`, accessToken, "PATCH", {});
}

export function rejectTherapistProfileChanges(accessToken: string, id: string) {
  return writeTherapist(`/therapists/${id}/profile-changes/reject`, accessToken, "PATCH", {});
}

export async function getMyTherapistProfile(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/therapists/me/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = (await response.json().catch(() => ({}))) as Therapist | {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray((data as { message?: string | string[] }).message)
      ? ((data as { message: string[] }).message).join(" ")
      : (data as { message?: string }).message ?? "Unable to load your therapist profile.";
    throw new Error(message);
  }

  return data as Therapist;
}

export function updateMyTherapistProfile(accessToken: string, payload: Partial<TherapistPayload>) {
  return writeTherapist("/therapists/me/profile", accessToken, "PATCH", payload);
}

export async function deleteTherapist(accessToken: string, id: string) {
  const response = await fetch(`${API_BASE_URL}/therapists/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = (await response.json().catch(() => ({}))) as {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(" ")
      : data.message ?? "Unable to delete therapist.";
    throw new Error(message);
  }
}

export async function getTherapist(id: string) {
  const response = await fetch(`${API_BASE_URL}/therapists/${id}`);
  const data = (await response.json().catch(() => ({}))) as Therapist | {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray((data as { message?: string | string[] }).message)
      ? ((data as { message: string[] }).message).join(" ")
      : (data as { message?: string }).message ?? "Unable to load therapist.";
    throw new Error(message);
  }

  const therapist = data as Therapist;
  if (!therapist.isActive) throw new Error("This therapist profile is currently unavailable.");

  return therapist;
}

export async function getAvailabilitySlots(therapistId: string) {
  const response = await fetch(`${API_BASE_URL}/availability/${therapistId}`);
  const data = (await response.json().catch(() => ({}))) as AvailabilitySlot[] | {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray((data as { message?: string | string[] }).message)
      ? ((data as { message: string[] }).message).join(" ")
      : (data as { message?: string }).message ?? "Unable to load availability slots.";
    throw new Error(message);
  }

  return (data as AvailabilitySlot[])
    .filter((slot) => new Date(slot.startTime).getTime() >= Date.now())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

export async function getMyAvailabilitySlots(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/availability/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = (await response.json().catch(() => ({}))) as AvailabilitySlot[] | {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray((data as { message?: string | string[] }).message)
      ? ((data as { message: string[] }).message).join(" ")
      : (data as { message?: string }).message ?? "Unable to load your slots.";
    throw new Error(message);
  }

  return (data as AvailabilitySlot[]).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

export async function createMyAvailabilitySlot(accessToken: string, payload: { startTime: string; endTime: string }) {
  const response = await fetch(`${API_BASE_URL}/availability/me`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => ({}))) as AvailabilitySlot | {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray((data as { message?: string | string[] }).message)
      ? ((data as { message: string[] }).message).join(" ")
      : (data as { message?: string }).message ?? "Unable to create slot.";
    throw new Error(message);
  }

  return data as AvailabilitySlot;
}

export async function updateMyAvailabilitySlot(accessToken: string, id: string, payload: { startTime: string; endTime: string }) {
  const response = await fetch(`${API_BASE_URL}/availability/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => ({}))) as AvailabilitySlot | {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray((data as { message?: string | string[] }).message)
      ? ((data as { message: string[] }).message).join(" ")
      : (data as { message?: string }).message ?? "Unable to update slot.";
    throw new Error(message);
  }

  return data as AvailabilitySlot;
}

export async function deleteMyAvailabilitySlot(accessToken: string, id: string) {
  const response = await fetch(`${API_BASE_URL}/availability/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = (await response.json().catch(() => ({}))) as {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(" ")
      : data.message ?? "Unable to delete slot.";
    throw new Error(message);
  }
}

export function formatTherapistPrice(therapist: Therapist) {
  const individual = `Ind: Rs.${therapist.price.toLocaleString("en-IN")}`;
  const couple = therapist.couplePrice
    ? ` / Couple: Rs.${therapist.couplePrice.toLocaleString("en-IN")}`
    : "";

  return `${individual}${couple}`;
}

export function formatAvailabilitySlotRange(slot: AvailabilitySlot) {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Time to be confirmed";

  const date = start.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const startTime = start.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const endTime = end.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${date}, ${startTime} - ${endTime}`;
}

export function getSlotDateLabel(slot: AvailabilitySlot) {
  const date = new Date(slot.startTime);
  if (Number.isNaN(date.getTime())) return "Date";

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function getSlotTimeLabel(slot: AvailabilitySlot) {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Time";

  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return `${start.toLocaleTimeString("en-IN", options)} - ${end.toLocaleTimeString("en-IN", options)}`;
}

export function formatTherapistSlot(slot: string | null) {
  if (!slot) return "Contact for availability";

  const date = new Date(slot);
  if (Number.isNaN(date.getTime())) return "Contact for availability";

  return date.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getTherapistImage(image: string | null) {
  if (!image) return "";
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `/assets/${image}`;
}
