import React from 'react';
import { LucideIcon } from '@site-builder/icons';

export default function ServicesSnapshot() {
  const services = [
    { 
      title: 'Psychologist', 
      icon: 'brain', 
      color: 'bg-[#F5F8F7]',
      iconColor: 'text-[#064F4B]',
      href: '/therapists'
    },
    { 
      title: 'Individual Therapy', 
      icon: 'user', 
      color: 'bg-[#F5F8F7]',
      iconColor: 'text-[#064F4B]',
      href: '/services/individual-therapy'
    },
    { 
      title: 'Couple Therapy', 
      icon: 'users', 
      color: 'bg-[#B7C8A3]/10',
      iconColor: 'text-[#064F4B]',
      href: '/services/couple-therapy'
    },
    { 
      title: 'NRI Consultation', 
      icon: 'globe', 
      color: 'bg-[#0A7F7A]/10',
      iconColor: 'text-[#0A7F7A]',
      href: '/consultation',
      isNew: true
    },
    { 
      title: 'Sexual Wellness', 
      icon: 'sparkles', 
      color: 'bg-[#F5F8F7]',
      iconColor: 'text-[#064F4B]',
      href: '/services/sexual-wellness'
    },
  ];

  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-xl md:text-2xl font-heading font-black text-[#064F4B] text-center mb-12 uppercase tracking-tighter">
          How can we support you today?
        </h2>
        
        <div className="max-w-5xl mx-auto">
          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-5 gap-6">
            {services.map(function(service, i) {
              return (
                <a 
                  key={i} 
                  href={service.href}
                  className="flex flex-col items-center gap-4 group transition-transform active:scale-95"
                >
                  <div className={"w-24 h-24 " + service.color + " rounded-[2rem] flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-black/5 group-hover:-translate-y-1 relative"}>
                    {service.isNew && (
                      <div className="absolute -top-2 -right-2 bg-[#00D494] text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">
                        Global
                      </div>
                    )}
                    <LucideIcon 
                      name={service.icon} 
                      size={32} 
                      className={service.iconColor + " opacity-80 group-hover:opacity-100 transition-opacity"} 
                    />
                  </div>
                  <p className="text-[10px] font-black text-[#5F7F7A] text-center leading-tight uppercase tracking-tighter group-hover:text-[#0A7F7A] transition-colors">
                    {service.title}
                  </p>
                </a>
              );
            })}
          </div>

          {/* Mobile Grid */}
          <div className="grid grid-cols-4 md:hidden gap-y-10 gap-x-4">
            {services.map(function(service, i) {
              return (
                <a 
                  key={i} 
                  href={service.href} 
                  className={"flex flex-col items-center gap-3 group active:scale-95 " + (i === 4 ? 'col-start-1' : '')}
                >
                  <div className={"w-16 h-16 " + service.color + " rounded-2xl flex items-center justify-center transition-all duration-300 group-active:scale-110 relative"}>
                    {service.isNew && (
                      <div className="absolute -top-1 -right-1 bg-[#00D494] text-white text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                        New
                      </div>
                    )}
                    <LucideIcon 
                      name={service.icon} 
                      size={24} 
                      className={service.iconColor + " opacity-80"} 
                    />
                  </div>
                  <p className="text-[8px] font-black text-[#5F7F7A] text-center leading-tight uppercase tracking-tighter group-active:text-[#0A7F7A]">
                    {service.title}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
