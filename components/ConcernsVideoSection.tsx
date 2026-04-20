import React from 'react';

export default function ConcernsVideoSection() {
  const videoId = "QrGuF5zsaUU";
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <section className="py-24 bg-[#F7F9F5] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#A3B899]/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#064F4B]/10 rounded-full blur-3xl opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-block bg-[#064F4B] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
              Featured Insight
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-heading font-black text-[#064F4B] leading-tight uppercase tracking-tighter">
              Healing <span className="text-[#A3B899]">Begins</span> <br /> 
              With Understanding
            </h2>
            
            <p className="text-xl text-[#5F7F7A] font-medium leading-relaxed max-w-xl">
              Take a moment to understand why therapy is a vital step toward reclaiming your peace. At ORUMA, we provide a safe space to heal, grow, and rediscover yourself.
            </p>
            
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                    <img 
                      src={`https://images.unsplash.com/photo-${1500000000000 + i*10000}?auto=format&fit=crop&q=80&w=100`} 
                      alt="User avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[#064F4B] font-black uppercase text-sm tracking-widest">
                Trusted by 500+ individuals
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-[#A3B899] rounded-[4rem] opacity-20 blur-2xl transform rotate-2"></div>
            <div className="relative aspect-video w-full overflow-hidden rounded-[3rem] shadow-2xl shadow-[#064F4B]/20 border-[12px] border-white group">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={embedUrl}
                title="ORUMA Wellness - Understanding Therapy"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 hidden md:block max-w-[200px] animate-bounce-slow">
              <p className="text-[#064F4B] font-black text-xs uppercase tracking-widest leading-relaxed">
                Watch how we help you heal
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
      `}} />
    </section>
  );
}
