import React from 'react';

export default function WhyTraumaTherapyMatters() {
  const points = [
    { title: 'Specialized Modalities', text: 'Access treatments like EMDR and TF-CBT designed specifically for trauma resolution.' },
    { title: 'Regain Control', text: 'Learn to manage the physical and emotional triggers that disrupt your daily life.' },
    { title: 'A Secure Environment', text: 'Work within a professional setting that prioritizes your physical and emotional safety.' },
    { title: 'Holistic Healing', text: 'Address the impact of trauma on your mind, body, and relationships.' },
    { title: 'Emotional Resilience', text: 'Build the strength to move beyond the past and create a fulfilling future.' },
    { title: 'Long-term Support', text: 'Healing is a process; our therapists are committed to walking with you for the duration.' }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-[#064F4B] text-center mb-16">
          Why therapy for Trauma and PTSD <span className="italic">matters</span>
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
