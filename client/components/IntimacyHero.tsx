import { createWhatsAppUrl } from "../src/config/business";

export default function IntimacyHero() {
  return (
    <section className="pt-40 lg:pt-52 pb-20 bg-[#F5F8F7]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl lg:text-7xl font-heading font-extrabold text-[#064F4B] leading-tight mb-8">
            Intimacy & <br />{" "}
            <span className="text-[#0A7F7A]">Sexual Wellness</span>
          </h1>
          <p className="text-lg text-[#5F7F7A] mb-10 max-w-lg leading-relaxed">
            Sexual wellness is more than just physical health. It's about
            feeling confident, connected, and comfortable in your own body and
            relationships. We provide a safe, non-judgmental space to explore
            your concerns through our Ivade initiative.
          </p>
          <a
            href={createWhatsAppUrl(
              "Hello, I need information about a confidential sexual wellness consultation.",
            )}
            className="bg-[#1A1A1A] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-black transition-all shadow-xl shadow-black/10 inline-block"
          >
            Book consultation
          </a>
        </div>

        <div className="relative group max-w-md mx-auto lg:mr-0">
          <div className="absolute -inset-4 bg-[#B7C8A3] rounded-[2.5rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" />
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-white">
            <img
              src="/assets/porn-addiction-graphic.webp"
              alt="Porn addiction and sexual wellness graphic"
              loading="eager"
              decoding="async"
              className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
