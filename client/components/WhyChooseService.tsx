import React from "react";
import { LucideIcon } from "@site-builder/icons";

export default function WhyChooseService() {
  const benefits = [
    { title: "Confidential conversations", icon: "shield-check" },
    { title: "Published availability", icon: "clock" },
    { title: "Identified paid bookings", icon: "user-check" },
    { title: "Listen with empathy", icon: "heart" },
    { title: "Professional guidance", icon: "user-check" },
    { title: "Integrated healing", icon: "sparkles" },
  ];

  return (
    <section className="py-20 bg-[#F2C94C]/10 border-y border-[#F2C94C]/20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-heading font-extrabold text-[#064F4B] mb-16">
          Why choose Oruma?
        </h2>

        <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center gap-4 group"
            >
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#0A7F7A] shadow-lg group-hover:scale-110 transition-transform duration-300">
                <LucideIcon name={item.icon} size={32} />
              </div>
              <p className="text-sm font-bold text-[#064F4B] max-w-[120px] leading-tight">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
