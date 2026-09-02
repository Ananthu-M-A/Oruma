import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";
import { LucideIcon } from "@site-builder/icons";
import { createWhatsAppUrl } from "../src/config/business";

const programTypes = [
  {
    id: "courses",
    title: "Oruma Courses",
    label: "Self-paced and guided learning",
    description:
      "Structured learning experiences created by Oruma around relationships, parenting, emotional wellbeing and practical personal growth.",
    icon: "graduation-cap",
    color: "bg-[#EFF2D9]",
    points: [
      "Clear learning outcomes and program descriptions",
      "Oruma-created psychology and wellbeing content",
      "Published format, schedule and fee before registration",
    ],
    action: "Ask about Oruma courses",
  },
  {
    id: "workshops",
    title: "Offline Workshops",
    label: "Learn and connect in person",
    description:
      "Facilitated Oruma workshops designed for focused learning, reflection and thoughtful group participation.",
    icon: "users",
    color: "bg-[#FAE8DE]",
    points: [
      "Oruma-hosted in-person experiences",
      "Topic, venue and facilitator details before registration",
      "Clear participant guidance and contact information",
    ],
    action: "Ask about workshops",
  },
  {
    id: "webinars",
    title: "Webinars & Events",
    label: "Live learning from anywhere",
    description:
      "Online talks, conversations and expert-led events offered through Oruma’s official channels.",
    icon: "video",
    color: "bg-[#EEE9F7]",
    points: [
      "Live online Oruma sessions",
      "Published speaker, topic and joining information",
      "Registration updates through official contact channels",
    ],
    action: "Ask about webinars",
  },
];

export default function ProgramsPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <section className="relative overflow-hidden bg-[#064F4B] px-4 pb-20 pt-36 text-center text-white sm:px-6 md:pb-28 md:pt-44">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#B7C8A3]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-[#00D494]/10 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#B7C8A3]">
            Oruma learning experiences
          </p>
          <h1 className="mt-5 font-heading text-5xl font-bold leading-tight md:text-7xl">
            Learn. Grow. Transform.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-white/70">
            Explore courses, offline workshops, webinars and events created and hosted by Oruma.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-7xl space-y-7">
          {programTypes.map((program, index) => {
            const whatsappLink = createWhatsAppUrl(
              `Hello, I would like information about ${program.title}.`,
            );
            return (
              <article
                key={program.id}
                id={program.id}
                className={`${program.color} scroll-mt-24 overflow-hidden rounded-[2rem] border border-[#064F4B]/5 p-7 sm:p-10 lg:grid lg:grid-cols-[0.75fr_1.25fr] lg:gap-14 lg:p-14`}
              >
                <div className="flex flex-col justify-between">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 text-[#064F4B] shadow-sm">
                    <LucideIcon name={program.icon} size={31} />
                  </span>
                  <div className="mt-8 lg:mt-20">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0A7F7A]">
                      0{index + 1} · {program.label}
                    </p>
                    <h2 className="mt-3 font-heading text-4xl font-bold text-[#064F4B] md:text-5xl">
                      {program.title}
                    </h2>
                  </div>
                </div>
                <div className="mt-8 lg:mt-0">
                  <p className="text-lg font-medium leading-8 text-[#435F5A]">
                    {program.description}
                  </p>
                  <div className="mt-7 space-y-3">
                    {program.points.map((point) => (
                      <p key={point} className="flex items-start gap-3 rounded-2xl bg-white/60 p-4 text-sm font-bold leading-6 text-[#31534E]">
                        <LucideIcon name="check-circle" size={18} className="mt-0.5 shrink-0 text-[#7F9B43]" />
                        {point}
                      </p>
                    ))}
                  </div>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#064F4B] px-7 py-4 text-sm font-black text-white transition hover:bg-[#0A7F7A]"
                  >
                    <LucideIcon name="message-circle" size={17} /> {program.action}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-[#F5F8F7] px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-heading text-3xl font-bold text-[#064F4B]">
            New schedules will be published through Oruma’s official channels.
          </p>
          <p className="mt-4 font-medium leading-7 text-[#5F7773]">
            Program availability, facilitator information, delivery format and fees will be shown before registration.
          </p>
        </div>
      </section>

      <FloatingActions />
      <Footer />
    </main>
  );
}
