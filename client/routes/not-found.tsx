import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";

const helpfulLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Find a practitioner", href: "/therapists" },
  { label: "Contact us", href: "/contact" },
];

export default function NotFoundPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8F5EF] font-body text-[#2E3E3C]">
      <Navbar />
      <section className="px-4 pb-24 pt-36 sm:px-6 md:pt-44">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#0A7F7A]">
            Error 404
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold text-[#064F4B] md:text-5xl">
            We couldn&apos;t find that page
          </h1>
          <p className="mt-6 text-lg font-medium leading-8 text-[#536D68]">
            The link may be out of date, or the page may have moved. These pages
            can help you find what you need.
          </p>
          <nav aria-label="Helpful links" className="mt-10 flex flex-wrap justify-center gap-3">
            {helpfulLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full border border-[#064F4B]/20 bg-white px-6 py-3 text-sm font-black text-[#064F4B] transition hover:border-[#0A7F7A]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </section>
      <FloatingActions />
      <Footer />
    </main>
  );
}
