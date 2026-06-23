import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import TherapistSearchHero from '../components/TherapistSearchHero';
import TherapistCardAdvanced from '../components/TherapistCardAdvanced';
import { LucideIcon } from '@site-builder/icons';

export const meta = {
  title: "Find Your Therapist | ORUMA Wellness",
  description: "Connect with senior psychologists and counseling experts. Browse our available therapists and book your session online."
};

export default function TherapistListingPage() {
  const therapists = [
    {
      name: "Hamna",
      title: "Clinical Psychologist",
      hours: 800,
      group: 2,
      tags: ["Clinical Psychologist", "Expert Support", "Mental Wellness"],
      price: "Ind: ₹2,000 / Couple: ₹3,000",
      slot: "Today, 12:00 PM",
      img: "/assets/hamna-profile.webp"
    },
    {
      name: "Kallu Sajeev",
      title: "Clinical Psychologist",
      hours: 1500,
      group: 2,
      tags: ["Clinical Psychologist", "Individual & Couple", "Expert"],
      price: "Ind: ₹2,000 / Couple: ₹3,000",
      slot: "Today, 10:00 AM",
      img: "/assets/kallu-sajeev-psychologist-new.webp"
    },
    // Group 3
    {
      name: "Shabna",
      title: "Consultant Psychologist",
      hours: 0,
      group: 3,
      tags: ["Consultant", "Individual & Couple", "Support"],
      price: "Ind: ₹1,500 / Couple: ₹1,500",
      slot: "Today, 10:00 AM",
      img: "/assets/shabna-profile-new.webp"
    },
    // Group 5
    {
      name: "Shihana",
      title: "Consultant Psychologist",
      hours: 850,
      group: 5,
      tags: ["Consultant", "Individual & Couple", "Counseling"],
      price: "Ind: ₹1,500 / Couple: ₹1,500",
      slot: "Today, 11:00 AM",
      img: "/assets/shihana-profile-updated.webp"
    },
    {
      name: "Shaeza Mariyem",
      title: "Consultant Psychologist",
      hours: 820,
      group: 5,
      tags: ["Consultant", "Individual & Couple", "Expert Counseling"],
      price: "Ind: ₹2,000 / Couple: ₹2,250",
      slot: "Today, 10:30 AM",
      img: "/assets/shaeza-mariyam-profile.webp"
    },
    {
      name: "Aleeda",
      title: "Consultant Psychologist",
      hours: 780,
      group: 5,
      tags: ["Consultant", "Individual & Couple", "Professional Guidance"],
      price: "Ind: ₹2,000 / Couple: ₹2,250",
      slot: "Today, 1:00 PM",
      img: "/assets/therapist-aleeda.webp"
    },
    // Group 4
    {
      name: "Rifana",
      title: "Consultant Psychologist",
      hours: 800,
      group: 4,
      tags: ["Consultant", "Individual & Couple", "Empathy"],
      price: "Ind: ₹1,500 / Couple: ₹1,500",
      slot: "Today, 12:00 PM",
      img: "/assets/rifana-new-profile-2024.webp"
    },
    {
      name: "Pavithra",
      title: "Consultant Psychologist",
      hours: 820,
      group: 4,
      tags: ["Consultant", "Individual & Couple", "Skilled Counseling"],
      price: "Ind: ₹1,500 / Couple: ₹1,500",
      slot: "Today, 2:30 PM",
      img: "/assets/therapist-pavithra.webp"
    },
    {
      name: "Jasna",
      title: "Consultant Psychologist",
      hours: 790,
      group: 4,
      tags: ["Consultant", "Individual & Couple", "Dedicated Support"],
      price: "Ind: ₹1,500 / Couple: ₹1,500",
      slot: "Today, 4:30 PM",
      img: "/assets/therapist-jasna.webp"
    },
    {
      name: "Dr. Ashi Chandran",
      title: "Consultant Psychologist",
      hours: 1000,
      group: 3,
      tags: ["Consultant", "Individual & Couple", "Counseling"],
      price: "Ind: ₹1,000 / Couple: ₹1,500",
      slot: "Today, 10:00 AM",
      img: "/assets/dr-ashi-chandran.webp"
    },
    // Group 1
    {
      name: "Sreemol P S",
      title: "Consultant Psychologist",
      hours: 1000,
      group: 1,
      tags: ["Individual Only", "Consultant Psychologist", "Mental Health", "Wellness"],
      price: "Individual: ₹1,000",
      slot: "Today, 9:30 PM",
      img: "/assets/sreemol-profile.webp"
    },
    {
      name: "Nisha",
      title: "Consultant Psychologist",
      hours: 1000,
      group: 1,
      tags: ["Individual Only", "Consultant Psychologist", "Counseling", "Wellness"],
      price: "Individual: ₹1,000",
      slot: "Today, 11:30 AM",
      img: "/assets/nisha-profile-new.webp"
    },
  ];

  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C] overflow-x-hidden">
      <Navbar />
      <FloatingActions />

      <TherapistSearchHero />

      {/* Main Listing Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <LucideIcon name="search" size={20} className="text-[#5F7F7A] group-focus-within:text-[#0A7F7A] transition-colors" />
              </div>
              <input 
                type="text" 
                className="w-full bg-[#F5F8F7] border border-[#E2E8E6] rounded-full py-5 pl-14 pr-8 outline-none focus:ring-4 focus:ring-[#0A7F7A]/10 focus:bg-white focus:border-[#0A7F7A] transition-all text-[#2E3E3C] font-medium shadow-sm" 
                placeholder="Search by Therapist name..." 
              />
            </div>
          </div>

          <div className="mb-12">
             <div className="inline-flex items-center gap-2 bg-[#064F4B]/5 text-[#064F4B] px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest mb-4">
                Recommended Professionals
             </div>
             <h2 className="text-3xl font-heading font-black text-[#064F4B] uppercase tracking-tighter">Available Experts</h2>
          </div>

          {/* Grid - Adjusted for the larger cards */}
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {therapists.map((t, i) => (
              <TherapistCardAdvanced key={i} {...t} />
            ))}
          </div>

          {/* Load More / Footer CTA */}
          <div className="text-center mt-20">
            <p className="text-[#5F7F7A] font-bold mb-6 italic">Can't find what you're looking for?</p>
            <a 
              href="https://wa.me/919846462744?text=Hi,%20I%20need%20help%20finding%20the%20right%20therapist."
              className="inline-flex items-center gap-2 bg-[#064F4B] text-[#FFFFFF] px-10 py-5 rounded-full font-black hover:scale-105 transition-all shadow-xl shadow-[#064F4B]/20 uppercase tracking-widest text-xs"
            >
              Let us help you choose <LucideIcon name="arrow-right" size={18} />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
