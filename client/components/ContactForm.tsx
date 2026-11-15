import { useState, type FormEvent, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { LucideIcon } from "@site-builder/icons";
import {
  enquirySubjects,
  submitEnquiry,
  type EnquiryContactMethod,
  type EnquirySubject,
} from "../src/lib/operations";
import { trackEvent } from "../src/lib/analytics";

type ContactFormProps = {
  /** Pre-selected subject, for example from the "Find your psychologist" page. */
  defaultSubject?: EnquirySubject;
  /** Text placed at the start of the message box. */
  defaultMessage?: string;
  heading?: string;
};

const inputClass =
  "w-full rounded-2xl border border-[#C9D7D2] bg-white px-4 py-3.5 font-medium text-[#31534E] outline-none transition focus:border-[#0A7F7A]";

export default function ContactForm({
  defaultSubject = "Choosing a practitioner",
  defaultMessage = "",
  heading = "Send us a message",
}: ContactFormProps) {
  const { pathname } = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContact, setPreferredContact] =
    useState<EnquiryContactMethod>("email");
  const [subject, setSubject] = useState<EnquirySubject>(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  const needsPhone = preferredContact !== "email";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setStatus("sending");
    try {
      await submitEnquiry({
        name,
        email,
        phone: phone.trim() || undefined,
        preferredContact,
        subject,
        message,
        pagePath: pathname,
        consent,
        website: website || undefined,
      });
      trackEvent("generate_lead", { form: "contact", subject });
      setStatus("sent");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send your message. Please email us instead.",
      );
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <div
        role="status"
        className="rounded-[2rem] border border-[#B7C8A3] bg-[#F5F8F7] p-8 text-center"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E5ECCE] text-[#607D2E]">
          <LucideIcon name="check-circle" size={28} />
        </span>
        <h3 className="mt-5 font-heading text-2xl font-bold text-[#064F4B]">
          Thank you, your message has been sent
        </h3>
        <p className="mt-3 font-medium leading-7 text-[#536D68]">
          We&apos;ve emailed you a confirmation and will reply using your
          preferred contact method.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-5">
      <h3 className="font-heading text-2xl font-bold text-[#064F4B]">{heading}</h3>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="enquiry-name">
          <input
            id="enquiry-name"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Email" htmlFor="enquiry-email">
          <input
            id="enquiry-email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="How should we reply?" htmlFor="enquiry-contact">
          <select
            id="enquiry-contact"
            value={preferredContact}
            onChange={(event) =>
              setPreferredContact(event.target.value as EnquiryContactMethod)
            }
            className={inputClass}
          >
            <option value="email">Email</option>
            <option value="phone">Phone call</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </Field>
        <Field
          label={needsPhone ? "Phone number" : "Phone number (optional)"}
          htmlFor="enquiry-phone"
        >
          <input
            id="enquiry-phone"
            type="tel"
            required={needsPhone}
            pattern="\+?[0-9\s()\-]{7,20}"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="What is it about?" htmlFor="enquiry-subject">
        <select
          id="enquiry-subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value as EnquirySubject)}
          className={inputClass}
        >
          {enquirySubjects.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Your message" htmlFor="enquiry-message">
        <textarea
          id="enquiry-message"
          required
          minLength={10}
          maxLength={1000}
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={inputClass}
        />
        <span className="mt-2 block text-xs font-medium text-[#5F7773]">
          Please don&apos;t include medical or personal health details here.
          You can discuss those privately with your practitioner.
        </span>
      </Field>

      {/* Honeypot: hidden from people and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="enquiry-website">Website</label>
        <input
          id="enquiry-website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <label className="flex items-start gap-3 text-sm font-medium leading-6 text-[#375651]">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[#0A7F7A]"
        />
        <span>
          I agree that Oruma may use these details to reply to my enquiry, as
          described in the{" "}
          <a href="/privacy-policy" className="font-bold text-[#0A7F7A] underline">
            Privacy Policy
          </a>
          .
        </span>
      </label>

      {error ? (
        <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-800">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#064F4B] px-8 py-4 text-sm font-black text-white transition hover:bg-[#0A7F7A] disabled:opacity-60 sm:w-auto"
      >
        <LucideIcon name="mail" size={17} />
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
      <p className="text-xs font-medium text-[#5F7773]">
        This form is not for emergencies. If you are in crisis, contact your
        local emergency services.
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#0A7F7A]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
