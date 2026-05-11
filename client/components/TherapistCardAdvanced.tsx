import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from '@site-builder/icons';

export default function TherapistCardAdvanced({ id, name, title, hours, tags, price, img, slot, whatsappNumber = "918157039987" }) {
  // Simple check to avoid double currency symbol if it's already in the string
  const displayPrice = price && price.toString().startsWith('₹') ? price : `₹${price}`;

  return (
    <div className="bg-[#B7C8A3] rounded-[3rem] p-8 shadow-xl shadow-[#0A7F7A]/10 flex flex-col gap-6 relative group overflow-hidden">
      
      {/* Top Section: Avatar & Basic Info */}
      <div className="flex items-start gap-5">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-inner bg-white/20">
            {img ? (
              <img src={img} className="w-full h-full object-cover" alt={name} />
            ) : (
              <div className="w-full h-full bg-[#064F4B]/10 flex items-center justify-center">
                <LucideIcon name="user" size={32} className="text-[#064F4B]/30" />
              </div>
            )}
          </div>
          {/* Online Indicator */}
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#00D494] border-4 border-[#B7C8A3] rounded-full" />
        </div>
        
        <div className="pt-1">
          <h3 className="text-xl font-black text-[#064F4B] leading-tight">{name}</h3>
          <p className="text-[10px] font-bold text-[#064F4B]/60 uppercase tracking-widest mt-1">{title}</p>
          
          <div className="mt-3 inline-flex items-center bg-[#D9E4D9]/80 backdrop-blur-sm px-4 py-1.5 rounded-full">
            <span className="text-[10px] font-black text-[#0A7F7A] uppercase tracking-tighter">Available Now</span>
          </div>
        </div>
      </div>

      {/* Tags & Hours */}
      <div className="flex flex-wrap items-center gap-2">
        {tags && tags.length > 0 ? tags.map((tag, i) => (
          <span key={i} className="px-5 py-2 rounded-full bg-white/40 text-[10px] font-extrabold text-[#064F4B] backdrop-blur-sm">
            {tag}
          </span>
        )) : (
          <span className="px-5 py-2 rounded-full bg-white/40 text-[10px] font-extrabold text-[#064F4B] backdrop-blur-sm">
            Mental Health
          </span>
        )}
        <span className="ml-2 text-[11px] font-black text-[#064F4B]/50 uppercase tracking-widest">
          {hours ? `${hours}+ HRS` : '1000+ HRS'}
        </span>
      </div>

      {/* Simplified Audio Player (Screenshot Style) */}
      <div className="bg-black/5 rounded-[2rem] p-5 flex items-center gap-4">
        <button className="text-[#064F4B] hover:scale-110 transition-transform">
          <LucideIcon name="play" size={20} fill="currentColor" />
        </button>
        <div className="flex-1 relative h-1.5 bg-[#064F4B]/10 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-[40%] bg-[#064F4B] rounded-full">
             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#064F4B] rounded-full border-2 border-[#B7C8A3] shadow-sm" />
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#064F4B]/60">1:14</span>
      </div>

      {/* Footer Booking Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[#064F4B]/60 uppercase tracking-widest">Booking Slot</p>
          <p className="text-sm font-black text-[#064F4B]">{slot || "Today, 12:00 PM"}</p>
          <p className="text-xl font-black text-[#064F4B]">{displayPrice}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {id && (
            <Link
              to={`/therapists/${id}`}
              className="bg-white/40 text-[#064F4B] px-6 py-4 rounded-[1.5rem] font-black text-xs hover:bg-white/70 transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <LucideIcon name="user-round-search" size={16} />
              View Profile
            </Link>
          )}
          <a
            href={`https://wa.me/${whatsappNumber}?text=Hi,%20I%20want%20to%20book%20an%20appointment%20with%20${encodeURIComponent(name)}`}
            className="bg-[#064F4B] text-white px-6 py-4 rounded-[1.5rem] font-black text-xs hover:bg-[#0A7F7A] transition-all active:scale-95 shadow-lg shadow-[#064F4B]/20 uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <LucideIcon name="message-circle" size={18} />
            Book
          </a>
        </div>
      </div>

    </div>
  );
}
