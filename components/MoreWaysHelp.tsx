import React from 'react';

export default function MoreWaysHelp() {
  const tags = [
    'Anorgasmia', 'Vaginismus', 'Erectile Dysfunction', 'Premature Ejaculation',
    'Painful Intercourse', 'Sexual Orientation', 'Communication Blocks', 'Paraphilias',
    'Compulsive Sexual Behavior', 'Kink/BDSM Support', 'Asexuality Support', 'Polyamory Support',
    'Infertility & Intimacy', 'Chronic Illness & Sex'
  ];

  return (
    <section className="py-24 bg-[#F5F8F7]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-heading font-extrabold text-[#064F4B] mb-4">More Ways We Can Help</h2>
        <p className="text-[#5F7F7A] mb-12 font-medium">You're in the hands of a multidisciplinary team.</p>
        
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {tags.map(tag => (
            <div key={tag} className="px-6 py-3 bg-white border border-[#E2E8E6] rounded-full text-sm font-bold text-[#2E3E3C] shadow-sm">
              {tag}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
