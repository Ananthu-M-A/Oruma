import React from 'react';
import { LucideIcon } from '@site-builder/icons';

export default function ParentingMechanism() {
  const steps = [
    { icon: 'baby', title: 'Child Focused', text: 'Support tailored specifically to developmental stages and behavioral patterns.' },
    { icon: 'users', title: 'Parenting Coaches', text: 'Work with professionals who understand the unique journey of raising a child.' },
    { icon: 'shield-check', title: 'Secure Environment', text: 'A private space for parents to discuss challenges and find solutions.' },
    { icon: 'heart', title: 'Compassionate Care', text: 'Support that respects both the parent\'s experience and the child\'s growth.' }
  ];

  return (
    <section className="py-24 bg-[#F2C94C]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-[#064F4B] mb-16">
          How Oruma Supports You in Parenting <br /> and Managing Child Behavioral Issues
        </h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-[#064F4B]/5 text-left h-full group hover:shadow-2xl transition-shadow">
              <div className="w-12 h-12 bg-[#F5F8F7] rounded-xl flex items-center justify-center text-[#00D494] mb-6 border border-[#E2E8E6] group-hover:scale-110 transition-transform">
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
          <button className="bg-[#1A1A1A] text-white px-10 py-3.5 rounded-full font-bold text-sm hover:bg-black shadow-xl shadow-black/10">
            Get Therapy
          </button>
        </div>
      </div>
    </section>
  );
}
