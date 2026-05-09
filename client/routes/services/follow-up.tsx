import React from 'react';
import Navbar from '../../components/Navbar';
import FollowUpHero from '../../components/FollowUpHero';
import ServicesSnapshot from '../../components/ServicesSnapshot';
import TherapistGrid from '../../components/TherapistGrid';
import ActionBanner from '../../components/ActionBanner';
import FollowUpFAQ from '../../components/FollowUpFAQ';
import Footer from '../../components/Footer';
import FloatingActions from '../../components/FloatingActions';
import { LucideIcon } from '@site-builder/icons';

export const meta = {
  title: "Follow Up Sessions | oruma.me",
  description: "Secure your next session and maintain your progress. Consistent care is essential for lasting wellness."
};

export default function FollowUpPage() {
  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <FloatingActions />
      
      <FollowUpHero />

      {/* Category Section */}
      <ServicesSnapshot />

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <LucideIcon name="search" size={18} className="text-[#5F7F7A]" />
          </div>
          <input 
            type="text" 
            className="w-full bg-[#F5F8F7] border border-[#E2E8E6] rounded-full py-5 pl-14 pr-8 outline-none focus:ring-4 focus:ring-[#0A7F7A]/5 focus:bg-white focus:border-[#0A7F7A] transition-all text-sm font-medium" 
            placeholder="Search by Therapist name..." 
          />
        </div>
      </div>

      {/* First Therapist Batch */}
      <div className="max-w-7xl mx-auto px-6">
        <TherapistGrid />
      </div>

      {/* Yellow "Still Unsure" Banner */}
      <section className="py-12">
         <div className="max-w-7xl mx-auto px-6">
            <div className="bg-[#B7C8A3] rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
               <div className="relative z-10">
                  <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-[#064F4B] mb-6">
                     Still Unsure About What Help to Take?
                  </h2>
                  <a href="https://wa.me/918157039987" className="bg-[#1A1A1A] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-black transition-all inline-flex items-center gap-2">
                     Talk to Find Responders <LucideIcon name="chevron-right" size={16} />
                  </a>
               </div>
               
               <div className="relative w-48 h-32 flex items-center justify-center opacity-80">
                  <div className="w-12 h-12 bg-white rounded-full border-4 border-[#B7C8A3] -mr-4 shadow-lg flex items-center justify-center text-[#B7C8A3]">
                     <LucideIcon name="heart" size={24} fill="currentColor" />
                  </div>
                  <div className="w-16 h-24 bg-[#0A7F7A] rounded-2xl flex flex-col p-2 gap-2 shadow-xl">
                     <div className="w-full h-1 bg-white/20 rounded-full" />
                     <div className="w-full h-1 bg-white/20 rounded-full" />
                     <div className="w-2/3 h-1 bg-white/20 rounded-full" />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Second Therapist Batch */}
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <TherapistGrid />
      </div>

      <FollowUpFAQ />

      <Footer />
    </main>
  );
}
