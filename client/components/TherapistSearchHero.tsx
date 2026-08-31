import React from "react";
import { LucideIcon } from "@site-builder/icons";

export default function TherapistSearchHero() {
  const categories = [
    {
      name: "Individual counselling",
      icon: "message-square",
      color: "bg-[#0A7F7A]/10",
    },
    { name: "Sexual Wellness", icon: "heart", color: "bg-[#B7C8A3]/20" },
    {
      name: "Profile-verified practitioners",
      icon: "user",
      color: "bg-[#0A7F7A]/10",
    },
  ];

  return (
    <section className="pt-32 pb-16 bg-[#F5F8F7]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <div className="inline-block bg-[#B7C8A3]/30 text-[#064F4B] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            Expert Network
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-[#064F4B] mb-6 leading-tight">
            Find the right <br />
            <span className="text-[#0A7F7A] italic">Therapist</span> for you
          </h1>
          <p className="text-lg text-[#5F7F7A] font-medium leading-relaxed mb-12">
            Review each practitioner&apos;s verified role, qualifications, areas
            of practice, availability, and fee before requesting a booking.
          </p>

          <div className="grid grid-cols-1 gap-8 border-y border-[#0A7F7A]/10 py-10 sm:grid-cols-3">
            {[
              "Verified profile details",
              "Published availability",
              "Upfront fee and duration",
            ].map((item) => (
              <p key={item} className="text-sm font-black text-[#0A7F7A]">
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-black text-[#064F4B] mb-12">
            How can we support you today?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div
                  className={`w-20 h-20 ${cat.color} rounded-[2rem] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#0A7F7A] group-hover:text-white transition-all duration-300 shadow-sm shadow-[#0A7F7A]/5`}
                >
                  <LucideIcon
                    name={cat.icon}
                    size={32}
                    className="transition-colors"
                  />
                </div>
                <p className="text-sm font-bold text-[#064F4B] max-w-[120px] leading-tight group-hover:text-[#0A7F7A] transition-colors">
                  {cat.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
