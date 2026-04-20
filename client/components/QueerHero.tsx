import React from 'react';

export default function QueerHero() {
  return (
    <section className="pt-20">
      <div className="flex flex-col lg:flex-row min-h-[500px]">
        {/* Left Side - Teal Content */}
        <div className="lg:w-1/2 bg-[#0A7F7A] p-12 lg:p-24 flex flex-col justify-center items-start text-white">
          <h1 className="text-4xl lg:text-6xl font-heading font-extrabold mb-8 leading-tight max-w-md">
            Understanding the need for queer affirmative Support
          </h1>
          <p className="text-lg mb-10 text-[#B7C8A3] font-medium max-w-sm">
            Navigating a world that wasn't built for you can be exhausting. Our specialists provide identity-affirming care where you can be your authentic self.
          </p>
          <button className="bg-white text-[#0A7F7A] px-10 py-4 rounded-full font-bold text-lg hover:bg-[#F5F8F7] transition-all shadow-xl shadow-black/10">
            Get Therapy
          </button>
        </div>
        
        {/* Right Side - Image */}
        <div className="lg:w-1/2 relative min-h-[400px]">
          <img 
            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1200" 
            alt="Diverse individuals smiling" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/5 mix-blend-multiply" />
        </div>
      </div>
    </section>
  );
}
