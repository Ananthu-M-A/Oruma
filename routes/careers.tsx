import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import { LucideIcon } from '@site-builder/icons';

export const meta = {
  title: "Therapists Careers | oruma.me",
  description: "Join the Oruma team as a licensed therapist. Provide anonymous, empathetic, and gentle mental health support to those in need."
};

export default function CareersPage() {
  const phoneNumber = "918157039987";
  const whatsappLink = `https://wa.me/${phoneNumber}?text=Hi,%20I'm%20a%20licensed%20therapist%20interested%20in%20joining%20Oruma.`;
  const emailLink = "mailto:join@oruma.me";

  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C] overflow-x-hidden">
      <Navbar />
      <FloatingActions />

      {/* Hero Section */}
      <section className="pt-32 md:pt-48 pb-20 bg-[#F5F8F7] relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#0A7F7A]/5 -skew-x-12 transform origin-right" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block bg-[#0A7F7A] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">Join Our Team</div>
            <h1 className="text-5xl md:text-7xl font-heading font-black text-[#064F4B] mb-8 leading-tight">
              Therapists <span className="text-[#0A7F7A]">Careers</span>
            </h1>
            <p className="text-xl text-[#5F7F7A] font-medium leading-relaxed mb-10 max-w-2xl">
              Become a 'Change Maker' at Oruma. We are building a safe, anonymous sanctuary for mental healing, and we need compassionate professionals like you.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#apply" className="bg-[#064F4B] text-white px-10 py-5 rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl shadow-[#064F4B]/20 active:scale-95">
                Apply Now
              </a>
              <a href={whatsappLink} className="bg-white text-[#0A7F7A] border-2 border-[#0A7F7A] px-10 py-[1.125rem] rounded-full font-black text-lg hover:bg-[#F5F8F7] transition-all active:scale-95">
                Quick Enquiry
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-heading font-black text-[#064F4B] mb-6">Why Join Oruma?</h2>
            <div className="w-24 h-2 bg-[#B7C8A3] mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-10 bg-[#F5F8F7] rounded-[3rem] border border-gray-100 hover:border-[#0A7F7A] transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-[#0A7F7A] group-hover:text-white transition-colors">
                <LucideIcon name="shield-check" size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#064F4B] mb-4">Anonymous & Safe</h3>
              <p className="text-[#5F7F7A] font-medium leading-relaxed">
                Provide support through our secure, private platform that protects both therapist and user anonymity.
              </p>
            </div>

            <div className="p-10 bg-[#F5F8F7] rounded-[3rem] border border-gray-100 hover:border-[#0A7F7A] transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-[#0A7F7A] group-hover:text-white transition-colors">
                <LucideIcon name="clock" size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#064F4B] mb-4">Flexible Hours</h3>
              <p className="text-[#5F7F7A] font-medium leading-relaxed">
                Work on your own terms. Choose schedules that fit your lifestyle while making a real impact in people's lives.
              </p>
            </div>

            <div className="p-10 bg-[#F5F8F7] rounded-[3rem] border border-gray-100 hover:border-[#0A7F7A] transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-[#0A7F7A] group-hover:text-white transition-colors">
                <LucideIcon name="users" size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#064F4B] mb-4">Supportive Community</h3>
              <p className="text-[#5F7F7A] font-medium leading-relaxed">
                Join a network of fellow 'Change Makers' for peer support, supervision, and professional development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section id="apply" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-[#064F4B] mb-6">Ready to Start?</h2>
            <p className="text-lg text-[#5F7F7A] font-medium">Simple steps to join our growing family.</p>
          </div>

          <div className="space-y-12">
            <div className="flex gap-8 group">
              <div className="w-16 h-16 rounded-full bg-[#0A7F7A] text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-[#0A7F7A]/20">1</div>
              <div className="pt-2">
                <h3 className="text-2xl font-black text-[#064F4B] mb-2">Send Your Resume</h3>
                <p className="text-[#5F7F7A] font-medium leading-relaxed">
                  Email your CV and a brief cover letter explaining why you want to be a part of Oruma to <a href={emailLink} className="text-[#0A7F7A] font-bold underline">join@oruma.me</a>.
                </p>
              </div>
            </div>

            <div className="flex gap-8 group">
              <div className="w-16 h-16 rounded-full bg-[#B7C8A3] text-[#064F4B] flex items-center justify-center font-black text-2xl shrink-0">2</div>
              <div className="pt-2">
                <h3 className="text-2xl font-black text-[#064F4B] mb-2">Introductory Call</h3>
                <p className="text-[#5F7F7A] font-medium leading-relaxed">
                  We'll schedule a brief session to get to know you, your specialties, and how your approach aligns with the Oruma philosophy.
                </p>
              </div>
            </div>

            <div className="flex gap-8 group">
              <div className="w-16 h-16 rounded-full bg-[#064F4B] text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-[#064F4B]/20">3</div>
              <div className="pt-2">
                <h3 className="text-2xl font-black text-[#064F4B] mb-2">Onboarding</h3>
                <p className="text-[#5F7F7A] font-medium leading-relaxed">
                  Once we're a match, we'll guide you through our platform orientation and set up your therapist profile.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20 p-12 bg-[#F5F8F7] rounded-[3rem] border border-gray-100 text-center">
            <h3 className="text-2xl font-black text-[#064F4B] mb-6">Have Questions?</h3>
            <div className="flex flex-col md:flex-row justify-center gap-8">
              <div className="flex items-center gap-3 justify-center">
                <LucideIcon name="mail" size={20} className="text-[#0A7F7A]" />
                <span className="font-bold text-[#5F7F7A]">join@oruma.me</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <LucideIcon name="phone" size={20} className="text-[#0A7F7A]" />
                <span className="font-bold text-[#5F7F7A]">+91 81570 39987</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
