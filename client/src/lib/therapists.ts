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

export function formatTherapistPrice(therapist: Therapist) {
  const individual = `Ind: Rs.${therapist.price.toLocaleString("en-IN")}`;
  const couple = therapist.couplePrice
    ? ` / Couple: Rs.${therapist.couplePrice.toLocaleString("en-IN")}`
    : "";

  return `${individual}${couple}`;
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
