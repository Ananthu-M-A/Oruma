import { Navigate, useParams } from "react-router-dom";
import { LucideIcon } from "@site-builder/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";
import { createSupportEmailUrl } from "../src/config/business";

const programPages = {
  courses: {
    title: "Oruma Courses",
    eyebrow: "Self-paced and guided learning",
    description:
      "Structured learning experiences created by Oruma to help people build practical skills around relationships, parenting, emotional wellbeing, and personal growth.",
    icon: "graduation-cap",
    image: "/assets/home-lady-striped-shirt-v2.webp",
    imageAlt: "A woman enjoying a calm moment outdoors",
    color: "bg-[#EFF2D9]",
    points: [
      "Clear learning outcomes and course descriptions",
      "Self-paced and guided formats, where available",
      "Schedule, fee, and registration details shared before enrolment",
    ],
    emailMessage:
      "Hello Oruma, I am interested in Oruma Courses. Please share available course topics, learning format, duration, fees, who each course is suitable for, and registration steps.",
  },
  workshops: {
    title: "Offline Workshops",
    eyebrow: "Learn and connect in person",
    description:
      "Facilitated in-person workshops create time for focused learning, reflection, and thoughtful group participation around relevant wellbeing topics.",
    icon: "users",
    image: "/assets/relationship-healing-connection-v2.webp",
    imageAlt: "Two people sharing a supportive conversation",
    color: "bg-[#FAE8DE]",
    points: [
      "Oruma-hosted in-person experiences",
      "Topic, venue, facilitator, and schedule details before registration",
      "Participant guidance and fees shared before you enrol",
    ],
    emailMessage:
      "Hello Oruma, I am interested in an offline workshop. Please share upcoming workshop topics, dates, venue, facilitator details, fees, who can attend, and registration steps.",
  },
  webinars: {
    title: "Webinars & Events",
    eyebrow: "Live learning from anywhere",
    description:
      "Join online talks, conversations, and expert-led events offered through Oruma, with details about the speaker, topic, and joining process shared in advance.",
    icon: "video",
    image: "/assets/hero-therapist-professional.webp",
    imageAlt: "A practitioner in a welcoming professional setting",
    color: "bg-[#EEE9F7]",
    points: [
      "Live online Oruma sessions",
      "Speaker, topic, duration, and joining details published before registration",
      "Registration and event updates sent by email",
    ],
    emailMessage:
      "Hello Oruma, I am interested in your webinars and events. Please share upcoming topics, speakers, dates, duration, fees if applicable, and how to register.",
  },
} as const;

export default function ProgramDetailPage() {
  const { programSlug = "" } = useParams<{ programSlug: string }>();
  if (!Object.prototype.hasOwnProperty.call(programPages, programSlug)) {
    return <Navigate to="/programs" replace />;
  }

  const program = programPages[programSlug as keyof typeof programPages];
  const emailLink = createSupportEmailUrl(
    program.emailMessage,
    `Enquiry about ${program.title}`,
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <section className={`px-4 pb-16 pt-32 sm:px-6 md:pb-24 md:pt-40 ${program.color}`}>
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0A7F7A]">
              {program.eyebrow}
            </p>
            <h1 className="mt-4 font-heading text-5xl font-bold leading-tight text-[#064F4B] md:text-7xl">
              {program.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-[#536D68]">
              {program.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={emailLink}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#064F4B] px-7 py-4 text-sm font-black text-white transition hover:bg-[#0A7F7A]"
              >
                <LucideIcon name="mail" size={17} /> Email about this program
              </a>
              <a
                href="/programs"
                className="inline-flex items-center justify-center rounded-full border border-[#064F4B]/20 bg-white/70 px-7 py-4 text-sm font-black text-[#064F4B]"
              >
                All programs
              </a>
            </div>
          </div>
          <div className="relative min-h-72 overflow-hidden rounded-[2.5rem] border-8 border-white/70 bg-white/55 shadow-xl md:min-h-96">
            <img
              src={program.image}
              alt={program.imageAlt}
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-[#064F4B]/35 via-transparent to-transparent" />
            <span className="absolute bottom-5 left-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 text-[#064F4B] shadow-lg">
              <LucideIcon name={program.icon} size={26} />
            </span>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0A7F7A]">
              Before you register
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-[#064F4B] md:text-4xl">
              Know what to expect
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {program.points.map((point, index) => (
              <article
                key={point}
                className="rounded-[1.75rem] border border-[#064F4B]/10 bg-[#F8FAF7] p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DDE7C3] font-heading text-lg font-bold text-[#064F4B]">
                  {index + 1}
                </span>
                <p className="mt-5 text-base font-bold leading-7 text-[#375651]">
                  {point}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-8 rounded-2xl bg-[#F5F8F7] p-5 text-sm font-medium leading-6 text-[#536D68]">
            Availability, facilitators, format, and fees vary by event. Email
            Oruma for current details; the team will reply to your email.
          </p>
        </div>
      </section>
      <FloatingActions />
      <Footer />
    </main>
  );
}
