import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import FAQSection from '../components/FAQSection';
import TherapyIntro from '../components/TherapyIntro';

// 1. Relationship & Trust
import RelationshipHero from '../components/RelationshipHero';
import RelationshipSymptoms from '../components/RelationshipSymptoms';
import RelationshipMechanism from '../components/RelationshipMechanism';

// 2. Anxiety & Stress
import AnxietyHero from '../components/AnxietyHero';
import AnxietySymptoms from '../components/AnxietySymptoms';
import AnxietyMechanism from '../components/AnxietyMechanism';

// 3. Postpartum Depression
import PostpartumHero from '../components/PostpartumHero';
import PostpartumSymptoms from '../components/PostpartumSymptoms';

// 4. Depression
import DepressionHero from '../components/DepressionHero';
import DepressionSymptoms from '../components/DepressionSymptoms';
import DepressionMechanism from '../components/DepressionMechanism';

// 5. Teenage & Student Wellness
import StudentHero from '../components/StudentHero';
import StudentSymptoms from '../components/StudentSymptoms';

// 6. Trauma
import TraumaHero from '../components/TraumaHero';
import TraumaSymptoms from '../components/TraumaSymptoms';
import TraumaMechanism from '../components/TraumaMechanism';

// Global Components
import AnxietyHowItWorks from '../components/AnxietyHowItWorks';
import TherapistGrid from '../components/TherapistGrid';

export const meta = {
  title: "Relationship, Breakup & Mental Health Concerns | oruma.me",
  description: "Specialized support for relationship issues, breakup recovery, anxiety, postpartum depression, student wellness, and trauma recovery."
};

