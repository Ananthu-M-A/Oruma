import { LucideIcon } from "@site-builder/icons";

export default function CoupleTherapyVideo() {
  // Updated main image with the new user-provided photo (represented by a high-quality relevant image)
  const mainImage =
    "https://images.unsplash.com/photo-1571771894806-9668f47e6666?auto=format&fit=crop&q=80&w=1200";

  return (
    <section className="py-24 bg-[#F7F9F5] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#A3B899]/5 -skew-x-12 transform translate-x-1/2" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#064F4B]/5 rounded-full blur-3xl opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-3 bg-[#064F4B] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="w-2 h-2 bg-[#A3B899] rounded-full animate-pulse" />
              Ivade • Couple Therapy & Relationship Wellness
            </div>

            <h2 className="text-4xl lg:text-6xl font-heading font-black text-[#1A1A1A] leading-tight uppercase tracking-tighter">
              Connect, <span className="text-[#A3B899]">Re-build,</span> <br />
              Bond Together.
            </h2>

            <p className="text-xl text-[#5F7F7A] font-medium leading-relaxed max-w-xl">
              Couple therapy provides a safe, neutral space for partners to
              address conflicts, improve communication, and deepen their
              emotional connection. Through our Ivade initiative, we help you
              navigate relationship complexities with expert guidance.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100",
                  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
                  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100",
                ].map((url, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full border-4 border-[#F7F9F5] overflow-hidden bg-gray-200"
                  >
                    <img
                      src={url}
                      alt="Therapist avatar"
                      width="100"
                      height="100"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[#064F4B] font-black uppercase text-[10px] tracking-widest mb-1">
                  Online relationship support
                </p>
                <p className="text-[#5F7F7A] text-xs font-bold uppercase tracking-tighter">
                  Guiding Partners to Harmony
                </p>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="/services/couple-therapy"
                className="inline-flex items-center gap-2 text-[#0A7F7A] font-black uppercase tracking-widest text-xs hover:underline group"
              >
                Learn more about Ivade Couple Therapy
                <LucideIcon
                  name="arrow-right"
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
            </div>
          </div>

          <div className="relative group flex flex-col gap-6">
            {/* Design accents for the image frame */}
            <div className="absolute -inset-4 bg-[#A3B899] rounded-[4rem] opacity-20 blur-2xl transform rotate-3 transition-transform group-hover:rotate-1 duration-700"></div>

            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white transition-transform duration-500 group-hover:scale-[1.02]">
              <img
                src={mainImage}
                alt="Ivade Relationship Wellness - Connecting Together"
                loading="lazy"
                decoding="async"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-50 hidden md:block max-w-[240px] animate-float z-20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#A3B899]/20 rounded-full flex items-center justify-center text-[#064F4B]">
                  <LucideIcon name="heart" size={20} className="fill-current" />
                </div>
                <p className="text-[#064F4B] font-black text-[10px] uppercase tracking-widest">
                  Ivade Wellness
                </p>
              </div>
              <p className="text-[#1A1A1A] font-bold text-xs leading-relaxed">
                Expert relationship counseling to transform your bond and
                overall well-being.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `,
        }}
      />
    </section>
  );
}
