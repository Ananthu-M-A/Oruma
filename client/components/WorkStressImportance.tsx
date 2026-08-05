import React from 'react';

export default function WorkStressImportance() {
  const points = [
    { title: 'Improved Mental Health', text: 'Addressing work-related stress helps reduce symptoms of anxiety and depression.' },
    { title: 'Enhanced Productivity', text: 'Managing stress leads to better focus and efficiency in your professional life.' },
    { title: 'Better Work-life Balance', text: 'Therapy helps you set boundaries and prioritize your personal well-being.' },
    { title: 'Physical Health Benefits', text: 'Reducing stress can improve sleep quality and lower the risk of stress-related illnesses.' },
    { title: 'Stronger Relationships', text: 'Healthy stress management prevents workplace pressure from affecting your personal connections.' }
  ];

  return (
    <section className="py-24 bg-[#FFFBF0]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-[#064F4B] text-center mb-16">
          Why Addressing Work Stress and <br /> Burnout <span className="italic">Matters</span>
        </h2>
        
        {/* Central Visualization Area */}
        <div className="max-w-2xl mx-auto mb-16 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-[#1A1A1A] aspect-[21/9] flex items-center justify-center relative overflow-hidden">
             <img 
               src="https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=800" 
               className="w-full h-full object-cover opacity-30 grayscale"
               alt="Work stress visualization"
               loading="lazy"
               decoding="async"
             />
             <div className="absolute inset-0 flex items-center justify-center p-8">
                <p className="text-white text-sm lg:text-base font-medium max-w-sm italic text-center">
                  "Burnout isn't just about being tired; it's about the soul needing rest."
                </p>
             </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12 max-w-5xl mx-auto">
          {points.map((point, i) => (
            <div key={i} className="flex flex-col gap-2">
              <h3 className="text-lg font-extrabold text-[#064F4B] flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-[#00D494] rounded-full" />
                {point.title}
              </h3>
              <p className="text-[#5F7F7A] text-sm leading-relaxed pl-5 font-medium">
                {point.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
