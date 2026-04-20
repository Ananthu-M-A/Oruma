import React, { useState } from 'react';
import { LucideIcon } from '@site-builder/icons';
import BookingModal from './BookingModal';

const experts = [
  // Group 2
  {
    id: 105,
    name: 'Rose J',
    role: 'Onco Psychologist and Clinical Psychologist',
    image: '/assets/rose-j-expert.webp',
    tags: ['Onco Psychologist and Clinical Psychologist'],
    hours: '950',
    nextSlot: 'Today, 3:00 PM',
    priceInd: '₹2,000',
    priceCouple: '₹3,000',
    group: 2
  },
  {
    id: 104,
    name: 'Hamna',
    role: 'Clinical Psychologist',
    image: '/assets/hamna-profile.webp',
    tags: ['Clinical Psychologist'],
    hours: '800',
    nextSlot: 'Today, 12:00 PM',
    priceInd: '₹2,000',
    priceCouple: '₹3,000',
    group: 2
  },
  {
    id: 101,
    name: 'Kallu Sajeev',
    role: 'Clinical Psychologist',
    image: '/assets/kallu-sajeev-psychologist-new.webp',
    tags: ['Clinical Psychologist'],
    hours: '1500',
    nextSlot: 'Today, 10:00 AM',
    priceInd: '₹2,000',
    priceCouple: '₹3,000',
    group: 2
  },
  {
    id: 308,
    name: 'Shabna',
    role: 'Consultant Psychologist',
    image: '/assets/shabna-profile-new.webp',
    tags: ['Consultant', 'Individual & Couple'],
    hours: 'Professional',
    nextSlot: 'Today, 10:00 AM',
    priceInd: '₹1,500',
    priceCouple: '₹1,500',
    group: 3
  },
  // Group 5 Featured
  {
    id: 302,
    name: 'Shihana',
    role: 'Consultant Psychologist',
    image: '/assets/shihana-profile-updated.webp',
    tags: ['Consultant', 'Individual & Couple'],
    hours: '850',
    nextSlot: 'Today, 11:00 AM',
    priceInd: '₹1,500',
    priceCouple: '₹1,500',
    group: 5
  },
  // Group 1 Requested Consultants
  {
    id: 31,
    name: 'Reginmaria',
    role: 'Consultant Psychologist',
    image: '/assets/raginmara-profile.webp',
    tags: ['Individual Only', 'Consultant', 'Mindfulness'],
    hours: '1000',
    nextSlot: 'Today, 12:30 PM',
    priceInd: '₹1,000',
    group: 1
  },
  {
    id: 202,
    name: 'Rameesa K',
    role: 'Consultant Psychologist',
    image: '/assets/therapist-rameesa.webp',
    tags: ['Individual Only', 'Consultant', 'Support'],
    hours: '900',
    nextSlot: 'Today, 4:00 PM',
    priceInd: '₹1,000',
    group: 1
  }
];

export default function ConsultantsSection() {
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const whatsappNumber = "919846462744";

  const handleBookNow = (therapist) => {
    setSelectedTherapist(therapist);
    setIsModalOpen(true);
  };

  return (
    <section className="py-20 bg-[#F7F9F5]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-[#064F4B] mb-4 uppercase tracking-tighter">Our Featured Experts</h2>
            <p className="text-[#064F4B]/60 font-medium">Connect with our dedicated psychologists who bring deep expertise and clinical care to your healing journey.</p>
          </div>
          <a href="/team" className="inline-flex items-center gap-2 text-[#0A7F7A] font-black uppercase tracking-widest text-xs hover:underline group">
            See All Team Members
            <LucideIcon name="arrow-right" size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experts.map((therapist) => (
            <div key={therapist.id} className="bg-[#B7C8A3] rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden">
              
              {/* Profile Header */}
              <div className="flex gap-5 items-center">
                <div className="relative w-20 h-20 shrink-0">
                   {therapist.image ? (
                     <img 
                       src={therapist.image} 
                       alt={therapist.name}
                       className="w-full h-full object-cover rounded-full border-4 border-white/50 shadow-sm group-hover:scale-105 transition-transform duration-500"
                     />
                   ) : (
                     <div className="w-full h-full bg-[#064F4B]/10 rounded-full border-4 border-white/50 flex items-center justify-center text-[#064F4B]/20">
                       <LucideIcon name="user" size={32} />
                     </div>
                   )}
                   <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#00D494] border-2 border-[#B7C8A3] rounded-full"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-black text-[#064F4B] leading-tight mb-1 truncate">{therapist.name}</h3>
                  <p className="text-[10px] font-black text-[#064F4B]/60 uppercase tracking-[0.2em]">{therapist.role}</p>
                </div>
              </div>

              {/* Skills/Tags */}
              <div className="flex flex-wrap gap-2">
                {therapist.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-black text-[#064F4B] bg-white/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 uppercase tracking-wider">{tag}</span>
                ))}
              </div>

              {/* Audio visualizer style */}
              <div className="bg-[#064F4B]/5 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#064F4B] text-white rounded-full flex items-center justify-center shadow-md">
                  <LucideIcon name="play" size={14} fill="currentColor" />
                </div>
                <div className="flex-1 h-1 bg-[#064F4B]/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#064F4B] w-1/3 rounded-full"></div>
                </div>
              </div>

              {/* Footer / Booking */}
              <div className="pt-6 border-t border-[#064F4B]/5 mt-auto flex flex-col gap-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#064F4B]/40 uppercase tracking-widest">Pricing</p>
                    <div className="flex flex-col">
                      <span className="text-base font-black text-[#064F4B]">{therapist.priceInd} <span className="text-[10px] opacity-60">/ Ind</span></span>
                      {therapist.priceCouple && therapist.priceCouple !== '-' && (
                        <span className="text-xs font-bold text-[#064F4B]/70">{therapist.priceCouple} <span className="text-[9px] opacity-60">/ Couple</span></span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#064F4B]/40 uppercase tracking-widest">Available</p>
                    <p className="text-xs font-black text-[#064F4B]">{therapist.nextSlot}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleBookNow(therapist)}
                    className="flex-1 bg-[#064F4B] text-white py-4 rounded-2xl font-black text-xs hover:bg-[#064F4B]/90 transition-all active:scale-95 uppercase tracking-[0.2em] shadow-lg shadow-[#064F4B]/20"
                  >
                    BOOK SESSION
                  </button>
                  <a 
                    href={`https://wa.me/${whatsappNumber}?text=Hi,%20I%20want%20to%20book%20an%20appointment%20with%20${encodeURIComponent(therapist.name)}`}
                    className="w-14 bg-[#00D494] text-white rounded-2xl flex items-center justify-center hover:bg-[#00B37E] transition-all active:scale-95 shadow-md"
                    title="WhatsApp for Booking"
                  >
                    <LucideIcon name="message-circle" size={24} />
                  </a>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        therapist={selectedTherapist}
      />
    </section>
  );
}
