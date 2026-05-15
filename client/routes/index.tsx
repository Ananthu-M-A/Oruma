import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import VideoStorySection from '../components/VideoStorySection';
import ServicesSnapshot from '../components/ServicesSnapshot';
import TherapistGrid from '../components/TherapistGrid';
import ActionBanner from '../components/ActionBanner';
import FAQSection from '../components/FAQSection';
import FloatingActions from '../components/FloatingActions';
import Footer from '../components/Footer';
import ContactSection from '../components/ContactSection';
import CoupleTherapyVideo from '../components/CoupleTherapyVideo';
import { LucideIcon } from '@site-builder/icons';

export const meta = {
  title: "oruma.me | Together, Gently",
  description: "Mental health is a priority, not a privilege. Connect with licensed psychologists anonymously. Your first call is free."
};

export default function HomePage() {
  const assessmentLink = "https://wa.me/918157039987?text=Hi,%20I'd%20like%20to%20take%20the%20mental%20health%20assessment.";
  const unsureLink = "https://wa.me/918157039987?text=Hi,%20I'm%20not%20sure%20what%20help%20I%20need.%20Can%20you%20guide%20me?";

  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C]">
      <Navbar />
      
      <HeroSection />

      <VideoStorySection />

      <FloatingActions />

      {/* Category Grid */}
      <ServicesSnapshot />

      {/* Couple Therapy Spotlight Section */}
      <CoupleTherapyVideo />

      {/* Impact Stats Strip */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
         <div className="relative max-w-md mx-auto bg-[#064F4B] p-10 rounded-[3rem] shadow-2xl shadow-[#064F4B]/20">
            <div className="grid grid-cols-2 gap-y-10 gap-x-8 text-center">
              <div>
                <p className="text-4xl font-black text-white mb-1">10k+</p>
                <p className="text-[#B7C8A3] text-[10px] font-black uppercase tracking-widest">Sessions</p>
              </div>
              <div>
                <p className="text-4xl font-black text-white mb-1">40+</p>
                <p className="text-[#B7C8A3] text-[10px] font-black uppercase tracking-widest">Countries</p>
              </div>
              <div>
                <p className="text-4xl font-black text-white mb-1">4.7/5</p>
                <p className="text-[#B7C8A3] text-[10px] font-black uppercase tracking-widest">User Rating</p>
              </div>
              <div>
                <p className="text-4xl font-black text-white mb-1">24/7</p>
                <p className="text-[#B7C8A3] text-[10px] font-black uppercase tracking-widest">Support</p>
              </div>
            </div>

            <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
              <a href="tel:+918157039987" className="w-12 h-12 bg-[#1A3A37] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <LucideIcon name="phone" size={20} />
              </a>
              <a href="https://wa.me/918157039987" className="w-14 h-14 bg-[#00D494] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <LucideIcon name="message-circle" size={28} />
              </a>
            </div>
         </div>
      </div>

      {/* All Available Therapists */}
      <div id="therapists" className="max-w-7xl mx-auto px-6 scroll-mt-24 pb-20">
        <div className="flex items-center justify-between mb-8 px-4 border-b border-[#064F4B]/5 pb-4">
          <h2 className="text-3xl font-heading font-black text-[#064F4B]">Available Tomorrow</h2>
          <a href="/therapists" className="text-[#0A7F7A] font-bold text-sm hover:underline flex items-center gap-1">
            View All <LucideIcon name="chevron-right" size={16} />
          </a>
        </div>
        <TherapistGrid
          nextDayOnly
          emptyTitle="No therapists are available tomorrow."
          emptyDescription="Please view all therapists or contact Oruma directly for help choosing a slot."
        />
      </div>

      <ActionBanner 
        title="Healing starts here we'll walk with you." 
        buttonText="Take Assessment" 
        href={assessmentLink}
      />

      <ActionBanner 
        title="Still Unsure About What Help To Take?" 
        buttonText="Talk to Find Respondents" 
        href={unsureLink}
        secondary
      />

      <FAQSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
