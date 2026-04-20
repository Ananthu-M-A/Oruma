import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { LucideIcon } from '@site-builder/icons';

export const meta = {
  title: "Meet Our Team | ORUMA Wellness",
  description: "Our team consists of licensed psychologists trained in modern therapeutic approaches. Ethical, empathetic, and evidence-based care."
};

const group2 = [
  {
    name: 'Rose J',
    role: 'Onco Psychologist and Clinical Psychologist',
    specialisation: 'Onco Psychology and Clinical Psychology',
    exp: '950+ Sessions',
    approach: 'Empathetic Cancer Support & Clinical Excellence',
    pricing: 'Ind: ₹2000 / Couple: ₹3000',
    img: '/assets/rose-j-expert.webp',
    tier: 'Premium',
    group: 2
  },
  {
    name: 'Hamna',
    role: 'Clinical Psychologist',
    specialisation: 'Clinical Psychology',
    exp: '800+ Sessions',
    approach: 'Empathetic Support & Clinical Excellence',
    pricing: 'Ind: ₹2000 / Couple: ₹3000',
    img: '/assets/hamna-profile.webp',
    tier: 'Premium',
    group: 2
  },
  {
    name: 'Kallu Sajeev',
    role: 'Clinical Psychologist',
    specialisation: 'Clinical Psychology',
    exp: '1500+ Sessions',
    approach: 'Evidence-Based & Compassionate Care',
    pricing: 'Ind: ₹2000 / Couple: ₹3000',
    img: '/assets/kallu-sajeev-psychologist-new.webp',
    tier: 'Premium',
    group: 2
  },
  {
    name: 'Dr. Amurtha Vijayan',
    role: 'Clinical Psychologist',
    specialisation: 'Clinical Psychology',
    exp: '1800+ Sessions',
    approach: 'Therapeutic Safe Spaces & Mindfulness',
    pricing: 'Ind: ₹2000 / Couple: ₹3000',
    img: '/assets/dr-amrutha-vijayn-psychologist-new.webp',
    tier: 'Premium',
    group: 2
  },
  {
    name: 'Seenai Tito',
    role: 'Clinical Psychologist',
    specialisation: 'Clinical Psychology',
    exp: '1200+ Sessions',
    approach: 'Supportive Empathy & Professional Guidance',
    pricing: 'Ind: ₹2000 / Couple: ₹3000',
    img: '/assets/seenai-tito-psychologist-new.webp',
    tier: 'Premium',
    group: 2
  }
];

const group5 = [
  {
    name: 'Shihana',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: '850+ Sessions',
    approach: 'Empathetic Counseling & Support',
    pricing: 'Ind: ₹1500 / Couple: ₹1500',
    img: '/assets/shihana-profile-updated.webp',
    tier: 'Standard',
    group: 5
  },
  {
    name: 'Muhsina Tp',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: 'Professional Support',
    approach: 'Empathetic Guidance & Mental Well-being',
    pricing: 'Ind: ₹2000 / Couple: ₹2250',
    img: '/assets/muhsina-tp-profile.webp',
    tier: 'Standard',
    group: 5
  },
  {
    name: 'Shaeza Mariyem',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: 'Expert Counseling',
    approach: 'Healing Through Compassionate Connection',
    pricing: 'Ind: ₹2000 / Couple: ₹2250',
    img: '/assets/shaeza-mariyam-profile.webp',
    tier: 'Standard',
    group: 5
  },
  {
    name: 'Aleeda',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: 'Professional Guidance',
    approach: 'Empathetic Therapeutic Care',
    pricing: 'Ind: ₹2000 / Couple: ₹2250',
    img: '/assets/therapist-aleeda.webp',
    tier: 'Standard',
    group: 5
  },
  {
    name: 'Shahna Sherin',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: 'Professional Counseling',
    approach: 'Guided Support & Resilience',
    pricing: 'Ind: ₹2000 / Couple: ₹2250',
    img: '/assets/therapist-shahna-sherin.webp',
    tier: 'Standard',
    group: 5
  },
  {
    name: 'Nihala Jabin',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: 'Professional Support',
    approach: 'Balanced Mental Health Journey',
    pricing: 'Ind: ₹2000 / Couple: ₹2250',
    img: '/assets/therapist-nihala-jabin.webp',
    tier: 'Standard',
    group: 5
  }
];

