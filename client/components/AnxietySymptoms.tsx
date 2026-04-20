import React from 'react';

export default function AnxietySymptoms() {
  const symptomsLeft = [
    'Constant worry or racing thoughts',
    'Physical symptoms like heart palpitations',
    'Feelings of nervousness or panic'
  ];
  
  const symptomsRight = [
    'Irritability or feeling on edge',
    'Difficulty concentrating or mind going blank',
    'Sleep disturbances or fatigue'
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-[#064F4B] mb-12">
          This is what anxiety can look like
        </h2>
        
        {/* Central Black Box */}
        <div className="max-w-2xl mx-auto mb-16 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-[#1A1A1A] aspect-[21/9] flex items-center justify-center relative overflow-hidden">
             <img 
               src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800" 
               className="w-full h-full object-cover opacity-40"
               alt="Anxiety visualization"
             />
             <div className="absolute inset-0 flex items-center justify-center p-8">
                <p className="text-white text-sm lg:text-base font-medium max-w-sm italic">
                  "It feels like a constant weight on my chest, even when everything seems fine."
                </p>
             </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 max-w-4xl mx-auto text-left">
          <ul className="space-y-6">
            {symptomsLeft.map((item, i) => (
              <li key={i} className="flex items-start gap-4 text-[#5F7F7A] font-bold text-sm">
                <div className="w-1.5 h-1.5 bg-[#B7C8A3] rounded-full mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <ul className="space-y-6">
            {symptomsRight.map((item, i) => (
              <li key={i} className="flex items-start gap-4 text-[#5F7F7A] font-bold text-sm">
                <div className="w-1.5 h-1.5 bg-[#B7C8A3] rounded-full mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
