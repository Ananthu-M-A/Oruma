import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";
import ContactSection from "../components/ContactSection";
import ContactForm from "../components/ContactForm";
import { businessConfig, googleBusinessProfile } from "../src/config/business";

export default function ContactPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <FloatingActions />
      <section className="bg-[#F5F8F7] px-6 pb-10 pt-36 text-center md:pt-44">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#0A7F7A]">
            Official business contact
          </p>
          <h1 className="mt-5 text-5xl font-heading font-black leading-tight text-[#064F4B] md:text-7xl">
            Contact {businessConfig.brandName}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl font-medium leading-relaxed text-[#5F7F7A]">
            Get help selecting a service or practitioner, tracing a booking or
            payment, receiving joining instructions, or requesting a
            cancellation or refund.
          </p>
        </div>
      </section>

      <section id="contact-form" className="scroll-mt-24 bg-[#F5F8F7] px-4 pb-4 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-[2.5rem] bg-white p-7 shadow-2xl shadow-[#064F4B]/10 sm:p-12">
          <ContactForm />
        </div>
      </section>

      <ContactSection />

      {googleBusinessProfile.mapEmbedUrl ? (
        <section className="bg-[#F5F8F7] px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border-8 border-white shadow-xl">
            <iframe
              src={googleBusinessProfile.mapEmbedUrl}
              title={`${businessConfig.brandName} on Google Maps`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[360px] w-full border-0"
            />
          </div>
        </section>
      ) : null}

      <Footer />
    </main>
  );
}
