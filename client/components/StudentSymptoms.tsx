import { LucideIcon } from '@site-builder/icons';

export default function StudentSymptoms() {
  const issues = [
    { 
      title: 'Digital Addictions', 
      desc: 'Expert support for mobile phone and porn addiction which impacts daily focus and mental health.',
      icon: 'smartphone'
    },
    { 
      title: 'Stress Management', 
      desc: 'Effective techniques for academic performance, exam anxiety, and future-related stress.',
      icon: 'brain'
    },
    { 
      title: 'Teenage & Parenting', 
      desc: 'Addressing relationship dynamics between parents and teens to rebuild communication.',
      icon: 'users'
    },
    { 
      title: 'Counselling for Parents', 
      desc: 'Empowering parents with the right tools to understand and support their children effectively.',
      icon: 'heart-handshake'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-5xl font-heading font-black text-[#064F4B] mb-6">
            Addressing Modern <span className="italic">Teenage Challenges</span>
          </h2>
          <p className="text-xl text-[#5F7F7A] max-w-3xl mx-auto font-medium">
            Adolescence is a critical stage. We specialize in the issues that impact teenagers and their families most in today's world.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {issues.map((item, i) => (
            <div key={i} className="bg-[#F5F8F7] p-8 rounded-[2.5rem] border border-[#E2E8E6] hover:border-[#B7C8A3] hover:-translate-y-2 transition-all group shadow-sm">
              <div className="w-14 h-14 bg-[#B7C8A3]/30 rounded-2xl flex items-center justify-center text-[#064F4B] mb-6 group-hover:bg-[#064F4B] group-hover:text-white transition-all">
                <LucideIcon name={item.icon} size={28} />
              </div>
              <h3 className="text-xl font-black text-[#064F4B] mb-4">{item.title}</h3>
              <p className="text-[#5F7F7A] text-sm leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        
        {/* Quote for emphasis */}
        <div className="mt-24 max-w-4xl mx-auto bg-[#064F4B] p-12 md:p-16 rounded-[4rem] text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <p className="text-xl md:text-3xl font-heading font-bold italic leading-relaxed relative z-10">
            "Understanding your teenager is the first step toward helping them thrive. We provide specialized counselling for both teens and their parents."
          </p>
        </div>
      </div>
    </section>
  );
}
