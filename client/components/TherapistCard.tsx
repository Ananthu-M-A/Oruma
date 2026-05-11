import React from 'react';
import { LucideIcon } from '@site-builder/icons';

export default function TherapistCard({
  name,
  role,
  image,
  tags = [],
  hours,
  price,
  nextSlot,
  onBook
}: any) {
  const whatsappLink = `https://wa.me/918157039987?text=Hi,%20I%20want%20to%20book%20an%20appointment%20with%20${encodeURIComponent(name)}.`;

  return (
    <div className="bg-[#B7C8A3] rounded-[3rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col gap-6">
      
      {/* Top Section: Avatar & Basic Info */}
      <div className="flex items-start gap-5">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full border-4 border-white/50 overflow-hidden shadow-sm bg-white/20">
            {image ? (
              <img src={image} className="w-full h-full object-cover" alt={name} />
            ) : (
              <div className="w-full h-full bg-[#064F4B]/10 flex items-center justify-center">
                <LucideIcon name="user" size={32} className="text-[#064F4B]/30" />
              </div>
            )}
          </div>
          {/* Online Indicator */}
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#00D494] border-4 border-[#B7C8A3] rounded-full" />
        </div>
        
        <div className="pt-1 min-w-0">
          <h3 className="text-xl font-black text-[#064F4B] leading-tight truncate">{name}</h3>
          <p className="text-[10px] font-bold text-[#064F4B]/60 uppercase tracking-widest mt-1 truncate">{role}</p>
          
          <div className="mt-3 inline-flex items-center bg-[#D9E4D9]/80 backdrop-blur-sm px-4 py-1.5 rounded-full">
            <span className="text-[10px] font-black text-[#0A7F7A] uppercase tracking-tighter">Available Now</span>
          </div>
        </div>
      </div>

      {/* Tags & Hours */}
      <div className="flex flex-wrap items-center gap-2 min-h-[64px]">
        {tags.map((tag, i) => (
          <span key={i} className="px-5 py-2 rounded-full bg-white/40 text-[10px] font-extrabold text-[#064F4B] backdrop-blur-sm border border-white/20">
            {tag}
          </span>
        ))}
        <span className="ml-2 text-[11px] font-black text-[#064F4B]/50 uppercase tracking-widest">
          {hours}+ HRS
        </span>
      </div>

      {/* Audio Player Style */}
      <div className="bg-black/5 rounded-[1.5rem] px-4 py-3.5 flex items-center gap-3">
        <button className="text-[#064F4B] hover:scale-110 transition-transform">
          <LucideIcon name="play" size={16} fill="currentColor" />
        </button>
        <div className="flex-1 h-1 bg-[#064F4B]/10 rounded-full relative">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-[#064F4B] rounded-full">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#064F4B] rounded-full border border-[#B7C8A3]"></div>
          </div>
        </div>
        <span className="text-[9px] font-black text-[#064F4B]/60">1:14</span>
      </div>

      {/* Footer Booking Area */}
      <div className="flex items-end justify-between mt-auto pt-4 border-t border-[#064F4B]/5">
        <div className="space-y-1">
          <p className="text-[8px] font-black text-[#064F4B]/50 uppercase tracking-widest">Booking Slot</p>
          <p className="text-xs font-black text-[#064F4B]">{nextSlot || "Today, 12:00 PM"}</p>
          <p className="text-sm font-black text-[#064F4B]">{price}</p>
        </div>
        
        <a 
          href={whatsappLink}
          className="bg-[#064F4B] text-white px-8 py-4 rounded-[1.5rem] font-black text-sm hover:bg-[#0A7F7A] transition-all active:scale-95 shadow-lg shadow-[#064F4B]/20 uppercase tracking-widest text-center"
        >
          Book Appointment
        </a>
      </div>

    </div>
  );
}
