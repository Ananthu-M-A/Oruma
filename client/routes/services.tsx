import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CoupleTherapySection from "../components/CoupleTherapySection";
import { LucideIcon } from "@site-builder/icons";
import ServiceScopeNotice from "../components/ServiceScopeNotice";

const programs = [
  {
    id: "nri",
    title: "NRI Consultation",
    desc: "Online booking information for Indians living abroad, subject to practitioner availability.",
    icon: "globe",
    color: "bg-[#0A7F7A] text-white",
    details: [
      "Flexible Time Zone Slots",
      "Cultural Contextual Support",
      "Native Language Comfort (Malayalam/English)",
      "INR Checkout Information",
      "Published Privacy Practices",
    ],
    link: "/consultation",
  },
  {
    id: "individual",
    title: "Individual Therapy",
    desc: "Confidential 1-on-1 sessions for personal growth and emotional health.",
    icon: "user",
    color: "bg-[#0A7F7A]/10 text-[#0A7F7A]",
    details: [
      "Anxiety & Panic Attacks",
      "Low-mood and Emotional Wellness Support",
      "Stress & Burnout Management",
      "Self-Esteem & Confidence Building",
      "Grief & Bereavement Support",
    ],
    link: "/services/individual-therapy",
  },
  {
    id: "couple",
    title: "Couple Therapy",
    desc: "Restore trust and improve communication in your relationship.",
    icon: "users",
    color: "bg-[#B7C8A3]/20 text-[#064F4B]",
    details: [
      "Relationship Wellness Tools",
      "Effective Communication Skills",
      "Pre-marital Compatibility",
      "Conflict Resolution Strategies",
      "Intimacy & Emotional Connection",
    ],
    link: "/services/couple-therapy",
  },
  {
    id: "parenting",
    title: "Parenting Support",
    desc: "Practical, collaborative support for parents and caregivers.",
    icon: "users",
    color: "bg-[#EFF2D9] text-[#607D2E]",
    details: [
      "Parent-Child Communication",
      "Boundaries & Routines",
      "Behaviour & Emotional Regulation",
      "Co-Parenting Conversations",
      "Parental Stress & Self-Care",
    ],
    link: "/services/parenting-support",
  },
  {
    id: "child-teen",
    title: "Child & Teen Counselling",
    desc: "Age-appropriate support with caregiver involvement where appropriate.",
    icon: "user-round-check",
    color: "bg-[#EEE9F7] text-[#064F4B]",
    details: [
      "Academic Stress",
      "Peer & Friendship Concerns",
      "Confidence & Self-Expression",
      "Emotional Regulation",
      "Family Communication",
    ],
    link: "/services/child-teen-counselling",
  },
  {
    id: "family",
    title: "Family Counselling",
    desc: "Structured conversations for communication, change and connection.",
    icon: "heart",
    color: "bg-[#FBEDE3] text-[#0A7F7A]",
    details: [
      "Family Communication",
      "Recurring Conflict",
      "Life-Stage Transitions",
      "Blended-Family Adjustment",
      "Rebuilding Trust",
    ],
    link: "/services/family-counselling",
  },
  {
    id: "postpartum",
    title: "Postpartum Support",
    desc: "Specialized care for new mothers navigating emotional shifts.",
    icon: "baby",
    color: "bg-orange-50 text-orange-600",
    details: [
      "Postpartum Depression (PPD)",
      "Baby Blues & New Parent Stress",
      "Bonding & Attachment Support",
      "Identity & Life-role Transitions",
      "Parental Self-Care Strategies",
    ],
    link: "/services/postpartum-support",
  },
  {
    id: "sexual-wellness",
    title: "Sexual Wellness",
    desc: "Confidential support for intimacy, communication and sexual wellbeing.",
    icon: "sparkles",
    color: "bg-[#EAF3F7] text-[#0A7F7A]",
    details: [
      "Intimacy & Communication",
      "Relationship Context",
      "Body Image & Confidence",
      "Sexual Wellbeing Education",
      "Appropriate Practitioner Matching",
    ],
    link: "/services/sexual-wellness",
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-white font-body text-[#1A2E2C]">
      <Navbar />
      <ServiceScopeNotice />

      {/* Hero */}
      <section className="pt-40 pb-20 bg-[#F5F8F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[#0A7F7A] text-white px-6 py-2 rounded-full font-black text-xs mb-8 tracking-widest uppercase shadow-xl shadow-[#0A7F7A]/20">
            What We Offer
          </div>
          <h1 className="text-4xl lg:text-7xl font-heading font-black text-[#1A2E2C] mb-8 leading-tight uppercase tracking-tighter">
            Comprehensive <br />
            <span className="text-[#0A7F7A]">Care Programs.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#5F7F7A] max-w-2xl mx-auto font-medium">
            Explore our specialized services designed to support you through
            every stage of your mental health journey.
          </p>
        </div>
      </section>

      {/* Therapy Programs */}
      <section className="py-24 border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-3xl font-heading font-black text-[#064F4B]">
              Counselling & Therapy
            </h2>
            <div className="h-px flex-grow bg-gray-100" />
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {programs.map((p) => {
              return (
                <div
                  key={p.id}
                  id={p.id}
                  className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-gray-100 hover:border-[#0A7F7A]/30 hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row gap-10 scroll-mt-32"
                >
                  <div
                    className={`w-20 h-20 shrink-0 ${p.color} rounded-[2rem] flex items-center justify-center`}
                  >
                    <LucideIcon name={p.icon} size={40} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl font-black text-[#1A2E2C] mb-3 uppercase tracking-tighter">
                      {p.title}
                    </h3>
                    <p className="text-[#5F7F7A] font-medium mb-8 leading-relaxed">
                      {p.desc}
                    </p>

                    <div className="space-y-4 mb-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                        What's included:
                      </p>
                      {p.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-[#B7C8A3] rounded-full" />
                          <span className="text-sm font-bold text-[#3D4B49]">
                            {detail}
                          </span>
                        </div>
                      ))}
                    </div>

                    <a
                      href={p.link}
                      className="inline-flex items-center gap-2 text-[#0A7F7A] font-black text-sm group"
                    >
                      View detailed service{" "}
                      <LucideIcon
                        name="arrow-right"
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Couple Therapy Section */}
      <CoupleTherapySection />

      <Footer />
    </main>
  );
}