const group4 = [
  {
    name: 'Rifana',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: '800+ Sessions',
    approach: 'Empathetic & Evidence-Based Support',
    pricing: 'Ind: ₹1500 / Couple: ₹1500',
    img: '/assets/rifana-new-profile-2024.webp',
    tier: 'Standard',
    group: 4
  },
  {
    name: 'Sreelekshmi',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: 'Expert Guidance',
    approach: 'Empathetic & Transformative Care',
    pricing: 'Ind: ₹1500 / Couple: ₹1500',
    img: '/assets/therapist-sreelekshmi.webp',
    tier: 'Standard',
    group: 4
  },
  {
    name: 'Saifunnisa',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: 'Professional Support',
    approach: 'Compassionate Therapeutic Journey',
    pricing: 'Ind: ₹1500 / Couple: ₹1500',
    img: '/assets/therapist-saifunnisa.webp',
    tier: 'Standard',
    group: 4
  },
  {
    name: 'Pavithra',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: 'Skilled Counseling',
    approach: 'Guided Resilience & Well-being',
    pricing: 'Ind: ₹1500 / Couple: ₹1500',
    img: '/assets/therapist-pavithra.webp',
    tier: 'Standard',
    group: 4
  },
  {
    name: 'Jasna',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: 'Dedicated Support',
    approach: 'Deep Emotional Healing',
    pricing: 'Ind: ₹1500 / Couple: ₹1500',
    img: '/assets/therapist-jasna.webp',
    tier: 'Standard',
    group: 4
  }
];

const group3 = [
  {
    name: 'Shabna',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: 'Professional Guidance',
    approach: 'Empathetic Counseling & Support',
    pricing: 'Ind: ₹1500 / Couple: ₹1500',
    img: '/assets/shabna-profile-new.webp',
    tier: 'Standard',
    group: 3
  },
  {
    name: 'Dr. Ashi Chandran',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: '1000+ Sessions',
    approach: 'Comprehensive Psychological Support',
    pricing: 'Ind: ₹1000 / Couple: ₹1500',
    img: '/assets/dr-ashi-chandran.webp',
    tier: 'Standard',
    group: 3
  },
  {
    name: 'Anila',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: '900+ Sessions',
    approach: 'Holistic Mental Wellness',
    pricing: 'Ind: ₹1000 / Couple: ₹1500',
    img: '/assets/anila.webp',
    tier: 'Standard',
    group: 3
  },
  {
    name: 'Nivya',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: '1100+ Sessions',
    approach: 'Guided Healing & Resilience',
    pricing: 'Ind: ₹1000 / Couple: ₹1500',
    img: '/assets/nivya.webp',
    tier: 'Standard',
    group: 3
  },
  {
    name: 'Rubeena',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: '850+ Sessions',
    approach: 'Empathetic Listening & Growth',
    pricing: 'Ind: ₹1000 / Couple: ₹1500',
    img: '/assets/rubeena.webp',
    tier: 'Standard',
    group: 3
  },
  {
    name: 'Indulekha',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: '950+ Sessions',
    approach: 'Balanced Mental Health Support',
    pricing: 'Ind: ₹1000 / Couple: ₹1500',
    img: '/assets/indulekha.webp',
    tier: 'Standard',
    group: 3
  },
  {
    name: 'Fathima Rincy',
    role: 'Consultant Psychologist',
    specialisation: 'Individual & Couple Therapy',
    exp: '1000+ Sessions',
    approach: 'Compassionate Therapeutic Care',
    pricing: 'Ind: ₹1000 / Couple: ₹1500',
    img: '/assets/fathima-rincy.webp',
    tier: 'Standard',
    group: 3
  }
];

const group1 = [
  {
    name: 'Anusha',
    role: 'Consultant Psychologist',
    specialisation: 'Individual Therapy',
    exp: '1000+ Sessions',
    approach: 'Therapy, Healing & Balance',
    pricing: '₹1000 (Individual Only)',
    img: '/assets/anusha-profile-photo.webp',
    tier: 'Standard',
    group: 1
  },
  {
    name: 'Sreemol P S',
    role: 'Consultant Psychologist',
    specialisation: 'Individual Therapy',
    exp: '1000+ Sessions',
    approach: 'Compassionate Support & Personal Well-being',
    pricing: '₹1000 (Individual Only)',
    img: '/assets/sreemol-profile.webp',
    tier: 'Standard',
    group: 1
  },
  {
    name: 'Shipa',
    role: 'Consultant Psychologist',
    specialisation: 'Individual Therapy',
    exp: '800+ Sessions',
    approach: 'Healing, Support & Wellness',
    pricing: '₹1000 (Individual Only)',
    img: '/assets/therapist-shilpa.webp',
    tier: 'Standard',
    group: 1
  },
  {
    name: 'Reginmaria',
    role: 'Consultant Psychologist',
    specialisation: 'Individual Therapy',
    exp: '1000+ Sessions',
    approach: 'Empathetic Support & Mindfulness',
    pricing: '₹1000 (Individual Only)',
    img: '/assets/raginmara-profile.webp',
    tier: 'Standard',
    group: 1
  },
  {
    name: 'Nisha',
    role: 'Consultant Psychologist',
    specialisation: 'Individual Therapy',
    exp: '1000+ Sessions',
    approach: 'Counseling & Mental Wellness',
    pricing: '₹1000 (Individual Only)',
    img: '/assets/nisha-profile-new.webp',
    tier: 'Standard',
    group: 1
  },
  {
    name: 'Rameesa K',
    role: 'Consultant Psychologist',
    specialisation: 'Individual Therapy',
    exp: '900+ Sessions',
    approach: 'Support & Wellness Through Empathy',
    pricing: '₹1000 (Individual Only)',
    img: '/assets/therapist-rameesa.webp',
    tier: 'Standard',
    group: 1
  }
];

