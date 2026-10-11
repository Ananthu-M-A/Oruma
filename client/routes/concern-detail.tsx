import { Navigate, useParams } from "react-router-dom";
import AnxietyHero from "../components/AnxietyHero";
import AnxietyHowItWorks from "../components/AnxietyHowItWorks";
import AnxietyMechanism from "../components/AnxietyMechanism";
import AnxietySymptoms from "../components/AnxietySymptoms";
import DepressionHero from "../components/DepressionHero";
import DepressionMechanism from "../components/DepressionMechanism";
import DepressionSymptoms from "../components/DepressionSymptoms";
import FAQSection from "../components/FAQSection";
import FloatingActions from "../components/FloatingActions";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PostpartumHero from "../components/PostpartumHero";
import PostpartumSymptoms from "../components/PostpartumSymptoms";
import RelationshipHero from "../components/RelationshipHero";
import RelationshipMechanism from "../components/RelationshipMechanism";
import RelationshipSymptoms from "../components/RelationshipSymptoms";
import ServiceScopeNotice from "../components/ServiceScopeNotice";
import StudentHero from "../components/StudentHero";
import StudentSymptoms from "../components/StudentSymptoms";
import TherapistGrid from "../components/TherapistGrid";
import TraumaHero from "../components/TraumaHero";
import TraumaMechanism from "../components/TraumaMechanism";
import TraumaSymptoms from "../components/TraumaSymptoms";
import { concernPaths, therapistDirectoryHref } from "../src/lib/concerns";

