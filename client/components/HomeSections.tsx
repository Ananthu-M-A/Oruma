import React from "react";
import { LucideIcon } from "@site-builder/icons";
import { createWhatsAppUrl } from "../src/config/business";

const supportPathways = [
  {
    title: "Relationship & Marriage",
    description: "Connection, communication, trust and emotional distance",
    icon: "heart-handshake",
    href: "/concerns/all-concerns#relationship",
    color: "bg-[#F4F0E7]",
  },
  {
    title: "Parenting & Family",
    description: "Parenting, child behaviour and family relationships",
    icon: "users",
    href: "/services/parenting-support",
    color: "bg-[#FBEDE3]",
  },
  {
    title: "Child & Teen",
    description: "Teen concerns, behaviour, academic stress and peer issues",
    icon: "user-round-check",
    href: "/services/child-teen-counselling",
    color: "bg-[#F1ECF7]",
  },
  {
    title: "Emotional Wellbeing",
    description: "Anxiety, stress, self-esteem and life transitions",
    icon: "brain",
    href: "/concerns/all-concerns#anxiety",
    color: "bg-[#EAF3F7]",
  },
];

const services = [
  {
    title: "Individual Therapy",
    icon: "user",
    href: "/services/individual-therapy",
  },
  {
    title: "Couple Therapy",
    icon: "heart-handshake",
    href: "/services/couple-therapy",
  },
  {
    title: "Parenting Support",
    icon: "users",
    href: "/services/parenting-support",
  },
  {
    title: "Child & Teen Counselling",
    icon: "user-round-check",
    href: "/services/child-teen-counselling",
  },
  {
    title: "Family Counselling",
    icon: "heart",
    href: "/services/family-counselling",
  },
  {
    title: "Postpartum Support",
    icon: "baby",
    href: "/services/postpartum-support",
  },
  {
    title: "Sexual Wellness",
    icon: "sparkles",
    href: "/services/sexual-wellness",
  },
];

const concerns = [
  { title: "Relationship Issues", href: "/concerns/all-concerns#relationship" },
  { title: "Breakup Recovery", href: "/concerns/all-concerns#breakup" },
  { title: "Anxiety & Stress", href: "/concerns/all-concerns#anxiety" },
  { title: "Parenting Challenges", href: "/services/parenting-support" },
  { title: "Teenage Concerns", href: "/concerns/all-concerns#student" },
  { title: "Trauma & PTSD", href: "/concerns/all-concerns#trauma" },
  { title: "Emotional Wellbeing", href: "/concerns/all-concerns#depression" },
];

const programs = [
  {
    eyebrow: "Learn with Oruma",
    title: "Oruma Courses",
    description:
      "Structured psychology-based learning created to support practical, lasting growth.",
    action: "Explore Courses",
    href: "/programs#courses",
    icon: "graduation-cap",
    color: "bg-[#EFF2D9]",
  },
  {
    eyebrow: "Meet in person",
    title: "Offline Workshops",
    description:
      "Thoughtful group experiences designed for learning, reflection and connection.",
    action: "View Workshops",
    href: "/programs#workshops",
    icon: "users",
    color: "bg-[#FAE8DE]",
  },
  {
    eyebrow: "Join from anywhere",
    title: "Webinars & Events",
    description:
      "Live online conversations and expert-led sessions from the Oruma community.",
    action: "Explore Webinars",
    href: "/programs#webinars",
    icon: "video",
    color: "bg-[#EEE9F7]",
  },
];

