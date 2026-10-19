import { LucideIcon } from "@site-builder/icons";

export default function TraumaMechanism() {
  const steps = [
    { icon: "shield-check", title: "Safe Boundaries" },
    { icon: "user-check", title: "Specialized Trauma Care" },
    { icon: "heart-handshake", title: "Empathetic Support" },
    { icon: "user-check", title: "Professional Guidance" },
  ];

  return (
    <section className="py-20 bg-[#B7C8A3]/20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-[#064F4B] mb-16">
          How Oruma helps fight Trauma & PTSD
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

      </div>
    </section>
  );
}
