import React from 'react';
import TherapistCard from './TherapistCard';

export default function TraumaTherapistGrid() {
  const therapists = [
    {
      name: 'Leena Mary Mathew',
      role: 'Consultant Psychologist',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400',
      tags: ['Anxiety', 'Relationship', 'Self-esteem'],
      hours: '2023',
      price: '₹2000',
      nextSlot: 'Today, 12:00 PM'
    },
    {
      name: 'Jils PV',
      role: 'Consultant Psychologist',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
      tags: ['Trauma', 'Stress', 'Anxiety'],
      hours: '1500',
      price: '₹2000',
      nextSlot: 'Today, 2:00 PM'
    },
    {
      name: 'Noor Pareeda',
      role: 'Consultant Psychologist',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
      tags: ['Depression', 'Grief', 'Relationship'],
      hours: '1800',
      price: '₹2000',
      nextSlot: 'Tomorrow, 10:00 AM'
    },
    {
      name: 'Dr. Pathmash Shahanuma',
      role: 'Consultant Psychologist',
      image: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=400',
      tags: ['Anxiety', 'Trauma', 'Clinical'],
      hours: '2500',
      price: '₹2500',
      nextSlot: 'Tomorrow, 11:00 AM'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12">
        {therapists.map((pro, i) => (
          <TherapistCard key={i} {...pro} />
        ))}
      </div>
    </div>
  );
}
