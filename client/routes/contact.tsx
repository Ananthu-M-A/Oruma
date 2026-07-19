import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import ContactSection from '../components/ContactSection';
import { LucideIcon } from '@site-builder/icons';

export const meta = {
  title: "Contact Us | oruma.me",
  description: "Get in touch with Oruma. We are here to listen and support your mental health journey. Contact us via WhatsApp, Email or Phone."
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C] overflow-x-hidden">
      <Navbar />
      <FloatingActions />

      {/* Hero Section for Contact */}
      <section className="pt-32 md:pt-48 pb-12 bg-[#F5F8F7]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block bg-[#0A7F7A] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">Reach Out</div>
          <h1 className="text-5xl md:text-7xl font-heading font-black text-[#064F4B] mb-8 leading-tight">
            We're here to <span className="text-[#0A7F7A]">Listen</span>
          </h1>
          <p className="text-xl text-[#5F7F7A] font-medium leading-relaxed max-w-2xl mx-auto">
            Your journey to healing doesn't have to be lonely. Reach out today and take the first step toward a gentler tomorrow.
          </p>
        </div>
      </section>

      {/* Reuse the polished ContactSection */}
      <ContactSection />

      {/* Map or Location Highlight */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#B7C8A3]/20 rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <h2 className="text-3xl font-heading font-black text-[#064F4B] mb-6">Our Sanctuary</h2>
              <p className="text-lg text-[#5F7F7A] mb-8 leading-relaxed">
                While we primarily provide support online and anonymously, our heart is rooted in Kerala. We're building a network that spans across 40+ countries.
              </p>
              <div className="flex items-center gap-4 text-[#064F4B]">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                   <LucideIcon name="globe" size={24} />
                </div>
                <p className="font-black text-xl">Operating Globally from Trivandrum</p>
              </div>
            </div>
            
            <a
              href="https://www.google.com/maps/search/?api=1&query=Thiruvananthapuram%2C+Kerala%2C+India"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-1/2 aspect-video bg-[#0A7F7A]/10 rounded-[2rem] flex items-center justify-center border-2 border-[#0A7F7A]/20 transition-colors hover:bg-[#0A7F7A]/15"
            >
               <div className="text-center">
                  <LucideIcon name="map" size={48} className="text-[#0A7F7A] mx-auto mb-4 opacity-50" />
                  <p className="text-[#064F4B] font-bold">View Trivandrum on Google Maps</p>
               </div>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
