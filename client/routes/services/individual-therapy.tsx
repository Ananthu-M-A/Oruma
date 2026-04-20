import React from 'react';
import Navbar from '../../components/Navbar';
import ServiceHero from '../../components/ServiceHero';
import ServiceTherapistGrid from '../../components/ServiceTherapistGrid';
import WhyChooseService from '../../components/WhyChooseService';
import FAQSection from '../../components/FAQSection';
import Footer from '../../components/Footer';
import FloatingActions from '../../components/FloatingActions';
import PricingSection from '../../components/PricingSection';

export const meta = {
  title: "Individual Therapy | ORUMA Wellness",
  description: "Transform struggles into personal strength. Anonymous and professional individual therapy sessions with licensed psychologists."
};

export default function IndividualTherapyPage() {
  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <FloatingActions />
      
      <ServiceHero 
        title="Transforming Struggles into Personal Strength"
        subtitle="Individual therapy provides a safe, confidential space where you can explore your thoughts and feelings with a professional who truly listens."
        img="https://images.unsplash.com/photo-1527689368864-3a821dbccc48?auto=format&fit=crop&q=80&w=800"
      />

      <ServiceTherapistGrid />

      <PricingSection />

      <WhyChooseService />

      <section className="py-24 bg-white text-center">
         <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-heading font-black text-[#064F4B] mb-16 uppercase tracking-tighter">Hear out their Stories</h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
               {[
                 { q: "Anon", text: "Oruma provided me with a safe space when I felt most vulnerable. The therapist was incredibly patient and empathetic." },
                 { q: "Anon", text: "Being able to talk anonymously initially helped me open up. Now I feel more confident in my daily life." },
                 { q: "Anon", text: "The 24/7 support is a lifesaver. I never feel like I'm alone in my struggles anymore." }
               ].map((t, i) => (
                  <div key={i} className="p-10 bg-[#F5F8F7] rounded-[3rem] border border-[#E2E8E6] relative hover:shadow-2xl transition-all">
                     <div className="text-4xl text-[#B7C8A3] absolute top-8 right-10 opacity-40 italic">"</div>
                     <p className="text-[#5F7F7A] leading-relaxed mb-8 font-medium italic">
                        {t.text}
                     </p>
                     <p className="text-xs font-black text-[#064F4B] uppercase tracking-widest">— {t.q}</p>
                  </div>
               ))}
            </div>
            
            <div className="mt-20">
               <a 
                href="https://wa.me/917558832001?text=Hi,%20I'd%20like%20to%20start%20Individual%20Therapy."
                className="bg-[#064F4B] text-white px-16 py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#064F4B]/20 hover:scale-105 transition-all"
              >
                  Start Your Journey
               </a>
            </div>
         </div>
      </section>

      <FAQSection />

      <Footer />
    </main>
  );
}
