import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import FloatingActions from "../../components/FloatingActions";
import ServiceScopeNotice from "../../components/ServiceScopeNotice";
import TherapistGrid from "../../components/TherapistGrid";
import { LucideIcon } from "@site-builder/icons";
import { createSupportEmailUrl } from "../../src/config/business";

type SupportingServiceKey =
  | "parenting-support"
  | "child-teen-counselling"
  | "family-counselling"
  | "postpartum-support";

type ServiceFeature = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  points: string[];
};

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
    heroImage: string;
    heroImageAlt: string;
    specialtyAreas: string[];
    featureSections?: ServiceFeature[];
  }
> = {
  "parenting-support": {
    eyebrow: "Support for parents and caregivers",
    title: "Parenting Support",
    introduction:
      "A collaborative space to understand family patterns, respond to difficult moments with more confidence, and build connection with your child.",
    icon: "users",
    heroImage: "/assets/postpartum-new.webp",
    heroImageAlt: "A parent taking a quiet moment while caring for a baby",
    specialtyAreas: ["Parenting Challenges", "Family Counselling", "Child Behaviour"],
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
    message: [
      "Hello, I am a parent or caregiver looking for parenting support.",
      "Please share which practitioners work with parent-child communication, behaviour, routines, or caregiver stress, along with their professional role, session fee, available times, and how a first session works.",
    ].join("\n"),
    featureSections: [
      {
        title: "Support for the caregiver, too",
        description:
          "Parenting support can make room for your own stress and uncertainty as well as your child’s needs. Sessions can help you identify what is manageable now and choose practical changes that fit your family.",
        image: "/assets/postpartum-new.webp",
        imageAlt: "A parent caring for a newborn during an emotionally demanding moment",
        points: [
          "Notice stress patterns without blame",
          "Make space for rest and support",
          "Set realistic goals for home and school",
        ],
      },
      {
        title: "Build connection through everyday moments",
        description:
          "Work with a practitioner to understand recurring situations, communicate more clearly, and respond to difficult moments with steadier routines and boundaries.",
        image: "/assets/hero-therapist-professional.webp",
        imageAlt: "A psychologist ready to discuss family support in a consultation",
        points: [
          "Parent-child communication",
          "Boundaries and routines that suit your family",
          "Co-parenting and family conversations",
        ],
      },
    ],
  },
  "child-teen-counselling": {
    eyebrow: "A thoughtful space for younger minds",
    title: "Child & Teen Counselling",
    introduction:
      "Age-appropriate support for emotional, behavioural, social and school-related concerns, with parent or guardian involvement where appropriate.",
    icon: "user-round-check",
    heroImage: "/assets/student-wellness-v2-overwhelmed.webp",
    heroImageAlt: "Two students feeling the pressure of study and peer concerns",
    specialtyAreas: ["Teenage Concerns", "Child Behaviour", "Academic Stress"],
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
    message: [
      "Hello, I am a parent or guardian looking for counselling for a child or teenager.",
      "Please share which practitioners work with academic stress, emotions, behaviour, or peer concerns, their professional role and experience, session fee, next available times, and how guardian consent and privacy are handled.",
      "I will share identifying details only after choosing a suitable practitioner.",
    ].join("\n"),
    featureSections: [
      {
        title: "A steady place for school and peer pressure",
        description:
          "Young people may need help with study demands, friendship changes, confidence, or a sense of being overwhelmed. Age-appropriate sessions can help them describe what is happening and explore manageable ways forward.",
        image: "/assets/student-wellness-v2-overwhelmed.webp",
        imageAlt: "Students taking a moment while coping with academic pressure",
        points: [
          "Academic pressure and motivation",
          "Friendships, belonging, and peer conflict",
          "Confidence, identity, and self-expression",
        ],
      },
      {
        title: "Clear roles for young people and caregivers",
        description:
          "Before sessions begin, the practitioner can explain how consent, privacy, and caregiver involvement work for the young person’s age and needs. Families can discuss how to support progress at home.",
        image: "/assets/hero-therapist-professional.webp",
        imageAlt: "A psychologist prepared to explain a counselling plan to a family",
        points: [
          "Understand consent and privacy before booking",
          "Agree on when a caregiver joins a conversation",
          "Plan support around the young person’s goals",
        ],
      },
    ],
  },
  "family-counselling": {
    eyebrow: "Make space for every voice",
    title: "Family Counselling",
    introduction:
      "Structured conversations that help families understand recurring patterns, communicate more clearly, and work through change together.",
    icon: "heart",
    heroImage: "/assets/home-lady-striped-shirt-v2.webp",
    heroImageAlt: "A woman reflecting in a calm outdoor setting",
    specialtyAreas: ["Family Counselling", "Parenting Challenges"],
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
    message: "Hello, I am looking for family counselling. Please share practitioners who work with family communication or conflict, their professional role, session fees, next available times, and who can attend the first session.",
  },
  "postpartum-support": {
    eyebrow: "Gentle support through early parenthood",
    title: "Postpartum Support",
    introduction:
      "A supportive place to talk about emotional changes, identity, relationships, expectations and adjustment during the postpartum period.",
    icon: "baby",
    heroImage: "/assets/postpartum-new.webp",
    heroImageAlt: "A parent caring for a newborn during the postpartum period",
    specialtyAreas: ["Postpartum Support"],
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
    message: "Hello, I am looking for emotional support after pregnancy. Please share practitioners who work with postpartum adjustment, their professional role and scope, session fees, next available times, and what to expect in an initial session.",
  },
};

