import React, { useEffect, useMemo, useState } from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import Footer from "../components/Footer";
import { LucideIcon } from "@site-builder/icons";
import { getAccessToken } from "../src/lib/auth";
import {
  deleteTherapist,
  getAdminTherapists,
  getTherapistPerformance,
  Therapist,
  TherapistPerformance,
  updateTherapist,
} from "../src/lib/therapists";

export const meta = {
  title: "Manage Therapists | Oruma",
  description: "Admin therapist permissions, details, and performance.",
};

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [performance, setPerformance] = useState<TherapistPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = async () => {
    const token = getAccessToken();
    if (!token) return;

    const [therapistData, performanceData] = await Promise.all([
      getAdminTherapists(token),
      getTherapistPerformance(token),
    ]);
    setTherapists(therapistData);
    setPerformance(performanceData);
  };

  useEffect(() => {
    loadData()
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load therapists."))
      .finally(() => setIsLoading(false));
  }, []);

  const performanceByTherapist = useMemo(
    () => new Map(performance.map((item) => [item.therapistId, item])),
    [performance],
  );

  const toggleActive = async (therapist: Therapist) => {
    const token = getAccessToken();
    if (!token) return;

    setError("");
    setNotice("");
    try {
      await updateTherapist(token, therapist.id, { isActive: !therapist.isActive });
      setNotice(`${therapist.name} is now ${therapist.isActive ? "hidden from" : "available to"} the public.`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update therapist.");
    }
  };

  const removeTherapist = async (therapist: Therapist) => {
    const token = getAccessToken();
    if (!token || !window.confirm(`Delete ${therapist.name}?`)) return;

    setError("");
    setNotice("");
    try {
      await deleteTherapist(token, therapist.id);
      setNotice("Therapist deleted.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete therapist.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FBF8] font-body text-[#2E3E3C]">
      <DashboardNavbar />
      <section className="px-6 pb-20 pt-24">
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0A7F7A]">Admin tools</p>
            <h1 className="mt-3 text-4xl font-heading font-black text-[#064F4B] md:text-6xl">Manage therapists</h1>
            <p className="mt-3 max-w-2xl font-bold text-[#5F7F7A]">Review therapist details, control public visibility, and monitor performance.</p>
          </div>

          {notice && <p className="mt-6 rounded-lg bg-[#EAF7F2] p-4 font-bold text-[#075E59]">{notice}</p>}
          {error && <p className="mt-6 rounded-lg bg-red-50 p-4 font-bold text-red-700">{error}</p>}

          <section className="mt-8 rounded-lg bg-white p-6 shadow-sm border border-[#E2E8E6]">
            <div className="overflow-hidden rounded-lg border border-[#E2E8E6]">
              {isLoading && <p className="bg-[#F5F8F7] p-5 font-bold text-[#5F7F7A]">Loading therapists...</p>}
              {!isLoading && therapists.length === 0 && (
                <p className="bg-[#F5F8F7] p-7 text-center font-black text-[#064F4B]">No therapist accounts yet.</p>
              )}
              {!isLoading && therapists.map((therapist) => {
                const stats = performanceByTherapist.get(therapist.id);

                return (
                  <article key={therapist.id} className="grid gap-4 border-b border-[#E2E8E6] bg-white p-5 last:border-b-0 xl:grid-cols-[1.2fr_1fr_1fr_auto] xl:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-[#064F4B]">{therapist.name}</p>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${therapist.isActive ? "bg-[#0A7F7A]/10 text-[#0A7F7A]" : "bg-slate-100 text-slate-500"}`}>
                          {therapist.isActive ? "Public" : "Hidden"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-[#5F7F7A]">{therapist.email}</p>
                      <p className="mt-1 text-sm font-bold text-[#5F7F7A]">{therapist.title}</p>
                      <p className="mt-2 line-clamp-2 text-sm font-medium text-[#5F7F7A]">{therapist.bio || "Profile details pending from therapist."}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">Bookings</p>
                      <p className="mt-1 text-2xl font-black text-[#064F4B]">{stats?.totalAppointments ?? 0}</p>
                      <p className="text-xs font-bold text-[#5F7F7A]">{stats?.completedAppointments ?? 0} completed, {stats?.pendingAppointments ?? 0} pending</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">Performance</p>
                      <p className="mt-1 text-2xl font-black text-[#064F4B]">{stats?.completionRate ?? 0}%</p>
                      <p className="text-xs font-bold text-[#5F7F7A]">Rs.{(stats?.estimatedCompletedRevenue ?? 0).toLocaleString("en-IN")} completed revenue</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleActive(therapist)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#DDE8E5] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#064F4B]"
                      >
                        <LucideIcon name={therapist.isActive ? "eye-off" : "eye"} size={16} />
                        {therapist.isActive ? "Hide" : "Activate"}
                      </button>
                      <button
                        onClick={() => removeTherapist(therapist)}
                        className="inline-flex items-center justify-center rounded-full border border-red-100 p-3 text-red-600"
                        title="Delete therapist"
                      >
                        <LucideIcon name="trash-2" size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}