export default function TeamPage() {
  const professionals = [...group2, ...group5, ...group4, ...group3, ...group1];

  return (
    <main className="min-h-screen bg-[#F5F8F7] font-body text-[#1A2E2C]">
      <Navbar />
      
      <section className="pt-40 pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[#B7C8A3]/20 text-[#064F4B] px-4 py-1.5 rounded-full font-bold text-xs mb-8 tracking-widest uppercase">
            Our Professionals
          </div>
          <h1 className="text-5xl lg:text-7xl font-heading font-extrabold text-[#1A2E2C] mb-8 leading-tight">
            Meet Your <span className="text-[#0A7F7A]">Support.</span>
          </h1>
          <p className="text-xl text-[#5F7F7A] max-w-3xl mx-auto leading-relaxed italic">
            Our team consists of licensed psychologists dedicated to providing empathetic, evidence-based therapy in a safe environment.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {professionals.map((pro, idx) => (
              <div key={`${pro.name}-${idx}`} className="bg-[#B9BE9B] rounded-[3.5rem] overflow-hidden shadow-xl border border-black/5 group hover:-translate-y-2 transition-all duration-500">
                <div className="relative h-96 overflow-hidden bg-[#064F4B]/10">
                  {pro.img ? (
                    <img 
                      src={pro.img} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      alt={pro.name}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#064F4B]/20 bg-[#F5F8F7]">
                      <LucideIcon name="user" size={120} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#064F4B]/80 via-transparent to-transparent opacity-60" />
                  
                  {/* Online Indicator */}
                  <div className="absolute top-8 right-8 w-4 h-4 bg-[#00D494] rounded-full border-2 border-white shadow-[0_0_12px_rgba(0,212,148,0.8)] animate-pulse"></div>

                  <div className="absolute bottom-8 left-8">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                       <h3 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter">{pro.name}</h3>
                       {pro.tier === 'Premium' && (
                         <div className="bg-[#00D494] text-[#064F4B] px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Premium</div>
                       )}
                       {pro.group === 4 && (
                         <div className="bg-[#B7C8A3] text-[#064F4B] px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Consultant Plus</div>
                       )}
                       {pro.group === 5 && (
                         <div className="bg-[#B7C8A3] text-[#064F4B] px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Consultant</div>
                       )}
                    </div>
                    <p className="text-white/80 font-bold tracking-wide uppercase text-xs">{pro.role}</p>
                  </div>
                </div>
                
                <div className="p-10 lg:p-12 bg-white">
                  <div className="flex flex-wrap gap-4 mb-10">
                    <div className="bg-[#F5F8F7] px-4 py-2 rounded-xl text-sm font-bold text-[#064F4B] border border-[#E2E8E6]">
                      Exp: {pro.exp}
                    </div>
                    <div className="bg-[#F5F8F7] px-4 py-2 rounded-xl text-sm font-bold text-[#064F4B] border border-[#E2E8E6]">
                      Licensed Professional
                    </div>
                  </div>
                  
                  <div className="space-y-6 mb-10">
                    <div>
                      <h4 className="text-[10px] font-black text-[#064F4B]/40 uppercase tracking-widest mb-2">Specialisation</h4>
                      <p className="text-[#064F4B] font-bold leading-relaxed">{pro.specialisation}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-[#064F4B]/40 uppercase tracking-widest mb-2">Approach</h4>
                      <p className="text-[#064F4B]/80 leading-relaxed italic">"{pro.approach}"</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-[#064F4B]/40 uppercase tracking-widest mb-2">Pricing</h4>
                      <p className="text-[#064F4B] font-black text-xl tracking-tighter">{pro.pricing}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-[#00D494]/10 text-[#0A7F7A] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                         <LucideIcon name="package" size={10} /> Packages Available
                      </div>
                    </div>
                  </div>

                  <a 
                    href={`https://wa.me/919846462744?text=Hi,%20I%20want%20to%20book%20an%20appointment%20with%20${encodeURIComponent(pro.name)}`}
                    className="block w-full text-center bg-[#064F4B] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#0A7F7A] transition-all shadow-xl shadow-[#064F4B]/20 active:scale-95"
                  >
                    Book Appointment
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-24 text-center">
            <div className="inline-block p-1 bg-white rounded-full shadow-lg">
              <div className="bg-[#064F4B] px-8 py-4 rounded-full flex flex-wrap items-center justify-center gap-8">
                <div className="flex items-center gap-3 text-white">
                  <LucideIcon name="shield-check" size={20} className="text-[#B7C8A3]" />
                  <span className="text-sm font-bold">Ethical Practice</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <LucideIcon name="heart" size={20} className="text-[#B7C8A3]" />
                  <span className="text-sm font-bold">Empathetic Listening</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <LucideIcon name="scroll" size={20} className="text-[#B7C8A3]" />
                  <span className="text-sm font-bold">Evidence-Based Care</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
