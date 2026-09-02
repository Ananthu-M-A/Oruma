
export default function EducationalCards() {
  const facts = [
    { title: 'Fact 01', text: 'Sexual wellness is a combination of physical, emotional, and social well-being in relation to sexuality.' },
    { title: 'Fact 02', text: 'Almost 50% of people experience some form of sexual challenge at some point in their lives.' },
    { title: 'Fact 03', text: 'Communication and understanding are the most important components of a healthy sexual life.' }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-heading font-extrabold text-[#064F4B] mb-16">Did You Know?</h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {facts.map((fact, i) => (
            <div key={i} className="bg-[#B7C8A3]/10 border border-[#B7C8A3]/20 p-10 rounded-[2.5rem] text-left hover:bg-[#B7C8A3]/20 transition-all">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xs font-black text-[#0A7F7A] mb-8 shadow-sm border border-[#E2E8E6]">
                {fact.title.split(' ')[1]}
              </div>
              <p className="text-[#064F4B] font-bold text-lg leading-relaxed">
                {fact.text}
              </p>
            </div>
          ))}
        </div>

        <a
          href="/therapists"
          className="inline-block bg-[#1A1A1A] text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-black/10"
        >
          Book consultation
        </a>
      </div>
    </section>
  );
}
