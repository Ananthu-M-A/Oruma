import React from 'react';

export default function TraumaHowItWorks() {
  const steps = [
    { title: 'Choose Your Specialist', text: 'Select a therapist trained specifically in trauma-informed modalities.' },
    { title: 'Choose Your Slot', text: 'Book a secure, private session that fits into your healing journey.' },
    { title: 'Start Therapy', text: 'Begin processing your experiences in a space where you are in control.' }
  ];

  return (
    <section className="py-24 bg-[#0A7F7A] text-center">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-16">
          How Oruma Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-[#E2E8E6] hover:bg-[#B7C8A3]/10 transition-all text-left">
              <div className="w-10 h-10 bg-[#0A7F7A] rounded-full flex items-center justify-center text-white font-bold text-xs mb-8">
                0{i + 1}
              </div>
              <h3 className="text-xl font-bold text-[#064F4B] mb-4 leading-tight">
                {step.title}
              </h3>
              <p className="text-[#5F7F7A] text-sm font-medium leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
