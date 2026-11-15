import { API_BASE_URL, apiFetch } from "./auth";
import {
  formatIstDate,
  formatIstDateTime,
  formatIstSlotRange,
  formatIstTime,
  isTomorrowInIst,
} from "./dateTime";

export type Therapist = {
  id: string;
  name: string;
  email?: string | null;
  title: string;
  tags: string[] | null;
  areasOfPractice: string[] | null;
  languages: string[] | null;
  experience: number;
  price: number;
  couplePrice: number | null;
  image: string | null;
  voiceIntro: string | null;
  voiceIntroTranscript: string | null;
  imagePublicId?: string | null;
  voiceIntroPublicId?: string | null;
  qualifications: string | null;
  awardingInstitution: string | null;
  specialization: string | null;
  consultationType: string | null;
  verifiedExperienceHours: number | null;
  professionalRegistrationNumber: string | null;
  registrationAuthority: string | null;
  sessionDurationMinutes: number | null;
  engagementRelationship: string | null;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  bio: string | null;
  pendingProfileChanges?: Partial<TherapistPayload> | null;
  pendingProfileSubmittedAt?: string | null;
  nextAvailableSlot: string | null;
  isActive: boolean;
  archivedAt?: string | null;
  createdAt: string;
  credentialsQueued?: boolean;
};

type TherapistPayload = {
  name: string;
  email: string;
  title: string;
  tags?: string[] | null;
  areasOfPractice?: string[] | null;
  languages?: string[] | null;
  experience: number;
  price: number;
  couplePrice?: number | null;
  image?: string | null;
  imagePublicId?: string | null;
  voiceIntro?: string | null;
  voiceIntroPublicId?: string | null;
  voiceIntroTranscript?: string | null;
  qualifications?: string | null;
  awardingInstitution?: string | null;
  verifiedExperienceHours?: number | null;
  professionalRegistrationNumber?: string | null;
  registrationAuthority?: string | null;
  specialization?: string | null;
  consultationType?: string | null;
  sessionDurationMinutes?: number | null;
  engagementRelationship?: string | null;
  verificationStatus?: Therapist["verificationStatus"];
  bio?: string | null;
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

function parseTherapistList(data: unknown): Therapist[] {
  const records = Array.isArray(data)
    ? data
    : data &&
        typeof data === "object" &&
        Array.isArray((data as { data?: unknown }).data)
      ? (data as { data: unknown[] }).data
      : null;

  if (records) return records.map(normalizeTherapistRecord);

  throw new Error("Unable to load therapists. Please try again later.");
}

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value !== "string") return [];

  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      // Fall back to the legacy comma-separated representation.
    }
  }
  return trimmed.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
}

function normalizeTherapistRecord(value: unknown): Therapist {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Unable to load therapist. Please try again later.");
  }
  const therapist = value as Therapist;
  return {
    ...therapist,
    tags: normalizeStringList(therapist.tags),
    areasOfPractice: normalizeStringList(therapist.areasOfPractice),
    languages: normalizeStringList(therapist.languages),
  };
}

export type AvailabilitySlot = {
  id: string;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "BOOKED" | "BLOCKED";
  createdAt: string;
};

export async function getTherapists() {
  const response = await apiFetch(`${API_BASE_URL}/therapists`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = Array.isArray(
      (data as { message?: string | string[] }).message,
    )
      ? (data as { message: string[] }).message.join(" ")
      : ((data as { message?: string }).message ??
        "Unable to load therapists.");
    throw new Error(message);
  }

  return parseTherapistList(data);
}

export async function getAdminTherapists() {
  const response = await apiFetch(`${API_BASE_URL}/therapists/admin`, {
  });
  const data = (await response.json().catch(() => ({}))) as
    | Therapist[]
    | {
        message?: string | string[];
      };

  if (!response.ok) {
    const message = Array.isArray(
      (data as { message?: string | string[] }).message,
    )
      ? (data as { message: string[] }).message.join(" ")
      : ((data as { message?: string }).message ??
        "Unable to load therapists.");
    throw new Error(message);
  }

  return parseTherapistList(data);
}

export async function getTherapistPerformance() {
  const response = await apiFetch(`${API_BASE_URL}/therapists/admin/performance`, {
  });
  const data = (await response.json().catch(() => ({}))) as
    | TherapistPerformance[]
    | {
        message?: string | string[];
      };

  if (!response.ok) {
    const message = Array.isArray(
      (data as { message?: string | string[] }).message,
    )
      ? (data as { message: string[] }).message.join(" ")
      : ((data as { message?: string }).message ??
        "Unable to load therapist performance.");
    throw new Error(message);
  }

  return data as TherapistPerformance[];
}

async function writeTherapist(
  path: string,
  method: "POST" | "PATCH",
  payload: Partial<TherapistPayload>,
) {
  const response = await apiFetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => ({}))) as
    | Therapist
    | {
        message?: string | string[];
      };

  if (!response.ok) {
    const message = Array.isArray(
      (data as { message?: string | string[] }).message,
    )
      ? (data as { message: string[] }).message.join(" ")
      : ((data as { message?: string }).message ?? "Unable to save therapist.");
    throw new Error(message);
  }

  return normalizeTherapistRecord(data);
}

export function createTherapist(
  payload: { email: string },
) {
  return writeTherapist("/therapists", "POST", payload);
}

export function updateTherapist(
  id: string,
  payload: Partial<TherapistPayload>,
) {
  return writeTherapist(`/therapists/${id}`, "PATCH", payload);
}

export function approveTherapistProfileChanges(
  id: string,
) {
  return writeTherapist(
    `/therapists/${id}/profile-changes/approve`,
    "PATCH",
    {},
  );
}

