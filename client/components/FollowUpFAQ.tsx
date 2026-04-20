import React from 'react';
import { LucideIcon } from '@site-builder/icons';

export default function FollowUpFAQ() {
  const faqCards = [
    {
      icon: 'calendar-check',
      title: 'How do I book a follow-up therapy session?',
      steps: [
        'Go to your therapist\'s profile',
        'Select the "Book follow-up session" option',
        'Choose a suitable date and time from the available slots',
        'Confirm your booking and receive the confirmation via email'
      ]
    },
    {
      icon: 'user-check',
      title: 'Will I have the same therapist for follow-up sessions?',
      steps: [
        'Yes, continuity with the same therapist is key for progress',
        'Your therapist will have a deeper understanding of your history and goals',
        'Follow-up sessions help to track and build on your progress',
        'Having the same therapist ensures a consistent therapeutic approach',
        'If you need to change therapists, that option is available upon request'
      ]
    }
  ];

  return (
    <section className="py-24 bg-[#F5F8F7]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-[#064F4B] text-center mb-16">
          Your Questions About <br /> Therapy, <span className="italic">Answered</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {faqCards.map((card, i) => (
            <div key={i} className="bg-white rounded-[3rem] p-10 lg:p-16 shadow-xl shadow-[#064F4B]/5 border border-[#E2E8E6]">
              <div className="w-16 h-16 bg-[#F5F8F7] rounded-2xl flex items-center justify-center text-[#0A7F7A] mb-8 border border-[#E2E8E6]">
                <LucideIcon name={card.icon} size={32} />
              </div>
              <h3 className="text-2xl font-bold text-[#064F4B] mb-8 leading-tight">
                {card.title}
              </h3>
              <ul className="space-y-6">
                {card.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-4 text-[#5F7F7A] font-medium leading-relaxed">
                    <div className="w-1.5 h-1.5 bg-[#B7C8A3] rounded-full mt-2.5 flex-shrink-0" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
