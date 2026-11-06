import { useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import FloatingActions from "../../components/FloatingActions";
import ServiceScopeNotice from "../../components/ServiceScopeNotice";
import TherapistGrid from "../../components/TherapistGrid";
import { LucideIcon } from "@site-builder/icons";
import {
  createPageSupportEmailUrl,
  createPageWhatsAppUrl,
  publicContact,
} from "../../src/config/business";
import {
  findSeoService,
  onlineSessionSteps,
  serviceLinkLabels,
} from "../../src/content/seoServices";
import { trackEvent } from "../../src/lib/analytics";
import NotFoundPage from "../not-found";

const policyLinks = [
  { label: "Service delivery policy", href: "/service-delivery-policy" },
  { label: "Cancellation policy", href: "/cancellation-policy" },
  { label: "Refund policy", href: "/refund-policy" },
  { label: "Privacy policy", href: "/privacy-policy" },
];

export default function SeoServicePage({ slug }: { slug: string }) {
  const { pathname } = useLocation();
  const service = findSeoService(slug);
  if (!service) return <NotFoundPage />;

  const request = `${service.enquiryTopic}: suitable practitioners, their session fee, next available time, and how a first session works`;
  const emailLink = createPageSupportEmailUrl(pathname, request);
  const whatsappLink = createPageWhatsAppUrl(pathname, request);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <ServiceScopeNotice />

      <section className="relative overflow-hidden bg-[#F8F5EF] px-4 py-16 sm:px-6 md:py-24">
        <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#B7C8A3]/25 blur-3xl" />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs font-bold text-[#5F7773]">
              <a href="/" className="hover:text-[#0A7F7A]">Home</a>
              <span className="mx-2">/</span>
              <a href="/services" className="hover:text-[#0A7F7A]">Services</a>
              <span className="mx-2">/</span>
              <span aria-current="page">{service.navLabel}</span>
            </nav>
            <span className="mt-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E5ECCE] text-[#607D2E] shadow-sm">
              <LucideIcon name={service.icon} size={31} />
            </span>
            <p className="mt-7 text-xs font-black uppercase tracking-[0.24em] text-[#0A7F7A]">
              {service.eyebrow}
            </p>
            <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-[#064F4B] sm:text-5xl md:text-6xl">
              {service.title}
            </h1>
            {service.introduction.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-6 max-w-2xl text-lg font-medium leading-8 text-[#536D68]"
              >
                {paragraph}
              </p>
            ))}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#practitioners"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#064F4B] px-8 py-4 text-sm font-black text-white transition hover:bg-[#0A7F7A]"
              >
                <LucideIcon name="calendar-check" size={17} /> Book a session
              </a>
              {publicContact.whatsapp ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("whatsapp_click", { page_path: pathname })}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#064F4B]/25 bg-white px-8 py-4 text-sm font-black text-[#064F4B] transition hover:border-[#0A7F7A]"
                >
                  <LucideIcon name="message-circle" size={17} /> WhatsApp us
                </a>
              ) : null}
              <a
                href={emailLink}
                onClick={() => trackEvent("email_click", { page_path: pathname })}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#064F4B]/25 bg-white px-8 py-4 text-sm font-black text-[#064F4B] transition hover:border-[#0A7F7A]"
              >
                <LucideIcon name="mail" size={17} /> Email us
              </a>
            </div>
          </div>
          <div className="relative min-h-[300px] overflow-hidden rounded-[2rem] border-8 border-white shadow-2xl shadow-[#064F4B]/10 sm:min-h-[420px] lg:min-h-[500px]">
            <img
              src={service.heroImage}
              alt={service.heroImageAlt}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-[#DDE6E2] p-7 sm:p-10">
            <h2 className="font-heading text-3xl font-bold text-[#064F4B] md:text-4xl">
              Who it can help
            </h2>
            <ul className="mt-7 space-y-3">
              {service.whoFor.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-bold leading-6 text-[#375651]">
                  <LucideIcon name="check-circle" size={18} className="mt-0.5 shrink-0 text-[#7F9B43]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[2rem] border border-[#DDE6E2] p-7 sm:p-10">
            <h2 className="font-heading text-3xl font-bold text-[#064F4B] md:text-4xl">
              What you can talk about
            </h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {service.topics.map((topic) => (
                <p key={topic} className="rounded-2xl bg-[#F5F8F7] p-4 text-sm font-bold leading-6 text-[#375651]">
                  {topic}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F8F5EF] px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-4xl space-y-12">
          {service.sections.map((section) => (
            <article key={section.heading}>
              <h2 className="font-heading text-3xl font-bold text-[#064F4B] md:text-4xl">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-5 text-base font-medium leading-8 text-[#536D68] md:text-lg">
                  {paragraph}
                </p>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-[#064F4B] p-7 text-white sm:p-12">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">
            How online sessions work
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {onlineSessionSteps.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-black text-[#B7C8A3]">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm font-semibold leading-6 text-white/85">{step}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 flex gap-3 rounded-2xl border border-white/15 bg-white/5 p-5 text-sm font-medium leading-6 text-white/75">
            <LucideIcon name="info" size={19} className="mt-0.5 shrink-0 text-[#B7C8A3]" />
            {service.note}
          </p>
        </div>
      </section>

      <section id="practitioners" className="scroll-mt-28 bg-[#F4F7F4] px-4 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0A7F7A]">
              Available practitioners
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-[#064F4B] md:text-4xl">
              Book {service.navLabel.toLowerCase()}
            </h2>
            <p className="mt-4 font-medium leading-7 text-[#5F7773]">
              Review each practitioner&apos;s qualifications, professional scope,
              languages, fee and next available slot before booking.
            </p>
          </div>
          <TherapistGrid
            specialtyAreas={service.specialtyAreas}
            maxItems={6}
            emptyTitle={`No ${service.navLabel.toLowerCase()} practitioners are listed right now.`}
            emptyDescription="Message us on WhatsApp or by email and we'll help you find a suitable practitioner."
          />
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-heading text-3xl font-bold text-[#064F4B] md:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-4">
            {service.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-3xl border border-[#E2E8E6] p-6 open:border-[#B7C8A3] open:bg-[#F5F8F7]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-lg font-bold text-[#064F4B]">
                  {faq.question}
                  <LucideIcon name="chevron-down" size={20} className="shrink-0 transition group-open:rotate-180" />
                </summary>
                <p className="mt-4 font-medium leading-7 text-[#536D68]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8F5EF] px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl font-bold text-[#064F4B]">Related services</h2>
            <ul className="mt-5 flex flex-wrap gap-3">
              {service.related.map((path) => (
                <li key={path}>
                  <a
                    href={path}
                    className="inline-block rounded-full border border-[#064F4B]/20 bg-white px-5 py-2.5 text-sm font-black text-[#064F4B] hover:border-[#0A7F7A]"
                  >
                    {serviceLinkLabels[path] ?? path}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-[#064F4B]">Before you book</h2>
            <ul className="mt-5 flex flex-wrap gap-3">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm font-bold text-[#0A7F7A] underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <FloatingActions />
      <Footer />
    </main>
  );
}