export default function ConcernsPage() {
  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C] relative overflow-x-hidden">
      <Navbar />
      <FloatingActions />

      {/* Hero Section of the page */}
      <TherapyIntro />

      {/* 1. Relationship & Trust Rebuilding Section */}
      <section id="relationship" className="scroll-mt-24 relative z-10 bg-white border-t border-gray-100">
        <RelationshipHero />
        <div className="bg-[#F5F8F7] py-16">
           <div className="max-w-7xl mx-auto px-6 text-center">
             <div className="inline-block bg-[#0A7F7A] text-white px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">#1 Requested Support</div>
             <h2 className="text-3xl lg:text-6xl font-heading font-black text-[#064F4B] leading-tight">Husband-Wife Trust & <br/> <span className="text-[#0A7F7A]">Relationship Healing</span></h2>
           </div>
        </div>
        <RelationshipSymptoms />
        <RelationshipMechanism />
      </section>

      {/* 2. Breakup & Emotional Recovery Section */}
      <section id="breakup" className="scroll-mt-24 relative z-10 bg-white border-t border-gray-100">
        <div className="bg-[#064F4B] text-white py-24 text-center px-6">
           <div className="inline-block bg-[#B7C8A3] text-[#064F4B] px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">Specialized Support</div>
           <h2 className="text-4xl lg:text-7xl font-heading font-black mb-8 uppercase tracking-tighter">Breakup & <br className="md:hidden" /> <span className="text-[#B7C8A3]">Recovery</span></h2>
           <p className="text-white/60 max-w-2xl mx-auto font-medium text-lg lg:text-xl leading-relaxed">
             Healing from the emotional toll of a breakup requires specialized guidance. We help you navigate the transition with professional empathy.
           </p>
        </div>

        <div className="py-24 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
           <div>
              <h3 className="text-4xl font-black text-[#064F4B] mb-8 leading-tight uppercase tracking-tighter">Healing From Loss</h3>
              <p className="text-lg text-[#5F7F7A] font-medium leading-relaxed mb-10">Relationship addiction often stems from deeper emotional needs. Our sessions help you identify these patterns and build a healthier sense of self-worth.</p>
              <ul className="space-y-6">
                 {[
                   'Detaching from toxic cycles',
                   'Building emotional independence',
                   'Healing the "Heartbreak Brain"',
                   'Establishing healthy boundaries'
                 ].map(item => (
                   <li key={item} className="flex items-center gap-4 font-black text-[#064F4B] text-lg uppercase tracking-tight">
                      <div className="w-3 h-3 bg-[#00D494] rounded-full shadow-[0_0_12px_rgba(0,212,148,0.5)]" />
                      {item}
                   </li>
                 ))}
              </ul>
              <div className="mt-12">
                 <a 
                   href="https://wa.me/918157039987?text=Hi,%20I'd%20like%20to%20start%20my%20recovery%20from%20a%20breakup."
                   className="inline-block bg-[#064F4B] text-white px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#0A7F7A] transition-all shadow-xl shadow-[#064F4B]/20 active:scale-95"
                 >
                   Start Your Recovery
                 </a>
              </div>
           </div>
           
           <div className="rounded-[4rem] overflow-hidden aspect-[4/5] shadow-2xl relative group border-8 border-[#F5F8F7]">
              <img src="https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&q=80&w=800" alt="Reflective healing from breakup" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-[#064F4B]/5 transition-all duration-1000" />
              
              <div className="absolute top-8 inset-x-8 z-20">
                <div className="p-6 bg-[#064F4B]/40 backdrop-blur-md rounded-[2.5rem] border border-white/20 transform group-hover:-translate-y-1 transition-transform duration-700">
                  <p className="text-white text-sm md:text-base font-black text-center italic leading-relaxed">
                    “A breakup is not the end of love, it’s the beginning of healing.”
                  </p>
                </div>
              </div>

              <div className="absolute inset-x-8 bottom-12 p-10 bg-white/10 backdrop-blur-xl rounded-[3rem] border border-white/20 transform translate-y-4 group-hover:translate-y-0 transition-all duration-700">
                <p className="text-white text-base font-black uppercase tracking-[0.2em] text-center">
                  Together, Gently.
                </p>
              </div>
           </div>
        </div>
      </section>

      {/* 3. Anxiety & Stress Section */}
      <section id="anxiety" className="scroll-mt-24 relative z-10 bg-white border-t border-gray-100">
        <AnxietyHero />
        <AnxietySymptoms />
        <AnxietyMechanism />
      </section>

      {/* 4. Postpartum Depression Section */}
      <section id="postpartum" className="scroll-mt-24 relative z-10 bg-white border-t border-gray-100">
        <PostpartumHero />
        <PostpartumSymptoms />
      </section>

      {/* 5. Depression Section */}
      <section id="depression" className="scroll-mt-24 relative z-10 bg-white border-t border-gray-100">
        <DepressionHero />
        <DepressionSymptoms />
        <DepressionMechanism />
      </section>

      {/* 6. Teenage & Student Wellness Section */}
      <section id="student" className="scroll-mt-24 relative z-10 bg-white border-t border-gray-100">
        <StudentHero />
        <div className="bg-[#B7C8A3]/10 py-16">
           <div className="max-w-7xl mx-auto px-6 text-center">
             <div className="inline-block bg-[#064F4B] text-white px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">High Enquiry Area</div>
             <h2 className="text-3xl lg:text-6xl font-heading font-black text-[#064F4B] leading-tight">Teenage & Parent <br/> <span className="text-[#0A7F7A]">Support Systems</span></h2>
           </div>
        </div>
        <StudentSymptoms />
      </section>

      {/* 7. Trauma Section */}
      <section id="trauma" className="scroll-mt-24 relative z-10 bg-white border-t border-gray-100">
        <TraumaHero />
        <TraumaSymptoms />
        <TraumaMechanism />
      </section>

      <AnxietyHowItWorks />

      {/* Available Now Section */}
      <div className="bg-[#F9FBF9] py-32 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center text-[#064F4B] mb-20">
          <h2 className="text-4xl lg:text-7xl font-heading font-black mb-6 leading-tight">Reclaim Your Life <br /> With <span className="italic text-[#0A7F7A]">Oruma</span></h2>
          <p className="text-xl text-[#5F7F7A] font-medium max-w-2xl mx-auto">Professional help for any concern, always anonymous and safe.</p>
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <TherapistGrid />
        </div>
      </div>
      
      <FAQSection />
      <Footer />
    </main>
  );
}
