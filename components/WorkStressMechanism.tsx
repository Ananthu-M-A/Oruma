import React from 'react';
import { LucideIcon } from '@site-builder/icons';

export default function WorkStressMechanism() {
  const steps = [
    { icon: 'target', title: 'Goal Setting', text: 'Work with professionals to set realistic professional and personal goals.' },
    { icon: 'shield-check', title: 'Stress Management', text: 'Learn proven techniques to handle high-pressure environments.' },
    { icon: 'user-check', title: 'Specialized Support', text: 'Therapists who understand the unique dynamics of modern workspaces.' },
    { icon: 'heart', title: 'Emotional Resilience', text: 'Develop the strength to bounce back from workplace challenges.' }
  ];

  return (
    <section className="py-24 bg-[#F2C94C]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-[#064F4B] mb-16">
          How Oruma Supports You in Managing <br /> Work Stress and Burnout
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
