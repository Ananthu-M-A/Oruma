import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LucideIcon } from "@site-builder/icons";
import { getAccessToken, getCurrentUser } from "../src/lib/auth";
import { BookingResponse, getAppointments } from "../src/lib/booking";
import { getTherapists, Therapist } from "../src/lib/therapists";

export const meta = {
  title: "Admin Profile | Oruma",
  description: "Admin overview for Oruma appointments and therapist records.",
};

export default function AdminProfilePage() {
  const user = getCurrentUser();
  const [appointments, setAppointments] = useState<BookingResponse[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    Promise.all([getAppointments(token), getTherapists()])
      .then(([appointmentData, therapistData]) => {
        setAppointments(appointmentData);
        setTherapists(therapistData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load admin overview."))
      .finally(() => setIsLoading(false));
  }, []);

  const pendingCount = useMemo(() => appointments.filter((appointment) => appointment.status === "PENDING").length, [appointments]);

  return (
    <main className="min-h-screen bg-[#F8FBF8] font-body text-[#2E3E3C]">
      <Navbar />
      <section className="pt-32 md:pt-40 pb-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0A7F7A]">Admin profile</p>
              <h1 className="mt-3 text-4xl md:text-6xl font-heading font-black text-[#064F4B]">Operations overview</h1>
              <p className="mt-3 font-bold text-[#5F7F7A]">{user?.email}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/therapists" className="inline-flex items-center gap-2 rounded-full bg-[#064F4B] px-6 py-4 text-xs font-black uppercase tracking-widest text-white">
                <LucideIcon name="users" size={16} />
                Therapists
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-[#064F4B] border border-[#E2E8E6]">
                <LucideIcon name="inbox" size={16} />
                Contact
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] bg-white p-6 shadow-sm border border-[#E2E8E6]">
              <LucideIcon name="calendar-check" size={26} className="text-[#0A7F7A]" />
              <p className="mt-5 text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">Appointments</p>
              <p className="mt-2 text-4xl font-black text-[#064F4B]">{appointments.length}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-6 shadow-sm border border-[#E2E8E6]">
              <LucideIcon name="clock-alert" size={26} className="text-[#0A7F7A]" />
              <p className="mt-5 text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">Pending</p>
              <p className="mt-2 text-4xl font-black text-[#064F4B]">{pendingCount}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-6 shadow-sm border border-[#E2E8E6]">
              <LucideIcon name="user-round-check" size={26} className="text-[#0A7F7A]" />
              <p className="mt-5 text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">Active therapists</p>
              <p className="mt-2 text-4xl font-black text-[#064F4B]">{therapists.length}</p>
            </div>
          </div>

          <section className="mt-8 rounded-[2rem] bg-white p-6 md:p-8 shadow-sm border border-[#E2E8E6]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">Latest activity</p>
                <h2 className="mt-2 text-3xl font-heading font-black text-[#064F4B]">Appointments</h2>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-[#E2E8E6]">
              {isLoading && <p className="bg-[#F5F8F7] p-5 font-bold text-[#5F7F7A]">Loading admin data...</p>}
              {!isLoading && error && <p className="bg-red-50 p-5 font-bold text-red-700">{error}</p>}
              {!isLoading && !error && appointments.length === 0 && (
                <p className="bg-[#F5F8F7] p-7 text-center font-black text-[#064F4B]">No appointment data is available yet.</p>
              )}
              {!isLoading && !error && appointments.slice(0, 10).map((appointment) => (
                <article key={appointment.id} className="grid gap-3 border-b border-[#E2E8E6] bg-white p-5 last:border-b-0 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">Patient</p>
                    <p className="mt-1 font-black text-[#064F4B]">{appointment.patient?.email ?? "Patient"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">Therapist</p>
                    <p className="mt-1 font-bold text-[#064F4B]">{appointment.therapist?.name ?? "Therapist"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">Created</p>
                    <p className="mt-1 font-bold text-[#064F4B]">{new Date(appointment.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <span className="w-fit rounded-full bg-[#0A7F7A]/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                    {appointment.status}
                  </span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}
