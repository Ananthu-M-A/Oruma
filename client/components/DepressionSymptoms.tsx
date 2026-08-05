import React from 'react';

export default function DepressionSymptoms() {
  const symptomsLeft = [
    'Persistent sadness or low mood',
    'Loss of interest in hobbies',
    'Fatigue or low energy'
  ];
  
  const symptomsRight = [
    'Loss of appetite or overeating',
    'Difficulty concentrating or making decisions',
    'Feelings of hopelessness or guilt'
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-[#064F4B] mb-12">
          This is what depression can <span className="italic">look like</span>
        </h2>
        
        {/* Central Black Box - Replicating screenshot */}
        <div className="max-w-2xl mx-auto mb-16 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-[#1A1A1A] aspect-[21/9] flex items-center justify-center relative overflow-hidden">
             <img 
               src="https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&q=80&w=800" 
               className="w-full h-full object-cover opacity-40 grayscale"
               alt="Depression visualization"
               loading="lazy"
               decoding="async"
             />
             <div className="absolute inset-0 flex items-center justify-center p-8">
                <p className="text-white text-sm lg:text-base font-medium max-w-sm italic">
                  "It feels like living in a fog where the colors of the world have faded away."
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
