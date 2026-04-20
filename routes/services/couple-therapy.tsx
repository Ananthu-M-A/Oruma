import React from 'react';
import Navbar from '../../components/Navbar';
import ServiceHero from '../../components/ServiceHero';
import AssessmentBanner from '../../components/AssessmentBanner';
import ServiceTherapistGrid from '../../components/ServiceTherapistGrid';
import WhyChooseService from '../../components/WhyChooseService';
import FAQSection from '../../components/FAQSection';
import Footer from '../../components/Footer';
import FloatingActions from '../../components/FloatingActions';
import CoupleTherapyVideo from '../../components/CoupleTherapyVideo';
import PricingSection from '../../components/PricingSection';
import { LucideIcon } from '@site-builder/icons';

export const meta = {
  title: "Couple Therapy | oruma.me",
  description: "Reconnect, resolve conflicts, and rebuild your bond together. Professional couple therapy sessions in a safe and supportive environment focused on relationship wellness."
};

export default function CoupleTherapyPage() {
  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <FloatingActions />
      
      <ServiceHero 
        title="Connect, Re-build, Bond Together"
        subtitle="Couple therapy helps partners navigate challenges, improve communication, and strengthen their emotional connection through expert guidance and relationship wellness techniques."
        img="/assets/couple-therapy-new-hero-image.webp"
      />

      <AssessmentBanner />

      <ServiceTherapistGrid />

      <CoupleTherapyVideo />

      <PricingSection />

      <WhyChooseService />

      <section className="py-24 bg-white text-center">
         <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-heading font-extrabold text-[#064F4B] mb-16 uppercase tracking-tighter">Stories of Reconnection</h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
               {[
                 { q: "Anon Couple", text: "We were on the verge of separation. Couple therapy at Oruma helped us rediscover why we fell in love in the first place." },
                 { q: "Anon Couple", text: "The communication tools we learned have transformed our daily interactions. We feel heard and understood now." },
                 { q: "Anon Couple", text: "Having a neutral third party guide us through our conflicts was exactly what we needed to move forward." }
               ].map((t, i) => (
                  <div key={i} className="p-10 bg-[#F5F8F7] rounded-[2.5rem] border border-[#E2E8E6] relative">
                     <div className="text-4xl text-[#B7C8A3] absolute top-6 right-8 opacity-40">"</div>
                     <p className="text-[#5F7F7A] leading-relaxed mb-6 font-medium italic">
                        {t.text}
                     </p>
                     <p className="text-sm font-bold text-[#064F4B">— {t.q}</p>
                  </div>
               ))}
            </div>
            
            <div className="mt-16">
               <a 
                  href="https://wa.me/917558832001?text=Hi,%20I'd%20like%20to%20book%20a%20Couple%20Therapy%20session."
                  className="bg-[#064F4B] text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-[#064F4B]/20 hover:scale-105 transition-all"
               >
                  Book Session
               </a>
            </div>
         </div>
      </section>

      <FAQSection />

      <Footer />
    </main>
  );
}
