import React, { FormEvent, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";
import { LucideIcon } from "@site-builder/icons";
import { createWhatsAppUrl } from "../src/config/business";

export default function FindYourPsychologistPage() {
  const [supportArea, setSupportArea] = useState("");
  const [sessionFor, setSessionFor] = useState("");
  const [language, setLanguage] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = [
      "Hello, I would like help finding the right Oruma psychologist.",
      `Support area: ${supportArea}`,
      `Session for: ${sessionFor}`,
      `Preferred language: ${language}`,
      note.trim() ? `A little more context: ${note.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(createWhatsAppUrl(message), "_blank", "noopener,noreferrer");
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
                Share only what you are comfortable sharing. Your answers will create a WhatsApp message for Oruma’s support team.
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
                Continue on WhatsApp <LucideIcon name="arrow-right" size={17} />
              </button>
              <p className="text-center text-xs font-medium leading-5 text-[#6C827E]">
                By continuing, WhatsApp will open with your answers. Review the message before sending. See Oruma’s <a href="/privacy-policy" className="font-bold text-[#0A7F7A] underline">privacy policy</a>.
              </p>
            </form>
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
