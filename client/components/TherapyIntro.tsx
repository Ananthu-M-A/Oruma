import React from "react";
import { createWhatsAppUrl } from "../src/config/business";
import { LucideIcon } from "@site-builder/icons";

export default function TherapyIntro() {
  const whatsappLink = createWhatsAppUrl(
    "Hello, I need help booking an Oruma counselling or wellness session.",
  );

  return (
    <section className="pt-28 md:pt-40 pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl lg:text-6xl font-heading font-extrabold text-[#064F4B] mb-6 leading-tight">
            Why suffer alone when <br />
            <span className="italic text-[#0A7F7A]">there is a listener?</span>
          </h1>
          <p className="text-lg text-[#5F7F7A] font-medium mb-10">
            Mental health is a priority, not a privilege. Take the first step
            towards healing with oruma.me.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={whatsappLink}
              className="bg-[#064F4B] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#0A7F7A] transition-all shadow-xl shadow-[#064F4B]/20 flex items-center gap-3 active:scale-95"
            >
              Book Your Therapy
              <span className="w-2 h-2 bg-[#00D494] rounded-full shadow-[0_0_8px_#00D494]"></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
