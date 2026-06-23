import React from 'react';

export default function ServiceTherapistGrid() {
  const whatsappNumber = "919846462744";
  
  // Group 2: Individual & Couple (Premium/Senior)
  const seniorTherapists = [
    { 
      name: 'Kallu Sajeev', 
      role: 'Consultant Psychologist', 
      price: '₹2000', 
      img: '/assets/kallu-sajeev-psychologist-new.webp'
    },
  ];

  // Group 4: Consultant Plus (Updated)
  const group4Therapists = [
    { name: 'Pavithra', role: 'Consultant Psychologist', price: '₹1500', img: '/assets/therapist-pavithra.webp' },
    { name: 'Jasna', role: 'Consultant Psychologist', price: '₹1500', img: '/assets/therapist-jasna.webp' },
  ];

  // Group 1: Individual Only (Standard)
  const standardTherapists = [
    { name: 'Sreemol P S', role: 'Consultant Psychologist', price: '₹1000', img: '/assets/sreemol-profile.webp' },
    { name: 'Nisha', role: 'Consultant Psychologist', price: '₹1000', img: '/assets/nisha-profile-new.webp' },
  ];

  const therapists = [...seniorTherapists, ...group4Therapists, ...standardTherapists];

  return (
    <section className="py-24 bg-[#0A7F7A]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl lg:text-5xl font-heading font-black text-white mb-16 uppercase tracking-tighter">
          Meet our <span className="italic text-[#B7C8A3]">Clinical</span> Specialists
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {therapists.map((pro, i) => (
            <div key={i} className="bg-white rounded-[3rem] p-8 shadow-2xl hover:scale-105 transition-all duration-500 group flex flex-col items-center">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden mb-6 border-4 border-[#F5F8F7] shadow-lg group-hover:border-[#B7C8A3] transition-all bg-[#064F4B]/5 flex items-center justify-center">
                {pro.img ? (
                   <img src={pro.img} alt={pro.name} className="w-full h-full object-cover" />
                ) : (
                   <div className="text-[#064F4B]/20">
                     <i data-lucide="user" className="w-12 h-12" />
                   </div>
                )}
              </div>
              <h3 className="text-base lg:text-lg font-black text-[#064F4B] mb-1 leading-tight uppercase tracking-tighter truncate">{pro.name}</h3>
              <p className="text-[10px] text-[#5F7F7A] font-black uppercase tracking-widest mb-4 opacity-60">{pro.role}</p>
              <p className="text-xs font-black text-[#0A7F7A] mb-6 bg-[#F5F8F7] py-2 px-4 rounded-full">Starts at {pro.price}</p>
              <a 
                href={`https://wa.me/${whatsappNumber}?text=Hi,%20I%20want%20to%20book%20an%20appointment%20with%20${encodeURIComponent(pro.name)}`}
                className="mt-auto w-full bg-[#064F4B] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10"
              >
                Book now
              </a>
            </div>
          ))}
        </div>
        
        <a 
          href="/therapists"
          className="inline-block mt-20 bg-white/10 hover:bg-white text-white hover:text-[#064F4B] px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] border border-white/20 transition-all active:scale-95"
        >
          View all therapists
        </a>
      </div>
    </section>
  );
}
