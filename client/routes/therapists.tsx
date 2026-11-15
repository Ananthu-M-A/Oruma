import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";
import TherapistSearchHero from "../components/TherapistSearchHero";
import TherapistGrid from "../components/TherapistGrid";
import { LucideIcon } from "@site-builder/icons";
import { createSupportEmailUrl } from "../src/config/business";

export default function TherapistListingPage() {
  const [query, setQuery] = useState("");
  const [nextDayOnly, setNextDayOnly] = useState(false);
  const [searchParams] = useSearchParams();
  const specialtyAreas = (searchParams.get("areas") ?? "")
    .split(",")
    .map((area) => area.trim())
    .filter(Boolean);
  const preferredLanguage = searchParams.get("language") ?? "";
  const sessionFor = searchParams.get("sessionFor") ?? "";
  const emailLink = createSupportEmailUrl(
    [
      "Hello, I have reviewed Oruma’s practitioner profiles and would like help choosing a suitable match.",
      `Areas I am looking for: ${query.trim() || specialtyAreas.join(", ") || "not sure yet"}`,
      `Session is for: ${sessionFor || "myself"}`,
      `Preferred language: ${preferredLanguage || "no preference"}`,
      `Availability: ${nextDayOnly ? "tomorrow if possible" : "any published available time"}`,
      "Please share matching profile links, professional roles and scope, fees, next available times, and the steps needed to book.",
    ].join("\n"),
  );

  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C] overflow-x-hidden">
      <Navbar />
      <FloatingActions />

      <TherapistSearchHero />

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {specialtyAreas.length > 0 || preferredLanguage || sessionFor ? (
            <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-[#0A7F7A]/15 bg-[#EAF3F0] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0A7F7A]">
                  Matched to your request
                </p>
                <p className="mt-2 font-bold text-[#064F4B]">
                  {specialtyAreas.length
                    ? specialtyAreas.join(" · ")
                    : "All practice areas"}
                  {preferredLanguage ? ` · ${preferredLanguage}` : ""}
                  {sessionFor ? ` · for ${sessionFor.toLowerCase()}` : ""}
                </p>
              </div>
              <a
                href="/therapists"
                className="shrink-0 text-sm font-black text-[#064F4B] underline underline-offset-4"
              >
                Clear matching filters
              </a>
            </div>
          ) : null}

          <div className="max-w-3xl mx-auto mb-16">
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <LucideIcon
                  name="search"
                  size={20}
                  className="text-[#5F7F7A] group-focus-within:text-[#0A7F7A] transition-colors"
                />
              </div>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-[#F5F8F7] border border-[#E2E8E6] rounded-full py-5 pl-14 pr-8 outline-none focus:ring-4 focus:ring-[#0A7F7A]/10 focus:bg-white focus:border-[#0A7F7A] transition-all text-[#2E3E3C] font-medium shadow-sm"
                placeholder="Search by therapist name, title, or specialization..."
              />
            </div>
            <div className="mt-4">
              <label className="inline-flex items-center gap-3 rounded-full border border-[#E2E8E6] bg-[#F5F8F7] px-5 py-4 text-sm font-black text-[#064F4B]">
                <input
                  type="checkbox"
                  checked={nextDayOnly}
                  onChange={(event) => setNextDayOnly(event.target.checked)}
                  className="h-4 w-4 accent-[#0A7F7A]"
                />
                Available tomorrow
              </label>
            </div>
          </div>

          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-[#064F4B]/5 text-[#064F4B] px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest mb-4">
              Verified Professionals
            </div>
            <h2 className="text-3xl font-heading font-black text-[#064F4B] uppercase tracking-tighter">
              Available Practitioners
            </h2>
          </div>

          <TherapistGrid
            searchQuery={query}
            nextDayOnly={nextDayOnly}
            specialtyAreas={specialtyAreas}
            preferredLanguage={preferredLanguage}
            sessionFor={sessionFor}
            emptyTitle="No therapists found."
            emptyDescription="No profiles match these concerns, session type, language, and search filters. Clear the recommendation filters or adjust your search to explore other profiles."
          />

          <div className="text-center mt-20">
            <p className="text-[#5F7F7A] font-bold mb-6 italic">
              Can't find what you're looking for?
            </p>
            <a
              href={emailLink}
              className="inline-flex items-center gap-2 bg-[#064F4B] text-[#FFFFFF] px-10 py-5 rounded-full font-black hover:scale-105 transition-all shadow-xl shadow-[#064F4B]/20 uppercase tracking-widest text-xs"
            >
              Let us help you choose <LucideIcon name="arrow-right" size={18} />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
