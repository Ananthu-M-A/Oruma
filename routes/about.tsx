import React from 'react';
import Navbar from '../components/Navbar';
import TeamMember from '../components/TeamMember';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import { LucideIcon } from '@site-builder/icons';

export const meta = {
  title: "Our Change Makers | About ORUMA Wellness",
  description: "Meet the visionary team behind Oruma. Our youth-led team is committed to making mental health a priority for everyone."
};

const team = [
  {
    name: 'Ranjini R',
    role: 'Founder & Director',
    bio: 'Visionary leader driving the mission to make mental healthcare accessible to every household. Committed to breaking the stigma through innovation and empathy.',
    img: '/assets/ranjini-r-founder-director.webp',
    bgColor: 'bg-[#0A7F7A]'
  },
  {
    name: 'Reshmi',
    role: 'Clinical Lead',
    bio: 'Dedicated to creating safe spaces for healing. With over a decade of clinical experience, she ensures our psychological programs meet the highest ethical standards.',
    img: '/assets/reshmi-clinical-lead.webp',
    bgColor: 'bg-[#B7C8A3]',
    reverse: true
  }
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <FloatingActions />
      
      {/* Brand Hero */}
      <section className="pt-48 pb-24 bg-[#F5F8F7] text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl lg:text-6xl font-heading font-extrabold text-[#064F4B] mb-8 leading-tight">
            Our <span className="text-[#0A7F7A]">Change Makers</span>
          </h1>
          <div className="w-20 h-1.5 bg-[#B7C8A3] mx-auto rounded-full mb-8" />
          <p className="text-xl text-[#5F7F7A] leading-relaxed">
            The heart of Oruma is a dedicated group of professionals and visionaries working together to transform how mental health is perceived and treated.
          </p>
        </div>
      </section>

      {/* Change Makers Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          {team.map((member, idx) => (
            <TeamMember 
              key={member.name}
              {...member}
            />
          ))}
        </div>
      </section>

      {/* Wave CTA Section - Replaced image with YouTube video */}
      <section className="py-24 bg-[#F5F8F7] text-center border-t border-[#E2E8E6]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-[#064F4B] mb-6">
            Welcome to The 1% – <br /> Let's Make Waves!
          </h2>
          <p className="text-[#5F7F7A] text-lg mb-12">
            Join our mission to normalize mental health conversations across the globe.
          </p>
          
          <button className="bg-[#1A1A1A] text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-black transition-all shadow-xl shadow-black/10 mb-16">
            Join Us
          </button>

          {/* YouTube Video Section */}
          <div className="relative aspect-video w-full max-w-4xl mx-auto overflow-hidden rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-[#0A7F7A]/10 border-8 border-white">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/R9m-SGecnVc"
              title="ORUMA Wellness Story"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
