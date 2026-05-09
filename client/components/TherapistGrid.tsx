import React, { useEffect, useState } from 'react';
import { LucideIcon } from '@site-builder/icons';
import BookingModal from './BookingModal';
import {
  formatTherapistPrice,
  formatTherapistSlot,
  getTherapistImage,
  getTherapists,
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
    hasPackages: true,
  };
}

export default function TherapistGrid() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleBookNow = (therapist: Therapist) => {
    setSelectedTherapist(mapForBooking(therapist));
    setIsModalOpen(true);
  };

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

  if (therapists.length === 0) {
    return (
      <div className="py-12 text-center bg-[#F5F8F7] rounded-[2rem] px-6">
        <p className="font-black text-[#064F4B]">No therapists are available right now.</p>
        <p className="text-sm font-bold text-[#5F7F7A] mt-2">Please check back soon or contact Oruma directly.</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
        {therapists.map((therapist) => {
          const image = getTherapistImage(therapist.image);
          const slot = formatTherapistSlot(therapist.nextAvailableSlot);

          return (
            <div key={therapist.id} className="bg-[#B7C8A3] rounded-[3rem] p-8 flex flex-col gap-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
              <div className="flex gap-4 items-start">
                <div className="relative w-20 h-20 shrink-0">
                  {image ? (
                    <img
                      src={image}
                      alt={therapist.name}
                      className="w-full h-full object-cover rounded-full border-4 border-white/50 shadow-sm transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#064F4B]/10 rounded-full border-4 border-white/50 flex items-center justify-center">
                      <LucideIcon name="user" size={32} className="text-[#064F4B]/30" />
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#00D494] border-2 border-[#B7C8A3] rounded-full" />
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-xl font-black text-[#064F4B] leading-tight truncate">{therapist.name}</h3>
                  <p className="text-[10px] font-black text-[#064F4B]/60 uppercase tracking-widest mt-1 truncate">{therapist.title}</p>
                  <div className="mt-2 bg-[#D9E4D9]/80 backdrop-blur-sm inline-block px-3 py-1 rounded-full text-[8px] font-black text-[#0A7F7A] uppercase tracking-tighter">AVAILABLE NOW</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 min-h-[50px]">
                {(therapist.tags?.length ? therapist.tags : ['Mental Health']).slice(0, 4).map((tag) => (
                  <span key={tag} className="text-[9px] font-extrabold text-[#064F4B] bg-white/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20">{tag}</span>
                ))}
                <span className="text-[10px] font-black text-[#064F4B]/50 uppercase tracking-widest">{therapist.experience}+ HRS</span>
              </div>

              <div className="bg-black/5 rounded-[1.5rem] px-5 py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-[#064F4B]/60 uppercase tracking-widest">Consultation Fee</span>
                  <div className="bg-[#00D494]/20 text-[#0A7F7A] text-[7px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter">Bundles Available</div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-[#064F4B]">Rs.{therapist.price.toLocaleString('en-IN')}</p>
                  {therapist.couplePrice && (
                    <p className="text-[9px] font-bold text-[#064F4B]/60 mt-0.5 tracking-tighter">Couple: Rs.{therapist.couplePrice.toLocaleString('en-IN')}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#064F4B]/5 mt-auto">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center mb-1">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-[#064F4B]/50 uppercase tracking-widest">Next Available Slot</p>
                      <p className="text-[11px] font-black text-[#064F4B]">{slot}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBookNow(therapist)}
                      className="flex-1 bg-[#064F4B] text-white py-4 rounded-[1.2rem] font-black text-[10px] hover:bg-[#0A7F7A] transition-all shadow-lg shadow-[#064F4B]/10 active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <LucideIcon name="calendar" size={14} />
                      BOOK SESSION
                    </button>
                    <a
                      href={`https://wa.me/919846462744?text=Hi,%20I%20want%20to%20book%20an%20appointment%20with%20${encodeURIComponent(therapist.name)}`}
                      className="w-14 bg-[#00D494] text-white rounded-[1.2rem] flex items-center justify-center hover:bg-[#00B37E] transition-all active:scale-95 shadow-lg shadow-[#00D494]/20"
                      title="WhatsApp for Booking"
                    >
                      <LucideIcon name="message-circle" size={20} />
                    </a>
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
