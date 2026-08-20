import React from "react";
import {
  businessAddress,
  businessConfig,
  businessLinks,
  ownershipDisclosure,
} from "../src/config/business";

export default function BusinessIdentityDisclosure({
  compact = false,
  dark = false,
}: {
  compact?: boolean;
  dark?: boolean;
}) {
  const muted = dark ? "text-white/75" : "text-[#5F7F7A]";
  const link = dark
    ? "font-bold text-white underline decoration-white/30 underline-offset-4"
    : "font-bold text-[#064F4B] underline decoration-[#0A7F7A]/30 underline-offset-4";

  return (
    <section
      aria-label="Business ownership and contact information"
      className={
        compact
          ? "space-y-2"
          : "rounded-[1.5rem] border border-[#DDE8E5] bg-white p-6 shadow-sm md:p-8"
      }
    >
      <p
        className={`font-bold leading-relaxed ${dark ? "text-white" : "text-[#064F4B]"}`}
      >
        {ownershipDisclosure}
      </p>
      <address className={`not-italic leading-relaxed ${muted}`}>
        {businessAddress}
      </address>
      <p className={`flex flex-wrap gap-x-4 gap-y-2 ${muted}`}>
        <a className={link} href={businessLinks.supportEmail}>
          {businessConfig.emails.support}
        </a>
        <a className={link} href={businessLinks.supportPhone}>
          {businessConfig.supportPhone.display}
        </a>
      </p>
      {businessConfig.gstin && (
        <p className={muted}>GSTIN: {businessConfig.gstin}</p>
      )}
    </section>
  );
}
