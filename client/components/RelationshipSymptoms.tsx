import React from 'react';

export default function RelationshipSymptoms() {
  const symptomsLeft = [
    'Frequent arguments or conflict',
    'Lack of trust or emotional safety',
    'Difficulty with communication'
  ];
  
  const symptomsRight = [
    'Feeling distant or disconnected',
    'Issues with intimacy or physical connection',
    'Disagreements on future goals or values'
  ];

  return (
    <section className="py-24 bg-white text-center">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-[#064F4B] mb-12">
          This is what relationship issues <span className="italic text-[#0A7F7A]">look like</span>
        </h2>
        
        {/* Central Visualization Area - Emotional Young Indian female representation */}
        <div className="max-w-4xl mx-auto mb-16 rounded-[3rem] overflow-hidden shadow-2xl relative">
          <div className="bg-[#1A1A1A] aspect-[21/9] flex items-center justify-center relative overflow-hidden">
             <img 
               src="https://images.unsplash.com/photo-1687757660531-4b7a837ece8a?auto=format&fit=crop&q=80&w=1200" 
               className="absolute inset-0 w-full h-full object-cover opacity-60"
               alt="Young Indian woman feeling emotional in a relationship context"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center p-8">
                <p className="text-white text-lg lg:text-2xl font-medium max-w-2xl italic leading-relaxed">
                  "The silence at home feels louder than any argument we've ever had."
                </p>
             </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 max-w-4xl mx-auto text-left">
          <ul className="space-y-6">
            {symptomsLeft.map((item, i) => (
              <li key={i} className="flex items-start gap-4 text-[#5F7F7A] font-bold text-lg">
                <div className="w-2 h-2 bg-[#B7C8A3] rounded-full mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <ul className="space-y-6">
            {symptomsRight.map((item, i) => (
              <li key={i} className="flex items-start gap-4 text-[#5F7F7A] font-bold text-lg">
                <div className="w-2 h-2 bg-[#B7C8A3] rounded-full mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
