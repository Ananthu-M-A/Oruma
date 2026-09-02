import { LucideIcon } from "@site-builder/icons";
import { createWhatsAppUrl } from "../src/config/business";

const trustPoints = [
  { icon: "lock", label: "Confidential support" },
  { icon: "badge-check", label: "Verified profiles" },
  { icon: "video", label: "Online sessions" },
  { icon: "heart-handshake", label: "Gentle, respectful care" },
];

export default function HeroSection() {
  const whatsappLink = createWhatsAppUrl(
    "Hello, I would like help choosing and booking an Oruma psychologist.",
  );

  return (
    <section className="overflow-hidden bg-[#F8F5EF] px-4 pb-10 pt-20 sm:px-6 md:pb-14 md:pt-24">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#064F4B]/10 bg-white shadow-[0_24px_70px_rgba(6,79,75,0.12)] lg:grid lg:min-h-[620px] lg:grid-cols-[1.05fr_0.95fr] lg:rounded-[2.75rem]">
        <div className="relative flex flex-col justify-center overflow-hidden px-6 py-12 sm:px-10 md:px-14 lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-[#B7C8A3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-0 h-64 w-64 rounded-full bg-[#F2E5AE]/35 blur-3xl" />

          <div className="relative z-10">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#EAF4EF] px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#0A7F7A] sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-[#7F9B43]" />
              Online counselling &amp; wellness
            </p>
            <h1 className="max-w-2xl font-heading text-5xl font-bold leading-[0.98] tracking-[-0.035em] text-[#064F4B] sm:text-6xl lg:text-7xl">
              Healing starts here with <span className="text-[#7F9B43]">Oruma.</span>
            </h1>
            <p className="mt-6 font-heading text-xl font-semibold italic text-[#0A7F7A] sm:text-2xl">
              “You are safe now. Healing can begin.”
            </p>
            <p className="mt-4 max-w-xl text-base font-medium leading-7 text-[#4D6662] sm:text-lg">
              Compassionate support for relationships, families, parenting and
              emotional wellbeing—together, gently.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/therapists"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#064F4B] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#064F4B]/20 transition hover:-translate-y-0.5 hover:bg-[#0A7F7A]"
              >
                <LucideIcon name="search" size={18} />
                Find Your Psychologist
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[#064F4B]/25 bg-white px-6 py-4 text-sm font-black text-[#064F4B] transition hover:-translate-y-0.5 hover:border-[#0A7F7A] hover:bg-[#F5F8F7]"
              >
                <LucideIcon name="message-circle" size={18} />
                Chat on WhatsApp
              </a>
            </div>

            <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-[#064F4B]/10 pt-6 sm:grid-cols-4">
              {trustPoints.map((point) => (
                <div key={point.label} className="flex items-center gap-2">
                  <LucideIcon
                    name={point.icon}
                    size={16}
                    className="shrink-0 text-[#0A7F7A]"
                  />
                  <span className="text-[10px] font-bold leading-tight text-[#4D6662] sm:text-[11px]">
                    {point.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative min-h-[470px] overflow-hidden bg-[#D8E0D4] lg:min-h-full">
          <img
            src="/assets/professional-portrait.webp"
            alt="Oruma founder seated in the Oruma studio"
            width="666"
            height="1000"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#064F4B]/30 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/40 bg-white/90 p-4 shadow-xl backdrop-blur sm:bottom-8 sm:left-auto sm:right-8 sm:max-w-[245px] sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8EFCF] text-[#607D2E]">
                <LucideIcon name="heart" size={20} />
              </span>
              <p className="text-sm font-black leading-5 text-[#064F4B]">
                A space to heal, grow and reconnect.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
