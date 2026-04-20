import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { LucideIcon } from '@site-builder/icons';

export const meta = {
  title: "Online Counselling | ORUMA",
  description: "Secure and professional online therapy from the comfort of your home. Accessible mental health support anywhere."
};

export default function OnlineCounsellingPage() {
  return (
    <main className="min-h-screen bg-[#F5F8F7]">
      <Navbar />
      
      <section className="pt-40 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] overflow-hidden shadow-xl border border-[#E2E8E6] grid lg:grid-cols-2">
            <div className="p-12 lg:p-20">
              <span className="text-[#0A7F7A] font-bold tracking-widest uppercase text-sm mb-4 block">Modern Therapy</span>
              <h1 className="text-5xl font-heading font-bold text-[#064F4B] mb-8">
                Professional support <br /> from your home.
              </h1>
              <p className="text-xl text-[#5F7F7A] mb-12">
                Online therapy offers the same quality of care as in-person sessions, with added flexibility for your busy lifestyle.
              </p>

              <div className="grid sm:grid-cols-2 gap-8 mb-12">
                {[
                  { title: 'Flexible Scheduling', icon: 'calendar' },
                  { title: 'Secure Video Sessions', icon: 'video' },
                  { title: 'Confidential Space', icon: 'lock' },
                  { title: 'Quality Care', icon: 'check-circle' }
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#B7C8A3]/20 rounded-xl flex items-center justify-center text-[#0A7F7A]">
                      <LucideIcon name={item.icon} size={20} />
                    </div>
                    <span className="font-bold text-[#064F4B]">{item.title}</span>
                  </div>
                ))}
              </div>

              <a
                href="/consultation"
                className="inline-flex bg-[#0A7F7A] text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-[#096E6A] transition-all shadow-xl shadow-[#0A7F7A]/20"
              >
                Start Online Counselling
              </a>
            </div>
            
            <div className="relative min-h-[400px]">
              <img 
                src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80&w=1000" 
                className="absolute inset-0 w-full h-full object-cover" 
                alt="Woman in a therapy session online"
              />
              <div className="absolute inset-0 bg-[#064F4B]/10" />
            </div>
          </div>

          <div className="mt-24 grid md:grid-cols-3 gap-12">
            {[
              { title: 'Busy Professionals', desc: 'Therapy that fits into your lunch break or evening hours.', icon: 'briefcase' },
              { title: 'Students', desc: 'Emotional support that understands academic pressure.', icon: 'graduation-cap' },
              { title: 'Remote Locations', desc: 'Expert care even if you live far from our physical clinic.', icon: 'globe' }
            ].map((item) => (
              <div key={item.title} className="text-center p-8">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#0A7F7A] mx-auto mb-6 shadow-sm border border-[#E2E8E6]">
                  <LucideIcon name={item.icon} size={32} />
                </div>
                <h3 className="text-2xl font-bold text-[#064F4B] mb-4">{item.title}</h3>
                <p className="text-[#5F7F7A] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
