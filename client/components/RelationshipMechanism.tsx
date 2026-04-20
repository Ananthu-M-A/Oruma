import React from 'react';
import { LucideIcon } from '@site-builder/icons';

export default function RelationshipMechanism() {
  const whatsappLink = "https://wa.me/917558832001?text=Hi,%20I'd%20like%20to%20get%20therapy%20for%20relationship%20issues.";
  const steps = [
    { icon: 'users', title: 'Couples Focused', text: 'Therapy tailored to the unique dynamics of your partnership.' },
    { icon: 'user-check', title: 'Relationship Experts', text: 'Work with professionals trained in Gottman and EFT models.' },
    { icon: 'shield-check', title: 'Neutral Ground', text: 'A safe, unbiased space where both voices are heard equally.' },
    { icon: 'heart-handshake', title: 'Communication Tools', text: 'Learn proven techniques to resolve conflict peacefully.' }
  ];

  return (
    <section className="py-24 bg-[#B7C8A3]/10">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-[#064F4B] mb-16">
          How Oruma helps You resolve <br /> Relationship Issues
        </h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-[#064F4B]/5 text-left h-full group hover:shadow-2xl transition-shadow">
              <div className="w-12 h-12 bg-[#F5F8F7] rounded-xl flex items-center justify-center text-[#0A7F7A] mb-6 border border-[#E2E8E6] group-hover:scale-110 transition-transform">
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
          <a 
            href={whatsappLink}
            className="inline-block bg-[#1A1A1A] text-white px-10 py-3.5 rounded-full font-bold text-sm hover:bg-black shadow-xl shadow-black/10 transition-transform hover:scale-105 active:scale-95"
          >
            Get Therapy
          </a>
        </div>
      </div>
    </section>
  );
}
