import React from 'react';
import { LucideIcon } from '@site-builder/icons';

export default function Footer() {
  const sections = [
    {
      title: 'Service',
      links: [
        { name: 'Counselling', href: '/online-counselling' },
        { name: 'Psychiatry', href: '/services' },
        { name: 'Sexual Wellness', href: '/services/sexual-wellness' },
        { name: 'Student Support', href: '/concerns/all-concerns#student' }
      ]
    },
    {
      title: 'Concerns',
      links: [
        { name: 'Anxiety', href: '/concerns/all-concerns#anxiety' },
        { name: 'Depression', href: '/concerns/all-concerns#depression' },
        { name: 'Relationship', href: '/concerns/all-concerns#relationship' },
        { name: 'Stress', href: '/concerns/all-concerns#anxiety' },
        { name: 'Trauma', href: '/concerns/all-concerns#trauma' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Careers', href: '/careers' },
        { name: 'Our Story', href: '/about' },
        { name: 'Join Us', href: '/careers' },
        { name: 'Contact Us', href: '/contact' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy-policy' },
        { name: 'Terms & Conditions', href: '/terms-and-conditions' },
        { name: 'Cancellation & Refunds', href: '/refund-policy' },
        { name: 'Cancellation Details', href: '/cancellation-policy' }
      ]
    }
  ];

  const socialLinks = [
    { icon: 'instagram', href: 'https://www.instagram.com/orumacounselling' },
    { icon: 'facebook', href: 'https://www.facebook.com/share/14dGCeongmy/' },
    { icon: 'linkedin', href: 'https://www.linkedin.com/in/oruma-counselling-0833143b4?utm_source=share_via&utm_content=profile&utm_medium=member_android' },
    { icon: 'youtube', href: 'https://youtube.com/@orumacounselling' },
    { icon: 'mail', href: 'mailto:Oruma987@gmail.com' }
  ];

  return (
    <footer className="bg-[#B7C8A3] text-[#064F4B] py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-16 border-b border-[#064F4B]/10 pb-20">
          <div className="lg:col-span-2">
            <a href="/" className="flex flex-col items-start gap-4 mb-8 group">
              <img 
                src="/assets/oruma-main-logo.webp" 
                alt="Oruma Logo" 
                className="h-14 w-auto object-contain transition-transform group-hover:scale-105" 
              />
            </a>
            <p className="text-[#064F4B]/70 max-w-sm mb-10 text-lg leading-relaxed font-medium">
              Mental health is a priority, not a privilege. Always by your side, supporting your journey gently.
            </p>
            
            {/* Social Icons */}
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.href} 
                  target={social.href.startsWith('http') ? "_blank" : undefined}
                  rel={social.href.startsWith('http') ? "noopener noreferrer" : undefined}
                  className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center hover:bg-[#064F4B] hover:text-white transition-all border border-white/20 shadow-sm"
                >
                  <LucideIcon name={social.icon} size={20} />
                </a>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-12">
            {sections.map((section) => (
              <div key={section.title}>
                <h4 className="font-bold text-[#064F4B] text-xs mb-8 uppercase tracking-widest">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className="text-[#064F4B]/80 font-bold hover:text-[#0A7F7A] transition-colors">{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-20 text-center space-y-12">
          <div className="space-y-2">
            <p className="text-lg font-bold text-[#064F4B]/70 tracking-tight">
              © 2026 Oruma – Together, Gently. All rights reserved.
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="h-px w-20 bg-[#064F4B]/10 mb-10" />
            <p className="text-2xl md:text-3xl font-heading font-black text-[#064F4B]/40 uppercase tracking-[0.15em] leading-relaxed max-w-2xl">
              KERALA'S FIRST YOUTH-LED INITIATIVE
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
