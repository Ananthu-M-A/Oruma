import React from 'react';
import { LucideIcon } from '@site-builder/icons';

export default function FollowUpHero() {
  return (
    <section className="pt-40 lg:pt-52 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl lg:text-7xl font-heading font-extrabold text-[#064F4B] leading-tight mb-8">
            Continue Your <br /> Journey to <span className="italic">Wellness</span>
          </h1>
          <p className="text-lg text-[#5F7F7A] mb-12 max-w-lg leading-relaxed font-medium">
            Consistent care is essential for lasting progress. Secure your next session with your therapist and stay on track with your mental health goals.
          </p>
          
          <div className="flex gap-12 lg:gap-16 border-t border-[#E2E8E6] pt-10">
            <div>
              <p className="text-3xl font-extrabold text-[#0A7F7A]">20K</p>
              <p className="text-[10px] font-bold text-[#5F7F7A] uppercase tracking-widest mt-1">Hours completed</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#0A7F7A]">40+</p>
              <p className="text-[10px] font-bold text-[#5F7F7A] uppercase tracking-widest mt-1">Countries</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#0A7F7A]">29+</p>
              <p className="text-[10px] font-bold text-[#5F7F7A] uppercase tracking-widest mt-1">Therapists</p>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          {/* Arch Illustration Replicated with CSS/SVG */}
          <div className="relative w-full max-w-sm aspect-[4/5] bg-[#00E0A1] rounded-t-full flex items-center justify-center shadow-2xl overflow-hidden">
             {/* Inner White Arch */}
             <div className="absolute bottom-0 w-1/2 h-2/3 bg-white rounded-t-full mb-[-10%]" />
             
             {/* Magnifying Glass Illustration Icon */}
             <div className="relative z-10 w-48 h-48 bg-white/20 rounded-full backdrop-blur-md flex items-center justify-center border border-white/30 rotate-12">
                <div className="w-24 h-24 border-8 border-black rounded-full relative">
                   <div className="absolute bottom-[-20px] right-[-20px] w-4 h-12 bg-black rounded-full rotate-45 origin-top" />
                </div>
             </div>

             {/* Background decorative dots */}
             <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-20 left-10 w-4 h-4 bg-black rounded-full" />
                <div className="absolute top-40 right-10 w-8 h-8 bg-black rounded-full" />
                <div className="absolute bottom-20 left-20 w-6 h-6 bg-black rounded-full" />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
