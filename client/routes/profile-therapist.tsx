import React, { useEffect, useMemo, useState } from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import Footer from "../components/Footer";
import { LucideIcon } from "@site-builder/icons";
import { getAccessToken, getCurrentUser } from "../src/lib/auth";
import { BookingResponse, getAppointments } from "../src/lib/booking";
import { getMyTherapistProfile, Therapist, updateMyTherapistProfile } from "../src/lib/therapists";

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
  const [profile, setProfile] = useState<Therapist | null>(null);
  const [form, setForm] = useState({
    name: "",
    title: "",
    tags: "",
    experience: "0",
    group: "1",
    price: "0",
    couplePrice: "",
    image: "",
    qualifications: "",
    specialization: "",
    bio: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    Promise.all([getAppointments(token), getMyTherapistProfile(token)])
      .then(([appointmentData, profileData]) => {
        setAppointments(appointmentData);
        setProfile(profileData);
        setForm({
          name: profileData.name,
          title: profileData.title,
          tags: profileData.tags?.join(", ") ?? "",
          experience: String(profileData.experience),
          group: String(profileData.group),
          price: String(profileData.price),
          couplePrice: profileData.couplePrice ? String(profileData.couplePrice) : "",
          image: profileData.image ?? "",
          qualifications: profileData.qualifications ?? "",
          specialization: profileData.specialization ?? "",
          bio: profileData.bio ?? "",
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load appointment list."))
      .finally(() => setIsLoading(false));
  }, []);

  const upcoming = useMemo(() => {
    return appointments.filter((appointment) => appointment.slot?.startTime && new Date(appointment.slot.startTime).getTime() >= Date.now());
  }, [appointments]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = getAccessToken();
    if (!token) return;

    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const updatedProfile = await updateMyTherapistProfile(token, {
        name: form.name.trim(),
        title: form.title.trim(),
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        experience: Number(form.experience),
        group: Number(form.group),
        price: Number(form.price),
        couplePrice: form.couplePrice ? Number(form.couplePrice) : null,
        image: form.image.trim() || undefined,
        qualifications: form.qualifications.trim() || undefined,
        specialization: form.specialization.trim() || undefined,
        bio: form.bio.trim() || undefined,
      });
      setProfile(updatedProfile);
      setNotice("Profile saved. Admin can activate it when ready.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FBF8] font-body text-[#2E3E3C]">
      <DashboardNavbar />
      <section className="pt-24 pb-20 px-6">
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

                <span className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-xs font-black uppercase tracking-widest ${profile?.isActive ? "bg-[#064F4B] text-white" : "bg-white/50 text-[#064F4B]"}`}>
                  <LucideIcon name={profile?.isActive ? "eye" : "eye-off"} size={16} />
                  {profile?.isActive ? "Public profile active" : "Awaiting admin activation"}
                </span>
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

                <form onSubmit={saveProfile} className="mt-8 grid gap-4 rounded-[1.5rem] border border-[#E2E8E6] bg-[#FBFDFC] p-5 md:grid-cols-2">
                  <Field label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
                  <Field label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
                  <Field label="Tags" value={form.tags} onChange={(value) => setForm({ ...form, tags: value })} />
                  <Field label="Experience" type="number" value={form.experience} onChange={(value) => setForm({ ...form, experience: value })} required />
                  <Field label="Group" type="number" value={form.group} onChange={(value) => setForm({ ...form, group: value })} required />
                  <Field label="Individual fee" type="number" value={form.price} onChange={(value) => setForm({ ...form, price: value })} required />
                  <Field label="Couple fee" type="number" value={form.couplePrice} onChange={(value) => setForm({ ...form, couplePrice: value })} />
                  <Field label="Image file" value={form.image} onChange={(value) => setForm({ ...form, image: value })} />
                  <Field label="Qualifications" value={form.qualifications} onChange={(value) => setForm({ ...form, qualifications: value })} />
                  <Field label="Specialization" value={form.specialization} onChange={(value) => setForm({ ...form, specialization: value })} />
                  <label className="md:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">Bio</span>
                    <textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} className="mt-2 min-h-28 w-full rounded-lg border border-[#DDE8E5] bg-white px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]" />
                  </label>
                  <div className="md:col-span-2">
                    <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-full bg-[#064F4B] px-6 py-4 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60">
                      <LucideIcon name="save" size={16} />
                      {isSaving ? "Saving..." : "Save profile"}
                    </button>
                  </div>
                </form>
                {notice && <p className="mt-4 rounded-lg bg-[#EAF7F2] p-4 font-bold text-[#075E59]">{notice}</p>}

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

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">{label}</span>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-[#DDE8E5] bg-white px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
      />
    </label>
  );
}
