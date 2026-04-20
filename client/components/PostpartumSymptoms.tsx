import React from 'react';

export default function PostpartumSymptoms() {
  const symptomsLeft = [
    'Persistent feelings of sadness or emptiness',
    'Difficulty bonding with your baby',
    'Intense irritability or anger'
  ];
  
  const symptomsRight = [
    'Overwhelming fatigue or loss of energy',
    'Thoughts of not being a good mother',
    'Fear of being alone with the baby'
  ];

  return (
    <section className="py-24 bg-[#F5F8F7] text-center">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-[#064F4B] mb-12">
          Understanding the <span className="italic text-[#0A7F7A]">Postpartum Experience</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 max-w-4xl mx-auto text-left">
          <ul className="space-y-6">
            {symptomsLeft.map((item, i) => (
              <li key={i} className="flex items-start gap-4 text-[#5F7F7A] font-bold text-lg">
                <div className="w-2 h-2 bg-[#0A7F7A] rounded-full mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <ul className="space-y-6">
            {symptomsRight.map((item, i) => (
              <li key={i} className="flex items-start gap-4 text-[#5F7F7A] font-bold text-lg">
                <div className="w-2 h-2 bg-[#0A7F7A] rounded-full mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
