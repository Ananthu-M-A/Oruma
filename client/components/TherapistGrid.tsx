import React, { useState } from 'react';
import { LucideIcon } from '@site-builder/icons';
import BookingModal from './BookingModal';

export const therapists = [
  // Group 2 (Premium - Consultant Psychologists)
  {
    id: 104,
    name: 'Hamna',
    role: 'Clinical Psychologist',
    tier: 'high',
    image: '/assets/hamna-profile.webp',
    tags: ['Clinical Psychologist'],
    hours: '800',
    nextSlot: 'Today, 12:00 PM',
    priceInd: '₹2,000',
    priceCouple: '₹3,000',
    hasPackages: true,
    group: 2
  },
  {
    id: 101,
    name: 'Kallu Sajeev',
    role: 'Clinical Psychologist',
    tier: 'high',
    image: '/assets/kallu-sajeev-psychologist-new.webp',
    tags: ['Clinical Psychologist'],
    hours: '1500',
    nextSlot: 'Today, 10:00 AM',
    priceInd: '₹2,000',
    priceCouple: '₹3,000',
    hasPackages: true,
    group: 2
  },
  // Group 3 (Consultant Psychologists)
  {
    id: 308,
    name: 'Shabna',
    role: 'Consultant Psychologist',
    tier: 'standard',
    image: '/assets/shabna-profile-new.webp',
    tags: ['Consultant', 'Individual & Couple'],
    hours: 'Professional',
    nextSlot: 'Today, 10:00 AM',
    priceInd: '₹1,500',
    priceCouple: '₹1,500',
    hasPackages: true,
    group: 3
  },
  // New Shihana (Team No 2)
  {
    id: 310,
    name: 'Shihana',
    role: 'Consultant Psychologist',
    tier: 'standard',
    image: '/assets/shihana-profile.webp',
    tags: ['Consultant', 'Team No 2', 'Individual & Couple'],
    hours: '800',
    nextSlot: 'Today, 10:00 AM',
    priceInd: '₹1,000',
    priceCouple: '₹1,500',
    hasPackages: true,
    group: 3
  },
  // Group 5 (Consultant Psychologists)
  {
    id: 302,
    name: 'Shihana',
    role: 'Consultant Psychologist',
    tier: 'standard',
    image: '/assets/shihana-profile-updated.webp',
    tags: ['Consultant', 'Individual & Couple', 'Counseling'],
    hours: '850',
    nextSlot: 'Today, 11:00 AM',
    priceInd: '₹1,500',
    priceCouple: '₹1,500',
    hasPackages: true,
    group: 5
  },
  {
    id: 502,
    name: 'Shaeza Mariyem',
    role: 'Consultant Psychologist',
    tier: 'standard',
    image: '/assets/shaeza-mariyam-profile.webp',
    tags: ['Consultant', 'Individual & Couple', 'Healing'],
    hours: '450',
    nextSlot: 'Today, 11:00 AM',
    priceInd: '₹2,000',
    priceCouple: '₹2,250',
    hasPackages: true,
    group: 5
  },
  {
    id: 503,
    name: 'Aleeda',
    role: 'Consultant Psychologist',
    tier: 'standard',
    image: '/assets/therapist-aleeda.webp',
    tags: ['Consultant', 'Individual & Couple', 'Empathy'],
    hours: '400',
    nextSlot: 'Today, 12:00 PM',
    priceInd: '₹2,000',
    priceCouple: '₹2,250',
    hasPackages: true,
    group: 5
  },
  // Group 4 (Consultant Psychologists)
  {
    id: 406,
    name: 'Rifana',
    role: 'Consultant Psychologist',
    tier: 'standard',
    image: '/assets/rifana-new-profile-2024.webp',
    tags: ['Consultant', 'Team No 6', 'Individual & Couple'],
    hours: '800',
    nextSlot: 'Today, 12:00 PM',
    priceInd: '₹1,500',
    priceCouple: '₹1,500',
    hasPackages: true,
    group: 4
  },
  {
    id: 404,
    name: 'Pavithra',
    role: 'Consultant Psychologist',
    tier: 'standard',
    image: '/assets/therapist-pavithra.webp',
    tags: ['Consultant', 'Individual & Couple', 'Skilled Counseling'],
    hours: '820',
    nextSlot: 'Today, 2:30 PM',
    priceInd: '₹1,500',
    priceCouple: '₹1,500',
    hasPackages: true,
    group: 4
  },
  {
    id: 405,
    name: 'Jasna',
    role: 'Consultant Psychologist',
    tier: 'standard',
    image: '/assets/therapist-jasna.webp',
    tags: ['Consultant', 'Individual & Couple', 'Dedicated Support'],
    hours: '790',
    nextSlot: 'Today, 4:30 PM',
    priceInd: '₹1,500',
    priceCouple: '₹1,500',
    hasPackages: true,
    group: 4
  },
  // Remaining Group 3
  {
    id: 301,
    name: 'Dr. Ashi Chandran',
    role: 'Consultant Psychologist',
    tier: 'standard',
    image: '/assets/dr-ashi-chandran.webp',
    tags: ['Consultant', 'Individual & Couple', 'Counseling'],
    hours: '1000',
    nextSlot: 'Today, 10:00 AM',
    priceInd: '₹1,000',
    priceCouple: '₹1,500',
    hasPackages: true,
    group: 3
  },
  {
    id: 303,
    name: 'Anila',
    role: 'Consultant Psychologist',
    tier: 'standard',
    image: '/assets/anila.webp',
    tags: ['Consultant', 'Individual & Couple', 'Counseling'],
    hours: '900',
    nextSlot: 'Today, 12:00 PM',
    priceInd: '₹1,000',
    priceCouple: '₹1,500',
    hasPackages: true,
    group: 3
  },
  {
    id: 304,
    name: 'Nivya',
    role: 'Consultant Psychologist',
    tier: 'standard',
    image: '/assets/nivya.webp',
    tags: ['Consultant', 'Individual & Couple', 'Counseling'],
    hours: '1100',
    nextSlot: 'Today, 2:00 PM',
    priceInd: '₹1,000',
    priceCouple: '₹1,500',
    hasPackages: true,
    group: 3
  },
  {
    id: 305,
    name: 'Rubeena',
    role: 'Consultant Psychologist',
    tier: 'standard',
    image: '/assets/rubeena.webp',
    tags: ['Consultant', 'Individual & Couple', 'Counseling'],
    hours: '850',
    nextSlot: 'Today, 4:00 PM',
    priceInd: '₹1,000',
    priceCouple: '₹1,500',
    hasPackages: true,
    group: 3
  },
  {
    id: 306,
    name: 'Indulekha',
    role: 'Consultant Psychologist',
    tier: 'standard',
    image: '/assets/indulekha.webp',
    tags: ['Consultant', 'Individual & Couple', 'Counseling'],
    hours: '950',
    nextSlot: 'Today, 5:00 PM',
    priceInd: '₹1,000',
    priceCouple: '₹1,500',
    hasPackages: true,
    group: 3
  },
  {
    id: 307,
    name: 'Fathima Rincy',
    role: 'Consultant Psychologist',
    tier: 'standard',
    image: '/assets/fathima-rincy.webp',
    tags: ['Consultant', 'Individual & Couple', 'Counseling'],
    hours: '1000',
    nextSlot: 'Today, 6:00 PM',
    priceInd: '₹1,000',
    priceCouple: '₹1,500',
    hasPackages: true,
    group: 3
  },
  // Group 1 (Individual Therapy ONLY - Consultant Psychologists)
  {
    id: 33,
    name: 'Sreemol P S',
    malayalamName: 'ശ്രീമോൾ പി എസ്',
    role: 'Consultant Psychologist',
    tier: 'standard',
    image: '/assets/sreemol-profile.webp',
    tags: ['Individual Only', 'Consultant Psychologist', 'Mental Health', 'Wellness'],
    hours: '1000',
    nextSlot: 'Today, 9:30 PM',
    priceInd: '₹1,000',
    priceCouple: '-',
    hasPackages: true,
    group: 1
  },
  {
    id: 30,
    name: 'Nisha',
    malayalamName: 'നിഷ',
    role: 'Consultant Psychologist',
    tier: 'standard',
    image: '/assets/nisha-profile-new.webp',
    tags: ['Individual Only', 'Consultant Psychologist', 'Counseling', 'Wellness'],
    hours: '1000',
    nextSlot: 'Today, 11:30 AM',
    priceInd: '₹1,000',
    priceCouple: '-',
    hasPackages: true,
    group: 1
  },
];

