import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingActions from './FloatingActions';

type LegalPolicyLayoutProps = {
  title: string;
  effectiveDate: string;
  introduction: string;
  children: ReactNode;
};

export default function LegalPolicyLayout({
  title,
  effectiveDate,
  introduction,
  children
}: LegalPolicyLayoutProps) {
  return (
    <main className="min-h-screen bg-[#F5F8F7] font-body text-[#2E3E3C] overflow-x-hidden">
      <Navbar />
      <FloatingActions />

      <header className="pt-36 md:pt-48 pb-14 md:pb-20 bg-[#064F4B] text-white">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#B7C8A3] text-xs font-black uppercase tracking-[0.25em] mb-5">
            Legal &amp; Privacy
          </p>
          <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight mb-7">
            {title}
          </h1>
          <p className="max-w-3xl text-base md:text-lg text-white/80 leading-relaxed">
            {introduction}
          </p>
          <div className="mt-8 pt-6 border-t border-white/15">
            <p className="text-sm font-semibold text-white/75">
              Effective Date: <span className="text-white">{effectiveDate}</span>
            </p>
          </div>
        </div>
      </header>

      <section className="py-12 md:py-20">
        <article className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-3xl border border-[#064F4B]/10 shadow-sm px-6 py-10 md:px-14 md:py-14">
            <div className="legal-policy space-y-11 text-[#465E5A] leading-8">
              {children}
            </div>
          </div>
        </article>
      </section>

      <Footer />
    </main>
  );
}

