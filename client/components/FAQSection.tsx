import React, { useState } from "react";
import { LucideIcon } from "@site-builder/icons";

export default function FAQSection() {
  const faqs = [
    {
      q: "What is online counselling, and how does it work?",
      a: "Online counselling is a professional therapy session conducted via video, voice call, or messaging, providing flexible and confidential support from your preferred space.",
    },
    {
      q: "What types of issues can I address through online counselling?",
      a: "You can address a wide range of issues including anxiety, depression, relationship problems, stress management, career concerns, and personal growth.",
    },
    {
      q: "How is information handled during an online session?",
      a: "Oruma limits access to booking and session information and explains its practices in the Privacy Policy. No online service can promise absolute security or complete anonymity.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-heading font-bold text-[#064F4B] mb-16 text-center">
          Any Questions?
        </h2>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-3xl border ${activeIndex === index ? "border-[#B7C8A3] bg-[#F5F8F7]" : "border-[#E2E8E6]"} transition-all mb-4`}
            >
              <button
                onClick={() =>
                  setActiveIndex(activeIndex === index ? null : index)
                }
                className="w-full px-8 py-8 flex justify-between items-center text-left transition-colors group"
              >
                <span className="text-lg font-bold text-[#2E3E3C] group-hover:text-[#0A7F7A]">
                  {faq.q}
                </span>
                <LucideIcon
                  name="plus"
                  size={24}
                  className={`text-[#B7C8A3] transition-transform duration-500 ${activeIndex === index ? "rotate-45" : ""}`}
                />
              </button>
              {activeIndex === index && (
                <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[#5F7F7A] leading-relaxed text-base border-t border-[#E2E8E6] pt-6">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
