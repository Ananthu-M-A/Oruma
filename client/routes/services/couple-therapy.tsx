import React from "react";
import Navbar from "../../components/Navbar";
import ServiceHero from "../../components/ServiceHero";
import AssessmentBanner from "../../components/AssessmentBanner";
import TherapistGrid from "../../components/TherapistGrid";
import WhyChooseService from "../../components/WhyChooseService";
import FAQSection from "../../components/FAQSection";
import Footer from "../../components/Footer";
import FloatingActions from "../../components/FloatingActions";
import { createWhatsAppUrl } from "../../src/config/business";
import CoupleTherapyVideo from "../../components/CoupleTherapyVideo";
import ServiceScopeNotice from "../../components/ServiceScopeNotice";

export const meta = {
  title: "Couple Counselling | oruma.me",
  description:
    "Review verified practitioner profiles and book confidential online relationship counselling and wellness sessions.",
};

const bookingChecks = [
  {
    title: "Practitioner",
    text: "Review the exact professional role, qualifications, areas of practice, and engagement relationship shown on the verified profile.",
  },
  {
    title: "Booking",
    text: "Confirm the selected date, time, session duration, consultation mode, final amount, and any package discount.",
  },
  {
    title: "Policies",
    text: "Read the cancellation, refund, privacy, terms, and digital service-delivery policies before payment.",
  },
];

export default function CoupleTherapyPage() {
  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <FloatingActions />
      <ServiceScopeNotice />

      <ServiceHero
        title="Connect, Re-build, Bond Together"
        subtitle="Online relationship counselling can provide a structured setting to discuss communication and shared concerns. Review the selected practitioner's verified profile before booking."
        img="/assets/couple-therapy-new-hero-image.webp"
      />

      <AssessmentBanner />

      <section className="bg-[#F5F8F7] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-10 text-4xl font-heading font-black uppercase tracking-tighter text-[#064F4B]">
            Available Practitioners
          </h2>
          <TherapistGrid />
        </div>
      </section>

      <CoupleTherapyVideo />
      <WhyChooseService />

      <section className="bg-white py-24 text-center">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-16 text-4xl font-heading font-extrabold uppercase tracking-tighter text-[#064F4B]">
            Before you book
          </h2>
          <div className="grid gap-8 text-left md:grid-cols-3">
            {bookingChecks.map((item) => (
              <div
                key={item.title}
                className="rounded-[2.5rem] border border-[#E2E8E6] bg-[#F5F8F7] p-10"
              >
                <p className="leading-relaxed text-[#5F7F7A]">{item.text}</p>
                <p className="mt-6 text-sm font-bold text-[#064F4B]">
                  {item.title}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <a
              href={createWhatsAppUrl(
                "Hello, I need information about a couple counselling session.",
              )}
              className="rounded-full bg-[#064F4B] px-10 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-[#064F4B]/20 transition-all hover:scale-105"
            >
              Ask booking support
            </a>
          </div>
        </div>
      </section>

      <FAQSection />
      <Footer />
    </main>
  );
}
