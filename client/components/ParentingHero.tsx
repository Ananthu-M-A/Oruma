import React from 'react';

export default function ParentingHero() {
  return (
    <section className="pt-20">
      <div className="flex flex-col lg:flex-row min-h-[500px]">
        {/* Left Side - Bright Green/Teal */}
        <div className="lg:w-1/2 bg-[#00D494] p-12 lg:p-24 flex flex-col justify-center items-start text-white">
          <h1 className="text-4xl lg:text-6xl font-heading font-extrabold mb-8 leading-tight max-w-md">
            Understanding parenting and child behavioral issues
          </h1>
          <p className="text-lg mb-10 text-white/90 font-medium max-w-sm">
            Raising a child comes with unique challenges. We provide specialized support to help you navigate behavioral concerns and strengthen your family bond.
          </p>
          <button className="bg-white text-[#00D494] px-10 py-4 rounded-full font-bold text-lg hover:bg-[#F5F8F7] transition-all shadow-xl shadow-black/10">
            Get Therapy
          </button>
        </div>
        
        {/* Right Side - Image */}
        <div className="lg:w-1/2 relative min-h-[400px]">
          <img 
            src="https://images.unsplash.com/photo-1536640712247-c45474d43988?auto=format&fit=crop&q=80&w=1200" 
            alt="Mother and child in a moment of connection" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/5 mix-blend-multiply" />
        </div>
      </div>
    </section>
  );
}
