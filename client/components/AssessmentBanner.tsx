import React from 'react';

export default function AssessmentBanner() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="bg-[#B7C8A3]/20 border border-[#B7C8A3]/30 rounded-[2.5rem] p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-sm border border-[#E2E8E6]">
            💭
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#064F4B] mb-2">Not sure what you need?</h3>
            <p className="text-[#5F7F7A] font-medium">Takes just 60 seconds and connects you with your personal advisor.</p>
          </div>
        </div>
        <button className="whitespace-nowrap bg-[#1A1A1A] text-white px-8 py-3.5 rounded-full font-bold hover:bg-black transition-all shadow-lg">
          Info assessment ›
        </button>
      </div>
    </div>
  );
}
