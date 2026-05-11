import { API_BASE_URL } from "./auth";

export type Therapist = {
  id: string;
  name: string;
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
  nextAvailableSlot: string | null;
  isActive: boolean;
  createdAt: string;
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
