import React from 'react';

export default function ParentingTherapistGrid() {
  const whatsappNumber = "919846462744";
  const therapists = [
    { name: 'Dr. Pathmash Shahanuma', role: 'Consultant Psychologist', img: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200' },
    { name: 'Noor Pareeda', role: 'Consultant Psychologist', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
    { name: 'Jils PV', role: 'Consultant Psychologist', img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200' },
    { name: 'Leena Mathew', role: 'Consultant Psychologist', img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200' },
    { name: 'Fida Sherin', role: 'Consultant Psychologist', img: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200' },
    { name: 'Arjun K', role: 'Consultant Psychologist', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
    { name: 'Sana Fatima', role: 'Consultant Psychologist', img: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=200' },
    { name: 'Rohan Mani', role: 'Consultant Psychologist', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' }
  ];

  return (
    <section className="py-24 bg-[#00D494]">
      <div className="max-w-7xl mx-auto px-6 text-center text-white">
        <h2 className="text-3xl lg:text-5xl font-heading font-extrabold mb-4">
          Support Your Child <br /> With <span className="italic">Oruma</span>
        </h2>
        <p className="text-white/60 font-medium mb-16 tracking-wide">
          Connecting you with specialists in child behavioral health.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {therapists.map((pro, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] p-6 shadow-2xl text-[#2E3E3C] transition-transform hover:-translate-y-2">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-[#F5F8F7]">
                <img src={pro.img} alt={pro.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-sm font-bold text-[#064F4B] mb-1 truncate">{pro.name}</h3>
              <p className="text-[10px] text-[#5F7F7A] font-bold uppercase tracking-widest mb-4 truncate">{pro.role}</p>
              
              <a 
                href={`https://wa.me/${whatsappNumber}?text=Hi,%20I%20want%20to%20book%20an%20appointment%20with%20${encodeURIComponent(pro.name)}`}
                className="block w-full bg-[#1A1A1A] text-white py-2.5 rounded-xl font-bold text-[10px] hover:bg-black mb-2"
              >
                Book Appointment
              </a>
              <button className="w-full text-[10px] font-bold text-[#5F7F7A] hover:text-[#0A7F7A]">
                View Profile
              </button>
            </div>
          ))}
        </div>

        <a href="/therapists" className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-full font-bold border border-white/30 transition-all">
          View all child specialists
        </a>
      </div>
    </section>
  );
}
