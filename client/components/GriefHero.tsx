import React from 'react';

export default function GriefHero() {
  return (
    <section className="pt-20">
      <div className="flex flex-col lg:flex-row min-h-[500px]">
        {/* Left Side - Teal Content */}
        <div className="lg:w-1/2 bg-[#0A7F7A] p-12 lg:p-24 flex flex-col justify-center items-start text-white">
          <h1 className="text-4xl lg:text-6xl font-heading font-extrabold mb-8 leading-tight max-w-md">
            Find the right support for navigating grief
          </h1>
          <p className="text-lg mb-10 text-[#B7C8A3] font-medium max-w-sm">
            Losing someone or something you love is incredibly painful. Our compassionate specialists provide a safe space to process your loss and find a way forward.
          </p>
          <button className="bg-white text-[#0A7F7A] px-10 py-4 rounded-full font-bold text-lg hover:bg-[#F5F8F7] transition-all shadow-xl shadow-black/10">
            Get Therapy
          </button>
        </div>
        
        {/* Right Side - Image */}
        <div className="lg:w-1/2 relative min-h-[400px]">
          <img 
            src="https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&q=80&w=1200" 
            alt="Person in a quiet moment" 
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/5 mix-blend-multiply" />
        </div>
      </div>
    </section>
  );
}
