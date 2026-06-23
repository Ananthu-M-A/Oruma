import React from 'react';
import TherapistCard from './TherapistCard';

export default function TraumaTherapistGrid() {
  const therapists = [];

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
