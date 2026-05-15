import React, { useState, useEffect } from 'react';
import { LucideIcon } from '@site-builder/icons';
import { AUTH_CHANGED_EVENT, clearAccessToken, getCurrentUser, getRedirectPathForRole } from '../src/lib/auth';
import DashboardNavbar from './DashboardNavbar';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const phoneNumber = "918157039987";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getCurrentUser());

    window.addEventListener(AUTH_CHANGED_EVENT, syncUser);
    window.addEventListener('storage', syncUser);
    syncUser();

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const services = [
    { name: 'Individual Therapy', href: '/services/individual-therapy' },
    { name: 'Couple Therapy', href: '/services/couple-therapy' },
    { name: 'Postpartum Support', href: '/services#postpartum' },
    { name: 'Teenage Counselling', href: '/concerns/all-concerns#student' },
    { name: 'Sexual Wellness', href: '/services/sexual-wellness' }
  ];

  const concerns = [
    { name: 'Relationship Issues', href: '/concerns/all-concerns#relationship' },
    { name: 'Breakup Recovery', href: '/concerns/all-concerns#breakup' },
    { name: 'Anxiety & Stress', href: '/concerns/all-concerns#anxiety' },
    { name: 'Postpartum Support', href: '/concerns/all-concerns#postpartum' },
    { name: 'Depression', href: '/concerns/all-concerns#depression' },
    { name: 'Teenage Wellness', href: '/concerns/all-concerns#student' },
    { name: 'Trauma & PTSD', href: '/concerns/all-concerns#trauma' }
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
      <style dangerouslySetInnerHTML={{ __html: `
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
      `}} />

      <nav className="fixed top-0 left-0 right-0 bg-white z-[1000] border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-18 flex items-center justify-between relative">
          <a href="/" className="flex items-center gap-2 group h-full py-1.5">
             <img 
               src="/assets/oruma-main-logo.webp" 
               alt="Oruma Logo" 
               className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" 
             />
             <div className="flex flex-col justify-center">
               <span className="text-lg md:text-xl font-heading font-black text-[#01413D] tracking-tighter uppercase leading-none">
                 oruma
               </span>
               <span className="text-[7px] font-black text-[#0A7F7A] uppercase tracking-[0.2em] mt-0.5">Together gently</span>
             </div>
          </a>

          <button 
            className="lg:hidden p-2 text-[#0A7F7A] relative z-[1001]" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            <LucideIcon name={isOpen ? "x" : "menu"} size={24} />
          </button>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <a href="/" className="text-xs font-black text-[#5F7F7A] hover:text-[#0A7F7A] tracking-widest uppercase transition-colors">Home</a>
            <a href="/about" className="text-xs font-black text-[#5F7F7A] hover:text-[#0A7F7A] tracking-widest uppercase transition-colors">About Us</a>
            
            <div className="relative group/services">
               <button className="text-xs font-black text-[#5F7F7A] hover:text-[#0A7F7A] tracking-widest uppercase flex items-center gap-1 transition-colors h-16">
                 Services <LucideIcon name="chevron-down" size={12} />
               </button>
               <div className="absolute top-full left-0 pt-0 opacity-0 invisible group-hover/services:opacity-100 group-hover/services:visible transition-all duration-300">
                 <div className="bg-white border border-gray-100 shadow-2xl rounded-b-2xl p-4 min-w-[220px]">
                   {services.map(s => (
                     <a key={s.name} href={s.href} className="block py-2.5 text-[11px] font-black uppercase tracking-tighter text-[#5F7F7A] hover:text-[#0A7F7A] transition-colors">{s.name}</a>
                   ))}
                 </div>
               </div>
            </div>

            <div className="relative group/concerns">
               <button className="text-xs font-black text-[#5F7F7A] hover:text-[#0A7F7A] tracking-widest uppercase flex items-center gap-1 transition-colors h-16">
                 Concerns <LucideIcon name="chevron-down" size={12} />
               </button>
               <div className="absolute top-full left-0 pt-0 opacity-0 invisible group-hover/concerns:opacity-100 group-hover/concerns:visible transition-all duration-300">
                 <div className="bg-white border border-gray-100 shadow-2xl rounded-b-2xl p-4 min-w-[220px]">
                   {concerns.map(c => (
                     <a key={c.name} href={c.href} className="block py-2.5 text-[11px] font-black uppercase tracking-tighter text-[#5F7F7A] hover:text-[#0A7F7A] transition-colors">{c.name}</a>
                   ))}
                 </div>
               </div>
            </div>

            <a href="/therapists" className="text-xs font-black text-[#5F7F7A] hover:text-[#0A7F7A] tracking-widest uppercase transition-colors">Therapists</a>
            <a href="/careers" className="text-xs font-black text-[#5F7F7A] hover:text-[#0A7F7A] tracking-widest uppercase transition-colors">Careers</a>
            <a href="/contact" className="text-xs font-black text-[#5F7F7A] hover:text-[#0A7F7A] tracking-widest uppercase transition-colors">Contact Us</a>
            {currentUser ? (
              <div className="flex items-center gap-3">
                <a href={profilePath} className="inline-flex items-center gap-2 bg-[#F5F8F7] text-[#064F4B] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <LucideIcon name="circle-user-round" size={14} />
                  {currentUser.role}
                </a>
                <button onClick={handleLogout} className="text-xs font-black text-[#0A7F7A] hover:text-[#064F4B] tracking-widest uppercase transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <a href="/login" className="text-xs font-black text-[#0A7F7A] hover:text-[#064F4B] tracking-widest uppercase transition-colors">Login</a>
            )}

            <a href={`https://wa.me/${phoneNumber}?text=Hi,%20I%20want%20to%20book%20an%20appointment`} className="bg-[#0A7F7A] text-white px-7 py-2 rounded-full text-[10px] font-black hover:bg-[#064F4B] transition-all active:scale-95 shadow-lg shadow-[#0A7F7A]/20 uppercase tracking-widest">Book Appointment</a>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 top-0 bg-white z-[999] lg:hidden transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="h-full flex flex-col pt-8 pb-10 overflow-y-auto">
            
            <div className="w-full flex flex-col">
              <a href="/" className="px-8 py-5 text-[14px] font-black text-[#064F4B] border-b border-gray-50 uppercase tracking-tight" onClick={handleLinkClick}>HOME</a>
              <a href="/about" className="px-8 py-5 text-[14px] font-black text-[#064F4B] border-b border-gray-50 uppercase tracking-tight" onClick={handleLinkClick}>ABOUT US</a>

              {/* Services Item */}
              <div className="w-full border-b border-gray-50">
                <button 
                  onClick={() => toggleDropdown('services')}
                  className={`w-full text-left px-8 py-5 text-[14px] font-black flex items-center justify-between transition-colors uppercase tracking-tight ${
                    openDropdown === 'services' ? 'bg-[#0A7F7A]/5 text-[#0A7F7A]' : 'text-[#064F4B]'
                  }`}
                >
                  <span>SERVICES ({services.length})</span>
                  <LucideIcon name={openDropdown === 'services' ? "chevron-up" : "chevron-down"} size={16} />
                </button>
                {openDropdown === 'services' && (
                  <div className="bg-white py-1">
                    {services.map(s => (
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
                  onClick={() => toggleDropdown('concerns')}
                  className={`w-full text-left px-8 py-5 text-[14px] font-black flex items-center justify-between transition-colors uppercase tracking-tight ${
                    openDropdown === 'concerns' ? 'bg-[#0A7F7A]/5 text-[#0A7F7A]' : 'text-[#064F4B]'
                  }`}
                >
                  <span>CONCERNS ({concerns.length})</span>
                  <LucideIcon name={openDropdown === 'concerns' ? "chevron-up" : "chevron-down"} size={16} />
                </button>
                {openDropdown === 'concerns' && (
                  <div className="bg-white py-1">
                    {concerns.map(c => (
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

              <a href="/therapists" className="px-8 py-5 text-[14px] font-black text-[#064F4B] border-b border-gray-50 uppercase tracking-tight" onClick={handleLinkClick}>THERAPISTS</a>
              <a href="/careers" className="px-8 py-5 text-[14px] font-black text-[#064F4B] border-b border-gray-50 uppercase tracking-tight" onClick={handleLinkClick}>CAREERS</a>
              <a href="/contact" className="px-8 py-5 text-[14px] font-black text-[#064F4B] border-b border-gray-50 uppercase tracking-tight" onClick={handleLinkClick}>CONTACT US</a>
              {currentUser ? (
                <>
                  <a href={profilePath} className="px-8 py-5 text-[13px] font-black text-[#0A7F7A] border-b border-gray-50 uppercase tracking-tight" onClick={handleLinkClick}>
                    LOGGED IN AS {currentUser.role}
                  </a>
                  <button className="text-left px-8 py-5 text-[14px] font-black text-[#064F4B] border-b border-gray-50 uppercase tracking-tight" onClick={handleLogout}>LOGOUT</button>
                </>
              ) : (
                <a href="/login" className="px-8 py-5 text-[14px] font-black text-[#064F4B] border-b border-gray-50 uppercase tracking-tight" onClick={handleLinkClick}>LOGIN</a>
              )}
            </div>

            <div className="mt-auto px-8 py-10">
               <a 
                href={`https://wa.me/${phoneNumber}?text=Hi,%20I%20want%20to%20book%20an%20appointment`}
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
