import { LucideIcon } from "@site-builder/icons";
import { useLocation } from "react-router-dom";
import {
  createPageSupportEmailUrl,
  createPageWhatsAppUrl,
  publicContact,
} from "../src/config/business";
import { trackEvent } from "../src/lib/analytics";

export default function FloatingActions() {
  const { pathname } = useLocation();
  const request =
    "choosing an appropriate practitioner and checking the session fee, next available time, and booking steps";
  const emailLink = createPageSupportEmailUrl(pathname, request);
  const whatsappLink = createPageWhatsAppUrl(pathname, request);

  return (
    <div className="fixed bottom-12 right-6 z-[100] flex flex-col items-end gap-3">
      {publicContact.whatsapp ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Oruma on WhatsApp"
          onClick={() => trackEvent("whatsapp_click", { page_path: pathname })}
          className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white/20 bg-[#1FA855] text-white shadow-2xl transition-all hover:scale-110 active:scale-95"
        >
          <LucideIcon name="message-circle" size={24} />
        </a>
      ) : null}
      <a
        href={emailLink}
        aria-label="Email Oruma support"
        onClick={() => trackEvent("email_click", { page_path: pathname })}
        className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white/20 bg-[#0A7F7A] text-white shadow-2xl transition-all hover:scale-110 active:scale-95"
      >
        <LucideIcon name="mail" size={23} />
      </a>
    </div>
  );
}