export function rejectTherapistProfileChanges(id: string) {
  return writeTherapist(
    `/therapists/${id}/profile-changes/reject`,
    "PATCH",
    {},
  );
}

export async function getMyTherapistProfile() {
  const response = await apiFetch(`${API_BASE_URL}/therapists/me/profile`, {
  });
  const data = (await response.json().catch(() => ({}))) as
    | Therapist
    | {
        message?: string | string[];
      };

  if (!response.ok) {
    const message = Array.isArray(
      (data as { message?: string | string[] }).message,
    )
      ? (data as { message: string[] }).message.join(" ")
      : ((data as { message?: string }).message ??
        "Unable to load your therapist profile.");
    throw new Error(message);
  }

  return data as Therapist;
}

export function updateMyTherapistProfile(
  payload: Partial<TherapistPayload>,
) {
  return writeTherapist(
    "/therapists/me/profile",
    "PATCH",
    payload,
  );
}

export async function deleteTherapist(id: string) {
  const response = await apiFetch(`${API_BASE_URL}/therapists/${id}`, {
    method: "DELETE",
  });
  const data = (await response.json().catch(() => ({}))) as {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(" ")
      : (data.message ?? "Unable to archive therapist.");
    throw new Error(message);
  }
}

export function restoreTherapist(id: string) {
  return writeTherapist(`/therapists/${id}/restore`, "PATCH", {});
}

export async function getTherapist(id: string) {
  const response = await apiFetch(`${API_BASE_URL}/therapists/${id}`);
  const data = (await response.json().catch(() => ({}))) as
    | Therapist
    | {
        message?: string | string[];
      };

  if (!response.ok) {
    const message = Array.isArray(
      (data as { message?: string | string[] }).message,
    )
      ? (data as { message: string[] }).message.join(" ")
      : ((data as { message?: string }).message ?? "Unable to load therapist.");
    throw new Error(message);
  }

  const therapist = normalizeTherapistRecord(data);
  if (!therapist.isActive)
    throw new Error("This therapist profile is currently unavailable.");

  return therapist;
}

export async function getAvailabilitySlots(therapistId: string) {
  const response = await apiFetch(`${API_BASE_URL}/availability/${therapistId}`);
  const data = (await response.json().catch(() => ({}))) as
    | AvailabilitySlot[]
    | {
        message?: string | string[];
      };

  if (!response.ok) {
    const message = Array.isArray(
      (data as { message?: string | string[] }).message,
    )
      ? (data as { message: string[] }).message.join(" ")
      : ((data as { message?: string }).message ??
        "Unable to load availability slots.");
    throw new Error(message);
  }

  return (data as AvailabilitySlot[])
    .filter((slot) => new Date(slot.startTime).getTime() >= Date.now())
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
}

export async function getMyAvailabilitySlots() {
  const response = await apiFetch(`${API_BASE_URL}/availability/me`, {
  });
  const data = (await response.json().catch(() => ({}))) as
    | AvailabilitySlot[]
    | {
        message?: string | string[];
      };

  if (!response.ok) {
    const message = Array.isArray(
      (data as { message?: string | string[] }).message,
    )
      ? (data as { message: string[] }).message.join(" ")
      : ((data as { message?: string }).message ??
        "Unable to load your slots.");
    throw new Error(message);
  }

  return (data as AvailabilitySlot[]).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
}

export async function createMyAvailabilitySlot(
  payload: { startTime: string; endTime: string },
) {
  const response = await apiFetch(`${API_BASE_URL}/availability/me`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => ({}))) as
    | AvailabilitySlot
    | {
        message?: string | string[];
      };

  if (!response.ok) {
    const message = Array.isArray(
      (data as { message?: string | string[] }).message,
    )
      ? (data as { message: string[] }).message.join(" ")
      : ((data as { message?: string }).message ?? "Unable to create slot.");
    throw new Error(message);
  }

  return data as AvailabilitySlot;
}

export async function updateMyAvailabilitySlot(
  id: string,
  payload: { startTime: string; endTime: string },
) {
  const response = await apiFetch(`${API_BASE_URL}/availability/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => ({}))) as
    | AvailabilitySlot
    | {
        message?: string | string[];
      };

  if (!response.ok) {
    const message = Array.isArray(
      (data as { message?: string | string[] }).message,
    )
      ? (data as { message: string[] }).message.join(" ")
      : ((data as { message?: string }).message ?? "Unable to update slot.");
    throw new Error(message);
  }

  return data as AvailabilitySlot;
}

export async function deleteMyAvailabilitySlot(
  id: string,
) {
  const response = await apiFetch(`${API_BASE_URL}/availability/${id}`, {
    method: "DELETE",
  });
  const data = (await response.json().catch(() => ({}))) as {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(" ")
      : (data.message ?? "Unable to delete slot.");
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
  return formatIstSlotRange(slot.startTime, slot.endTime);
}

export function getSlotDateLabel(slot: AvailabilitySlot) {
  return formatIstDate(slot.startTime, "Date");
}

export function getSlotTimeLabel(slot: AvailabilitySlot) {
  const start = formatIstTime(slot.startTime, "");
  const end = formatIstTime(slot.endTime, "");
  return start && end ? `${start} - ${end} IST` : "Time";
}

export function formatTherapistSlot(slot: string | null) {
  if (!slot) return "Contact for availability";
  return formatIstDateTime(slot, "Contact for availability");
}

export function isSlotOnNextDay(slot: string | null) {
  if (!slot) return false;
  return isTomorrowInIst(slot);
}

export function getTherapistImage(image: string | null) {
  if (!image) return "";
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `/assets/${image}`;
}
