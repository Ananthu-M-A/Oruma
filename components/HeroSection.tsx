import React from 'react';

export default function HeroSection() {
  return (
    <section className="pt-28 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Hero Card Container */}
        <div className="bg-[#0A7F7A] rounded-[3rem] overflow-hidden flex flex-col lg:flex-row min-h-[500px] lg:h-[600px] shadow-2xl relative">
          
          {/* Left Side: Text */}
          <div className="lg:w-3/5 p-10 lg:p-20 flex flex-col justify-center relative overflow-hidden">
            {/* Subtle Gradient Wave Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute -bottom-1/2 -left-1/4 w-[150%] h-full bg-gradient-to-tr from-white/40 to-transparent rounded-full blur-3xl animate-pulse" />
            </div>

            <div className="relative z-10">
              <h1 className="text-5xl lg:text-8xl font-heading font-black text-white leading-[1.1] tracking-tight text-center lg:text-left">
                Healing starts <br /> 
                here with <span className="text-[#B7C8A3]">Oruma</span>
              </h1>
              
              <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start">
                <div className="w-12 h-1 bg-[#B7C8A3] rounded-full hidden lg:block" />
                <p className="text-xl lg:text-2xl text-[#B7C8A3] font-medium italic">
                  “You are safe now. Healing can begin.”
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="lg:w-2/5 relative h-[400px] lg:h-full overflow-hidden bg-[#064F4B]">
            <img 
              src="/assets/professional-portrait.webp" 
              alt="Oruma Professional Support" 
              className="w-full h-full object-cover lg:object-top transition-all duration-1000"
            />
            {/* Soft overlay to blend with the brand theme */}
            <div className="absolute inset-0 bg-[#064F4B]/10 mix-blend-multiply" />
          </div>
        </div>
      </div>
    </section>
  );
}
