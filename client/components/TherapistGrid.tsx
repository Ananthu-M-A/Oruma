import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LucideIcon } from "@site-builder/icons";
import BookingModal from "./BookingModal";
import { getCurrentUser } from "../src/lib/auth";
import {
  formatTherapistSlot,
  getTherapistImage,
  getTherapists,
  isSlotOnNextDay,
  Therapist,
} from "../src/lib/therapists";

function mapForBooking(therapist: Therapist) {
  return {
    ...therapist,
    role: therapist.title,
    hours: therapist.experience,
    nextSlot: formatTherapistSlot(therapist.nextAvailableSlot),
    priceInd: `Rs.${therapist.price.toLocaleString("en-IN")}`,
    priceCouple: therapist.couplePrice
      ? `Rs.${therapist.couplePrice.toLocaleString("en-IN")}`
      : "-",
    image: getTherapistImage(therapist.image),
  };
}

type TherapistGridProps = {
  nextDayOnly?: boolean;
  searchQuery?: string;
  maxFee?: number | null;
  maxItems?: number;
  emptyTitle?: string;
  emptyDescription?: string;
};

export default function TherapistGrid({
  nextDayOnly = false,
  searchQuery = "",
  maxFee = null,
  maxItems,
  emptyTitle = "No therapists are available right now.",
  emptyDescription = "Please check back soon or contact Oruma directly.",
}: TherapistGridProps) {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getTherapists()
      .then((data) => {
        if (isMounted) {
          setTherapists(
            nextDayOnly
              ? data.filter((therapist) =>
                  isSlotOnNextDay(therapist.nextAvailableSlot),
                )
              : data,
          );
        }
      })
      .catch((err) => {
        if (isMounted)
          setError(
            err instanceof Error ? err.message : "Unable to load therapists.",
          );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [nextDayOnly]);

  const handleBookNow = (therapist: Therapist) => {
    const user = getCurrentUser();
    if (user && user.role !== "PATIENT") {
      window.location.href = "/therapists";
      return;
    }

    setSelectedTherapist(mapForBooking(therapist));
    setIsModalOpen(true);
  };

  const filteredTherapists = therapists.filter((therapist) => {
    if (maxFee && therapist.price > maxFee) return false;

    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return true;

    return [
      therapist.name,
      therapist.title,
      therapist.specialization,
      therapist.qualifications,
      ...(therapist.tags ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });
  const visibleTherapists = maxItems
    ? filteredTherapists.slice(0, maxItems)
    : filteredTherapists;

  if (isLoading) {
    return (
      <div className="py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-[360px] rounded-[3rem] bg-[#B7C8A3]/40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center bg-red-50 rounded-[2rem] px-6">
        <p className="font-black text-red-700">{error}</p>
      </div>
    );
  }

  if (visibleTherapists.length === 0) {
    return (
      <div className="py-12 text-center bg-[#F5F8F7] rounded-[2rem] px-6">
        <p className="font-black text-[#064F4B]">{emptyTitle}</p>
        <p className="text-sm font-bold text-[#5F7F7A] mt-2">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {visibleTherapists.map((therapist) => {
          const image = getTherapistImage(therapist.image);
          const slot = formatTherapistSlot(therapist.nextAvailableSlot);
          const tags = therapist.tags?.length
            ? therapist.tags
            : ["Mental Health"];
          const languageTags = tags.filter((tag) =>
            ["english", "malayalam", "hindi", "tamil", "arabic"].includes(
              tag.toLowerCase(),
            ),
          );
          const languages = languageTags.length
            ? languageTags.join(", ")
            : "See profile";
          const specialization =
            therapist.specialization ||
            tags.slice(0, 2).join(", ") ||
            "Mental health support";
          const visibleTags = [specialization, ...tags]
            .filter(Boolean)
            .slice(0, 3);

          return (
            <div
              key={therapist.id}
              className="bg-white rounded-[2rem] border border-[#E2E8E6] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
            >
              <div className="relative min-h-44 bg-[#F2E5AE] px-7 py-7">
                <div className="relative z-10 pr-28">
                  <h3 className="text-3xl font-heading font-black text-[#1A2E2C] leading-tight">
                    {therapist.name}
                  </h3>
                  <p className="mt-2 text-base font-bold text-[#1A2E2C]/70">
                    {therapist.title}
                  </p>
                </div>
                <div className="absolute bottom-0 right-6 h-36 w-28 overflow-hidden rounded-t-[4rem] bg-white/20">
                  {image ? (
                    <img
                      src={image}
                      alt={therapist.name}
                      width="224"
                      height="288"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#064F4B]/30">
                      <LucideIcon name="user" size={42} />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-7">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#EAF7F2] px-3 py-2 text-[9px] font-black uppercase tracking-widest text-[#075E59]">
                  <LucideIcon name="badge-check" size={13} /> Profile verified
                </p>
                <div className="flex gap-4 overflow-x-auto border-b border-[#E2E8E6] pb-5">
                  {visibleTags.map((tag) => (
                    <span
                      key={tag}
                      className="shrink-0 text-sm font-black text-[#1A2E2C]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 border-b border-[#E2E8E6] py-6">
                  {therapist.voiceIntro ? (
                    <audio
                      controls
                      src={therapist.voiceIntro}
                      className="h-10 min-w-0 flex-1"
                    />
                  ) : (
                    <>
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-white"
                        title="Voice intro pending"
                      >
                        <LucideIcon name="mic-off" size={20} />
                      </span>
                      <p className="flex-1 text-sm font-black text-[#1A1A1A]/50">
                        Voice intro pending
                      </p>
                    </>
                  )}
                  <Link
                    to={`/therapists/${therapist.id}`}
                    className="shrink-0 rounded-full border border-[#1A1A1A] px-5 py-3 text-xs font-black text-[#1A1A1A] transition-all hover:bg-[#1A1A1A] hover:text-white"
                  >
                    View Profile
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-4 border-b border-[#E2E8E6] py-6">
                  <StatItem
                    value={
                      therapist.verifiedExperienceHours
                        ? `${therapist.verifiedExperienceHours}+ hrs`
                        : `${therapist.experience} yrs`
                    }
                    label="Verified experience"
                  />
                  <StatItem value={languages} label="Languages" />
                  <StatItem
                    value={`Rs.${therapist.price.toLocaleString("en-IN")}`}
                    label="Starts from"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 border-b border-[#E2E8E6] py-5 sm:grid-cols-2">
                  <InfoItem
                    icon="award"
                    label="Qualification"
                    value={therapist.qualifications}
                  />
                  <InfoItem
                    icon="sparkles"
                    label="Specialization"
                    value={specialization}
                  />
                </div>

                <div className="flex flex-col gap-5 pt-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#5F7F7A]">
                      {therapist.sessionDurationMinutes} minutes ·{" "}
                      {therapist.consultationType}
                    </p>
                    <p className="text-sm font-bold text-[#1A2E2C]/35">
                      Next available in
                    </p>
                    <p className="mt-2 text-xl font-black text-[#1A2E2C]">
                      {slot}
                    </p>
                    <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-[#0A7F7A]">
                      {nextDayOnly ? "Available tomorrow" : "Available slot"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBookNow(therapist)}
                    className="w-full rounded-full bg-[#D8AF17] px-8 py-5 text-sm font-black uppercase tracking-[0.2em] text-[#1A1A1A] shadow-lg shadow-[#D8AF17]/20 transition-all hover:bg-[#F0C72A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064F4B] active:scale-95 sm:w-auto"
                  >
                    BOOK SESSION
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        therapist={selectedTherapist}
      />
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F5F8F7] p-3 min-w-0">
      <div className="flex items-center gap-2 text-[#0A7F7A]">
        <LucideIcon name={icon} size={14} />
        <p className="text-[8px] font-black uppercase tracking-widest">
          {label}
        </p>
      </div>
      <p className="mt-1 text-xs font-black text-[#064F4B] leading-snug line-clamp-2">
        {value}
      </p>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0">
      <p className="break-words text-lg font-black leading-tight text-[#1A1A1A]">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-[#1A1A1A]/50">{label}</p>
    </div>
  );
}
