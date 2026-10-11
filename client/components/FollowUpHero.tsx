export default function FollowUpHero() {
  return (
    <section className="pt-40 lg:pt-52 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl lg:text-7xl font-heading font-extrabold text-[#064F4B] leading-tight mb-8">
            Continue Your <br /> Journey to{" "}
            <span className="italic">Wellness</span>
          </h1>
          <p className="text-lg text-[#5F7F7A] mb-12 max-w-lg leading-relaxed font-medium">
            Consistent care is essential for lasting progress. Secure your next
            session with your therapist and stay on track with your mental
            health goals.
          </p>

          <div className="grid gap-6 border-t border-[#E2E8E6] pt-10 sm:grid-cols-3">
            {[
              ["Existing clients", "Use this page for follow-up sessions"],
              ["Clear pricing", "Review the payable amount before payment"],
              ["Scheduled online", "Joining details follow confirmation"],
            ].map(([title, description]) => (
              <div key={title}>
                <p className="font-extrabold text-[#0A7F7A]">{title}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#5F7F7A]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-full rounded-b-[2.5rem] border-[10px] border-[#E6F1E9] bg-[#E6F1E9] shadow-2xl">
            <img
              src="/assets/hero-therapist-professional.webp"
              alt="A practitioner ready to continue supporting existing clients"
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#064F4B]/65 via-transparent to-transparent" />
            <p className="absolute inset-x-6 bottom-7 text-center font-heading text-xl font-bold text-white drop-shadow">
              Continue with care that knows your journey
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
