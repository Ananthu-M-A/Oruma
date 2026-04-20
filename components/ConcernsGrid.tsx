import React from 'react';
import { LucideIcon } from '@site-builder/icons';

export default function ConcernsGrid() {
  const concerns = [
    { 
      title: 'Performance anxiety issues', 
      icon: 'zap',
      href: '/concerns/all-concerns#anxiety'
    },
    { 
      title: 'Low desire or mismatched libido', 
      icon: 'battery-low',
      href: '/services/sexual-wellness'
    },
    { 
      title: 'Relationship intimacy concerns', 
      icon: 'heart',
      href: '/concerns/all-concerns#relationship'
    },
    { 
      title: 'Healing trauma & past experiences', 
      icon: 'sparkles',
      href: '/concerns/all-concerns#trauma'
    },
    { 
      title: 'Body image & self-esteem blocks', 
      icon: 'user',
      href: '/concerns/all-concerns#depression'
    },
    { 
      title: 'Gender dysphoria concerns', 
      icon: 'user-check',
      href: '/services/sexual-wellness'
    },
    { 
      title: 'Postpartum intimacy concerns', 
      icon: 'baby',
      href: '/concerns/all-concerns#postpartum'
    },
    { 
      title: 'Queer affirmative counseling', 
      icon: 'rainbow',
      href: '/services/sexual-wellness'
    },
  ];

  const bookingLink = "https://wa.me/917558832001?text=Hi,%20I'd%20like%20to%20book%20a%20consultation%20regarding%20my%20wellness%20concerns.";

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-[#064F4B] mb-4">Concerns We Can <span className="italic text-[#0A7F7A]">Help</span> With</h2>
        <p className="text-[#5F7F7A] mb-16 max-w-2xl mx-auto font-medium">
          We support individuals and couples through a wide range of sexual wellness challenges, including:
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {concerns.map((item) => (
            <a 
              key={item.title} 
              href={item.href}
              className="flex flex-col items-center gap-4 group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#F5F8F7] flex items-center justify-center text-[#0A7F7A] group-hover:bg-[#0A7F7A] group-hover:text-white transition-all border border-[#E2E8E6] group-hover:border-[#0A7F7A] group-hover:-translate-y-2 shadow-sm">
                <LucideIcon name={item.icon} size={28} />
              </div>
              <p className="text-sm font-bold text-[#2E3E3C] max-w-[150px] leading-tight group-hover:text-[#0A7F7A] transition-colors uppercase tracking-tight">
                {item.title}
              </p>
            </a>
          ))}
        </div>

        <a 
          href={bookingLink}
          className="inline-block mt-16 bg-[#064F4B] text-white px-10 py-4 rounded-full font-black shadow-xl shadow-[#064F4B]/20 hover:bg-[#0A7F7A] transition-all active:scale-95"
        >
          Book Consultation
        </a>
      </div>
    </section>
  );
}
