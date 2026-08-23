import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import TherapistGrid from "../components/TherapistGrid";
import FloatingActions from "../components/FloatingActions";
import Footer from "../components/Footer";
import { LucideIcon } from "@site-builder/icons";
import {
  CommonConcerns,
  CounsellingServices,
  FinalBookingSection,
  OrumaIntroductionVideo,
  ProgramsSection,
  SupportPathways,
  TestimonialsSection,
} from "../components/HomeSections";

export const meta = {
  title: "oruma.me | Together, Gently",
  description:
    "Explore Oruma counselling services, common concerns, verified psychologist profiles, learning programs, and online booking support.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <HeroSection />
      <SupportPathways />
      <OrumaIntroductionVideo />
      <CounsellingServices />
      <CommonConcerns />

      <section id="therapists" className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-[#0A7F7A] sm:text-xs">
                Meet the people who listen
              </p>
              <h2 className="font-heading text-4xl font-bold text-[#064F4B] md:text-5xl">
                Meet Our Psychologists
              </h2>
              <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-[#5F7773]">
                Compare qualifications, specialisations, fees and upcoming availability before you book.
              </p>
            </div>
            <a
              href="/therapists"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-black text-[#0A7F7A] hover:underline"
            >
              View All Psychologists <LucideIcon name="arrow-right" size={16} />
            </a>
          </div>
          <TherapistGrid
            maxItems={3}
            emptyTitle="Psychologist availability is being updated."
            emptyDescription="Please view all profiles or contact Oruma for help finding the right support."
          />
        </div>
      </section>

      <ProgramsSection />
      <TestimonialsSection />
      <FinalBookingSection />
      <FloatingActions />
      <Footer />
    </main>
  );
}
