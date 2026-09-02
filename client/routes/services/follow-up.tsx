import Navbar from "../../components/Navbar";
import FollowUpHero from "../../components/FollowUpHero";
import ServicesSnapshot from "../../components/ServicesSnapshot";
import TherapistGrid from "../../components/TherapistGrid";
import FollowUpFAQ from "../../components/FollowUpFAQ";
import Footer from "../../components/Footer";
import { createWhatsAppUrl } from "../../src/config/business";
import FloatingActions from "../../components/FloatingActions";
import { LucideIcon } from "@site-builder/icons";
import ServiceScopeNotice from "../../components/ServiceScopeNotice";

export default function FollowUpPage() {
  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <FloatingActions />
      <ServiceScopeNotice />

      <FollowUpHero />

      <ServicesSnapshot />

      <div className="max-w-7xl mx-auto px-6">
        <TherapistGrid />
      </div>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#B7C8A3] rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-[#064F4B] mb-6">
                Still Unsure About What Help to Take?
              </h2>
              <a
                href={createWhatsAppUrl(
                  "Hello, I need help choosing an Oruma service or practitioner.",
                )}
                className="bg-[#1A1A1A] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-black transition-all inline-flex items-center gap-2"
              >
                Talk to Find Responders{" "}
                <LucideIcon name="chevron-right" size={16} />
              </a>
            </div>

            <div className="relative w-48 h-32 flex items-center justify-center opacity-80">
              <div className="w-12 h-12 bg-white rounded-full border-4 border-[#B7C8A3] -mr-4 shadow-lg flex items-center justify-center text-[#B7C8A3]">
                <LucideIcon name="heart" size={24} fill="currentColor" />
              </div>
              <div className="w-16 h-24 bg-[#0A7F7A] rounded-2xl flex flex-col p-2 gap-2 shadow-xl">
                <div className="w-full h-1 bg-white/20 rounded-full" />
                <div className="w-full h-1 bg-white/20 rounded-full" />
                <div className="w-2/3 h-1 bg-white/20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <FollowUpFAQ />

      <Footer />
    </main>
  );
}
