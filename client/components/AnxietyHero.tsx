import React from 'react';

export default function AnxietyHero() {
  const whatsappLink = "https://wa.me/918157039987?text=Hi,%20I'd%20like%20to%20get%20therapy%20for%20anxiety.";

  return (
    <section className="relative w-full overflow-hidden bg-white border-t border-gray-100">
      <div className="flex flex-col lg:flex-row-reverse min-h-[600px]">
        {/* Right Side - Content */}
        <div className="w-full lg:w-1/2 bg-[#064F4B] p-8 md:p-16 lg:p-24 flex flex-col justify-center items-start text-white relative z-10 shadow-xl">
          <div className="absolute inset-0 bg-[#064F4B] -z-10" />
          
          <div className="inline-block bg-[#0A7F7A] px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-white/10">
            Anxiety & Stress Support
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-black mb-8 leading-[1.1] max-w-xl uppercase tracking-tighter">
            Gentle Support for <br /><span className="text-[#B7C8A3]">Anxiety & Stress</span>
          </h1>
          <p className="text-lg md:text-xl mb-12 text-[#B7C8A3] font-medium max-w-lg leading-relaxed italic">
            Persistent worry and chronic stress can feel overwhelming. We help you calm your nervous system and rediscover your inner peace.
          </p>
          <a 
            href={whatsappLink}
            className="bg-white text-[#064F4B] px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#B7C8A3] transition-all shadow-2xl shadow-black/20 active:scale-95"
          >
            Start Healing
          </a>
        </div>
        
        {/* Left Side - Image with Quote */}
        <div className="w-full lg:w-1/2 relative min-h-[500px] lg:min-h-0 bg-[#F5F8F7]">
          <img 
            src="/assets/anxiety-slow-down-healing.webp" 
            alt="Peace begins when you allow yourself to slow down." 
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-[#064F4B]/20 mix-blend-multiply" />
          
          {/* Quote Overlay - Top Center */}
          <div className="absolute top-12 left-8 right-8 z-20">
            <div className="p-6 bg-[#064F4B]/40 backdrop-blur-md rounded-[2.5rem] border border-white/20">
              <p className="text-white text-base md:text-lg font-black text-center italic leading-relaxed">
                “Peace begins when you allow yourself to slow down.”
              </p>
            </div>
          </div>

          <div className="absolute bottom-12 left-12 right-12 text-white/40 text-[10px] font-black tracking-[0.3em] uppercase text-center">
            Oruma • Together, Gently.
          </div>
        </div>
      </div>
    </section>
  );
}
