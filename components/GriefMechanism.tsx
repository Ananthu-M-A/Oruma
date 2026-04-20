import React from 'react';
import { LucideIcon } from '@site-builder/icons';

export default function GriefMechanism() {
  const steps = [
    { icon: 'heart', title: 'Empathetic Listening', text: 'Talk to specialists who understand the weight of loss.' },
    { icon: 'user-check', title: 'Grief Specialists', text: 'Work with professionals trained in bereavement care.' },
    { icon: 'shield', title: 'Safe Boundaries', text: 'A secure space to express every emotion without judgment.' },
    { icon: 'clock', title: 'Personalized Pace', text: 'Move through your journey on your own timeline.' }
  ];

  return (
    <section className="py-24 bg-[#B7C8A3]/20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-[#064F4B] mb-16">
          How Oruma helps You fight Grief
        </h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-[#064F4B]/5 text-left h-full">
              <div className="w-12 h-12 bg-[#F5F8F7] rounded-xl flex items-center justify-center text-[#0A7F7A] mb-6 border border-[#E2E8E6]">
                <LucideIcon name={step.icon} size={24} />
              </div>
              <h3 className="text-base font-extrabold text-[#064F4B] mb-3 leading-tight">
                {step.title}
              </h3>
              <p className="text-xs text-[#5F7F7A] font-medium leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <button className="bg-[#0A7F7A] text-white px-10 py-3.5 rounded-full font-bold text-sm hover:bg-[#064F4B] shadow-xl shadow-[#0A7F7A]/20 transition-all">
            Get Therapy
          </button>
        </div>
      </div>
    </section>
  );
}
