import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LucideIcon } from "@site-builder/icons";
import { getAccessToken, getCurrentUser } from "../src/lib/auth";
import { BookingResponse, getMyAppointments } from "../src/lib/booking";

export const meta = {
  title: "Patient Profile | Oruma",
  description: "Manage your Oruma patient profile and therapy appointments.",
};

function formatDate(value?: string) {
  if (!value) return "To be scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "To be scheduled";

  return date.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function AppointmentCard({ appointment }: { appointment: BookingResponse }) {
  return (
    <article className="rounded-[1.5rem] border border-[#E2E8E6] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">{appointment.status}</p>
          <h3 className="mt-2 text-lg font-black text-[#064F4B]">{appointment.therapist?.name ?? "Therapist"}</h3>
          <p className="mt-1 text-sm font-bold text-[#5F7F7A]">{formatDate(appointment.slot?.startTime)}</p>
        </div>
        <span className="w-fit rounded-full bg-[#F5F8F7] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#064F4B]">
          Online session
        </span>
      </div>
    </article>
  );
}

export default function PatientProfilePage() {
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

    getMyAppointments(token)
      .then(setAppointments)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load appointments."))
      .finally(() => setIsLoading(false));
  }, []);

  const nextAppointment = useMemo(() => {
    return appointments
      .filter((appointment) => appointment.slot?.startTime && new Date(appointment.slot.startTime).getTime() >= Date.now())
      .sort((a, b) => new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime())[0];
  }, [appointments]);

  return (
    <main className="min-h-screen bg-[#F8FBF8] font-body text-[#2E3E3C]">
      <Navbar />
      <section className="pt-32 md:pt-40 pb-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[2rem] bg-[#064F4B] p-7 md:p-9 text-white shadow-xl shadow-[#064F4B]/10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <LucideIcon name="heart-handshake" size={32} />
              </div>
              <p className="mt-8 text-[11px] font-black uppercase tracking-[0.22em] text-white/60">Patient profile</p>
              <h1 className="mt-3 text-4xl md:text-5xl font-heading font-black leading-tight">Welcome back</h1>
              <p className="mt-4 text-white/75 font-medium leading-relaxed">{user?.email}</p>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] bg-white/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Total sessions</p>
                  <p className="mt-2 text-3xl font-black">{appointments.length}</p>
                </div>
                <div className="rounded-[1.25rem] bg-white/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Next session</p>
                  <p className="mt-2 text-sm font-black">{nextAppointment ? formatDate(nextAppointment.slot.startTime) : "Not booked"}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/therapists" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-[#064F4B]">
                  <LucideIcon name="calendar-plus" size={16} />
                  Book session
                </Link>
                <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-4 text-xs font-black uppercase tracking-widest text-white">
                  <LucideIcon name="message-circle" size={16} />
                  Need help
                </Link>
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#E2E8E6] bg-white p-6 md:p-8 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">Care timeline</p>
                  <h2 className="mt-2 text-3xl font-heading font-black text-[#064F4B]">Your appointments</h2>
                </div>
                <Link to="/therapists" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#0A7F7A]">
                  Find therapist
                  <LucideIcon name="arrow-right" size={16} />
                </Link>
              </div>

              <div className="mt-8 space-y-4">
                {isLoading && <p className="rounded-[1.25rem] bg-[#F5F8F7] p-5 font-bold text-[#5F7F7A]">Loading appointments...</p>}
                {!isLoading && error && <p className="rounded-[1.25rem] bg-red-50 p-5 font-bold text-red-700">{error}</p>}
                {!isLoading && !error && appointments.length === 0 && (
                  <div className="rounded-[1.5rem] bg-[#F5F8F7] p-7 text-center">
                    <p className="font-black text-[#064F4B]">No appointments yet.</p>
                    <p className="mt-2 text-sm font-bold text-[#5F7F7A]">Choose a therapist and book your first session.</p>
                  </div>
                )}
                {!isLoading && !error && appointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