export default function SupportingServicePage({
  serviceKey,
}: {
  serviceKey: SupportingServiceKey;
}) {
  const service = serviceContent[serviceKey];
  const emailLink = createSupportEmailUrl(service.message);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <ServiceScopeNotice />

      <section className="relative overflow-hidden bg-[#F8F5EF] px-4 py-16 sm:px-6 md:py-24">
        <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#B7C8A3]/25 blur-3xl" />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E5ECCE] text-[#607D2E] shadow-sm">
              <LucideIcon name={service.icon} size={31} />
            </span>
            <p className="mt-7 text-xs font-black uppercase tracking-[0.24em] text-[#0A7F7A]">
              {service.eyebrow}
            </p>
            <h1 className="mt-4 font-heading text-5xl font-bold leading-tight text-[#064F4B] md:text-6xl">
              {service.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-[#536D68] md:text-xl">
              {service.introduction}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={emailLink}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#064F4B]/25 bg-white px-8 py-4 text-sm font-black text-[#064F4B] transition hover:border-[#0A7F7A]"
              >
                <LucideIcon name="mail" size={17} /> Email about this service
              </a>
            </div>
          </div>
          <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] border-8 border-white shadow-2xl shadow-[#064F4B]/10 sm:min-h-[440px] lg:min-h-[500px]">
            <img
              src={service.heroImage}
              alt={service.heroImageAlt}
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#064F4B]/45 via-transparent to-transparent" />
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

      {service.featureSections?.length ? (
        <section className="bg-white px-4 py-16 sm:px-6 md:py-24">
          <div className="mx-auto max-w-7xl space-y-12 md:space-y-20">
            {service.featureSections.map((feature, index) => (
              <article
                key={feature.title}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
              >
                <div
                  className={`relative min-h-[280px] overflow-hidden rounded-[2rem] border-8 border-[#F5F8F7] shadow-xl sm:min-h-[360px] ${index % 2 ? "lg:order-2" : ""}`}
                >
                  <img
                    src={feature.image}
                    alt={feature.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className={index % 2 ? "lg:order-1" : ""}>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0A7F7A]">
                    {service.title}
                  </p>
                  <h2 className="mt-3 font-heading text-3xl font-bold leading-tight text-[#064F4B] md:text-4xl">
                    {feature.title}
                  </h2>
                  <p className="mt-5 text-base font-medium leading-7 text-[#5F7773] md:text-lg">
                    {feature.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {feature.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-3 text-sm font-bold leading-6 text-[#375651]"
                      >
                        <LucideIcon
                          name="check-circle"
                          size={18}
                          className="mt-0.5 shrink-0 text-[#7F9B43]"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-[#F4F7F4] px-4 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0A7F7A]">Available profiles</p>
            <h2 className="mt-3 font-heading text-4xl font-bold text-[#064F4B]">Choose your psychologist</h2>
            <p className="mt-4 font-medium leading-7 text-[#5F7773]">
              These profiles list areas of practice related to {service.title.toLowerCase()}. Review each person’s qualifications, professional scope, fee and next available slot before booking.
            </p>
          </div>
          <TherapistGrid
            specialtyAreas={service.specialtyAreas}
            maxItems={3}
            emptyTitle={`No ${service.title.toLowerCase()} practitioners are listed right now.`}
            emptyDescription="No current profiles list these areas of practice. Check back later or email Oruma with this page-specific request to ask about a suitable match."
          />
        </div>
      </section>

      <FloatingActions />
      <Footer />
    </main>
  );
}
