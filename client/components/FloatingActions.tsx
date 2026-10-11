import { LucideIcon } from "@site-builder/icons";
import { useLocation } from "react-router-dom";
import { createPageSupportEmailUrl } from "../src/config/business";

export default function FloatingActions() {
  const { pathname } = useLocation();
  const emailLink = createPageSupportEmailUrl(
    pathname,
    "choosing an appropriate practitioner and checking the session fee, next available time, and booking steps",
  );
  return (
    <div className="fixed bottom-12 right-6 z-[100] flex items-end">
      <a
        href={emailLink}
        aria-label="Email Oruma support"
        className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white/20 bg-[#0A7F7A] text-white shadow-2xl transition-all hover:scale-110 active:scale-95"
      >
        <LucideIcon name="mail" size={23} />
      </a>
    </div>
  );
}
