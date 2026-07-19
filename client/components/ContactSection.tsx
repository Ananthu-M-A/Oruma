import React from 'react';
import { LucideIcon } from '@site-builder/icons';

export default function ContactSection() {
  const phoneNumber = "918157039987";
  const whatsappLink = `https://wa.me/${phoneNumber}?text=Hi,%20I%20want%20to%20get%20in%20touch%20with%20Oruma.`;

  return (
    <section id="contact" className="py-24 bg-[#F5F8F7] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row">
          {/* Left Side: Contact Info */}
          <div className="lg:w-2/5 bg-[#064F4B] p-12 md:p-16 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-heading font-black mb-6">Get in Touch</h2>
              <p className="text-[#B7C8A3] text-lg mb-12">
                We're here to listen. Whether you have questions about our services or need immediate support, our team is ready to help.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <LucideIcon name="mail" size={24} className="text-[#B7C8A3]" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-[#B7C8A3] mb-1">Email Us</p>
                    <a href="mailto:join@oruma.me" className="text-xl font-bold hover:text-[#B7C8A3] transition-colors">join@oruma.me</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <LucideIcon name="phone" size={24} className="text-[#B7C8A3]" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-[#B7C8A3] mb-1">Call/WhatsApp</p>
                    <a
                      href={`tel:+${phoneNumber}`}
                      className="text-xl font-bold hover:text-[#B7C8A3] transition-colors"
                    >
                      +91 81570 39987
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <LucideIcon name="map-pin" size={24} className="text-[#B7C8A3]" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-[#B7C8A3] mb-1">Location</p>
                    <p className="text-xl font-bold">Trivandrum, Kerala, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 flex gap-4">
              <a href="https://www.instagram.com/orumacounselling" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#B7C8A3] hover:text-[#064F4B] transition-all">
                <LucideIcon name="instagram" size={20} />
              </a>
              <a href="https://www.facebook.com/share/14dGCeongmy/" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#B7C8A3] hover:text-[#064F4B] transition-all">
                <LucideIcon name="facebook" size={20} />
              </a>
              <a href="https://www.linkedin.com/company/oruma-counselling-wellness/" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#B7C8A3] hover:text-[#064F4B] transition-all">
                <LucideIcon name="linkedin" size={20} />
              </a>
            </div>
          </div>

          {/* Right Side: Quick Contact / Form area */}
          <div className="lg:w-3/5 p-12 md:p-16 flex flex-col justify-center">
            <h3 className="text-3xl font-heading font-black text-[#064F4B] mb-4">Message Us</h3>
            <p className="text-[#5F7F7A] text-lg mb-10 leading-relaxed">
              For the fastest response, reach out to us directly on WhatsApp. We provide immediate guidance and session bookings.
            </p>

            <div className="grid gap-6">
              <div className="bg-[#F5F8F7] p-8 rounded-[2rem] border border-[#E2E8E6] group hover:border-[#0A7F7A] transition-all duration-300">
                <h4 className="text-xl font-bold text-[#064F4B] mb-2">Anonymous Support</h4>
                <p className="text-sm text-[#5F7F7A] mb-6 italic font-medium">Your identity is always protected with us.</p>
                <a 
                  href={whatsappLink}
                  className="inline-flex items-center gap-3 bg-[#0A7F7A] text-white px-8 py-4 rounded-full font-black text-lg shadow-lg shadow-[#0A7F7A]/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <LucideIcon name="message-square" size={24} />
                  Start WhatsApp Chat
                </a>
              </div>

              <div className="p-8 rounded-[2rem] border border-dashed border-[#B7C8A3] flex flex-col items-center text-center">
                <p className="text-[#064F4B] font-bold text-lg mb-2">Need a callback?</p>
                <p className="text-[#5F7F7A] text-sm mb-6">Leave us a message on WhatsApp and we'll call you back within 2 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
