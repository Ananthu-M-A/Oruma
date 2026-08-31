import React from "react";
import { LucideIcon } from "@site-builder/icons";
import BusinessIdentityDisclosure from "./BusinessIdentityDisclosure";
import {
  businessConfig,
  businessLinks,
  createWhatsAppUrl,
} from "../src/config/business";

export default function ContactSection() {
  const whatsappLink = createWhatsAppUrl(
    "Hello, I need help with Oruma services or a booking.",
  );

  return (
    <section id="contact" className="scroll-mt-24 bg-[#F5F8F7] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="overflow-hidden rounded-[3rem] bg-white shadow-2xl lg:flex">
          <div className="flex flex-col justify-between bg-[#064F4B] p-10 text-white md:p-16 lg:w-2/5">
            <div>
              <h2 className="text-3xl font-heading font-black">
                Official contact details
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-[#B7C8A3]">
                Use these channels for service, practitioner, booking, payment,
                cancellation, and refund support. They are not emergency
                services.
              </p>
              <dl className="mt-10 space-y-7">
                <ContactItem icon="mail" label="Customer support">
                  <a href={businessLinks.supportEmail}>
                    {businessConfig.emails.support}
                  </a>
                </ContactItem>
                <ContactItem icon="phone" label="Phone and WhatsApp">
                  <a href={businessLinks.supportPhone}>
                    {businessConfig.supportPhone.display}
                  </a>
                </ContactItem>
                <ContactItem icon="map-pin" label="Operating address">
                  <address className="not-italic">
                    {businessConfig.address.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </ContactItem>
              </dl>
            </div>
          </div>

          <div className="p-10 md:p-16 lg:w-3/5">
            <h2 className="text-3xl font-heading font-black text-[#064F4B]">
              How support works
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#5F7F7A]">
              General enquiries can begin without describing a personal concern.
              Identified bookings require contact, appointment, and payment
              details. Confidentiality is protected through limited access, but
              complete anonymity is not promised. Practitioner profiles are
              reviewed before Oruma makes them public.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#0A7F7A] px-7 py-4 font-black text-white"
              >
                <LucideIcon name="message-square" size={22} />
                WhatsApp support
              </a>
              <a
                href="/therapists"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-[#0A7F7A]/20 px-7 py-4 font-black text-[#064F4B]"
              >
                Browse and book online
              </a>
            </div>
            <div className="mt-9">
              <BusinessIdentityDisclosure />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactItem({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#B7C8A3]">
        <LucideIcon name={icon} size={22} />
      </span>
      <div>
        <dt className="text-xs font-black uppercase tracking-widest text-[#B7C8A3]">
          {label}
        </dt>
        <dd className="mt-1 font-bold leading-relaxed text-white">
          {children}
        </dd>
      </div>
    </div>
  );
}
