import React from 'react';
import TherapistCard from './TherapistCard';

export default function AnxietyTherapistGrid() {
  const therapists = [];

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
