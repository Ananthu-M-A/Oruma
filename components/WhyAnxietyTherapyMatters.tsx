import React from 'react';

export default function WhyAnxietyTherapyMatters() {
  const points = [
    { title: 'Expert Guidance', text: 'Work with therapists who specialize in CBT and other anxiety-focused modalities.' },
    { title: 'Safe Space to Open', text: 'Anonymously vent your worries in a professional, non-judgmental environment.' },
    { title: 'Tools for Coping', text: 'Gain practical strategies to manage panic attacks and daily stress.' },
    { title: 'Building Resilience', text: 'Learn to handle future challenges with a stronger mental foundation.' },
    { title: 'Improved Relationships', text: 'Anxiety often affects social bonds; therapy helps repair those connections.' },
    { title: 'Long-Term Well-Being', text: 'Invest in a lifestyle that prioritizes your peace of mind over persistent worry.' }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-[#064F4B] text-center mb-16">
          Why therapy for anxiety matters
        </h2>
        
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12 max-w-5xl mx-auto">
          {points.map((point, i) => (
            <div key={i} className="flex flex-col gap-2">
              <h3 className="text-lg font-bold text-[#064F4B] flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-[#B7C8A3] rounded-full" />
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
