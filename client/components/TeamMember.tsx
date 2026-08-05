import React from 'react';

export default function TeamMember({ name, role, bio, img, bgColor, reverse = false }: any) {
  return (
    <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20 py-16 border-b border-[#E2E8E6] last:border-0`}>
      <div className="relative w-64 h-64 lg:w-80 lg:h-80 flex-shrink-0 animate-in fade-in zoom-in duration-700">
        {/* Organic Blob Shape Background */}
        <div className={`absolute inset-0 ${bgColor} opacity-20 rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] animate-pulse duration-[4000ms]`} />
        
        {/* Main Image with Mask/Shape */}
        <div className="relative z-10 w-full h-full overflow-hidden rounded-[40%_60%_70%_30%_/_40%_50%_60%_40%] border-4 border-white shadow-xl">
          <img 
            src={img} 
            alt={name} 
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" 
          />
        </div>
      </div>

      <div className="flex-1 text-center lg:text-left">
        <h3 className="text-3xl font-heading font-bold text-[#064F4B] mb-2">{name}</h3>
        <p className="text-[#0A7F7A] font-bold text-sm tracking-widest uppercase mb-6">{role}</p>
        <div className="w-12 h-1 bg-[#B7C8A3] mb-6 mx-auto lg:mx-0 rounded-full" />
        <p className="text-[#5F7F7A] leading-relaxed text-lg italic italic">
          "{bio}"
        </p>
      </div>
    </div>
  );
}
