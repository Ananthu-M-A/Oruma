import React from 'react';

export default function ParentingImportance() {
  const points = [
    { title: 'Improved Communication', text: 'Learn effective ways to understand and respond to your child\'s needs and emotions.' },
    { title: 'Effective Discipline', text: 'Develop healthy strategies for managing challenging behaviors while maintaining a positive connection.' },
    { title: 'Stronger Family Bond', text: 'Foster a nurturing environment that supports the emotional growth of both parents and children.' },
    { title: 'Child\'s Emotional Health', text: 'Early intervention helps children develop the social and emotional skills they need for life.' },
    { title: 'Parental Well-being', text: 'Reducing parenting stress improves your own mental health and overall quality of life.' }
  ];

  return (
    <section className="py-24 bg-[#FFFBF0]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-[#064F4B] text-center mb-16">
          Why Addressing parenting and child <br /> behavioral issues <span className="italic">Matters</span>
        </h2>
        
        {/* Central Visualization Area */}
        <div className="max-w-2xl mx-auto mb-16 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-[#1A1A1A] aspect-[21/9] flex items-center justify-center relative overflow-hidden">
             <img 
               src="https://images.unsplash.com/photo-1491677584656-f2f455e11103?auto=format&fit=crop&q=80&w=800" 
               className="w-full h-full object-cover opacity-30 grayscale"
               alt="Parenting visualization"
               loading="lazy"
               decoding="async"
             />
             <div className="absolute inset-0 flex items-center justify-center p-8">
                <p className="text-white text-sm lg:text-base font-medium max-w-sm italic text-center">
                  "Children are not things to be molded, but people to be unfolded."
                </p>
             </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12 max-w-5xl mx-auto">
          {points.map((point, i) => (
            <div key={i} className="flex flex-col gap-2">
              <h3 className="text-lg font-extrabold text-[#064F4B] flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-[#00D494] rounded-full" />
                {point.title}
              </h3>
              <p className="text-[#5F7F7A] text-sm leading-relaxed pl-5 font-medium">
                {point.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
