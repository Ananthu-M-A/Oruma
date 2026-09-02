import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import FloatingActions from "../../components/FloatingActions";
import ServiceScopeNotice from "../../components/ServiceScopeNotice";
import TherapistGrid from "../../components/TherapistGrid";
import { LucideIcon } from "@site-builder/icons";
import { createWhatsAppUrl } from "../../src/config/business";

type SupportingServiceKey =
  | "parenting-support"
  | "child-teen-counselling"
  | "family-counselling"
  | "postpartum-support";

const serviceContent: Record<
  SupportingServiceKey,
  {
    eyebrow: string;
    title: string;
    introduction: string;
    icon: string;
    topics: string[];
    experience: string[];
    note: string;
    message: string;
  }
> = {
  "parenting-support": {
    eyebrow: "Support for parents and caregivers",
    title: "Parenting Support",
    introduction:
      "A collaborative space to understand family patterns, respond to difficult moments with more confidence, and build connection with your child.",
    icon: "users",
    topics: [
      "Parent-child communication",
      "Boundaries and routines",
      "Difficult behaviour and emotional outbursts",
      "Co-parenting conversations",
      "Parental stress and self-care",
      "School and peer-related concerns",
    ],
    experience: [
      "Choose a psychologist after reviewing their stated areas of practice.",
      "Share the situation, priorities and context in your first conversation.",
      "Agree on practical next steps suited to your family and the practitioner’s scope.",
    ],
    note: "Parenting support is collaborative and does not replace paediatric, psychiatric, safeguarding or emergency services.",
    message: "Hello, I would like information about Oruma parenting support.",
  },
  "child-teen-counselling": {
    eyebrow: "A thoughtful space for younger minds",
    title: "Child & Teen Counselling",
    introduction:
      "Age-appropriate support for emotional, behavioural, social and school-related concerns, with parent or guardian involvement where appropriate.",
    icon: "user-round-check",
    topics: [
      "Academic stress and motivation",
      "Friendships and peer pressure",
      "Emotional regulation",
      "Confidence and self-expression",
      "Family transitions",
      "Communication between teens and caregivers",
    ],
    experience: [
      "A parent or guardian reviews the psychologist’s profile and suitability.",
      "The practitioner explains how sessions, privacy and caregiver involvement work.",
      "Support is planned around age, context, goals and professional scope.",
    ],
    note: "Bookings involving a minor require appropriate parent or guardian coordination. Urgent safety concerns need local emergency or safeguarding support.",
    message: "Hello, I would like information about Oruma child and teen counselling.",
  },
  "family-counselling": {
    eyebrow: "Make space for every voice",
    title: "Family Counselling",
    introduction:
      "Structured conversations that help families understand recurring patterns, communicate more clearly, and work through change together.",
    icon: "heart",
    topics: [
      "Recurring family conflict",
      "Communication breakdowns",
      "Life-stage and role transitions",
      "Separation and blended-family adjustment",
      "Caregiving pressures",
      "Rebuilding trust and connection",
    ],
    experience: [
      "Review practitioner profiles, fees and available session formats.",
      "Clarify who may attend and what each person hopes to improve.",
      "Work toward shared, realistic steps with the selected practitioner.",
    ],
    note: "Family counselling requires willingness and appropriate consent from participants. It is not a substitute for emergency, legal or safeguarding intervention.",
    message: "Hello, I would like information about Oruma family counselling.",
  },
  "postpartum-support": {
    eyebrow: "Gentle support through early parenthood",
    title: "Postpartum Support",
    introduction:
      "A supportive place to talk about emotional changes, identity, relationships, expectations and adjustment during the postpartum period.",
    icon: "baby",
    topics: [
      "Adjustment to parenthood",
      "Overwhelm, guilt and emotional changes",
      "Identity and relationship transitions",
      "Communication with partners and family",
      "Rest, support systems and boundaries",
      "Returning to work or changing roles",
    ],
    experience: [
      "Choose a suitably qualified practitioner from a verified profile.",
      "Discuss current concerns, support systems and practical needs.",
      "Plan next steps within the practitioner’s published role and scope.",
    ],
    note: "Severe symptoms, thoughts of harm, psychosis or an immediate safety concern require urgent local medical or emergency support.",
    message: "Hello, I would like information about Oruma postpartum support.",
  },
};

export default function SupportingServicePage({
  serviceKey,
}: {
  serviceKey: SupportingServiceKey;
}) {
  const service = serviceContent[serviceKey];
  const whatsappLink = createWhatsAppUrl(service.message);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <ServiceScopeNotice />

      <section className="relative overflow-hidden bg-[#F8F5EF] px-4 py-20 sm:px-6 md:py-28">
        <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#B7C8A3]/25 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E5ECCE] text-[#607D2E] shadow-sm">
            <LucideIcon name={service.icon} size={31} />
          </span>
          <p className="mt-7 text-xs font-black uppercase tracking-[0.24em] text-[#0A7F7A]">
            {service.eyebrow}
          </p>
          <h1 className="mt-4 font-heading text-5xl font-bold leading-tight text-[#064F4B] md:text-7xl">
            {service.title}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg font-medium leading-8 text-[#536D68] md:text-xl">
            {service.introduction}
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/therapists"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#064F4B] px-8 py-4 text-sm font-black text-white transition hover:bg-[#0A7F7A]"
            >
              Find a Psychologist <LucideIcon name="arrow-right" size={17} />
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#064F4B]/25 bg-white px-8 py-4 text-sm font-black text-[#064F4B] transition hover:border-[#0A7F7A]"
            >
              <LucideIcon name="message-circle" size={17} /> Ask Oruma
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] border border-[#DDE6E2] p-7 sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0A7F7A]">
              Areas you can bring to a session
            </p>
            <h2 className="mt-3 font-heading text-4xl font-bold text-[#064F4B]">
              Support can begin with what matters now.
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {service.topics.map((topic) => (
                <div key={topic} className="flex items-start gap-3 rounded-2xl bg-[#F5F8F7] p-4">
                  <LucideIcon name="check-circle" size={18} className="mt-0.5 shrink-0 text-[#7F9B43]" />
                  <p className="text-sm font-bold leading-6 text-[#375651]">{topic}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#064F4B] p-7 text-white sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B7C8A3]">
              What to expect
            </p>
            <ol className="mt-7 space-y-7">
              {service.experience.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-black text-[#B7C8A3]">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm font-semibold leading-6 text-white/85">{step}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-5">
              <p className="flex gap-3 text-sm font-medium leading-6 text-white/70">
                <LucideIcon name="info" size={19} className="mt-0.5 shrink-0 text-[#B7C8A3]" />
                {service.note}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F4F7F4] px-4 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0A7F7A]">Available profiles</p>
            <h2 className="mt-3 font-heading text-4xl font-bold text-[#064F4B]">Choose your psychologist</h2>
            <p className="mt-4 font-medium leading-7 text-[#5F7773]">
              Review each profile’s qualifications, stated specialisation, fee and next available slot before booking.
            </p>
          </div>
          <TherapistGrid maxItems={3} />
        </div>
      </section>

      <FloatingActions />
      <Footer />
    </main>
  );
}
