import React, { FormEvent, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";
import { LucideIcon } from "@site-builder/icons";
import { createWhatsAppUrl } from "../src/config/business";
import { therapistDirectoryHref } from "../src/lib/concerns";

const supportAreaFilters: Record<string, string[]> = {
  "Relationship or marriage": ["Relationship Issues", "Couple Therapy"],
  "Parenting or family": ["Parenting Challenges", "Family Counselling"],
  "Child or teen wellbeing": [
    "Child Behaviour",
    "Teenage Concerns",
    "Academic Stress",
  ],
  "Anxiety or stress": ["Anxiety", "Stress & Burnout"],
  "Trauma or difficult experiences": ["Trauma & PTSD"],
  "Emotional wellbeing": [
    "Depression",
    "Emotional Wellbeing",
    "Self-esteem",
  ],
  "Postpartum support": ["Postpartum Support"],
  "Sexual wellness": ["Sexual Wellness"],
  "Not sure yet": [],
};

export default function FindYourPsychologistPage() {
  const [supportArea, setSupportArea] = useState("");
  const [sessionFor, setSessionFor] = useState("");
  const [language, setLanguage] = useState("");
  const [note, setNote] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const selectedAreas = new Set(supportAreaFilters[supportArea] ?? []);
  if (sessionFor === "Me and my partner") {
    selectedAreas.add("Relationship Issues");
    selectedAreas.add("Couple Therapy");
  }
  if (sessionFor === "My child or teenager") {
    selectedAreas.add("Child Behaviour");
    selectedAreas.add("Teenage Concerns");
    selectedAreas.add("Academic Stress");
  }
  if (sessionFor === "My family") selectedAreas.add("Family Counselling");

  const matchingPractitionersHref = therapistDirectoryHref(
    [...selectedAreas],
    language,
    sessionFor,
  );
  const whatsappLink = createWhatsAppUrl(
    [
      "Hello, I would like help finding a suitable Oruma practitioner.",
      `Support area: ${supportArea || "not sure yet"}`,
      `Session is for: ${sessionFor || "not selected"}`,
      `Preferred language: ${language || "not selected"}`,
      note.trim() ? `A little context: ${note.trim()}` : "",
      "Please share matching profile links, each practitioner's role and scope, session fee, next available times, and the steps to book.",
      sessionFor === "My child or teenager"
        ? "Please also explain consent, privacy, and how a parent or guardian is involved."
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowOptions(true);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8F5EF] font-body text-[#2E3E3C]">
      <Navbar />
      <section className="px-4 pb-16 pt-32 sm:px-6 md:pb-24 md:pt-40">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2.25rem] border border-[#064F4B]/10 bg-white shadow-2xl shadow-[#064F4B]/10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative overflow-hidden bg-[#064F4B] p-8 text-white sm:p-12 lg:p-14">
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#B7C8A3]/15 blur-3xl" />
            <div className="relative z-10">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#B7C8A3]">
                <LucideIcon name="heart-handshake" size={27} />
              </span>
              <p className="mt-9 text-xs font-black uppercase tracking-[0.22em] text-[#B7C8A3]">
                Psychologist recommendation
              </p>
              <h1 className="mt-4 font-heading text-4xl font-bold leading-tight sm:text-5xl">
                Let’s find the right support together.
              </h1>
              <p className="mt-5 text-base font-medium leading-7 text-white/70">
                Share only what you are comfortable sharing. Your answers can narrow the practitioner list or prepare a detailed question for Oruma.
              </p>
              <div className="mt-10 space-y-5 border-t border-white/15 pt-8">
                {[
                  "No diagnosis is needed to ask for help",
                  "Compare qualifications, fees and availability",
                  "You make the final choice before booking",
                ].map((point) => (
                  <p key={point} className="flex items-start gap-3 text-sm font-bold leading-6 text-white/85">
                    <LucideIcon name="check-circle" size={18} className="mt-0.5 shrink-0 text-[#B7C8A3]" />
                    {point}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="p-7 sm:p-12 lg:p-14">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0A7F7A]">
              A few quick questions
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-[#064F4B] sm:text-4xl">
              What kind of support are you looking for?
            </h2>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <FormField label="What brings you here?" htmlFor="support-area">
                <select
                  id="support-area"
                  required
                  value={supportArea}
                  onChange={(event) => setSupportArea(event.target.value)}
                  className="w-full rounded-2xl border border-[#C9D7D2] bg-white px-4 py-4 font-semibold text-[#31534E] outline-none transition focus:border-[#0A7F7A]"
                >
                  <option value="">Choose an area</option>
                  <option>Relationship or marriage</option>
                  <option>Parenting or family</option>
                  <option>Child or teen wellbeing</option>
                  <option>Anxiety or stress</option>
                  <option>Trauma or difficult experiences</option>
                  <option>Emotional wellbeing</option>
                  <option>Postpartum support</option>
                  <option>Sexual wellness</option>
                  <option>Not sure yet</option>
                </select>
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Who is the session for?" htmlFor="session-for">
                  <select
                    id="session-for"
                    required
                    value={sessionFor}
                    onChange={(event) => setSessionFor(event.target.value)}
                    className="w-full rounded-2xl border border-[#C9D7D2] bg-white px-4 py-4 font-semibold text-[#31534E] outline-none transition focus:border-[#0A7F7A]"
                  >
                    <option value="">Choose one</option>
                    <option>Myself</option>
                    <option>Me and my partner</option>
                    <option>My child or teenager</option>
                    <option>My family</option>
                    <option>Someone else</option>
                  </select>
                </FormField>
                <FormField label="Preferred language" htmlFor="language">
                  <select
                    id="language"
                    required
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="w-full rounded-2xl border border-[#C9D7D2] bg-white px-4 py-4 font-semibold text-[#31534E] outline-none transition focus:border-[#0A7F7A]"
                  >
                    <option value="">Choose one</option>
                    <option>Malayalam</option>
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Tamil</option>
                    <option>No preference</option>
                  </select>
                </FormField>
              </div>

              <FormField
                label="Anything else you’d like us to know? (optional)"
                htmlFor="support-note"
                hint="Please do not include emergency, medical, payment or highly sensitive information here."
              >
                <textarea
                  id="support-note"
                  rows={4}
                  maxLength={300}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="A short sentence is enough"
                  className="w-full resize-none rounded-2xl border border-[#C9D7D2] bg-white px-4 py-4 font-semibold text-[#31534E] outline-none transition placeholder:text-[#78908B]/60 focus:border-[#0A7F7A]"
                />
              </FormField>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#064F4B] px-8 py-4 text-sm font-black text-white shadow-lg shadow-[#064F4B]/15 transition hover:bg-[#0A7F7A]"
              >
                Find matching support <LucideIcon name="arrow-right" size={17} />
              </button>
              <p className="text-center text-xs font-medium leading-5 text-[#6C827E]">
                You can review practitioner profiles first, or review a prefilled WhatsApp message before sending it. See Oruma’s <a href="/privacy-policy" className="font-bold text-[#0A7F7A] underline">privacy policy</a>.
              </p>
            </form>

            {showOptions ? (
              <div className="mt-7 rounded-2xl border border-[#0A7F7A]/15 bg-[#F2F8F5] p-5">
                <h3 className="font-heading text-xl font-bold text-[#064F4B]">
                  Your next step
                </h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[#5F7773]">
                  The practitioner list will use your selected concern and
                  language to show profiles that match their stated areas of
                  practice.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={matchingPractitionersHref}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#064F4B] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0A7F7A]"
                  >
                    See matching practitioners
                    <LucideIcon name="arrow-right" size={16} />
                  </a>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#064F4B]/20 bg-white px-6 py-3 text-sm font-black text-[#064F4B] transition hover:border-[#0A7F7A]"
                  >
                    Ask Oruma with these details
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <FloatingActions />
      <Footer />
    </main>
  );
}

function FormField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-black text-[#31534E]">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-2 text-xs font-medium leading-5 text-[#7A8E8A]">{hint}</p> : null}
    </div>
  );
}
