import React from 'react';

export default function ServiceHero({ title, subtitle, ...rest }: any) {
  return (
    <section className="pt-40 lg:pt-52 pb-20 bg-[#F5F8F7]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl lg:text-7xl font-heading font-extrabold text-[#064F4B] leading-tight mb-8">
            {title.split(' ').map((word, i) => (
              <span key={i} className={word === 'Strength' || word === 'Personal' || word === 'Re-build' ? 'text-[#0A7F7A]' : ''}>
                {word}{' '}
              </span>
            ))}
          </h1>
          <p className="text-xl text-[#5F7F7A] mb-12 max-w-2xl mx-auto leading-relaxed italic">
            {subtitle}
          </p>
          <div className="flex justify-center">
            <button className="bg-[#0A7F7A] text-white px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#064F4B] transition-all shadow-2xl shadow-[#0A7F7A]/20 active:scale-95">
              Begin Your Journey
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
