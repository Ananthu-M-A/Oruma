// @refresh reset
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";
import Footer from "../components/Footer";
import ProfileTabs from "../components/ProfileTabs";
import { LucideIcon } from "@site-builder/icons";
import { getAccessToken, getCurrentUser } from "../src/lib/auth";
import { AdminSummary, getAdminSummary } from "../src/lib/admin";
import { BookingResponse, getAppointments } from "../src/lib/booking";
import { createTherapist, getAdminTherapists, Therapist } from "../src/lib/therapists";

export const meta = {
  title: "Admin Profile | Oruma",
  description: "Admin overview for Oruma appointments and therapist records.",
};

export default function AdminProfilePage() {
  const user = getCurrentUser();
  const [appointments, setAppointments] = useState<BookingResponse[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const loadAdminData = async () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    const [appointmentData, therapistData, summaryData] = await Promise.all([
      getAppointments(token),
      getAdminTherapists(token),
      getAdminSummary(token),
    ]);
    setAppointments(appointmentData);
    setTherapists(therapistData);
    setSummary(summaryData);
  };

  useEffect(() => {
    loadAdminData()
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load admin overview."))
      .finally(() => setIsLoading(false));
  }, []);

  const pendingCount = useMemo(
    () => appointments.filter((appointment) => appointment.status === "PENDING").length,
    [appointments],
  );
  const inactiveTherapistCount = useMemo(
    () => therapists.filter((therapist) => !therapist.isActive).length,
    [therapists],
  );

  const handleCreateTherapist = async (event: FormEvent) => {
    event.preventDefault();
    const token = getAccessToken();
    if (!token) return;

    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      const therapist = await createTherapist(token, { email: email.trim().toLowerCase() });
      setNotice(
        therapist.credentialsSent
          ? "Therapist account created and credentials email sent."
          : "Therapist account created. Configure email delivery to send credentials automatically.",
      );
      setEmail("");
      setIsCreateOpen(false);
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create therapist.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FBF8] font-body text-[#2E3E3C]">
      <DashboardNavbar />
      <section className="px-6 pb-20 pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0A7F7A]">Admin dashboard</p>
              <h1 className="mt-3 text-4xl font-heading font-black text-[#064F4B] md:text-6xl">Operations overview</h1>
              <p className="mt-3 font-bold text-[#5F7F7A]">{user?.email}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[#064F4B] px-6 py-4 text-xs font-black uppercase tracking-widest text-white"
              >
                <LucideIcon name="user-plus" size={16} />
                Create therapist
              </button>
              <Link to="/profile/admin/therapists" className="inline-flex items-center gap-2 rounded-full border border-[#E2E8E6] bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-[#064F4B]">
                <LucideIcon name="settings-2" size={16} />
                Manage therapists
              </Link>
            </div>
          </div>

          <ProfileTabs
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "appointments", label: "Appointments" },
              { id: "therapists", label: "Therapists" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="mt-10"
          />

          <div className="mt-8">
            {notice && <p className="mb-6 rounded-lg bg-[#EAF7F2] p-4 font-bold text-[#075E59]">{notice}</p>}
            {error && <p className="mb-6 rounded-lg bg-red-50 p-4 font-bold text-red-700">{error}</p>}

            {activeTab === "overview" && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Metric icon="users" label="Patients" value={summary?.patients ?? 0} />
                  <Metric icon="user-round-check" label="Therapists" value={summary?.therapistUsers ?? therapists.length} />
                  <Metric icon="calendar-check" label="Appointments" value={summary?.appointments ?? appointments.length} />
                  <Metric icon="badge-indian-rupee" label="Revenue" value={`Rs.${(summary?.revenue ?? 0).toLocaleString("en-IN")}`} />
                  <Metric icon="video" label="Completed sessions" value={summary?.sessions ?? 0} />
                  <Metric icon="clock-alert" label="Pending appointments" value={summary?.pendingAppointments ?? pendingCount} />
                  <Metric icon="user-round-cog" label="Awaiting activation" value={inactiveTherapistCount} />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <StatusPanel title="Payments" rows={[`Collected: Rs.${(summary?.payments.collected ?? 0).toLocaleString("en-IN")}`, `Refunds: Rs.${summary?.payments.refunds ?? 0}`, `Pending: Rs.${summary?.payments.pending ?? 0}`]} />
                  <StatusPanel title="Case sheets" rows={[`Monitored: ${summary?.caseSheets.monitored ?? 0}`, `Updated: ${summary?.caseSheets.updated ?? 0}`]} />
                  <StatusPanel title="Tickets" rows={[`Open: ${summary?.tickets.open ?? 0}`, `Resolved: ${summary?.tickets.resolved ?? 0}`, `Therapist updates: ${summary?.pendingTherapistUpdates ?? 0}`]} />
                </div>
              </>
            )}

            {activeTab === "appointments" && (
              <section className="rounded-lg bg-white p-6 shadow-sm border border-[#E2E8E6]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">Latest activity</p>
                <h2 className="mt-2 text-3xl font-heading font-black text-[#064F4B]">Appointments</h2>
                <div className="mt-6 overflow-hidden rounded-lg border border-[#E2E8E6]">
                  {isLoading && <p className="bg-[#F5F8F7] p-5 font-bold text-[#5F7F7A]">Loading admin data...</p>}
                  {!isLoading && appointments.length === 0 && (
                    <p className="bg-[#F5F8F7] p-7 text-center font-black text-[#064F4B]">No appointment data is available yet.</p>
                  )}
                  {appointments.slice(0, 10).map((appointment) => (
                    <article key={appointment.id} className="grid gap-3 border-b border-[#E2E8E6] bg-white p-5 last:border-b-0 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-center">
                      <ActivityItem label="Patient" value={appointment.patient?.email ?? "Patient"} />
                      <ActivityItem label="Therapist" value={appointment.therapist?.name ?? "Therapist"} />
                      <ActivityItem label="Created" value={new Date(appointment.createdAt).toLocaleDateString("en-IN")} />
                      <span className="w-fit rounded-full bg-[#0A7F7A]/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                        {appointment.status}
                      </span>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "therapists" && (
              <section className="rounded-lg bg-white p-6 shadow-sm border border-[#E2E8E6]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">Therapist manager</p>
                    <h2 className="mt-2 text-3xl font-heading font-black text-[#064F4B]">Therapists</h2>
                  </div>
                  <button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-[#064F4B] px-6 py-4 text-xs font-black uppercase tracking-widest text-white">
                    <LucideIcon name="user-plus" size={16} />
                    Create therapist
                  </button>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <StatusPanel title="Total therapists" rows={[`Count: ${therapists.length}`]} />
                  <StatusPanel title="Inactive" rows={[`Awaiting activation: ${inactiveTherapistCount}`]} />
                </div>
                <div className="mt-6 overflow-hidden rounded-lg border border-[#E2E8E6]">
                  {therapists.length === 0 && <p className="bg-[#F5F8F7] p-5 text-center font-black text-[#064F4B]">No therapists have been registered yet.</p>}
                  {therapists.map((therapist) => (
                    <article key={therapist.id} className="grid gap-4 border-b border-[#E2E8E6] bg-white p-5 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div>
                        <p className="font-black text-[#064F4B]">{therapist.name || therapist.email}</p>
                        <p className="mt-1 text-sm font-bold text-[#5F7F7A]">{therapist.email}</p>
                      </div>
                      <span className={`w-fit rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest ${therapist.isActive ? "bg-[#EAF7F2] text-[#075E59]" : "bg-[#F5F8F7] text-[#064F4B]"}`}>
                        {therapist.isActive ? "Active" : "Inactive"}
                      </span>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </section>

      {isCreateOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#064F4B]/40 p-4">
          <form onSubmit={handleCreateTherapist} className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">New therapist</p>
                <h2 className="mt-2 text-2xl font-heading font-black text-[#064F4B]">Create account</h2>
              </div>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-full p-2 text-[#064F4B] hover:bg-[#F5F8F7]">
                <LucideIcon name="x" size={18} />
              </button>
            </div>
            <label className="mt-6 block">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">Email address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[#DDE8E5] bg-[#FBFDFC] px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
              />
            </label>
            <button
              type="submit"
              disabled={isSaving}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#064F4B] px-6 py-4 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60"
            >
              <LucideIcon name="mail-plus" size={16} />
              {isSaving ? "Creating..." : "Create and email credentials"}
            </button>
          </form>
        </div>
      )}

      <Footer />
    </main>
  );
}

function Metric({ icon, label, value }: { icon: string; label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-[#E2E8E6]">
      <LucideIcon name={icon} size={26} className="text-[#0A7F7A]" />
      <p className="mt-5 text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">{label}</p>
      <p className="mt-2 text-4xl font-black text-[#064F4B]">{value}</p>
    </div>
  );
}

function StatusPanel({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-[#E2E8E6]">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">{title}</p>
      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <p key={row} className="text-sm font-black text-[#064F4B]">{row}</p>
        ))}
      </div>
    </div>
  );
}

function ActivityItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">{label}</p>
      <p className="mt-1 font-bold text-[#064F4B]">{value}</p>
    </div>
  );
}
