import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BusinessIdentityDisclosure from "./BusinessIdentityDisclosure";

export type PolicySection = {
  title: string;
  body: string[];
};

const relatedPolicies = [
  ["Terms and Conditions", "/terms"],
  ["Privacy Policy", "/privacy-policy"],
  ["Refund Policy", "/refund-policy"],
  ["Cancellation Policy", "/cancellation-policy"],
  ["Service Delivery Policy", "/service-delivery-policy"],
];

export default function PolicyPage({
  title,
  introduction,
  effectiveDate,
  sections,
}: {
  title: string;
  introduction: string;
  effectiveDate: string;
  sections: PolicySection[];
}) {
  return (
    <main className="min-h-screen bg-[#F8FBF8] font-body text-[#2E3E3C]">
      <Navbar />
      <section className="bg-[#F5F8F7] px-6 pb-16 pt-36 md:pt-44">
        <div className="mx-auto max-w-4xl">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0A7F7A]">
            Legal
          </p>
          <h1 className="mt-4 text-4xl font-heading font-black leading-tight text-[#064F4B] md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg font-medium leading-relaxed text-[#5F7F7A]">
            {introduction}
          </p>
          <p className="mt-6 text-sm font-bold text-[#064F4B]">
            Effective date: {effectiveDate}
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-4xl gap-6">
          <BusinessIdentityDisclosure />
          <aside className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm font-medium leading-relaxed text-amber-950">
            <p>
              Oruma is not an emergency service. For immediate danger, self-harm
              risk, or a medical emergency, contact local emergency services or
              a nearby hospital.
            </p>
            <p className="mt-3">
              Every practitioner is responsible for professional judgment,
              scope, session delivery, and applicable professional records;
              Oruma provides booking, payment, communication, and operational
              support.
            </p>
          </aside>
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-lg border border-[#E2E8E6] bg-white p-6 shadow-sm md:p-8"
            >
              <h2 className="text-2xl font-heading font-black text-[#064F4B]">
                {section.title}
              </h2>
              <div className="mt-5 grid gap-3">
                {section.body.map((item) => (
                  <p
                    key={item}
                    className="text-base font-medium leading-relaxed text-[#5F7F7A]"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </article>
          ))}
          <nav
            aria-label="Related policies"
            className="rounded-lg border border-[#DDE8E5] bg-[#F5F8F7] p-6"
          >
            <h2 className="font-heading text-xl font-black text-[#064F4B]">
              Related policies
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {relatedPolicies
                .filter(([label]) => label !== title)
                .map(([label, href]) => (
                  <Link
                    key={href}
                    to={href}
                    className="rounded-full border border-[#0A7F7A]/20 bg-white px-4 py-2 text-sm font-bold text-[#064F4B]"
                  >
                    {label}
                  </Link>
                ))}
            </div>
          </nav>
        </div>
      </section>
      <Footer />
    </main>
  );
}
