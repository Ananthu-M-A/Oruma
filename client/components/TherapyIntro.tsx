export default function TherapyIntro() {
  return (
    <section className="bg-white pb-16 pt-28 md:pt-40">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="mx-auto mb-0 max-w-3xl text-center lg:mx-0 lg:text-left">
          <h1 className="text-4xl lg:text-6xl font-heading font-extrabold text-[#064F4B] mb-6 leading-tight">
            Why suffer alone when <br />
            <span className="italic text-[#0A7F7A]">there is a listener?</span>
          </h1>
          <p className="mb-10 text-lg font-medium text-[#5F7F7A]">
            Mental health is a priority, not a privilege. Take the first step
            towards healing with oruma.me.
          </p>
          <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
            <a
              href="/therapists"
              className="bg-[#064F4B] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#0A7F7A] transition-all shadow-xl shadow-[#064F4B]/20 flex items-center gap-3 active:scale-95"
            >
              Book Your Therapy
              <span className="w-2 h-2 bg-[#00D494] rounded-full shadow-[0_0_8px_#00D494]"></span>
            </a>
          </div>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-[2.5rem] border-8 border-[#F5F8F7] shadow-2xl shadow-[#064F4B]/10 lg:ml-auto">
          <img
            src="/assets/hero-therapist-professional.webp"
            alt="A practitioner in a warm, welcoming setting"
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#064F4B]/25 to-transparent" />
        </div>
      </div>
    </section>
  );
}
