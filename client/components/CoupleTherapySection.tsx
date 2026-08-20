import React from "react";
import { createWhatsAppUrl } from "../src/config/business";
import { LucideIcon } from "@site-builder/icons";

export default function CoupleTherapySection() {
  return (
    <section className="py-24 bg-[#F7F9F5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-[#A3B899] text-white px-6 py-2 rounded-full font-black text-xs mb-8 tracking-widest uppercase shadow-xl shadow-[#A3B899]/20">
            Ivade • Relationship Wellness
          </div>
          <h2 className="text-4xl lg:text-6xl font-heading font-black text-[#1A2E2C] mb-8 leading-tight uppercase tracking-tighter">
            Connect, <span className="text-[#A3B899]">Re-build,</span> <br />{" "}
            Bond Together.
          </h2>
          <p className="text-xl text-[#5F7F7A] font-medium leading-relaxed mb-12 italic max-w-3xl mx-auto">
            Couple therapy provides a safe, neutral space for partners to
            address conflicts, improve communication, and deepen their emotional
            connection. At ORUMA, through our Ivade initiative, we help you
            navigate the complexities of your relationship with expert guidance
            focused on long-term wellness.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 max-w-3xl mx-auto text-left">
            {[
              "Rebuild Trust and Safety",
              "Improve Communication Skills",
              "Resolve Chronic Conflicts",
              "Deepen Emotional Intimacy",
              "Pre-marital Counselling",
              "Relationship Maintenance",
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="w-2 h-2 bg-[#A3B899] rounded-full shrink-0" />
                <span className="text-sm font-bold text-[#3D4B49]">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <a
              href={createWhatsAppUrl(
                "Hello, I need information about couple counselling sessions.",
              )}
              className="inline-flex items-center gap-3 bg-[#1A1A1A] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#A3B899] transition-all duration-300 shadow-2xl shadow-black/10 active:scale-95"
            >
              Book a Session <LucideIcon name="arrow-right" size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
