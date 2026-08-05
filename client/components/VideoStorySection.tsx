import React from 'react';

export default function VideoStorySection() {
  const videos = [
    {
      id: "7jd_snHx3CM",
      title: "Understanding Therapy - Your Journey at ORUMA",
      description: "A deeper look into how our therapy sessions help you grow."
    },
    {
      id: "R9m-SGecnVc",
      title: "ORUMA Story - Healing Begins with Understanding",
      description: "Our philosophy and approach to mental wellness."
    }
  ];

  return (
    <section className="py-20 bg-[#F5F8F7]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-[#A3B899]/10 text-[#064F4B] rounded-full text-xs font-black uppercase tracking-[0.2em] border border-[#A3B899]/20 mb-6">
            <span className="w-2 h-2 bg-[#00D494] rounded-full animate-pulse"></span>
            Video Gallery
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-[#064F4B] mb-6 uppercase tracking-tighter">
            Healing Begins with <span className="text-[#A3B899]">Understanding</span>
          </h2>
          <p className="text-xl font-body text-[#2E3E3C] max-w-3xl mx-auto opacity-80 leading-relaxed">
            A safe space to heal, grow, and rediscover yourself. Watch our journey and insights to see how we provide gentle, anonymous support for your mental well-being.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {videos.map((video, index) => (
            <div key={index} className="space-y-6 group">
              <div className="relative aspect-video w-full overflow-hidden rounded-[2.5rem] shadow-2xl shadow-[#0A7F7A]/10 border-8 border-white transition-transform duration-500 group-hover:scale-[1.02]">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
                  title={video.title}
                  loading="lazy"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="px-4">
                <h3 className="text-xl font-heading font-black text-[#064F4B] mb-2 uppercase tracking-tight">
                  {video.title}
                </h3>
                <p className="text-sm text-[#5F7F7A] font-medium">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#B7C8A3]/20 text-[#064F4B] rounded-full text-sm font-bold border border-[#B7C8A3]/30">
            Together, Gently
          </div>
        </div>
      </div>
    </section>
  );
}
