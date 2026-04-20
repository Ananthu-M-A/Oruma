import React from 'react';
import TherapistCard from './TherapistCard';

export default function AnxietyTherapistGrid() {
  const therapists = [
    {
      name: 'Sreelekshmi',
      role: 'Consultant Psychologist',
      image: '/assets/therapist-sreelekshmi.webp',
      tags: ['Consultant', 'Individual & Couple', 'Expert'],
      hours: '950',
      price: '₹ 1500',
      nextSlot: 'Today, 10:30 AM'
    },
    {
      name: 'Saifunnisa',
      role: 'Consultant Psychologist',
      image: '/assets/therapist-saifunnisa.webp',
      tags: ['Consultant', 'Individual & Couple', 'Expert'],
      hours: '880',
      price: '₹ 1500',
      nextSlot: 'Today, 11:30 AM'
    },
    {
      name: 'Pavithra',
      role: 'Consultant Psychologist',
      image: '/assets/therapist-pavithra.webp',
      tags: ['Consultant', 'Individual & Couple', 'Expert'],
      hours: '820',
      price: '₹ 1500',
      nextSlot: 'Today, 2:30 PM'
    },
    {
      name: 'Jasna',
      role: 'Consultant Psychologist',
      image: '/assets/therapist-jasna.webp',
      tags: ['Consultant', 'Individual & Couple', 'Expert'],
      hours: '790',
      price: '₹ 1500',
      nextSlot: 'Today, 4:30 PM'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl lg:text-4xl font-heading font-extrabold text-[#064F4B]">Available <span className="text-[#0A7F7A]">Now</span></h2>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-[#00D494] rounded-full animate-pulse"></div>
           <span className="text-xs font-bold text-[#5F7F7A] uppercase tracking-widest">Active Therapists</span>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12">
        {therapists.map((pro, i) => (
          <TherapistCard key={i} {...pro} />
        ))}
      </div>
    </div>
  );
}
