import { useState, useEffect } from "react";
import { LucideIcon } from "@site-builder/icons";
import {
  AUTH_CHANGED_EVENT,
  clearAccessToken,
  getCurrentUser,
  getRedirectPathForRole,
} from "../src/lib/auth";
import DashboardNavbar from "./DashboardNavbar";
import { concernPaths } from "../src/lib/concerns";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getCurrentUser());

    window.addEventListener(AUTH_CHANGED_EVENT, syncUser);
    window.addEventListener("storage", syncUser);
    syncUser();

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const services = [
    { name: "All Services", href: "/services" },
    { name: "Individual Therapy", href: "/services/individual-therapy" },
    { name: "Couple Therapy", href: "/services/couple-therapy" },
    { name: "Parenting Support", href: "/services/parenting-support" },
    {
      name: "Child & Teen Counselling",
      href: "/services/child-teen-counselling",
    },
    { name: "Family Counselling", href: "/services/family-counselling" },
    { name: "Postpartum Support", href: "/services/postpartum-support" },
    { name: "Sexual Wellness", href: "/services/sexual-wellness" },
  ];

  const concerns = [
    { name: "All Concerns", href: "/concerns" },
    {
      name: "Relationship Issues",
      href: concernPaths.relationship,
    },
    { name: "Breakup Recovery", href: concernPaths.breakup },
    { name: "Anxiety & Stress", href: concernPaths.anxiety },
    { name: "Emotional Wellbeing", href: concernPaths.emotionalWellbeing },
    { name: "Postpartum Support", href: concernPaths.postpartum },
    { name: "Depression", href: concernPaths.depression },
    { name: "Teenage Wellness", href: concernPaths.student },
    { name: "Trauma & PTSD", href: concernPaths.trauma },
  ];

  const programs = [
    { name: "Oruma Courses", href: "/programs/courses" },
    { name: "Offline Workshops", href: "/programs/workshops" },
    { name: "Webinars & Events", href: "/programs/webinars" },
  ];

  const resources = [
    { name: "All Resources", href: "/resources" },
    { name: "Articles", href: "/articles" },
    { name: "About Oruma", href: "/about" },
    { name: "Join as a Practitioner", href: "/careers" },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
    setOpenDropdown(null);
  };

  const handleLogout = () => {
    clearAccessToken();
    handleLinkClick();
  };

  const profilePath = getRedirectPathForRole(currentUser?.role);

  if (currentUser) {
    return <DashboardNavbar />;
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          white-space: nowrap;
          animation: marquee 20s linear infinite;
          width: fit-content;
        }
      `,
        }}
      />

      <nav className="fixed top-0 left-0 right-0 bg-white z-[1000] border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 xl:h-20">
          <a
            href="/"
            aria-label="Oruma home"
            className="group flex shrink-0 items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A7F7A]"
          >
            <img
              src="/assets/Oruma_Primary_Logo.png"
              alt="Oruma logo"
              width="444"
              height="148"
              loading="eager"
              decoding="async"
              className="h-9 w-auto rounded-md bg-[#0A7F7A] p-1 object-contain transition-transform group-hover:scale-[1.03] sm:h-10 xl:h-11"
            />
          </a>

          <button
            className="relative z-[1001] rounded-full p-2 text-[#0A7F7A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A7F7A] xl:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            <LucideIcon name={isOpen ? "x" : "menu"} size={24} />
          </button>

          {/* Desktop Links */}
          <div className="hidden items-center gap-3 xl:flex 2xl:gap-5">
            <a
              href="/"
              className="text-xs font-black text-[#5F7F7A] hover:text-[#0A7F7A] tracking-widest uppercase transition-colors"
            >
              Home
            </a>
            <a
              href="/about"
              className="text-xs font-black text-[#5F7F7A] hover:text-[#0A7F7A] tracking-widest uppercase transition-colors"
            >
              About
            </a>

            <div className="relative group/services">
              <a href="/services" className="text-xs font-black text-[#5F7F7A] hover:text-[#0A7F7A] tracking-widest uppercase flex items-center gap-1 transition-colors h-16">
                Services <LucideIcon name="chevron-down" size={12} />
              </a>
              <div className="absolute top-full left-0 pt-0 opacity-0 invisible group-hover/services:opacity-100 group-hover/services:visible transition-all duration-300">
                <div className="bg-white border border-gray-100 shadow-2xl rounded-b-2xl p-4 min-w-[220px]">
                  {services.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      className="block py-2.5 text-[11px] font-black uppercase tracking-tighter text-[#5F7F7A] hover:text-[#0A7F7A] transition-colors"
                    >
                      {s.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative group/concerns">
              <a href="/concerns" className="text-xs font-black text-[#5F7F7A] hover:text-[#0A7F7A] tracking-widest uppercase flex items-center gap-1 transition-colors h-16">
                Concerns <LucideIcon name="chevron-down" size={12} />
              </a>
              <div className="absolute top-full left-0 pt-0 opacity-0 invisible group-hover/concerns:opacity-100 group-hover/concerns:visible transition-all duration-300">
                <div className="bg-white border border-gray-100 shadow-2xl rounded-b-2xl p-4 min-w-[220px]">
                  {concerns.map((c) => (
                    <a
                      key={c.name}
                      href={c.href}
                      className="block py-2.5 text-[11px] font-black uppercase tracking-tighter text-[#5F7F7A] hover:text-[#0A7F7A] transition-colors"
                    >
                      {c.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <a
              href="/therapists"
              className="text-xs font-black text-[#5F7F7A] hover:text-[#0A7F7A] tracking-widest uppercase transition-colors"
            >
              Therapists
            </a>

            <div className="relative group/programs">
              <a href="/programs" className="text-xs font-black text-[#5F7F7A] hover:text-[#0A7F7A] tracking-widest uppercase flex items-center gap-1 transition-colors h-16">
                Programs <LucideIcon name="chevron-down" size={12} />
              </a>
              <div className="absolute top-full left-0 pt-0 opacity-0 invisible group-hover/programs:opacity-100 group-hover/programs:visible transition-all duration-300">
                <div className="bg-white border border-gray-100 shadow-2xl rounded-b-2xl p-4 min-w-[220px]">
                  {programs.map((program) => (
                    <a
                      key={program.name}
                      href={program.href}
                      className="block py-2.5 text-[11px] font-black uppercase tracking-tighter text-[#5F7F7A] hover:text-[#0A7F7A] transition-colors"
                    >
                      {program.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative group/resources">
              <a href="/resources" className="text-xs font-black text-[#5F7F7A] hover:text-[#0A7F7A] tracking-widest uppercase flex items-center gap-1 transition-colors h-16">
                Resources <LucideIcon name="chevron-down" size={12} />
              </a>
              <div className="absolute top-full left-0 pt-0 opacity-0 invisible group-hover/resources:opacity-100 group-hover/resources:visible transition-all duration-300">
                <div className="bg-white border border-gray-100 shadow-2xl rounded-b-2xl p-4 min-w-[220px]">
                  {resources.map((resource) => (
                    <a
                      key={resource.name}
                      href={resource.href}
                      className="block py-2.5 text-[11px] font-black uppercase tracking-tighter text-[#5F7F7A] hover:text-[#0A7F7A] transition-colors"
                    >
                      {resource.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <a
              href="/contact"
              className="text-xs font-black text-[#5F7F7A] hover:text-[#0A7F7A] tracking-widest uppercase transition-colors"
            >
              Contact
            </a>
            {currentUser ? (
              <div className="flex items-center gap-3">
                <a
                  href={profilePath}
                  className="inline-flex items-center gap-2 bg-[#F5F8F7] text-[#064F4B] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest"
                >
                  <LucideIcon name="circle-user-round" size={14} />
                  {currentUser.role}
                </a>
                <button
                  onClick={handleLogout}
                  className="text-xs font-black text-[#0A7F7A] hover:text-[#064F4B] tracking-widest uppercase transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="text-xs font-black text-[#0A7F7A] hover:text-[#064F4B] tracking-widest uppercase transition-colors"
              >
                Login
              </a>
            )}

            <a
              href={currentUser ? "/therapists" : "/login"}
                className="bg-[#0A7F7A] text-white px-5 py-2 rounded-full text-[10px] font-black hover:bg-[#064F4B] transition-all active:scale-95 shadow-lg shadow-[#0A7F7A]/20 uppercase tracking-widest"
            >
              Book Appointment
            </a>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          id="mobile-navigation"
          className={`fixed inset-x-0 bottom-0 top-14 z-[999] bg-white transition-all duration-300 sm:top-16 xl:hidden ${
            isOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="h-full flex flex-col pt-8 pb-10 overflow-y-auto">
            <div className="w-full flex flex-col">
              <a
                href="/"
                className="px-8 py-5 text-[14px] font-black text-[#064F4B] border-b border-gray-50 uppercase tracking-tight"
                onClick={handleLinkClick}
              >
                HOME
              </a>
              <a
                href="/about"
                className="px-8 py-5 text-[14px] font-black text-[#064F4B] border-b border-gray-50 uppercase tracking-tight"
                onClick={handleLinkClick}
              >
                ABOUT US
              </a>

              {/* Services Item */}
              <div className="w-full border-b border-gray-50">
                <button
                  onClick={() => toggleDropdown("services")}
                  className={`w-full text-left px-8 py-5 text-[14px] font-black flex items-center justify-between transition-colors uppercase tracking-tight ${
                    openDropdown === "services"
                      ? "bg-[#0A7F7A]/5 text-[#0A7F7A]"
                      : "text-[#064F4B]"
                  }`}
                >
                  <span>SERVICES ({services.length})</span>
                  <LucideIcon
                    name={
                      openDropdown === "services"
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={16}
                  />
                </button>
                {openDropdown === "services" && (
                  <div className="bg-white py-1">
                    {services.map((s) => (
                      <a
                        key={s.name}
                        href={s.href}
                        className="block px-12 py-3.5 text-[13px] font-bold text-[#5F7F7A] hover:text-[#0A7F7A] transition-colors uppercase tracking-tighter"
                        onClick={handleLinkClick}
                      >
                        {s.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Concerns Item */}
              <div className="w-full border-b border-gray-50">
                <button
                  onClick={() => toggleDropdown("concerns")}
                  className={`w-full text-left px-8 py-5 text-[14px] font-black flex items-center justify-between transition-colors uppercase tracking-tight ${
                    openDropdown === "concerns"
                      ? "bg-[#0A7F7A]/5 text-[#0A7F7A]"
                      : "text-[#064F4B]"
                  }`}
                >
                  <span>CONCERNS ({concerns.length})</span>
                  <LucideIcon
                    name={
                      openDropdown === "concerns"
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={16}
                  />
                </button>
                {openDropdown === "concerns" && (
                  <div className="bg-white py-1">
                    {concerns.map((c) => (
                      <a
                        key={c.name}
                        href={c.href}
                        className="block px-12 py-3.5 text-[13px] font-bold text-[#5F7F7A] hover:text-[#0A7F7A] transition-colors uppercase tracking-tighter"
                        onClick={handleLinkClick}
                      >
                        {c.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full border-b border-gray-50">
                <button
                  onClick={() => toggleDropdown("programs")}
                  className={`w-full text-left px-8 py-5 text-[14px] font-black flex items-center justify-between transition-colors uppercase tracking-tight ${
                    openDropdown === "programs"
                      ? "bg-[#0A7F7A]/5 text-[#0A7F7A]"
                      : "text-[#064F4B]"
                  }`}
                >
                  <span>PROGRAMS ({programs.length})</span>
                  <LucideIcon
                    name={
                      openDropdown === "programs"
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={16}
                  />
                </button>
                {openDropdown === "programs" && (
                  <div className="bg-white py-1">
                    {programs.map((program) => (
                      <a
                        key={program.name}
                        href={program.href}
                        className="block px-12 py-3.5 text-[13px] font-bold text-[#5F7F7A] hover:text-[#0A7F7A] transition-colors uppercase tracking-tighter"
                        onClick={handleLinkClick}
                      >
                        {program.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full border-b border-gray-50">
                <button
                  onClick={() => toggleDropdown("resources")}
                  className={`w-full text-left px-8 py-5 text-[14px] font-black flex items-center justify-between transition-colors uppercase tracking-tight ${
                    openDropdown === "resources"
                      ? "bg-[#0A7F7A]/5 text-[#0A7F7A]"
                      : "text-[#064F4B]"
                  }`}
                >
                  <span>RESOURCES ({resources.length})</span>
                  <LucideIcon
                    name={
                      openDropdown === "resources"
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={16}
                  />
                </button>
                {openDropdown === "resources" && (
                  <div className="bg-white py-1">
                    {resources.map((resource) => (
                      <a
                        key={resource.name}
                        href={resource.href}
                        className="block px-12 py-3.5 text-[13px] font-bold text-[#5F7F7A] hover:text-[#0A7F7A] transition-colors uppercase tracking-tighter"
                        onClick={handleLinkClick}
                      >
                        {resource.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <a
                href="/therapists"
                className="px-8 py-5 text-[14px] font-black text-[#064F4B] border-b border-gray-50 uppercase tracking-tight"
                onClick={handleLinkClick}
              >
                THERAPISTS
              </a>
              <a
                href="/careers"
                className="px-8 py-5 text-[14px] font-black text-[#064F4B] border-b border-gray-50 uppercase tracking-tight"
                onClick={handleLinkClick}
              >
                CAREERS
              </a>
              <a
                href="/contact"
                className="px-8 py-5 text-[14px] font-black text-[#064F4B] border-b border-gray-50 uppercase tracking-tight"
                onClick={handleLinkClick}
              >
                CONTACT US
              </a>
              {currentUser ? (
                <>
                  <a
                    href={profilePath}
                    className="px-8 py-5 text-[13px] font-black text-[#0A7F7A] border-b border-gray-50 uppercase tracking-tight"
                    onClick={handleLinkClick}
                  >
                    LOGGED IN AS {currentUser.role}
                  </a>
                  <button
                    className="text-left px-8 py-5 text-[14px] font-black text-[#064F4B] border-b border-gray-50 uppercase tracking-tight"
                    onClick={handleLogout}
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <a
                  href="/login"
                  className="px-8 py-5 text-[14px] font-black text-[#064F4B] border-b border-gray-50 uppercase tracking-tight"
                  onClick={handleLinkClick}
                >
                  LOGIN
                </a>
              )}
            </div>

            <div className="mt-auto px-8 py-10">
              <a
                href={currentUser ? "/therapists" : "/login"}
                className="flex items-center justify-between bg-[#0A7F7A] text-white p-5 rounded-xl font-black text-lg shadow-2xl shadow-[#0A7F7A]/20 active:scale-95 transition-transform uppercase tracking-widest"
                onClick={handleLinkClick}
              >
                <span>Book Appointment Now</span>
                <LucideIcon name="arrow-right" size={20} />
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
