import React, { useState } from 'react';
import { LucideIcon } from '@site-builder/icons';

export default function PricingSection() {
  const [tier, setTier] = useState('senior'); // 'senior' (G2), 'group5' (G5), 'group4' (G4), 'consultant' (G3), or 'standard' (G1)
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'couple'
  const whatsappNumber = "919846462744";

  const pricingData = {
    senior: {
      label: 'Group 2 (Premium)',
      individual: {
        price: '₹2,000',
        unit: '/ session',
        desc: 'Premium care from our clinical experts including Hamna, Kallu Sajeev, Dr. Amrutha Vijayn, and Seenai Tito.',
        features: ['50-60 Min Session', 'Advanced Clinical Care', 'Comprehensive Healing Plan'],
        packages: [
          { name: 'Individual Therapy - 4 Sessions', price: '₹7,200', saving: 'Save 10%' },
          { name: 'Individual Therapy - 8 Sessions', price: '₹13,600', saving: 'Save 15%' },
          { name: 'Individual Therapy - 12 Sessions', price: '₹19,200', saving: 'Save 20%' }
        ]
      },
      couple: {
        price: '₹3,000',
        unit: '/ session',
        desc: 'Specialized therapy for couples focusing on relationship dynamics and connection, handled by our senior experts.',
        features: ['60-90 Min Session', 'Joint Conflict Resolution', 'Long-term Growth Tools'],
        packages: [
          { name: 'Couple Therapy - 4 Sessions', price: '₹10,800', saving: 'Save 10%' },
          { name: 'Couple Therapy - 8 Sessions', price: '₹20,400', saving: 'Save 15%' },
          { name: 'Couple Therapy - 12 Sessions', price: '₹28,800', saving: 'Save 20%' }
        ]
      }
    },
    group5: {
      label: 'Group 5 (Consultant)',
      individual: {
        price: '₹2,000',
        unit: '/ session',
        desc: 'Dedicated individual sessions with our Consultant Psychologists: Muhsina, Shaeza, Aleeda, Shahna, and Nihala.',
        features: ['50-60 Min Session', 'Professional Counseling', 'Compassionate Support'],
        packages: [
          { name: 'Individual Therapy - 4 Sessions', price: '₹7,200', saving: 'Save 10%' },
          { name: 'Individual Therapy - 8 Sessions', price: '₹13,600', saving: 'Save 15%' },
          { name: 'Individual Therapy - 12 Sessions', price: '₹19,200', saving: 'Save 20%' }
        ]
      },
      couple: {
        price: '₹2,250',
        unit: '/ session',
        desc: 'Effective couple therapy sessions for improved relationship wellness and growth with our Group 5 specialists.',
        features: ['60-90 Min Session', 'Relationship Healing', 'Collaborative Solutions'],
        packages: [
          { name: 'Couple Therapy - 4 Sessions', price: '₹8,100', saving: 'Save 10%' },
          { name: 'Couple Therapy - 8 Sessions', price: 'size: 20px, 15.300', saving: 'Save 15%' },
          { name: 'Couple Therapy - 12 Sessions', price: '₹21,600', saving: 'Save 20%' }
        ]
      }
    },
    group4: {
      label: 'Group 4 (Consultant)',
      individual: {
        price: '₹1,500',
        unit: '/ session',
        desc: 'Expert individual sessions with our Consultant Psychologists: Sreelekshmi, Saifunnisa, Pavithra, and Jasna.',
        features: ['50-60 Min Session', 'Expert Counseling', 'Deep Emotional Support'],
        packages: [
          { name: 'Individual Therapy - 4 Sessions', price: '₹5,400', saving: 'Save 10%' },
          { name: 'Individual Therapy - 8 Sessions', price: '₹10,200', saving: 'Save 15%' },
          { name: 'Individual Therapy - 12 Sessions', price: '₹14,400', saving: 'Save 20%' }
        ]
      },
      couple: {
        price: '₹1,500',
        unit: '/ session',
        desc: 'Relationship wellness and guided communication sessions for couples with our Group 4 experts.',
        features: ['60-90 Min Session', 'Couple Communication', 'Balanced Relationship Care'],
        packages: [
          { name: 'Couple Therapy - 4 Sessions', price: '₹5,400', saving: 'Save 10%' },
          { name: 'Couple Therapy - 8 Sessions', price: '₹10,200', saving: 'Save 15%' },
          { name: 'Couple Therapy - 12 Sessions', price: '₹14,400', saving: 'Save 20%' }
        ]
      }
    },
    consultant: {
      label: 'Group 3 (Consultant)',
      individual: {
        price: '₹1,000',
        unit: '/ session',
        desc: 'Expert individual guidance from our Consultant Psychologists: Dr. Ashi, Shihana, Anila, Nivya, Rubeena, Indulekha, and Fathima Rincy.',
        features: ['50-60 Min Session', 'Professional Counseling', 'Evidence-Based Support'],
        packages: [
          { name: 'Individual Therapy - 4 Sessions', price: '₹3,600', saving: 'Save 10%' },
          { name: 'Individual Therapy - 8 Sessions', price: '₹6,800', saving: 'Save 15%' },
          { name: 'Individual Therapy - 12 Sessions', price: '₹9,600', saving: 'Save 20%' }
        ]
      },
      couple: {
        price: '₹1,500',
        unit: '/ session',
        desc: 'Affordable couple therapy sessions focusing on relationship wellness and communication improvement.',
        features: ['60-90 Min Session', 'Relationship Wellness', 'Guided Communication'],
        packages: [
          { name: 'Couple Therapy - 4 Sessions', price: '₹5,400', saving: 'Save 10%' },
          { name: 'Couple Therapy - 8 Sessions', price: '₹10,200', saving: 'Save 15%' },
          { name: 'Couple Therapy - 12 Sessions', price: '₹14,400', saving: 'Save 20%' }
        ]
      }
    },
    standard: {
      label: 'Group 1 (Standard)',
      individual: {
        price: '₹1,000',
        unit: '/ session',
        desc: 'Empathetic individual support from our Consultant Psychologists: Sreemol P S, Shipa, Anusha, Reginmaria, Nisha, and Rameesa K.',
        features: ['50-60 Min Session', 'Emotional Support', 'Personalized Wellness'],
        packages: [
          { name: 'Individual Therapy - 4 Sessions', price: '₹3,600', saving: 'Save 10%' },
          { name: 'Individual Therapy - 8 Sessions', price: '₹6,800', saving: 'Save 15%' },
          { name: 'Individual Therapy - 12 Sessions', price: '₹9,600', saving: 'Save 20%' }
        ]
      }
    }
  };

  const currentTier = pricingData[tier];
  const currentPlan = currentTier[activeTab] || currentTier['individual'];

  return (
    <section className="py-24 bg-[#F7F9F5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-black text-[#064F4B] mb-4 uppercase tracking-tighter">Wellness Packages</h2>
          <p className="text-[#5F7F7A] text-lg max-w-2xl mx-auto font-medium leading-relaxed">Select the therapist group and package that best supports your mental health journey.</p>
        </div>

        {/* Tier Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-[#B7C8A3]/20 p-1.5 rounded-2xl flex flex-wrap items-center justify-center gap-2">
            <button 
              onClick={() => { setTier('senior'); setActiveTab('individual'); }}
              className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${tier === 'senior' ? 'bg-[#064F4B] text-white shadow-lg' : 'text-[#064F4B] hover:bg-white/50'}`}
            >
              Group 2
            </button>
            <button 
              onClick={() => { setTier('group5'); setActiveTab('individual'); }}
              className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${tier === 'group5' ? 'bg-[#064F4B] text-white shadow-lg' : 'text-[#064F4B] hover:bg-white/50'}`}
            >
              Group 5
            </button>
            <button 
              onClick={() => { setTier('group4'); setActiveTab('individual'); }}
              className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${tier === 'group4' ? 'bg-[#064F4B] text-white shadow-lg' : 'text-[#064F4B] hover:bg-white/50'}`}
            >
              Group 4
            </button>
            <button 
              onClick={() => { setTier('consultant'); setActiveTab('individual'); }}
              className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${tier === 'consultant' ? 'bg-[#064F4B] text-white shadow-lg' : 'text-[#064F4B] hover:bg-white/50'}`}
            >
              Group 3
            </button>
            <button 
              onClick={() => { setTier('standard'); setActiveTab('individual'); }}
              className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${tier === 'standard' ? 'bg-[#064F4B] text-white shadow-lg' : 'text-[#064F4B] hover:bg-white/50'}`}
            >
              Group 1
            </button>
          </div>
        </div>

        {/* Base Rates */}
        <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-4xl mx-auto">
          {/* Individual Card */}
          <div 
            onClick={() => setActiveTab('individual')}
            className={`relative p-10 rounded-[3rem] border-2 transition-all duration-500 cursor-pointer bg-white group ${activeTab === 'individual' ? 'border-[#0A7F7A] shadow-2xl scale-[1.02]' : 'border-[#E2E8E6] opacity-60 hover:opacity-100'}`}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-black text-[#064F4B] uppercase tracking-tighter">Individual</h3>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${activeTab === 'individual' ? 'border-[#0A7F7A] bg-[#0A7F7A]' : 'border-[#E2E8E6]'}`}>
                {activeTab === 'individual' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-black text-[#064F4B] tracking-tighter">{currentTier.individual.price}</span>
              <span className="text-[#5F7F7A] font-bold uppercase text-xs tracking-widest">{currentTier.individual.unit}</span>
            </div>
            <p className="text-[#5F7F7A] mb-8 leading-relaxed font-medium min-h-[60px]">{currentTier.individual.desc}</p>
            <ul className="space-y-4 mb-10">
              {currentTier.individual.features.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-bold text-[#2E3E3C]">
                  <div className="w-5 h-5 rounded-full bg-[#B7C8A3]/20 flex items-center justify-center text-[#0A7F7A]"><LucideIcon name="check" size={12} strokeWidth={4} /></div>
                  {f}
                </li>
              ))}
            </ul>
            <button className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'individual' ? 'bg-[#064F4B] text-white' : 'bg-[#F5F8F7] text-[#064F4B]'}`}>
              {activeTab === 'individual' ? 'Plan Selected' : 'Select Plan'}
            </button>
          </div>

          {/* Couple Card */}
          {currentTier.couple ? (
            <div 
              onClick={() => setActiveTab('couple')}
              className={`relative p-10 rounded-[3rem] border-2 transition-all duration-500 cursor-pointer bg-white group ${activeTab === 'couple' ? 'border-[#0A7F7A] shadow-2xl scale-[1.02]' : 'border-[#E2E8E6] opacity-60 hover:opacity-100'}`}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-black text-[#064F4B] uppercase tracking-tighter">Couple</h3>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${activeTab === 'couple' ? 'border-[#0A7F7A] bg-[#0A7F7A]' : 'border-[#E2E8E6]'}`}>
                  {activeTab === 'couple' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-black text-[#064F4B] tracking-tighter">{currentTier.couple.price}</span>
                <span className="text-[#5F7F7A] font-bold uppercase text-xs tracking-widest">{currentTier.couple.unit}</span>
              </div>
              <p className="text-[#5F7F7A] mb-8 leading-relaxed font-medium min-h-[60px]">{currentTier.couple.desc}</p>
              <ul className="space-y-4 mb-10">
                {currentTier.couple.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold text-[#2E3E3C]">
                    <div className="w-5 h-5 rounded-full bg-[#B7C8A3]/20 flex items-center justify-center text-[#0A7F7A]"><LucideIcon name="check" size={12} strokeWidth={4} /></div>
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'couple' ? 'bg-[#064F4B] text-white' : 'bg-[#F5F8F7] text-[#064F4B]'}`}>
                {activeTab === 'couple' ? 'Plan Selected' : 'Select Plan'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center p-10 bg-white/40 rounded-[3rem] border-2 border-dashed border-[#E2E8E6]">
               <div className="text-center">
                 <LucideIcon name="info" size={32} className="mx-auto text-[#064F4B]/20 mb-4" />
                 <p className="text-[#5F7F7A] font-bold text-sm leading-relaxed">Couple therapy is handled by our<br/>Group 2, 5, 4 & 3 Professionals.</p>
               </div>
            </div>
          )}
        </div>

        {/* Package Section */}
        <div className="bg-[#064F4B] rounded-[4rem] p-10 md:p-20 text-white text-center relative overflow-hidden shadow-3xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#B7C8A3] opacity-10 rounded-full blur-[100px] pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00D494] opacity-10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            <h3 className="text-3xl md:text-5xl font-heading font-black mb-6 uppercase tracking-tighter">Therapy Bundles</h3>
            <p className="text-white/70 mb-14 max-w-xl mx-auto font-medium text-lg leading-relaxed italic">
              Experience transformative healing with our <span className="text-[#B7C8A3] font-black">{activeTab === 'individual' ? 'Individual' : 'Couple'}</span> therapy packages for <span className="text-[#B7C8A3] font-black">{currentTier.label}</span>.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {currentPlan.packages.map((pkg) => (
                <div key={pkg.name} className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] group hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 flex flex-col items-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B7C8A3] mb-4 text-center">{pkg.name}</p>
                  <p className="text-5xl font-black mb-4 tracking-tighter">{pkg.price}</p>
                  <div className="bg-[#00D494] text-[#064F4B] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-10 shadow-lg shadow-[#00D494]/20 group-hover:scale-110 transition-transform">
                    {pkg.saving}
                  </div>
                  <a 
                    href={`https://wa.me/${whatsappNumber}?text=Hi,%20I%20want%20to%20book%20the%20${encodeURIComponent(pkg.name)}%20bundle%20at%20${encodeURIComponent(currentTier.label)}.`}
                    className="mt-auto w-full py-4 bg-white text-[#064F4B] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#B7C8A3] transition-all active:scale-95 flex items-center justify-center"
                  >
                    Select Bundle
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
