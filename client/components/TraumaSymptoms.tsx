
export default function TraumaSymptoms() {
  const symptomsLeft = [
    'Intrusive memories or flashbacks',
    'Heightened emotional or physical reactions',
    'Avoidance of people or places as triggers'
  ];
  
  const symptomsRight = [
    'Persistent fear, guilt, or detachment',
    'Difficulty sleeping or concentrating',
    'Irritability or self-destructive behavior'
  ];

  return (
    <section className="py-24 bg-white text-center">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-[#064F4B] mb-12">
          This is what Trauma and PTSD <span className="italic">look like</span>
        </h2>
        
        {/* Central Visualization Area */}
        <div className="max-w-2xl mx-auto mb-16 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-[#1A1A1A] aspect-[21/9] flex items-center justify-center relative overflow-hidden">
             <img 
               src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" 
               className="w-full h-full object-cover opacity-30 grayscale"
               alt="Conceptual trauma visualization"
               loading="lazy"
               decoding="async"
             />
             <div className="absolute inset-0 flex items-center justify-center p-8">
                <p className="text-white text-sm lg:text-base font-medium max-w-sm italic">
                  "The past feels like it's happening right now, even in the safest of moments."
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