export default function TherapistGrid() {
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookNow = (therapist) => {
    setSelectedTherapist(therapist);
    setIsModalOpen(true);
  };

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
        {therapists.map((therapist) => (
          <div key={therapist.id} className="bg-[#B7C8A3] rounded-[3rem] p-8 flex flex-col gap-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            
            {/* Top: Portrait & Basic Info */}
            <div className="flex gap-4 items-start">
              <div className="relative w-20 h-20 shrink-0">
                 {therapist.image ? (
                   <img 
                     src={therapist.image} 
                     alt={therapist.name}
                     className="w-full h-full object-cover rounded-full border-4 border-white/50 shadow-sm transition-transform duration-500 group-hover:scale-110"
                   />
                 ) : (
                   <div className="w-full h-full bg-[#064F4B]/10 rounded-full border-4 border-white/50 flex items-center justify-center">
                     <LucideIcon name="user" size={32} className="text-[#064F4B]/30" />
                   </div>
                 )}
                 <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#00D494] border-2 border-[#B7C8A3] rounded-full"></div>
              </div>
              
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="text-xl font-black text-[#064F4B] leading-tight truncate">
                  {therapist.name}
                  {therapist.malayalamName && <span className="block text-sm font-bold opacity-60">{therapist.malayalamName}</span>}
                </h3>
                <p className="text-[10px] font-black text-[#064F4B]/60 uppercase tracking-widest mt-1 truncate">{therapist.role}</p>
                <div className="mt-2 bg-[#D9E4D9]/80 backdrop-blur-sm inline-block px-3 py-1 rounded-full text-[8px] font-black text-[#0A7F7A] uppercase tracking-tighter">AVAILABLE NOW</div>
              </div>
            </div>

            {/* Middle: Tags & Experience */}
            <div className="flex flex-wrap items-center gap-2 min-h-[50px]">
              {therapist.tags.map(tag => (
                <span key={tag} className="text-[9px] font-extrabold text-[#064F4B] bg-white/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20">{tag}</span>
              ))}
              <span className="text-[10px] font-black text-[#064F4B]/50 uppercase tracking-widest">{therapist.hours}+ HRS</span>
            </div>

            {/* Price Info Tag */}
            <div className="bg-black/5 rounded-[1.5rem] px-5 py-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-[#064F4B]/60 uppercase tracking-widest">Consultation Fee</span>
                {therapist.hasPackages && (
                  <div className="bg-[#00D494]/20 text-[#0A7F7A] text-[7px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter">Bundles Available</div>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-[#064F4B]">{therapist.priceInd}</p>
                {(therapist.group === 2 || therapist.group === 3 || therapist.group === 4 || therapist.group === 5) && therapist.priceCouple && therapist.priceCouple !== '-' && (
                   <p className="text-[9px] font-bold text-[#064F4B]/60 mt-0.5 tracking-tighter">Couple: {therapist.priceCouple}</p>
                )}
              </div>
            </div>

            {/* Bottom: Slot & Action */}
            <div className="pt-4 border-t border-[#064F4B]/5 mt-auto">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center mb-1">
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black text-[#064F4B]/50 uppercase tracking-widest">Next Available Slot</p>
                    <p className="text-[11px] font-black text-[#064F4B]">{therapist.nextSlot}</p>
                  </div>
                  <div className="flex -space-x-1">
                    {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full bg-white/40 border border-[#B7C8A3] flex items-center justify-center text-[8px] font-bold text-[#064F4B]">+{i}</div>)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleBookNow(therapist)}
                    className="flex-1 bg-[#064F4B] text-white py-4 rounded-[1.2rem] font-black text-[10px] hover:bg-[#0A7F7A] transition-all shadow-lg shadow-[#064F4B]/10 active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <LucideIcon name="calendar" size={14} />
                    BOOK SESSION
                  </button>
                  <a 
                    href={`https://wa.me/919846462744?text=Hi,%20I%20want%20to%20book%20an%20appointment%20with%20${encodeURIComponent(therapist.name)}`}
                    className="w-14 bg-[#00D494] text-white rounded-[1.2rem] flex items-center justify-center hover:bg-[#00B37E] transition-all active:scale-95 shadow-lg shadow-[#00D494]/20"
                    title="WhatsApp for Booking"
                  >
                    <LucideIcon name="message-circle" size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        therapist={selectedTherapist}
      />
    </div>
  );
}
