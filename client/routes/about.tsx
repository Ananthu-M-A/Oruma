import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";
import BusinessIdentityDisclosure from "../components/BusinessIdentityDisclosure";
import { businessConfig } from "../src/config/business";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <FloatingActions />
      <section className="bg-[#F5F8F7] pb-20 pt-40 text-center md:pt-48">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#0A7F7A]">
            Ownership and service model
          </p>
          <h1 className="mt-5 text-4xl font-heading font-extrabold leading-tight text-[#064F4B] lg:text-6xl">
            About {businessConfig.brandName}
          </h1>
          <p className="mx-auto mt-7 max-w-3xl text-xl leading-relaxed text-[#5F7F7A]">
            {businessConfig.brandName} is an individual-owned online counselling
            and wellness service. The website helps customers review verified
            practitioner profiles, book available sessions, pay online, and
            receive digital joining instructions and support.
          </p>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <article className="rounded-[2rem] bg-[#064F4B] p-8 text-white md:p-10">
            <p className="text-xs font-black uppercase tracking-widest text-[#B7C8A3]">
              Individual operator
            </p>
            <h2 className="mt-4 text-4xl font-heading font-black">
              {businessConfig.operatorLegalName}
            </h2>
            <p className="mt-5 font-medium leading-relaxed text-white/75">
              Website operator and owner of the {businessConfig.brandName}{" "}
              brand. No professional healthcare qualification or separate
              legal-entity status is claimed here.
            </p>
          </article>
          <article className="rounded-[2rem] border border-[#DDE8E5] bg-[#F5F8F7] p-8 md:p-10">
            <p className="text-xs font-black uppercase tracking-widest text-[#0A7F7A]">
              What Oruma does
            </p>
            <h2 className="mt-4 text-3xl font-heading font-black text-[#064F4B]">
              Digital service coordination
            </h2>
            <p className="mt-5 font-medium leading-relaxed text-[#5F7F7A]">
              Oruma coordinates practitioner discovery, booking, payment,
              appointment confirmation, joining instructions, and customer
              support. Each practitioner profile identifies the person's
              verified role, qualifications, scope, fees, duration, and
              relationship with Oruma.
            </p>
          </article>
        </div>
        <div className="mx-auto mt-8 max-w-5xl">
          <BusinessIdentityDisclosure />
          <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-bold leading-relaxed text-amber-950">
            Oruma is not an emergency service. For immediate danger, self-harm
            risk, or a medical emergency, contact local emergency services or a
            nearby hospital.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
