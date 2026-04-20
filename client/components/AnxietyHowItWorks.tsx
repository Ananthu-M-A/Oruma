import React from 'react';

export default function AnxietyHowItWorks() {
  const steps = [
    { title: 'Choose Your Therapist', text: 'Select a specialist who understands your unique patterns.' },
    { title: 'Choose Your Slot', text: 'Pick a time that fits your schedule for a secure online session.' },
    { title: 'Start Therapy', text: 'Begin your journey towards a calmer, more controlled life.' }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-[#064F4B] mb-16">
          How Oruma Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="bg-[#0A7F7A] p-10 rounded-[2.5rem] text-left text-white shadow-xl shadow-[#0A7F7A]/20 transition-transform hover:-translate-y-2 duration-300">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#0A7F7A] font-bold text-xs mb-8">
                0{i + 1}
              </div>
              <h3 className="text-xl font-bold mb-4 leading-tight">
                {step.title}
              </h3>
              <p className="text-white/80 text-sm font-medium leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
