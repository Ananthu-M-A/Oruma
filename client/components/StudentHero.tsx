import { createWhatsAppUrl } from "../src/config/business";

export default function StudentHero() {
  const whatsappLink = createWhatsAppUrl(
    "Hello, I need information about student or teenager counselling support.",
  );

  return (
    <section className="relative w-full overflow-hidden bg-white border-t border-gray-100">
      <div className="flex flex-col lg:flex-row min-h-[600px]">
        {/* Left Side - Content */}
        <div className="w-full lg:w-1/2 bg-[#B7C8A3] p-8 md:p-16 lg:p-24 flex flex-col justify-center items-start text-[#064F4B] relative z-10 shadow-xl">
          <div className="absolute inset-0 bg-[#B7C8A3] -z-10" />

          <div className="inline-block bg-[#064F4B] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-lg shadow-[#064F4B]/20">
            Student & Youth Support
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-black mb-8 leading-[1.1] max-w-xl uppercase tracking-tighter">
            Teenage & Student <br />
            <span className="text-white">Wellness</span>
          </h1>
          <p className="text-lg md:text-xl mb-12 text-[#064F4B]/80 font-medium max-w-lg leading-relaxed italic">
            Safe space for young minds to express, heal, and grow. Specialized
            support for academic stress and digital wellness.
          </p>
          <a
            href={whatsappLink}
            className="bg-[#064F4B] text-white px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white hover:text-[#064F4B] transition-all shadow-2xl active:scale-95"
          >
            Start Counselling
          </a>
        </div>

        {/* Right Side - Image with Quote */}
        <div className="w-full lg:w-1/2 relative min-h-[500px] lg:min-h-0 bg-[#F5F8F7]">
          <img
            src="/assets/student-wellness-v2-overwhelmed.webp"
            alt="It’s okay to feel overwhelmed — support makes it lighter."
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-[#064F4B]/10 mix-blend-multiply" />

          {/* Quote Overlay - Top Center */}
          <div className="absolute top-12 left-8 right-8 z-20">
            <div className="p-6 bg-[#064F4B]/40 backdrop-blur-md rounded-[2.5rem] border border-white/20">
              <p className="text-white text-base md:text-lg font-black text-center italic leading-relaxed">
                “It’s okay to feel overwhelmed — support makes it lighter.”
              </p>
            </div>
          </div>

          <div className="absolute bottom-12 left-12 right-12 text-[#064F4B]/40 text-[10px] font-black tracking-[0.3em] uppercase text-center">
            Oruma • Together, Gently.
          </div>
        </div>
      </div>
    </section>
  );
}
