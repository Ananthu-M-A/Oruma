import React from "react";
import { createWhatsAppUrl } from "../src/config/business";

export default function ActionBanner({
  title,
  buttonText,
  secondary = false,
  href,
}: any) {
  const defaultLink = createWhatsAppUrl(
    "Hello, I would like to know more about Oruma services.",
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div
        className={`${secondary ? "bg-[#F5F8F7]" : "bg-[#0A7F7A]"} rounded-[3rem] p-12 lg:p-20 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl shadow-[#064F4B]/5 border border-[#E2E8E6]`}
      >
        {/* Abstract shapes decor */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-end pr-10 opacity-10 hidden md:flex">
          <div className="flex gap-3 items-end">
            <div className="w-10 h-16 bg-white rounded-t-full" />
            <div className="w-10 h-28 bg-white rounded-t-full" />
            <div className="w-10 h-20 bg-white rounded-t-full" />
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <h2
            className={`text-3xl lg:text-5xl font-heading font-bold ${secondary ? "text-[#064F4B]" : "text-white"} leading-tight mb-10`}
          >
            {title}
          </h2>
          <a
            href={href || defaultLink}
            className={`${secondary ? "bg-[#0A7F7A] text-white" : "bg-[#064F4B] text-white"} px-10 py-4 rounded-full font-bold hover:shadow-2xl transition-all flex items-center justify-center md:justify-start gap-3 group text-lg active:scale-95`}
          >
            {buttonText}
            <span className="text-2xl group-hover:translate-x-2 transition-transform">
              ›
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
