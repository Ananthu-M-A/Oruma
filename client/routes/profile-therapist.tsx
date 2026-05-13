import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LucideIcon } from "@site-builder/icons";
import { getAccessToken, getCurrentUser } from "../src/lib/auth";
import { BookingResponse, getAppointments } from "../src/lib/booking";

export const meta = {
  title: "Therapist Profile | Oruma",
  description: "Review therapist appointments and account details on Oruma.",
};

function formatSlot(value?: string) {
  if (!value) return "Time pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time pending";

  return date.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TherapistProfilePage() {
  const user = getCurrentUser();
  const [appointments, setAppointments] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    getAppointments(token)
      .then(setAppointments)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load appointment list."))
      .finally(() => setIsLoading(false));
  }, []);

  const upcoming = useMemo(() => {
    return appointments.filter((appointment) => appointment.slot?.startTime && new Date(appointment.slot.startTime).getTime() >= Date.now());
  }, [appointments]);

  return (
    <main className="min-h-screen bg-[#F8FBF8] font-body text-[#2E3E3C]">
      <Navbar />
      <section className="pt-32 md:pt-40 pb-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] bg-white p-6 md:p-9 shadow-sm border border-[#E2E8E6]">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
              <aside className="rounded-[1.75rem] bg-[#B7C8A3] p-7 text-[#064F4B]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/40">
                  <LucideIcon name="stethoscope" size={32} />
                </div>
                <p className="mt-8 text-[11px] font-black uppercase tracking-[0.22em] text-[#064F4B]/60">Therapist profile</p>
                <h1 className="mt-3 text-4xl font-heading font-black leading-tight">Session desk</h1>
                <p className="mt-4 font-bold text-[#064F4B]/75">{user?.email}</p>

                <div className="mt-8 grid gap-3">
                  <div className="rounded-[1.25rem] bg-white/40 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#064F4B]/60">Upcoming sessions</p>
                    <p className="mt-2 text-3xl font-black">{upcoming.length}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/40 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#064F4B]/60">All appointments</p>
                    <p className="mt-2 text-3xl font-black">{appointments.length}</p>
                  </div>
                </div>

                <Link to="/therapists" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#064F4B] px-6 py-4 text-xs font-black uppercase tracking-widest text-white">
                  <LucideIcon name="user-round-search" size={16} />
                  Public profiles
                </Link>
              </aside>

              <section>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">Appointments</p>
                    <h2 className="mt-2 text-3xl font-heading font-black text-[#064F4B]">Assigned schedule</h2>
                  </div>
                  <span className="w-fit rounded-full bg-[#F5F8F7] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#064F4B]">
                    Therapist access
                  </span>
                </div>

                <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-[#E2E8E6]">
                  {isLoading && <p className="bg-[#F5F8F7] p-5 font-bold text-[#5F7F7A]">Loading appointments...</p>}
                  {!isLoading && error && <p className="bg-red-50 p-5 font-bold text-red-700">{error}</p>}
                  {!isLoading && !error && appointments.length === 0 && (
                    <p className="bg-[#F5F8F7] p-7 text-center font-black text-[#064F4B]">No appointments have been booked yet.</p>
                  )}
                  {!isLoading && !error && appointments.map((appointment) => (
                    <article key={appointment.id} className="grid gap-3 border-b border-[#E2E8E6] bg-white p-5 last:border-b-0 md:grid-cols-[1fr_1fr_auto] md:items-center">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">Patient</p>
                        <p className="mt-1 font-black text-[#064F4B]">{appointment.patient?.email ?? "Patient"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">Slot</p>
                        <p className="mt-1 font-bold text-[#064F4B]">{formatSlot(appointment.slot?.startTime)}</p>
                      </div>
                      <span className="w-fit rounded-full bg-[#0A7F7A]/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                        {appointment.status}
                      </span>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
