import { useEffect, useState } from "react";
import {
  consentRequired,
  getStoredConsent,
  onConsentChange,
  setConsent,
} from "../src/lib/analytics";

/**
 * Asks for analytics consent when analytics is configured and consent is
 * required (Google Consent Mode v2). Renders nothing otherwise.
 */
export default function ConsentBanner() {
  const [visible, setVisible] = useState(
    () => consentRequired && getStoredConsent() === null,
  );

  useEffect(
    () => onConsentChange(() => setVisible(getStoredConsent() === null)),
    [],
  );

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-[120] mx-auto max-w-3xl rounded-3xl border border-[#064F4B]/15 bg-white p-5 shadow-2xl shadow-[#064F4B]/20 sm:flex sm:items-center sm:gap-6"
    >
      <p className="text-sm font-medium leading-6 text-[#375651]">
        Oruma uses cookies to understand how the website is used and to measure
        marketing. We never use your booking or session details for this.{" "}
        <a href="/privacy-policy" className="font-bold text-[#0A7F7A] underline">
          Privacy Policy
        </a>
      </p>
      <div className="mt-4 flex shrink-0 gap-3 sm:mt-0">
        <button
          type="button"
          onClick={() => setConsent("denied")}
          className="rounded-full border border-[#064F4B]/25 px-5 py-2.5 text-sm font-black text-[#064F4B]"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={() => setConsent("granted")}
          className="rounded-full bg-[#064F4B] px-5 py-2.5 text-sm font-black text-white"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
