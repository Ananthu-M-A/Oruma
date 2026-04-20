import React from 'react';

export default function DepressionTherapyImportance() {
  const points = [
    { title: 'Support Guidance', text: 'Professional help provides a structured way to navigate complex emotions.' },
    { title: 'Safe space to Share', text: 'Express your deepest thoughts without fear of judgment or burdening others.' },
    { title: 'Tools for Coping', text: 'Learn proven techniques like CBT to challenge negative thought patterns.' },
    { title: 'Building Resilience', text: 'Develop the emotional strength to handle life\'s ups and downs more effectively.' },
    { title: 'Better Relationships', text: 'Healing within leads to more meaningful connections with those around you.' },
    { title: 'Long-term Well-being', text: 'Invest in your future self by addressing the root causes of your distress today.' }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-[#064F4B] text-center mb-16">
          Why therapy for depression <span className="italic">matters</span>
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
      </div>
    </section>
  );
}
