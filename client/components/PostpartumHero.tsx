import { createWhatsAppUrl } from "../src/config/business";

export default function PostpartumHero() {
  const whatsappLink = createWhatsAppUrl(
    "Hello, I need information about postpartum counselling and wellness support.",
  );

  return (
    <section className="relative w-full overflow-hidden bg-white border-t border-gray-100">
      <div className="flex flex-col lg:flex-row min-h-[600px]">
        {/* Left Side - Content */}
        <div className="w-full lg:w-1/2 bg-[#064F4B] p-8 md:p-16 lg:p-24 flex flex-col justify-center items-start text-white relative z-10">
          <div className="absolute inset-0 bg-[#064F4B] -z-10" />

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-black mb-8 leading-[1.1] max-w-xl">
            Gentle care for{" "}
            <span className="text-[#B7C8A3]">Postpartum Recovery</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 text-white/80 font-medium max-w-lg leading-relaxed">
            The transition to motherhood is a major life change. We provide
            specialized counselling to support your emotional health during the
            postpartum period.
          </p>
          <a
            href={whatsappLink}
            className="bg-[#B7C8A3] text-[#064F4B] px-10 py-5 rounded-full font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-black/20 active:scale-95"
          >
            Get Specialized Support
          </a>
        </div>

        {/* Right Side - Image with Quote */}
        <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-0 bg-gray-100 group">
          <img
            src="/assets/postpartum-new.webp"
            alt="Postpartum support - emotional care"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-[#064F4B]/10 mix-blend-multiply" />

          {/* Quote Overlay */}
          <div className="absolute inset-x-8 bottom-12 p-8 bg-black/20 backdrop-blur-md rounded-[2rem] border border-white/10 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <p className="text-white text-lg font-bold leading-relaxed italic text-center">
              "Motherhood is a journey, not a destination. You are doing better
              than you think."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
