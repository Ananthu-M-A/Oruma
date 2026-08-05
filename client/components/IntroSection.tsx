import React from 'react';
import { LucideIcon } from '@site-builder/icons';

export default function IntroSection() {
  return (
    <section className="py-24 bg-[#F5F8F7] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img 
                src="/assets/generated-6faa31cf.webp" 
                alt="Gentle healing abstract illustration" 
                loading="lazy"
                decoding="async"
                className="w-full h-auto"
              />
            </div>
            {/* Soft decorative background circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#B7C8A3]/20 rounded-full blur-3xl -z-10" />
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-[#064F4B] font-heading text-4xl lg:text-5xl font-bold mb-8">
              Why Oruma?
            </h2>
            <p className="text-[#2E3E3C] text-xl leading-relaxed mb-8">
              At Oruma, we believe healing happens gently — through understanding, empathy, and connection. 
              Our licensed psychologists provide a safe space where you can express, heal, and grow.
            </p>
            
            <div className="space-y-6">
              {[
                { title: 'Certified Psychologists', icon: 'shield-check' },
                { title: 'Confidential & Safe', icon: 'lock' },
                { title: 'Online & In-Person Sessions', icon: 'video' },
                { title: 'Client-Centric Care', icon: 'heart' }
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0A7F7A] shadow-sm">
                    <LucideIcon name={item.icon} size={20} />
                  </div>
                  <span className="font-bold text-[#064F4B] text-lg">{item.title}</span>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <a 
                href="/about" 
                className="text-[#0A7F7A] font-bold border-b-2 border-[#0A7F7A] pb-1 hover:text-[#064F4B] hover:border-[#064F4B] transition-all"
              >
                Learn more about our philosophy
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
