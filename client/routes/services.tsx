import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CoupleTherapySection from '../components/CoupleTherapySection';
import PricingSection from '../components/PricingSection';
import { LucideIcon } from '@site-builder/icons';

export const meta = {
  title: "Services & Specialized Programs | ORUMA",
  description: "Detailed point-by-point overview of our counselling programs, professional training, and courses."
};

const programs = [
  {
    id: 'nri',
    title: 'NRI Consultation',
    desc: 'Specialized global care for Indians living abroad with flexible scheduling.',
    icon: 'globe',
    color: 'bg-[#0A7F7A] text-white',
    details: [
      'Flexible Time Zone Slots',
      'Cultural Contextual Support',
      'Native Language Comfort (Malayalam/English)',
      'Cross-border Payment Support',
      'Global Confidentiality Standards'
    ],
    link: '/consultation'
  },
  {
    id: 'individual',
    title: 'Individual Therapy',
    desc: 'Confidential 1-on-1 sessions for personal growth and emotional health.',
    icon: 'user',
    color: 'bg-[#0A7F7A]/10 text-[#0A7F7A]',
    details: [
      'Anxiety & Panic Attacks',
      'Clinical Depression Support',
      'Stress & Burnout Management',
      'Self-Esteem & Confidence Building',
      'Grief & Bereavement Support'
    ],
    link: '/concerns/all-concerns#anxiety'
  },
  {
    id: 'couple',
    title: 'Couple Therapy',
    desc: 'Restore trust and improve communication in your relationship.',
    icon: 'users',
    color: 'bg-[#B7C8A3]/20 text-[#064F4B]',
    details: [
      'Relationship Wellness Tools',
      'Effective Communication Skills',
      'Pre-marital Compatibility',
      'Conflict Resolution Strategies',
      'Intimacy & Emotional Connection'
    ],
    link: '/services/couple-therapy'
  },
  {
    id: 'postpartum',
    title: 'Postpartum Support',
    desc: 'Specialized care for new mothers navigating emotional shifts.',
    icon: 'baby',
    color: 'bg-orange-50 text-orange-600',
    details: [
      'Postpartum Depression (PPD)',
      'Baby Blues & New Parent Stress',
      'Bonding & Attachment Support',
      'Identity & Life-role Transitions',
      'Parental Self-Care Strategies'
    ],
    link: '/concerns/all-concerns#postpartum'
  }
];

const educationalServices = [
  {
    id: 'courses',
    title: 'Self-Paced Courses',
    desc: 'Learn emotional resilience at your own pace.',
    icon: 'book-open',
    color: 'bg-[#0A7F7A]/5',
    details: [
      'Managing Modern Anxiety',
      'Mindful Parenting Modules',
      'Emotional Intelligence 101'
    ],
    tag: 'Coming Soon'
  },
  {
    id: 'webinar',
    title: 'Expert Webinars',
    desc: 'Live interactive sessions with professionals.',
    icon: 'video',
    color: 'bg-[#B7C8A3]/10',
    details: [
      'Understanding Mental Health',
      'Relationship Trust Workshops',
      'Stress Relief Techniques'
    ],
    tag: 'Monthly'
  },
  {
    id: 'training',
    title: 'Professional Training',
    desc: 'Certified programs for psychology students.',
    icon: 'award',
    color: 'bg-orange-50',
    details: [
      'Clinical Practice Foundations',
      'Counseling Ethics & Skills',
      'Therapeutic Internship Program'
    ],
    tag: 'Certified'
  }
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-white font-body text-[#1A2E2C]">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-40 pb-20 bg-[#F5F8F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[#0A7F7A] text-white px-6 py-2 rounded-full font-black text-xs mb-8 tracking-widest uppercase shadow-xl shadow-[#0A7F7A]/20">
            What We Offer
          </div>
          <h1 className="text-4xl lg:text-7xl font-heading font-black text-[#1A2E2C] mb-8 leading-tight uppercase tracking-tighter">
            Comprehensive <br/><span className="text-[#0A7F7A]">Care Programs.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#5F7F7A] max-w-2xl mx-auto font-medium">
            Explore our specialized services designed to support you through every stage of your mental health journey.
          </p>
        </div>
      </section>

      {/* Therapy Programs */}
      <section className="py-24 border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-3xl font-heading font-black text-[#064F4B]">Counselling & Therapy</h2>
            <div className="h-px flex-grow bg-gray-100" />
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {programs.map((p) => {
              return (
                <div key={p.id} id={p.id} className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-gray-100 hover:border-[#0A7F7A]/30 hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row gap-10 scroll-mt-32">
                  <div className={`w-20 h-20 shrink-0 ${p.color} rounded-[2rem] flex items-center justify-center`}>
                    <LucideIcon name={p.icon} size={40} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl font-black text-[#1A2E2C] mb-3 uppercase tracking-tighter">{p.title}</h3>
                    <p className="text-[#5F7F7A] font-medium mb-8 leading-relaxed">
                      {p.desc}
                    </p>
                    
                    <div className="space-y-4 mb-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">What's included:</p>
                      {p.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-[#B7C8A3] rounded-full" />
                          <span className="text-sm font-bold text-[#3D4B49]">{detail}</span>
                        </div>
                      ))}
                    </div>

                    <a 
                      href={p.link} 
                      className="inline-flex items-center gap-2 text-[#0A7F7A] font-black text-sm group"
                    >
                      View detailed service <LucideIcon name="arrow-right" size={16} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section (Newly Added to make it visible as requested) */}
      <PricingSection />

      {/* Couple Therapy Section */}
      <CoupleTherapySection />

      {/* Training & Community */}
      <section className="py-24 bg-[#064F4B]/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-3xl font-heading font-black text-[#064F4B]">Training & Community</h2>
            <div className="h-px flex-grow bg-white" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {educationalServices.map((s) => {
              return (
                <div key={s.id} id={s.id} className="bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-xl transition-all duration-500 scroll-mt-32 relative">
                  <div className="absolute -top-3 -right-3 bg-[#0A7F7A] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {s.tag}
                  </div>
                  <div className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center text-[#0A7F7A] mb-8`}>
                    <LucideIcon name={s.icon} size={28} />
                  </div>
                  <h3 className="text-xl font-black text-[#1A1A1A] mb-4 uppercase tracking-tighter">{s.title}</h3>
                  
                  <ul className="space-y-4 mb-10">
                    {s.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm font-bold text-[#5F7F7A]">
                        <LucideIcon name="check" size={14} className="text-[#0A7F7A]" />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  <a 
                    href="https://wa.me/918157039987?text=Hi,%20I'm%20interested%20in%20your%20training%20and%20courses" 
                    className="w-full bg-[#F5F8F7] text-[#0A7F7A] py-4 rounded-2xl font-black text-xs text-center hover:bg-[#0A7F7A] hover:text-white transition-all block"
                  >
                    Request Information
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
