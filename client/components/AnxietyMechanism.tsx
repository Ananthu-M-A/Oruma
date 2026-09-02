import { createWhatsAppUrl } from "../src/config/business";
import { LucideIcon } from "@site-builder/icons";

export default function AnxietyMechanism() {
  const whatsappLink = createWhatsAppUrl(
    "Hello, I need help choosing an anxiety counselling or wellness service.",
  );
  const steps = [
    { icon: "shield", title: "Safe Space" },
    { icon: "user-check", title: "Expert Guidance" },
    { icon: "clock", title: "Supportive Session" },
    { icon: "heart", title: "Empathy First" },
  ];

  return (
    <section className="py-20 bg-[#B7C8A3]/20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-[#064F4B] mb-16">
          How Oruma helps fight anxiety
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-white/90 p-8 rounded-[2.5rem] border border-[#064F4B]/10 hover:bg-white transition-all shadow-lg group"
            >
              <div className="w-12 h-12 bg-[#F5F8F7] rounded-xl flex items-center justify-center text-[#0A7F7A] mx-auto mb-4 border border-[#E2E8E6] group-hover:scale-110 transition-transform">
                <LucideIcon name={step.icon} size={24} />
              </div>
              <p className="text-sm font-extrabold text-[#064F4B] leading-tight">
                {step.title}
              </p>
            </div>
          ))}
        </div>

        <a
          href={whatsappLink}
          className="inline-block mt-12 bg-[#0A7F7A] text-white px-10 py-3.5 rounded-full font-bold text-sm hover:bg-[#064F4B] shadow-xl shadow-[#0A7F7A]/20 transition-all hover:scale-105 active:scale-95"
        >
          Get Therapy
        </a>
      </div>
    </section>
  );
}
