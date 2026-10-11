import { LucideIcon } from "@site-builder/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";

const resources = [
  {
    title: "Articles & guides",
    description:
      "Read general educational resources about emotional wellbeing, relationships, stress, and self-care.",
    href: "/articles",
    icon: "brain",
    image: "/assets/depression-healing-support.webp",
    imageAlt: "A woman reflecting during a difficult time",
    color: "bg-[#EAF3F7]",
  },
  {
    title: "About Oruma",
    description:
      "Learn how Oruma’s online counselling and wellness services work, who operates the service, and how practitioner profiles are reviewed.",
    href: "/about",
    icon: "heart-handshake",
    image: "/assets/ranjini-r-founder-director.webp",
    imageAlt: "Ranjini R, Oruma's individual operator",
    color: "bg-[#F4F0E7]",
  },
  {
    title: "Join as a practitioner",
    description:
      "Review the practitioner application and profile verification process before contacting the team by email.",
    href: "/careers",
    icon: "briefcase",
    image: "/assets/hero-therapist-professional.webp",
    imageAlt: "A practitioner in a professional setting",
    color: "bg-[#FBEDE3]",
  },
  {
    title: "How booking works",
    description:
      "Understand appointment selection, payment, confirmation, joining details, cancellation, and refund steps.",
    href: "/service-delivery-policy",
    icon: "calendar-check",
    image: "/assets/home-lady-striped-shirt-v2.webp",
    imageAlt: "A woman enjoying a calm moment outdoors",
    color: "bg-[#EFF2D9]",
  },
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <section className="bg-[#F8F5EF] px-4 pb-16 pt-32 sm:px-6 md:pb-24 md:pt-40">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0A7F7A]">
            Learn about care and wellbeing
          </p>
          <h1 className="mt-4 font-heading text-5xl font-bold leading-tight text-[#064F4B] md:text-7xl">
            Oruma Resources
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-[#536D68]">
            Explore educational articles, learn how the service works, and find
            clear information before choosing your next step.
          </p>
        </div>
      </section>
      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2">
          {resources.map((resource) => (
            <a
              key={resource.title}
              href={resource.href}
              className={`${resource.color} group flex min-h-64 flex-col overflow-hidden rounded-[2rem] border border-[#064F4B]/5 transition hover:-translate-y-1 hover:shadow-xl`}
            >
              <div className="relative h-48 overflow-hidden sm:h-56">
                <img
                  src={resource.image}
                  alt={resource.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-[#064F4B]/35 to-transparent" />
                <span className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-[#0A7F7A] shadow-sm">
                  <LucideIcon name={resource.icon} size={25} />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-7 sm:p-9">
                <h2 className="font-heading text-3xl font-bold text-[#064F4B]">
                  {resource.title}
                </h2>
                <p className="mt-3 flex-1 text-base font-medium leading-7 text-[#536D68]">
                  {resource.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#064F4B]">
                  Explore <LucideIcon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
      <FloatingActions />
      <Footer />
    </main>
  );
}
