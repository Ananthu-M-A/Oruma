import { LucideIcon } from "@site-builder/icons";
import BusinessIdentityDisclosure from "./BusinessIdentityDisclosure";
import {
  businessConfig,
  businessLinks,
  createWhatsAppUrl,
} from "../src/config/business";

export default function Footer() {
  const sections = [
    {
      title: "Services",
      links: [
        { name: "Online counselling", href: "/online-counselling" },
        { name: "Individual sessions", href: "/services/individual-therapy" },
        { name: "Couple sessions", href: "/services/couple-therapy" },
        { name: "Wellness services", href: "/services" },
        { name: "Find a practitioner", href: "/therapists" },
      ],
    },
    {
      title: "Information",
      links: [
        { name: "How booking works", href: "/service-delivery-policy" },
        { name: "About", href: "/about" },
        { name: "Articles", href: "/articles" },
        { name: "Contact", href: "/contact" },
        { name: "Careers", href: "/careers" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Terms and Conditions", href: "/terms" },
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Refund Policy", href: "/refund-policy" },
        { name: "Cancellation Policy", href: "/cancellation-policy" },
        { name: "Service Delivery Policy", href: "/service-delivery-policy" },
      ],
    },
  ];

  const socialLinks = [
    {
      icon: "instagram",
      href: "https://www.instagram.com/orumacounselling",
      label: "Instagram",
    },
    {
      icon: "facebook",
      href: "https://www.facebook.com/share/14dGCeongmy/",
      label: "Facebook",
    },
    {
      icon: "linkedin",
      href: "https://www.linkedin.com/in/oruma-counselling-0833143b4",
      label: "LinkedIn",
    },
    {
      icon: "youtube",
      href: "https://youtube.com/@orumacounselling",
      label: "YouTube",
    },
    { icon: "mail", href: businessLinks.supportEmail, label: "Email support" },
    {
      icon: "message-square",
      href: createWhatsAppUrl("Hello, I need help with an Oruma booking."),
      label: "WhatsApp support",
    },
  ];

  return (
    <footer className="bg-[#B7C8A3] py-20 text-[#064F4B]">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-14 border-b border-[#064F4B]/10 pb-16 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <a
              href="/"
              className="mb-7 inline-flex"
              aria-label={`${businessConfig.brandName} home`}
            >
              <img
                src="/assets/oruma-main-logo.webp"
                alt={`${businessConfig.brandName} logo`}
                width="1000"
                height="600"
                loading="lazy"
                decoding="async"
                className="h-14 w-auto object-contain"
              />
            </a>
            <p className="mb-8 max-w-md text-lg font-medium leading-relaxed text-[#064F4B]/75">
              Individual-owned online counselling and wellness service with
              practitioner-led digital consultations and verifiable booking
              support.
            </p>
            <BusinessIdentityDisclosure compact />
            <div className="mt-7 flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    social.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/25 transition-all hover:bg-[#064F4B] hover:text-white"
                >
                  <LucideIcon name={social.icon} size={19} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:col-span-3">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="mb-6 text-xs font-black uppercase tracking-widest">
                  {section.title}
                </h2>
                <ul className="space-y-4">
                  {section.links.map((item) => (
                    <li key={item.href}>
                      <a
                        className="font-bold text-[#064F4B]/80 hover:text-[#0A7F7A]"
                        href={item.href}
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-10 text-center font-bold text-[#064F4B]/70">
          © {new Date().getFullYear()} {businessConfig.brandName}. Operated by{" "}
          {businessConfig.operatorLegalName}.
        </p>
      </div>
    </footer>
  );
}
