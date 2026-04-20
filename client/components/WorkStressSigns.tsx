import React from 'react';

export default function WorkStressSigns() {
  const points = [
    { title: 'Expert Guidance', text: 'Professional support to help you identify stressors and develop effective coping mechanisms.' },
    { title: 'Safe Space to Share', text: 'Discuss workplace frustrations and feelings of burnout in a non-judgmental environment.' },
    { title: 'Tools for Coping', text: 'Practical strategies for managing time, setting boundaries, and preventing future burnout.' },
    { title: 'Building Resilience', text: 'Equip yourself with the emotional tools to thrive in challenging professional settings.' },
    { title: 'Long-term Well-being', text: 'Invest in a career that is sustainable and personally fulfilling.' }
  ];

  return (
    <section className="py-24 bg-[#FFFBF0]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-[#064F4B] text-center mb-16">
          Recognizing signs of work stress and <br /> <span className="italic text-[#00D494]">burnout</span>
        </h2>
        
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

        <div className="text-center mt-16">
           <button className="bg-[#1A1A1A] text-white px-10 py-4 rounded-full font-bold text-sm hover:bg-black shadow-xl shadow-black/10">
             Get Therapy
           </button>
        </div>
      </div>
    </section>
  );
}
