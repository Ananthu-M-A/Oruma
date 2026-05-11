import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LucideIcon } from '@site-builder/icons';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import BookingModal from '../components/BookingModal';
import {
  formatTherapistPrice,
  formatTherapistSlot,
  getTherapist,
  getTherapistImage,
  Therapist,
} from '../src/lib/therapists';

export const meta = {
  title: 'Therapist Profile | ORUMA Wellness',
  description: 'View therapist details, specializations, fees, availability, and book a session with ORUMA Wellness.',
};

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

function getPackageSummary(group: number, hasCoupleTherapy: boolean) {
  const individual =
    group === 4
      ? '4 sessions from Rs.5,400'
      : group === 2 || group === 5
        ? '4 sessions from Rs.7,200'
        : '4 sessions from Rs.3,600';

  if (!hasCoupleTherapy) return [{ label: 'Individual Therapy', value: individual }];

  const couple =
    group === 2
      ? '4 sessions from Rs.10,800'
      : group === 5
        ? '4 sessions from Rs.8,100'
        : '4 sessions from Rs.5,400';

  return [
    { label: 'Individual Therapy', value: individual },
    { label: 'Couple Therapy', value: couple },
  ];
}

export default function TherapistDetailPage() {
  const { id } = useParams();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Therapist profile was not found.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    getTherapist(id)
      .then((data) => {
        if (isMounted) setTherapist(data);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : 'Unable to load therapist.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const profile = useMemo(() => {
    if (!therapist) return null;

    const image = getTherapistImage(therapist.image);
    const slot = formatTherapistSlot(therapist.nextAvailableSlot);
    const hasCoupleTherapy = therapist.group !== 1 && Boolean(therapist.couplePrice);

    return {
      image,
      slot,
      hasCoupleTherapy,
      price: formatTherapistPrice(therapist),
      packages: getPackageSummary(therapist.group, hasCoupleTherapy),
      tags: therapist.tags?.length ? therapist.tags : ['Mental Health', 'Counseling', 'Support'],
    };
  }, [therapist]);

  const whatsappLink = therapist
    ? `https://wa.me/918157039987?text=Hi,%20I%20want%20to%20book%20an%20appointment%20with%20${encodeURIComponent(therapist.name)}.`
    : 'https://wa.me/918157039987';

  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C] overflow-x-hidden">
      <Navbar />
      <FloatingActions />

      <section className="pt-32 md:pt-40 pb-16 bg-[#F5F8F7]">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            to="/therapists"
            className="inline-flex items-center gap-2 text-[#064F4B] font-black text-xs uppercase tracking-widest mb-10 hover:text-[#0A7F7A] transition-colors"
          >
            <LucideIcon name="arrow-left" size={16} />
            All Therapists
          </Link>

          {isLoading && (
            <div className="grid lg:grid-cols-[420px_1fr] gap-12 items-stretch">
              <div className="h-[520px] rounded-[2rem] bg-[#B7C8A3]/50 animate-pulse" />
              <div className="space-y-6">
                <div className="h-14 max-w-lg rounded-full bg-[#B7C8A3]/40 animate-pulse" />
                <div className="h-8 max-w-sm rounded-full bg-[#B7C8A3]/30 animate-pulse" />
                <div className="h-40 rounded-[2rem] bg-white animate-pulse" />
              </div>
            </div>
          )}

          {!isLoading && error && (
            <div className="max-w-3xl bg-white rounded-[2rem] px-8 py-12 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
                <LucideIcon name="circle-alert" size={28} />
              </div>
              <h1 className="text-3xl font-heading font-black text-[#064F4B] uppercase tracking-tighter">Profile Unavailable</h1>
              <p className="mt-3 text-[#5F7F7A] font-bold">{error}</p>
            </div>
          )}

          {!isLoading && therapist && profile && (
            <div className="grid lg:grid-cols-[420px_1fr] gap-12 items-start">
              <div className="lg:sticky lg:top-28">
                <div className="bg-[#B7C8A3] rounded-[2rem] p-5 shadow-xl shadow-[#064F4B]/10">
                  <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-white/30">
                    {profile.image ? (
                      <img src={profile.image} alt={therapist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#064F4B]/30">
                        <LucideIcon name="user" size={96} />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <div className="bg-white/40 rounded-[1.25rem] p-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#064F4B]/60">Experience</p>
                      <p className="text-xl font-black text-[#064F4B] mt-1">{therapist.experience}+ hrs</p>
                    </div>
                    <div className="bg-white/40 rounded-[1.25rem] p-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#064F4B]/60">Group</p>
                      <p className="text-xl font-black text-[#064F4B] mt-1">{therapist.group}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 bg-white text-[#0A7F7A] px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest mb-5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#00D494]" />
                  Available for online consultation
                </div>

                <h1 className="text-4xl md:text-6xl font-heading font-black text-[#064F4B] uppercase tracking-tighter leading-none">
                  {therapist.name}
                </h1>
                <p className="mt-4 text-lg md:text-xl font-black text-[#0A7F7A]">{therapist.title}</p>
                {therapist.specialization && (
                  <p className="mt-2 text-[#5F7F7A] font-bold">{therapist.specialization}</p>
                )}

                <div className="flex flex-wrap gap-2 mt-8">
                  {profile.tags.map((tag) => (
                    <span key={tag} className="px-4 py-2 rounded-full bg-white text-[#064F4B] text-[11px] font-black uppercase tracking-tight shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-10">
                  <div className="bg-white rounded-[1.5rem] p-5 shadow-sm">
                    <LucideIcon name="calendar-clock" size={24} className="text-[#0A7F7A]" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#5F7F7A] mt-4">Next Slot</p>
                    <p className="text-sm font-black text-[#064F4B] mt-1">{profile.slot}</p>
                  </div>
                  <div className="bg-white rounded-[1.5rem] p-5 shadow-sm">
                    <LucideIcon name="wallet" size={24} className="text-[#0A7F7A]" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#5F7F7A] mt-4">Fee</p>
                    <p className="text-sm font-black text-[#064F4B] mt-1">{profile.price}</p>
                  </div>
                  <div className="bg-white rounded-[1.5rem] p-5 shadow-sm">
                    <LucideIcon name="video" size={24} className="text-[#0A7F7A]" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#5F7F7A] mt-4">Mode</p>
                    <p className="text-sm font-black text-[#064F4B] mt-1">Video, audio or chat</p>
                  </div>
                </div>

                <div className="mt-10 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm">
                  <h2 className="text-2xl font-heading font-black text-[#064F4B] uppercase tracking-tighter">About</h2>
                  <p className="mt-4 text-[#5F7F7A] font-medium leading-relaxed">
                    {therapist.bio ||
                      `${therapist.name} offers professional psychological support with a calm, client-centered approach.`}
                  </p>
                  {therapist.qualifications && (
                    <div className="mt-6 pt-6 border-t border-[#064F4B]/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">Qualifications</p>
                      <p className="mt-2 font-bold text-[#064F4B]">{therapist.qualifications}</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 grid md:grid-cols-2 gap-4">
                  {profile.packages.map((item) => (
                    <div key={item.label} className="bg-[#064F4B] text-white rounded-[1.5rem] p-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60">{item.label}</p>
                      <p className="mt-2 text-xl font-black">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 bg-[#064F4B] text-white px-8 py-5 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-[#0A7F7A] transition-all shadow-xl shadow-[#064F4B]/20"
                  >
                    <LucideIcon name="calendar" size={18} />
                    Book Session
                  </button>
                  <a
                    href={whatsappLink}
                    className="inline-flex items-center justify-center gap-2 bg-[#00D494] text-white px-8 py-5 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-[#00B37E] transition-all shadow-xl shadow-[#00D494]/20"
                  >
                    <LucideIcon name="message-circle" size={18} />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />

      {therapist && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          therapist={mapForBooking(therapist)}
        />
      )}
    </main>
  );
}
