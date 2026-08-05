import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { LucideIcon } from '@site-builder/icons';

export const meta = {
  title: "Global Consultation | ORUMA - Mental Health Support Worldwide",
  description: "Professional mental health support for the Indian diaspora and global citizens. 24/7 availability."
};

function MechanismSection() {
  const steps = [
    {
      title: "24/7 Availability",
      desc: "Our therapists are available across all time zones. Book your slot at your convenience, day or night.",
      icon: "clock"
    },
    {
      title: "Secure Global Link",
      desc: "Receive a private, encrypted video consultation link accessible from any country via WhatsApp or Email.",
      icon: "shield-check"
    },
    {
      title: "Cultural Understanding",
      desc: "Speak with professionals who understand the specific challenges of living and working abroad.",
      icon: "users"
    },
    {
      title: "International Payments",
      desc: "Hassle-free payments via global cards, PayPal, or digital wallets with transparent currency conversion.",
      icon: "globe"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-black text-[#064F4B] mb-6 uppercase tracking-tighter">Your Health, Your Time.</h2>
          <p className="text-[#5F7F7A] max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            Professional counseling optimized for the global community. No matter where you are, Oruma is just a click away.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-[#F5F8F7] p-8 rounded-[2.5rem] border border-transparent hover:border-[#00D494]/30 hover:shadow-2xl transition-all group">
              <div className="w-14 h-14 bg-[#0A7F7A] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-[#0A7F7A]/20 group-hover:scale-110 transition-transform">
                <LucideIcon name={step.icon} size={28} />
              </div>
              <h3 className="text-xl font-black text-[#064F4B] mb-4 uppercase tracking-tighter">{step.title}</h3>
              <p className="text-sm text-[#5F7F7A] font-medium leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function NRIConsultationPage() {
  const whatsappLink = "https://wa.me/918157039987?text=Hi,%20I'm%20contacting%20from%20abroad%20for%20a%20Global%20Consultation.";

  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden bg-[#064F4B]">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#0A7F7A]/30 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#B7C8A3] opacity-20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-[#00D494]/10 rounded-full blur-2xl animate-pulse pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 bg-[#00D494]/10 text-[#00D494] px-6 py-2.5 rounded-full mb-10 border border-[#00D494]/20 shadow-xl shadow-black/20">
                <LucideIcon name="globe-2" size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.25em]">Worldwide Healing</span>
              </div>
              
              <h1 className="text-5xl md:text-8xl font-heading font-black text-white leading-[1] mb-10 tracking-tighter">
                Global Support. <br />
                <span className="text-[#B7C8A3]">Gentle Care.</span>
              </h1>
              
              <p className="text-lg md:text-2xl text-white/70 font-medium mb-14 max-w-2xl mx-auto lg:mx-0 leading-relaxed italic">
                Professional counseling for Indians & global residents. Accessible anytime, from anywhere in the world.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8">
                <div className="relative group">
                   <div className="absolute -inset-1 bg-gradient-to-r from-[#00D494] to-[#B7C8A3] rounded-full blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                   <a 
                    href={whatsappLink} 
                    className="relative bg-white text-[#064F4B] px-12 py-6 rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-[#064F4B] hover:text-white transition-all shadow-2xl flex items-center gap-3"
                  >
                    Book Global Session
                    <LucideIcon name="arrow-right" size={16} />
                  </a>
                </div>
                
                <div className="flex flex-col items-center lg:items-start gap-1">
                  <div className="flex items-center gap-2 text-white/50">
                    <LucideIcon name="clock" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">24/7 Availability</span>
                  </div>
                  <p className="text-[#B7C8A3] font-bold text-xs">Book Anytime • Start Today</p>
                </div>
              </div>
            </div>

            <div className="flex-1 relative hidden lg:block">
               <div className="relative z-10 bg-white/5 p-6 rounded-[5rem] backdrop-blur-xl border border-white/10 shadow-3xl">
                  <img 
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Global Online Consultation" 
                    loading="eager"
                    decoding="async"
                    className="rounded-[4rem] w-full h-[500px] object-cover shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute -bottom-10 -left-10 bg-[#B7C8A3] p-10 rounded-[3rem] shadow-3xl border-8 border-[#064F4B]">
                     <div className="text-center">
                        <p className="text-4xl font-black text-[#064F4B] mb-1">24/7</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#064F4B]/60 leading-none">Global<br/>Care</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Presence Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1">
              <div className="w-20 h-1.5 bg-[#00D494] mb-8 rounded-full" />
              <h2 className="text-4xl md:text-6xl font-heading font-black text-[#064F4B] mb-10 leading-tight tracking-tighter uppercase">Serving our <br/><span className="text-[#0A7F7A]">Global Community.</span></h2>
              
              <div className="space-y-10">
                <div className="flex gap-8 p-8 rounded-[3rem] hover:bg-[#F5F8F7] transition-all group">
                  <div className="w-16 h-16 bg-[#00D494]/10 rounded-2xl flex items-center justify-center text-[#00D494] shrink-0 group-hover:bg-[#00D494] group-hover:text-white transition-all">
                    <LucideIcon name="calendar-days" size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[#064F4B] mb-3 uppercase tracking-tighter">Friday Availability</h4>
                    <p className="text-[#5F7F7A] font-medium leading-relaxed">Dedicated slots are available every Friday for our GCC and UAE clients. Make your weekend about wellness.</p>
                  </div>
                </div>
                
                <div className="flex gap-8 p-8 rounded-[3rem] hover:bg-[#F5F8F7] transition-all group">
                  <div className="w-16 h-16 bg-[#00D494]/10 rounded-2xl flex items-center justify-center text-[#00D494] shrink-0 group-hover:bg-[#00D494] group-hover:text-white transition-all">
                    <LucideIcon name="languages" size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[#064F4B] mb-3 uppercase tracking-tighter">Multilingual Support</h4>
                    <p className="text-[#5F7F7A] font-medium leading-relaxed">Comfortably express yourself in your preferred language. We provide therapy in Malayalam, English, and other regional languages.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
               <div className="grid grid-cols-2 gap-6 md:gap-8">
                  {/* UAE Card */}
                  <div className="bg-[#064F4B] aspect-[4/5] rounded-[4rem] flex flex-col items-center justify-center text-center p-8 shadow-2xl shadow-[#064F4B]/20 hover:-translate-y-4 transition-all duration-500 relative group overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="text-6xl mb-8 drop-shadow-2xl animate-bounce-slow">🇦🇪</div>
                     <h4 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">UAE</h4>
                     <div className="bg-[#00D494] text-[#064F4B] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Friday Slots</div>
                  </div>

                  {/* GCC Card */}
                  <div className="bg-[#0A7F7A] aspect-[4/5] rounded-[4rem] flex flex-col items-center justify-center text-center p-8 shadow-2xl shadow-[#0A7F7A]/20 hover:-translate-y-4 transition-all duration-500 relative group overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="text-6xl mb-8 drop-shadow-2xl">🇸🇦</div>
                     <h4 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">GCC</h4>
                     <div className="bg-white/10 text-white/60 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Full Coverage</div>
                  </div>

                  {/* UK & EU Card */}
                  <div className="bg-[#B7C8A3] aspect-[4/5] rounded-[4rem] flex flex-col items-center justify-center text-center p-8 shadow-2xl shadow-[#B7C8A3]/20 hover:-translate-y-4 transition-all duration-500 relative group overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="text-6xl mb-8 drop-shadow-2xl">🇬🇧</div>
                     <h4 className="text-2xl font-black text-[#064F4B] mb-3 tracking-tight uppercase">UK & EU</h4>
                     <div className="bg-[#064F4B]/10 text-[#064F4B]/60 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Evening Slots</div>
                  </div>

                  {/* USA & CA Card */}
                  <div className="bg-[#F5F8F7] aspect-[4/5] rounded-[4rem] flex flex-col items-center justify-center text-center p-8 border-2 border-[#E2E8E6] shadow-2xl shadow-black/5 hover:-translate-y-4 transition-all duration-500 relative group overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="text-6xl mb-8 drop-shadow-2xl">🇺🇸</div>
                     <h4 className="text-2xl font-black text-[#064F4B] mb-3 tracking-tight uppercase tracking-tighter leading-none">USA & CANADA</h4>
                     <div className="bg-[#0A7F7A] text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Early Morning</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <MechanismSection />

      {/* Global Call to Action */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto bg-[#064F4B] rounded-[5rem] p-16 md:p-32 text-center relative overflow-hidden shadow-3xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#00D494_1px,transparent_1px)] [background-size:40px_40px]" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-block bg-[#00D494] text-[#064F4B] px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10">Global Consultation</div>
            <h2 className="text-4xl md:text-8xl font-heading font-black text-white mb-12 leading-[1] tracking-tighter">Your Journey <br/><span className="text-[#B7C8A3]">Begins Anywhere.</span></h2>
            <p className="text-white/60 text-xl mb-16 max-w-2xl mx-auto font-medium leading-relaxed">Book professional mental health support from wherever you are. Available 24/7 for you.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href={whatsappLink} className="w-full sm:w-auto bg-[#00D494] text-[#064F4B] px-16 py-7 rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all shadow-2xl active:scale-95">
                Book Global Session
              </a>
              <a href="/contact" className="w-full sm:w-auto bg-white/5 backdrop-blur-md text-white border border-white/20 px-16 py-7 rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
