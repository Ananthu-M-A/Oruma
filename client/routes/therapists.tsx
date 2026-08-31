import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";
import TherapistSearchHero from "../components/TherapistSearchHero";
import TherapistGrid from "../components/TherapistGrid";
import { LucideIcon } from "@site-builder/icons";
import { createWhatsAppUrl } from "../src/config/business";

export const meta = {
  title: "Find a Verified Practitioner | Oruma",
  description:
    "Review practitioner roles, verified credentials, fees, duration, and availability before requesting an online session.",
};

export default function TherapistListingPage() {
  const [query, setQuery] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const [nextDayOnly, setNextDayOnly] = useState(false);

  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C] overflow-x-hidden">
      <Navbar />
      <FloatingActions />

      <TherapistSearchHero />

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
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
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <label>
                <span className="sr-only">Maximum fee</span>
                <select
                  value={maxFee}
                  onChange={(event) => setMaxFee(event.target.value)}
                  className="w-full rounded-full border border-[#E2E8E6] bg-[#F5F8F7] px-5 py-4 text-sm font-black text-[#064F4B] outline-none focus:border-[#0A7F7A] focus:bg-white"
                >
                  <option value="">Any fee</option>
                  <option value="1000">Up to Rs.1,000</option>
                  <option value="1500">Up to Rs.1,500</option>
                  <option value="2500">Up to Rs.2,500</option>
                </select>
              </label>
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
            maxFee={maxFee ? Number(maxFee) : null}
            nextDayOnly={nextDayOnly}
            emptyTitle="No therapists found."
            emptyDescription="Try another search or contact us to help you choose."
          />

          <div className="text-center mt-20">
            <p className="text-[#5F7F7A] font-bold mb-6 italic">
              Can't find what you're looking for?
            </p>
            <a
              href={createWhatsAppUrl(
                "Hello, I need help choosing a verified Oruma practitioner.",
              )}
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