function RelationshipContent() {
  return (
    <>
      <RelationshipHero />
      <div className="bg-[#F5F8F7] py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="mb-6 inline-block rounded-full bg-[#0A7F7A] px-8 py-2 text-xs font-black uppercase tracking-widest text-white">
            #1 Requested Support
          </div>
          <h2 className="font-heading text-3xl font-black leading-tight text-[#064F4B] lg:text-6xl">
            Husband-Wife Trust &amp; <br />
            <span className="text-[#0A7F7A]">Relationship Healing</span>
          </h2>
        </div>
      </div>
      <RelationshipSymptoms />
      <RelationshipMechanism />
    </>
  );
}

function BreakupContent() {
  return (
    <section className="relative z-10 border-t border-gray-100 bg-white">
      <div className="bg-[#064F4B] px-6 py-24 text-center text-white">
        <div className="mb-8 inline-block rounded-full bg-[#B7C8A3] px-8 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#064F4B]">
          Specialized Support
        </div>
        <h1 className="mb-8 font-heading text-4xl font-black uppercase tracking-tighter lg:text-7xl">
          Breakup &amp; <br className="md:hidden" />
          <span className="text-[#B7C8A3]">Recovery</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-white/75 lg:text-xl">
          Healing after a breakup takes time. Counselling can offer a steady
          place to process the change, understand your needs, and find a way
          forward.
        </p>
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-20 lg:py-24">
        <div>
          <h2 className="mb-8 font-heading text-3xl font-black leading-tight tracking-tight text-[#064F4B] lg:text-4xl">
            Healing From Loss
          </h2>
          <p className="mb-10 text-lg font-medium leading-relaxed text-[#5F7F7A]">
            A relationship ending can affect your routines, confidence, and
            sense of the future. Sessions can help you make sense of those
            feelings and rebuild a sense of self at your own pace.
          </p>
          <ul className="space-y-5">
            {[
              "Understanding recurring relationship patterns",
              "Building emotional independence",
              "Processing grief and difficult feelings",
              "Establishing healthy boundaries",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-4 text-base font-bold text-[#064F4B] lg:text-lg"
              >
                <span className="h-3 w-3 shrink-0 rounded-full bg-[#0A7F7A]" />
                {item}
              </li>
            ))}
          </ul>
          <a
            href={therapistDirectoryHref(["Breakup Recovery", "Grief & Loss"])}
            className="mt-10 inline-block rounded-full bg-[#064F4B] px-10 py-5 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-[#064F4B]/20 transition hover:bg-[#0A7F7A] active:scale-95"
          >
            Start Your Recovery
          </a>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border-8 border-[#F5F8F7] shadow-2xl lg:rounded-[4rem]">
          <img
            src="/assets/breakup-healing-hero.webp"
            alt="A quiet moment of reflection during breakup recovery"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#064F4B]/20 mix-blend-multiply" />
          <div className="absolute inset-x-6 top-6 rounded-3xl border border-white/20 bg-[#064F4B]/45 p-6 backdrop-blur-md sm:inset-x-8 sm:top-8">
            <p className="text-center text-sm font-bold italic leading-relaxed text-white sm:text-base">
              A breakup can be the beginning of understanding what you need
              next.
            </p>
          </div>
          <div className="absolute inset-x-8 bottom-10 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
            <p className="text-center text-sm font-black uppercase tracking-[0.2em] text-white">
              Together, Gently.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmotionalWellbeingContent() {
  const topics = [
    {
      title: "Depression & Mood",
      description:
        "Explore support for persistent low mood, changes in motivation, and emotional heaviness.",
      href: concernPaths.depression,
    },
    {
      title: "After Trauma (PTSD)",
      description:
        "Learn about trauma-informed care after difficult experiences and trauma symptoms.",
      href: concernPaths.trauma,
    },
    {
      title: "Overthinking",
      description:
        "Find ways to work with repetitive thoughts, uncertainty, and worry that is hard to switch off.",
      href: concernPaths.anxiety,
    },
    {
      title: "Anxiety",
      description:
        "Explore support for ongoing worry, tension, panic, and the effects of anxiety on daily life.",
      href: concernPaths.anxiety,
    },
    {
      title: "Stress & Burnout",
      description:
        "Talk through daily pressure, exhaustion, work demands, and ways to restore balance.",
      href: therapistDirectoryHref(["Stress & Burnout", "Workplace Stress"]),
    },
    {
      title: "Self-esteem & Confidence",
      description:
        "Build a kinder view of yourself and explore what affects confidence and self-worth.",
      href: therapistDirectoryHref(["Self-esteem", "Emotional Wellbeing"]),
    },
    {
      title: "Grief & Loss",
      description:
        "Make space to process loss and adjust to life after a significant change.",
      href: therapistDirectoryHref(["Grief & Loss"]),
    },
    {
      title: "Workplace Stress",
      description:
        "Explore support for difficult work dynamics, pressure, and ongoing occupational stress.",
      href: therapistDirectoryHref(["Workplace Stress", "Stress & Burnout"]),
    },
    {
      title: "Life Transitions",
      description:
        "Reflect on change, uncertainty, and the decisions involved in a new life stage.",
      href: therapistDirectoryHref(["Emotional Wellbeing", "Self-esteem"]),
    },
    {
      title: "Postpartum Emotional Changes",
      description:
        "Find support for mood changes, overwhelm, and adjusting after pregnancy.",
      href: concernPaths.postpartum,
    },
  ];

  const renderTopic = (topic: (typeof topics)[number]) => (
    <a
      key={topic.title}
      href={topic.href}
      className="group flex min-h-52 flex-col rounded-[1.75rem] border border-[#064F4B]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#0A7F7A]/30 hover:shadow-xl hover:shadow-[#064F4B]/10 sm:p-7"
    >
      <h3 className="font-heading text-xl font-bold text-[#064F4B] sm:text-2xl">
        {topic.title}
      </h3>
      <p className="mt-3 flex-1 text-sm font-medium leading-6 text-[#5F7773]">
        {topic.description}
      </p>
      <span className="mt-6 text-xs font-black uppercase tracking-widest text-[#0A7F7A] group-hover:underline">
        Explore support <span aria-hidden="true">→</span>
      </span>
    </a>
  );

  return (
    <section className="relative z-10 border-t border-gray-100 bg-[#F8F5EF] px-4 pb-20 pt-32 sm:px-6 md:pb-28 md:pt-40">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mt-4 font-heading text-4xl font-black leading-tight text-[#064F4B] sm:text-5xl md:text-6xl">
            Emotional Wellbeing Support
          </h1>
          <p className="mt-6 text-base font-medium leading-7 text-[#5F7773] md:text-lg md:leading-8">
            Explore focused, practitioner-led support for mood, trauma, worry,
            self-esteem, grief, and the pressures of everyday life.
          </p>
        </div>

        <div className="mt-14">
          <h2 className="text-center font-heading text-2xl font-black text-[#064F4B] sm:text-3xl">
            Specialized Care for Depression &amp; Mood
          </h2>
        </div>
        <div className="mx-auto mt-7 grid max-w-3xl gap-4">
          {renderTopic(topics[0])}
        </div>
        <div className="mt-14">
          <h2 className="text-center font-heading text-2xl font-black text-[#064F4B] sm:text-3xl">
            Support for Other Emotional Wellbeing Concerns
          </h2>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.slice(1).map(renderTopic)}
        </div>
      </div>
    </section>
  );
}

function TopicContent({ slug }: { slug: string }) {
  switch (slug) {
    case "relationship-marriage":
      return <RelationshipContent />;
    case "breakup-recovery":
      return <BreakupContent />;
    case "anxiety-stress":
      return (
        <>
          <AnxietyHero />
          <AnxietySymptoms />
          <AnxietyMechanism />
          <AnxietyHowItWorks />
        </>
      );
    case "emotional-wellbeing":
      return <EmotionalWellbeingContent />;
    case "postpartum-support":
      return (
        <>
          <PostpartumHero />
          <PostpartumSymptoms />
        </>
      );
    case "depression":
      return (
        <>
          <DepressionHero />
          <DepressionSymptoms />
          <DepressionMechanism />
        </>
      );
    case "teenage-wellbeing":
      return (
        <>
          <StudentHero />
          <div className="bg-[#B7C8A3]/10 py-16">
            <div className="mx-auto max-w-7xl px-6 text-center">
              <div className="mb-6 inline-block rounded-full bg-[#064F4B] px-8 py-2 text-xs font-black uppercase tracking-widest text-white">
                Support for young people and families
              </div>
              <h2 className="font-heading text-3xl font-black leading-tight text-[#064F4B] lg:text-6xl">
                Teenage &amp; Parent <br />
                <span className="text-[#0A7F7A]">Support Systems</span>
              </h2>
            </div>
          </div>
          <StudentSymptoms />
        </>
      );
    case "trauma-ptsd":
      return (
        <>
          <TraumaHero />
          <TraumaSymptoms />
          <TraumaMechanism />
        </>
      );
    default:
      return null;
  }
}

const therapistAreasBySlug: Record<string, string[]> = {
  "relationship-marriage": ["Relationship Issues", "Couple Therapy"],
  "breakup-recovery": ["Breakup Recovery", "Grief & Loss"],
  "anxiety-stress": ["Anxiety", "Stress & Burnout", "Workplace Stress"],
  "emotional-wellbeing": [
    "Depression",
    "Emotional Wellbeing",
    "Anxiety",
    "Stress & Burnout",
    "Trauma & PTSD",
    "Grief & Loss",
    "Postpartum Support",
    "Self-esteem",
    "Workplace Stress",
  ],
  "postpartum-support": ["Postpartum Support"],
  depression: ["Depression", "Emotional Wellbeing", "Grief & Loss"],
  "teenage-wellbeing": [
    "Teenage Concerns",
    "Child Behaviour",
    "Academic Stress",
  ],
  "trauma-ptsd": ["Trauma & PTSD"],
};

const concernSlugs = new Set(
  Object.values(concernPaths).map((path) => path.slice("/concerns/".length)),
);

export default function ConcernDetailPage() {
  const { concernSlug = "" } = useParams<{ concernSlug: string }>();
  if (!concernSlugs.has(concernSlug)) return <Navigate to="/concerns" replace />;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <FloatingActions />
      <ServiceScopeNotice />
      <TopicContent slug={concernSlug} />

      <section className="border-t border-gray-100 bg-[#F9FBF9] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0A7F7A]">
              Practitioner matches
            </p>
            <h2 className="mt-3 font-heading text-4xl font-black leading-tight text-[#064F4B] lg:text-5xl">
              Practitioners for this concern
            </h2>
            <p className="mt-4 text-base font-medium leading-7 text-[#5F7F7A]">
              These profiles list an area of practice related to this page. You
              can review each practitioner’s role, fees, availability, and
              professional scope before booking.
            </p>
          </div>
          <TherapistGrid
            specialtyAreas={therapistAreasBySlug[concernSlug]}
            emptyTitle="No matching practitioners are listed right now."
            emptyDescription="No current profiles list an area of practice related to this concern. Ask Oruma for a match or check again when practitioner availability is updated."
          />
        </div>
      </section>

      <FAQSection />
      <Footer />
    </main>
  );
}
