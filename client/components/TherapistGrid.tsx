import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from '@site-builder/icons';
import BookingModal from './BookingModal';
import {
  formatTherapistSlot,
  getTherapistImage,
  getTherapists,
  isSlotOnNextDay,
  Therapist,
} from '../src/lib/therapists';

function mapForBooking(therapist: Therapist) {
  return {
    ...therapist,
    role: therapist.title,
    hours: therapist.experience,
    nextSlot: formatTherapistSlot(therapist.nextAvailableSlot),
    priceInd: `Rs.${therapist.price.toLocaleString('en-IN')}`,
    priceCouple: therapist.couplePrice ? `Rs.${therapist.couplePrice.toLocaleString('en-IN')}` : '-',
    image: getTherapistImage(therapist.image),
  };
}

type TherapistGridProps = {
  nextDayOnly?: boolean;
  searchQuery?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export default function TherapistGrid({
  nextDayOnly = false,
  searchQuery = '',
  emptyTitle = 'No therapists are available right now.',
  emptyDescription = 'Please check back soon or contact Oruma directly.',
}: TherapistGridProps) {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    getTherapists()
      .then((data) => {
        if (isMounted) {
          setTherapists(nextDayOnly ? data.filter((therapist) => isSlotOnNextDay(therapist.nextAvailableSlot)) : data);
        }
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
  }, [nextDayOnly]);

  const handleBookNow = (therapist: Therapist) => {
    setSelectedTherapist(mapForBooking(therapist));
    setIsModalOpen(true);
  };

  const visibleTherapists = therapists.filter((therapist) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return true;

    return [
      therapist.name,
      therapist.title,
      therapist.specialization,
      therapist.qualifications,
      ...(therapist.tags ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery);
  });

  if (isLoading) {
    return (
      <div className="py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-[360px] rounded-[3rem] bg-[#B7C8A3]/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center bg-red-50 rounded-[2rem] px-6">
        <p className="font-black text-red-700">{error}</p>
      </div>
    );
  }

  if (visibleTherapists.length === 0) {
    return (
      <div className="py-12 text-center bg-[#F5F8F7] rounded-[2rem] px-6">
        <p className="font-black text-[#064F4B]">{emptyTitle}</p>
        <p className="text-sm font-bold text-[#5F7F7A] mt-2">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
        {visibleTherapists.map((therapist) => {
          const image = getTherapistImage(therapist.image);
          const slot = formatTherapistSlot(therapist.nextAvailableSlot);
          const tags = therapist.tags?.length ? therapist.tags : ['Mental Health'];
          const languageTags = tags.filter((tag) => ['english', 'malayalam', 'hindi', 'tamil', 'arabic'].includes(tag.toLowerCase()));
          const languages = languageTags.length ? languageTags.join(', ') : 'Malayalam, English';
          const specialization = therapist.specialization || tags.slice(0, 2).join(', ') || 'Mental health support';

          return (
            <div key={therapist.id} className="bg-white rounded-[2rem] border border-[#E2E8E6] p-5 md:p-6 flex flex-col gap-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
              <div className="flex gap-4 items-start">
                <div className="relative w-24 h-24 shrink-0">
                  {image ? (
                    <img
                      src={image}
                      alt={therapist.name}
                      className="w-full h-full object-cover rounded-2xl border border-[#E2E8E6] shadow-sm transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#F5F8F7] rounded-2xl border border-[#E2E8E6] flex items-center justify-center">
                      <LucideIcon name="user" size={32} className="text-[#064F4B]/30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-2xl font-black text-[#064F4B] leading-tight">{therapist.name}</h3>
                  <p className="text-xs font-black text-[#0A7F7A] uppercase tracking-widest mt-1">{therapist.title}</p>
                  <div className="mt-3 bg-[#D9E4D9]/80 inline-block px-3 py-1 rounded-full text-[8px] font-black text-[#0A7F7A] uppercase tracking-tighter">
                    {nextDayOnly ? 'AVAILABLE TOMORROW' : 'AVAILABLE'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <InfoItem icon="briefcase" label="Experience" value="Professional care" />
                <InfoItem icon="award" label="Qualification" value={therapist.qualifications || 'Verified professional'} />
                <InfoItem icon="sparkles" label="Specialization" value={specialization} />
                <InfoItem icon="clock" label="Therapy Hours" value={`${therapist.experience}+ hours`} />
                <InfoItem icon="languages" label="Language" value={languages} />
                <InfoItem icon="calendar-clock" label="Next Slot" value={slot} />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-[9px] font-extrabold text-[#064F4B] bg-[#F5F8F7] px-4 py-1.5 rounded-full border border-[#E2E8E6]">{tag}</span>
                ))}
              </div>

              <div className="pt-4 border-t border-[#E2E8E6] mt-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-xl font-black text-[#064F4B]">starts from ₹1000</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                      to={`/therapists/${therapist.id}`}
                      className="bg-[#F5F8F7] text-[#064F4B] border border-[#DDE8E5] px-5 py-4 rounded-[1.2rem] font-black text-[10px] hover:bg-white transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <LucideIcon name="user-round-search" size={14} />
                      DETAILS
                    </Link>
                    <button
                      onClick={() => handleBookNow(therapist)}
                      className="bg-[#064F4B] text-white px-6 py-4 rounded-[1.2rem] font-black text-[10px] hover:bg-[#0A7F7A] transition-all shadow-lg shadow-[#064F4B]/10 active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <LucideIcon name="calendar" size={14} />
                      BOOK NOW
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        therapist={selectedTherapist}
      />
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F5F8F7] p-3 min-w-0">
      <div className="flex items-center gap-2 text-[#0A7F7A]">
        <LucideIcon name={icon} size={14} />
        <p className="text-[8px] font-black uppercase tracking-widest">{label}</p>
      </div>
      <p className="mt-1 text-xs font-black text-[#064F4B] leading-snug line-clamp-2">{value}</p>
    </div>
  );
}
