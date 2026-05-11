import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import TherapistSearchHero from '../components/TherapistSearchHero';
import TherapistCardAdvanced from '../components/TherapistCardAdvanced';
import { LucideIcon } from '@site-builder/icons';
import {
  formatTherapistPrice,
  formatTherapistSlot,
  getTherapistImage,
  getTherapists,
  Therapist,
} from '../src/lib/therapists';

export const meta = {
  title: "Find Your Therapist | ORUMA Wellness",
  description: "Connect with senior psychologists and counseling experts. Browse our available therapists and book your session online."
};

function toCardProps(therapist: Therapist) {
  return {
    name: therapist.name,
    id: therapist.id,
    title: therapist.title,
    hours: therapist.experience,
    group: therapist.group,
    tags: therapist.tags ?? [],
    price: formatTherapistPrice(therapist),
    slot: formatTherapistSlot(therapist.nextAvailableSlot),
    img: getTherapistImage(therapist.image),
  };
}

export default function TherapistListingPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    getTherapists()
      .then((data) => {
        if (isMounted) setTherapists(data);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : 'Unable to load therapists.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTherapists = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return therapists;

    return therapists.filter((therapist) => {
      const haystack = [
        therapist.name,
        therapist.title,
        therapist.specialization,
        therapist.qualifications,
        ...(therapist.tags ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [query, therapists]);

  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C] overflow-x-hidden">
      <Navbar />
      <FloatingActions />

      <TherapistSearchHero />

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto mb-16">
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <LucideIcon name="search" size={20} className="text-[#5F7F7A] group-focus-within:text-[#0A7F7A] transition-colors" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-[#F5F8F7] border border-[#E2E8E6] rounded-full py-5 pl-14 pr-8 outline-none focus:ring-4 focus:ring-[#0A7F7A]/10 focus:bg-white focus:border-[#0A7F7A] transition-all text-[#2E3E3C] font-medium shadow-sm"
                placeholder="Search by therapist name, title, or specialization..."
              />
            </div>
          </div>

          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-[#064F4B]/5 text-[#064F4B] px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest mb-4">
              Recommended Professionals
            </div>
            <h2 className="text-3xl font-heading font-black text-[#064F4B] uppercase tracking-tighter">Available Experts</h2>
          </div>

          {isLoading && (
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-[360px] rounded-[3rem] bg-[#B7C8A3]/40 animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="max-w-3xl mx-auto bg-red-50 rounded-[2rem] px-6 py-12 text-center">
              <p className="font-black text-red-700">{error}</p>
            </div>
          )}

          {!isLoading && !error && filteredTherapists.length === 0 && (
            <div className="max-w-3xl mx-auto bg-[#F5F8F7] rounded-[2rem] px-6 py-12 text-center">
              <p className="font-black text-[#064F4B]">No therapists found.</p>
              <p className="text-sm font-bold text-[#5F7F7A] mt-2">Try another search or contact us to help you choose.</p>
            </div>
          )}

          {!isLoading && !error && filteredTherapists.length > 0 && (
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
              {filteredTherapists.map((therapist) => (
                <TherapistCardAdvanced key={therapist.id} {...toCardProps(therapist)} />
              ))}
            </div>
          )}

          <div className="text-center mt-20">
            <p className="text-[#5F7F7A] font-bold mb-6 italic">Can't find what you're looking for?</p>
            <a
              href="https://wa.me/918157039987?text=Hi,%20I%20need%20help%20finding%20the%20right%20therapist."
              className="inline-flex items-center gap-2 bg-[#064F4B] text-[#FFFFFF] px-10 py-5 rounded-full font-black hover:scale-105 transition-all shadow-xl shadow-[#064F4B]/20 uppercase tracking-widest text-xs"
            >
              Let us help you choose <LucideIcon name="arrow-right" size={18} />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
