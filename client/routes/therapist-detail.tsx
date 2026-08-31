import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LucideIcon } from "@site-builder/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";
import BookingModal from "../components/BookingModal";
import {
  AvailabilitySlot,
  formatAvailabilitySlotRange,
  formatTherapistPrice,
  formatTherapistSlot,
  getAvailabilitySlots,
  getTherapist,
  getTherapistImage,
  Therapist,
} from "../src/lib/therapists";
import { applyTherapistNotFoundSeo, applyTherapistSeo } from "../src/lib/seo";
import { splitTherapistTags } from "../src/lib/therapistProfileOptions";

export const meta = {
  title: "Verified Practitioner Profile | Oruma",
  description:
    "Review verified practitioner details, fees, duration, availability, and request an online Oruma booking.",
};

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

export default function TherapistDetailPage() {
  const { id } = useParams();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<
    AvailabilitySlot[]
  >([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null,
  );
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Therapist profile was not found.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    getTherapist(id)
      .then((data) => {
        if (isMounted) setTherapist(data);
      })
      .catch((err) => {
        if (isMounted)
          setError(
            err instanceof Error ? err.message : "Unable to load therapist.",
          );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!therapist?.id) return;

    let isMounted = true;
    setIsAvailabilityLoading(true);
    setAvailabilityError("");

    getAvailabilitySlots(therapist.id)
      .then((slots) => {
        if (isMounted) setAvailabilitySlots(slots);
      })
      .catch((err) => {
        if (isMounted)
          setAvailabilityError(
            err instanceof Error
              ? err.message
              : "Unable to load availability slots.",
          );
      })
      .finally(() => {
        if (isMounted) setIsAvailabilityLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [therapist?.id]);

  const profile = useMemo(() => {
    if (!therapist) return null;

    const image = getTherapistImage(therapist.image);
    const slot = formatTherapistSlot(therapist.nextAvailableSlot);
    const hasCoupleTherapy = Boolean(therapist.couplePrice);
    const legacyTags = splitTherapistTags(therapist.tags);

    return {
      image,
      slot,
      hasCoupleTherapy,
      price: formatTherapistPrice(therapist),
      areasOfPractice:
        therapist.areasOfPractice?.length
          ? therapist.areasOfPractice
          : legacyTags.areasOfPractice,
      languages: therapist.languages?.length
        ? therapist.languages
        : legacyTags.languages,
    };
  }, [therapist]);

  useEffect(() => {
    if (therapist) applyTherapistSeo(therapist);
    else if (!isLoading && error) applyTherapistNotFoundSeo();
  }, [error, isLoading, therapist]);

  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C] overflow-x-hidden">
      <Navbar />
      <FloatingActions />

      <section className="pt-32 md:pt-40 pb-16 bg-[#F5F8F7]">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            to="/therapists"
            className="inline-flex items-center gap-2 text-[#064F4B] font-black text-xs uppercase tracking-widest mb-10 hover:text-[#0A7F7A] transition-colors"
          >
            <LucideIcon name="arrow-left" size={16} />
            All Therapists
          </Link>

          {isLoading && (
            <div className="grid lg:grid-cols-[420px_1fr] gap-12 items-stretch">
              <div className="h-[520px] rounded-[2rem] bg-[#B7C8A3]/50 animate-pulse" />
              <div className="space-y-6">
                <div className="h-14 max-w-lg rounded-full bg-[#B7C8A3]/40 animate-pulse" />
                <div className="h-8 max-w-sm rounded-full bg-[#B7C8A3]/30 animate-pulse" />
                <div className="h-40 rounded-[2rem] bg-white animate-pulse" />
              </div>
            </div>
          )}

          {!isLoading && error && (
            <div className="max-w-3xl bg-white rounded-[2rem] px-8 py-12 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
                <LucideIcon name="circle-alert" size={28} />
              </div>
              <h1 className="text-3xl font-heading font-black text-[#064F4B] uppercase tracking-tighter">
                Profile Unavailable
              </h1>
              <p className="mt-3 text-[#5F7F7A] font-bold">{error}</p>
            </div>
          )}

          {!isLoading && therapist && profile && (
            <div className="grid lg:grid-cols-[420px_1fr] gap-12 items-start">
              <div className="lg:sticky lg:top-28">
                <div className="bg-[#B7C8A3] rounded-[2rem] p-5 shadow-xl shadow-[#064F4B]/10">
                  <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-white/30">
                    {profile.image ? (
                      <img
                        src={profile.image}
                        alt={therapist.name}
                        width="420"
                        height="525"
                        loading="eager"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#064F4B]/30">
                        <LucideIcon name="user" size={96} />
                      </div>
                    )}
                  </div>

                  <div className="mt-5">
                    <div className="bg-white/40 rounded-[1.25rem] p-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#064F4B]/60">
                        Experience
                      </p>
                      <p className="text-xl font-black text-[#064F4B] mt-1">
                        {therapist.experience} years
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 bg-white text-[#0A7F7A] px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest mb-5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#00D494]" />
                  Profile credentials reviewed · Online consultation
                </div>

                <h1 className="text-4xl md:text-6xl font-heading font-black text-[#064F4B] uppercase tracking-tighter leading-none">
                  {therapist.name}
                </h1>
                <p className="mt-4 text-lg md:text-xl font-black text-[#0A7F7A]">
                  {therapist.title}
                </p>
                {therapist.specialization && (
                  <p className="mt-2 text-[#5F7F7A] font-bold">
                    {therapist.specialization}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-8">
                  {profile.areasOfPractice.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 rounded-full bg-white text-[#064F4B] text-[11px] font-black uppercase tracking-tight shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {profile.languages.length > 0 && (
                  <p className="mt-4 text-sm font-bold text-[#5F7F7A]">
                    Languages: {profile.languages.join(", ")}
                  </p>
                )}

                <div className="grid md:grid-cols-3 gap-4 mt-10">
                  <div className="bg-white rounded-[1.5rem] p-5 shadow-sm">
                    <LucideIcon
                      name="calendar-clock"
                      size={24}
                      className="text-[#0A7F7A]"
                    />
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#5F7F7A] mt-4">
                      Next Slot
                    </p>
                    <p className="text-sm font-black text-[#064F4B] mt-1">
                      {profile.slot}
                    </p>
                  </div>
                  <div className="bg-white rounded-[1.5rem] p-5 shadow-sm">
                    <LucideIcon
                      name="wallet"
                      size={24}
                      className="text-[#0A7F7A]"
                    />
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#5F7F7A] mt-4">
                      Fee
                    </p>
                    <p className="text-sm font-black text-[#064F4B] mt-1">
                      {profile.price}
                    </p>
                  </div>
                  <div className="bg-white rounded-[1.5rem] p-5 shadow-sm">
                    <LucideIcon
                      name="video"
                      size={24}
                      className="text-[#0A7F7A]"
                    />
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#5F7F7A] mt-4">
                      Mode
                    </p>
                    <p className="text-sm font-black text-[#064F4B] mt-1">
                      {therapist.consultationType}
                    </p>
                  </div>
                </div>

                {therapist.voiceIntro && (
                  <div className="mt-6 rounded-[1.5rem] border border-[#E2E8E6] bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                      Voice introduction
                    </p>
                    <audio
                      controls
                      src={therapist.voiceIntro}
                      className="mt-4 w-full"
                    />
                    {therapist.voiceIntroTranscript && (
                      <details className="mt-4 rounded-lg bg-[#F5F8F7] p-4">
                        <summary className="cursor-pointer text-sm font-black text-[#064F4B]">
                          Read transcript
                        </summary>
                        <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-relaxed text-[#5F7F7A]">
                          {therapist.voiceIntroTranscript}
                        </p>
                      </details>
                    )}
                  </div>
                )}

                <div className="mt-10 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm">
                  <h2 className="text-2xl font-heading font-black text-[#064F4B] uppercase tracking-tighter">
                    About
                  </h2>
                  <p className="mt-4 text-[#5F7F7A] font-medium leading-relaxed">
                    {therapist.bio}
                  </p>
                  {therapist.qualifications && (
                    <div className="mt-6 pt-6 border-t border-[#064F4B]/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                        Qualifications
                      </p>
                      <p className="mt-2 font-bold text-[#064F4B]">
                        {therapist.qualifications}
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#5F7F7A]">
                        Awarded by {therapist.awardingInstitution}
                      </p>
                    </div>
                  )}
                  <dl className="mt-6 grid gap-4 border-t border-[#064F4B]/10 pt-6 sm:grid-cols-2">
                    <ProfileFact
                      label="Verified experience"
                      value={
                        therapist.verifiedExperienceHours == null
                          ? null
                          : `${therapist.verifiedExperienceHours.toLocaleString("en-IN")} hours`
                      }
                    />
                    <ProfileFact
                      label="Session duration"
                      value={
                        therapist.sessionDurationMinutes
                          ? `${therapist.sessionDurationMinutes} minutes`
                          : null
                      }
                    />
                    <ProfileFact
                      label="Professional registration"
                      value={
                        therapist.professionalRegistrationNumber
                          ? `${therapist.professionalRegistrationNumber}${therapist.registrationAuthority ? ` · ${therapist.registrationAuthority}` : ""}`
                          : null
                      }
                    />
                    <ProfileFact
                      label="Relationship with Oruma"
                      value={therapist.engagementRelationship}
                    />
                  </dl>
                </div>

                <div className="mt-8 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-heading font-black text-[#064F4B] uppercase tracking-tighter">
                        Availability
                      </h2>
                      <p className="mt-1 text-sm font-bold text-[#5F7F7A]">
                        Upcoming open slots for this therapist.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-[#0A7F7A] bg-[#00D494]/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">
                      <LucideIcon name="clock" size={14} />
                      IST
                    </div>
                  </div>

                  {isAvailabilityLoading && (
                    <div className="grid sm:grid-cols-2 gap-3 mt-6">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className="h-20 rounded-[1.25rem] bg-[#F5F8F7] animate-pulse"
                        />
                      ))}
                    </div>
                  )}

                  {!isAvailabilityLoading && availabilityError && (
                    <div className="mt-6 bg-red-50 rounded-[1.25rem] p-4">
                      <p className="text-sm font-black text-red-700">
                        {availabilityError}
                      </p>
                    </div>
                  )}

                  {!isAvailabilityLoading &&
                    !availabilityError &&
                    availabilitySlots.length === 0 && (
                      <div className="mt-6 bg-[#F5F8F7] rounded-[1.25rem] p-5">
                        <p className="text-sm font-black text-[#064F4B]">
                          No slots bookable at least 24 hours in advance are
                          available.
                        </p>
                        <p className="text-sm font-bold text-[#5F7F7A] mt-1">
                          Next available: {profile.slot}
                        </p>
                      </div>
                    )}

                  {!isAvailabilityLoading &&
                    !availabilityError &&
                    availabilitySlots.length > 0 && (
                      <div className="grid sm:grid-cols-2 gap-3 mt-6">
                        {availabilitySlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot)}
                            className={`text-left rounded-[1.25rem] border p-4 transition-all ${
                              selectedSlot?.id === slot.id
                                ? "border-[#0A7F7A] bg-[#0A7F7A]/10"
                                : "border-[#064F4B]/10 bg-[#F5F8F7] hover:border-[#0A7F7A] hover:bg-[#0A7F7A]/5"
                            }`}
                          >
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                              <LucideIcon name="calendar-check" size={14} />
                              Open Slot
                            </div>
                            <p className="mt-2 text-sm font-black text-[#064F4B]">
                              {formatAvailabilitySlotRange(slot)}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!selectedSlot}
                    className="inline-flex items-center justify-center gap-2 bg-[#064F4B] text-white px-8 py-5 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-[#0A7F7A] transition-all shadow-xl shadow-[#064F4B]/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <LucideIcon name="calendar" size={18} />
                    {selectedSlot
                      ? "Book selected slot"
                      : "Select a slot to book"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />

      {therapist && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          therapist={mapForBooking(therapist)}
          initialSlot={selectedSlot}
        />
      )}
    </main>
  );
}

function ProfileFact({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <dt className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
        {label}
      </dt>
      <dd className="mt-1 font-bold text-[#064F4B]">
        {value ?? "Not applicable or not displayed"}
      </dd>
    </div>
  );
}