const testimonials = [
  {
    quote:
      "Oruma helped us understand each other after years of misunderstandings. It changed our relationship completely.",
    source: "Couple counselling client",
  },
  {
    quote:
      "My teenager was going through a very difficult phase. The support we received made a huge difference.",
    source: "Parent",
  },
  {
    quote:
      "The sessions gave me clarity, confidence and emotional strength. I feel like a new me.",
    source: "Individual therapy client",
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
      {eyebrow ? (
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-[#0A7F7A] sm:text-xs">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-heading text-3xl font-bold leading-tight text-[#064F4B] sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-[#5F7773] md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function SupportPathways() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title="What brings you here today?"
          description="Choose the area where you need support. We’ll help you find a gentle next step."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {supportPathways.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className={`${item.color} group flex min-h-[250px] flex-col rounded-[1.75rem] border border-[#064F4B]/5 p-6 text-center transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#064F4B]/10 sm:p-7`}
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#064F4B]/15 bg-white/80 text-[#0A7F7A]">
                <LucideIcon name={item.icon} size={27} />
              </span>
              <h3 className="mt-5 font-heading text-2xl font-bold leading-7 text-[#123E3A]">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 text-sm font-medium leading-6 text-[#5F7773]">
                {item.description}
              </p>
              <span className="mt-5 inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-[#0A7F7A]">
                Explore <LucideIcon name="arrow-right" size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>

        <div className="mx-auto mt-7 flex max-w-4xl flex-col items-start gap-5 rounded-[1.75rem] border border-[#B7C8A3]/35 bg-[#F7F6F0] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E3E9D1] text-[#607D2E]">
              <LucideIcon name="circle-help" size={25} />
            </span>
            <div>
              <h3 className="text-lg font-black text-[#064F4B]">
                Not sure which psychologist is right for you?
              </h3>
              <p className="mt-1 max-w-xl text-sm font-medium leading-6 text-[#5F7773]">
                Tell us what you’re going through. We’ll help you find the right support.
              </p>
            </div>
          </div>
          <a
            href="/find-your-psychologist"
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#064F4B] px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#0A7F7A] sm:w-auto"
          >
            Get Started <LucideIcon name="arrow-right" size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

export function OrumaIntroductionVideo() {
  const points = [
    "Compassionate, practitioner-led support",
    "Personalised care for your needs",
    "Evidence-informed approaches",
    "A community that understands",
  ];

  return (
    <section className="bg-[#F8F5EF] px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0A7F7A] sm:text-xs">
            Our story
          </p>
          <h2 className="mt-3 font-heading text-4xl font-bold text-[#064F4B] md:text-5xl">
            A Little About Oruma
          </h2>
          <p className="mt-5 max-w-lg text-base font-medium leading-7 text-[#5F7773]">
            Watch this short introduction to understand how Oruma can support you on your healing journey.
          </p>
          <ul className="mt-7 space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm font-bold text-[#375651]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#DDE7C3] text-[#607D2E]">
                  <LucideIcon name="check-circle" size={15} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-[1.75rem] border-8 border-white bg-[#064F4B] shadow-2xl shadow-[#064F4B]/15 sm:rounded-[2.25rem]">
          <iframe
            className="absolute inset-0 h-full w-full"
            src="https://www.youtube.com/embed/R9m-SGecnVc?rel=0&modestbranding=1"
            title="A little about Oruma"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

export function CounsellingServices() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Ways we can support you"
          title="Our Counselling Services"
          description="Explore focused support and open a detailed service page before choosing a psychologist."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {services.map((service) => (
            <a
              key={service.title}
              href={service.href}
              className="group flex min-h-[175px] flex-col items-center justify-center rounded-[1.5rem] border border-[#DDE6E2] bg-white px-3 py-6 text-center transition hover:-translate-y-1 hover:border-[#0A7F7A]/30 hover:bg-[#F7FAF8] hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF4EF] text-[#0A7F7A] transition group-hover:bg-[#064F4B] group-hover:text-white">
                <LucideIcon name={service.icon} size={24} />
              </span>
              <h3 className="mt-4 text-sm font-black leading-5 text-[#123E3A]">
                {service.title}
              </h3>
              <LucideIcon name="arrow-right" size={15} className="mt-3 text-[#7F9B43] transition-transform group-hover:translate-x-1" />
            </a>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a
            href="/services"
            className="inline-flex items-center gap-2 rounded-full border border-[#064F4B]/25 px-7 py-3.5 text-sm font-black text-[#064F4B] transition hover:bg-[#064F4B] hover:text-white"
          >
            View All Services <LucideIcon name="arrow-right" size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

export function CommonConcerns() {
  return (
    <section className="bg-[#F4F7F4] px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="You don’t have to name it perfectly"
          title="Common Concerns We Help With"
          description="Start with what feels closest to your experience and learn more at your own pace."
        />
        <div className="flex flex-wrap justify-center gap-3">
          {concerns.map((concern, index) => (
            <a
              key={concern.title}
              href={concern.href}
              className="group inline-flex min-h-16 w-full items-center justify-between rounded-2xl border border-[#064F4B]/10 bg-white px-5 py-4 font-black text-[#31534E] shadow-sm transition hover:-translate-y-0.5 hover:border-[#0A7F7A]/35 hover:text-[#0A7F7A] sm:w-[calc(50%-0.375rem)] lg:w-[calc(25%-0.75rem)]"
            >
              <span className="flex items-center gap-3">
                <span className="text-xs font-black text-[#A0B374]">0{index + 1}</span>
                {concern.title}
              </span>
              <LucideIcon name="chevron-right" size={17} className="transition-transform group-hover:translate-x-1" />
            </a>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a
            href="/concerns"
            className="inline-flex items-center gap-2 rounded-full border border-[#064F4B]/25 bg-white px-7 py-3.5 text-sm font-black text-[#064F4B] transition hover:bg-[#064F4B] hover:text-white"
          >
            Explore All Concerns <LucideIcon name="arrow-right" size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

export function ProgramsSection() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Beyond one-to-one counselling"
          title="Learn. Grow. Transform."
          description="Courses, offline workshops and live events created and hosted by Oruma."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {programs.map((program) => (
            <a
              key={program.title}
              id={program.title === "Oruma Courses" ? "courses-home" : undefined}
              href={program.href}
              className={`${program.color} group flex min-h-[290px] flex-col rounded-[2rem] border border-[#064F4B]/5 p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#064F4B]/10 sm:p-8`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-[#064F4B] shadow-sm">
                  <LucideIcon name={program.icon} size={27} />
                </span>
                <LucideIcon name="arrow-right" size={20} className="text-[#064F4B] transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#0A7F7A]">
                {program.eyebrow}
              </p>
              <h3 className="mt-2 font-heading text-3xl font-bold text-[#064F4B]">
                {program.title}
              </h3>
              <p className="mt-3 flex-1 text-sm font-medium leading-6 text-[#506A65]">
                {program.description}
              </p>
              <span className="mt-6 text-sm font-black text-[#064F4B] underline decoration-[#7F9B43] decoration-2 underline-offset-4">
                {program.action}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-[#F8F5EF] px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Shared with care"
          title="What People Say About Oruma"
          description="Client feedback is shown without names or identifying details to protect privacy."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.source}
              className="flex min-h-[245px] flex-col rounded-[1.75rem] border border-[#064F4B]/10 bg-white p-7 shadow-sm sm:p-8"
            >
              <span className="font-heading text-6xl leading-none text-[#A0B374]">“</span>
              <blockquote className="-mt-2 flex-1 text-base font-semibold leading-7 text-[#31534E]">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-[#064F4B]/10 pt-4 text-xs font-black uppercase tracking-[0.16em] text-[#0A7F7A]">
                — {testimonial.source}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalBookingSection() {
  const whatsappLink = createWhatsAppUrl(
    "Hello, I would like to begin my healing journey with Oruma.",
  );

  return (
    <section className="bg-white px-4 py-12 sm:px-6 md:py-16">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-[#064F4B] px-6 py-12 text-center shadow-2xl shadow-[#064F4B]/20 sm:px-10 md:py-16">
        <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[#B7C8A3]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-[#00D494]/10 blur-3xl" />
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#B7C8A3] sm:text-xs">
            One gentle step
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl font-heading text-4xl font-bold leading-tight text-white md:text-5xl">
            Your healing journey can begin today.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-7 text-white/70">
            Browse available psychologists or talk to the Oruma team on WhatsApp.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/therapists"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#B7C8A3] px-7 py-4 text-sm font-black text-[#064F4B] transition hover:-translate-y-0.5 hover:bg-white"
            >
              <LucideIcon name="calendar-check" size={18} /> Book a Session
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 px-7 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[#064F4B]"
            >
              <LucideIcon name="message-circle" size={18} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
