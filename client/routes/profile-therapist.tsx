import React, { useEffect, useMemo, useState } from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import Footer from "../components/Footer";
import PasswordChangeForm from "../components/PasswordChangeForm";
import ProfileTabs from "../components/ProfileTabs";
import { LucideIcon } from "@site-builder/icons";
import { getAccessToken, getCurrentUser } from "../src/lib/auth";
import {
  BookingResponse,
  getEarliestBookableSlotTime,
  getAppointments,
  isBookingLeadTimeBypassEnabled,
  updateAppointmentStatus,
} from "../src/lib/booking";
import {
  AvailabilitySlot,
  createMyAvailabilitySlot,
  deleteMyAvailabilitySlot,
  formatAvailabilitySlotRange,
  getMyAvailabilitySlots,
  getMyTherapistProfile,
  getTherapistImage,
  Therapist,
  updateMyAvailabilitySlot,
  updateMyTherapistProfile,
} from "../src/lib/therapists";
import {
  CaseSheet,
  getCaseSheets,
  upsertCaseSheet,
} from "../src/lib/operations";
import { uploadMedia } from "../src/lib/media";
import {
  addMinutesToIstInput,
  formatIstDateTime,
  fromIstDateTimeInputValue,
  toIstDateTimeInputValue,
} from "../src/lib/dateTime";

export const meta = {
  title: "Therapist Profile | Oruma",
  description: "Review therapist appointments and account details on Oruma.",
};

function formatSlot(value?: string) {
  return formatIstDateTime(value, "Time pending");
}

const healthInfoLabels: Record<string, string> = {
  primaryConcern: "Primary concern",
  currentSymptoms: "Current symptoms",
  medication: "Medication",
  previousTherapy: "Previous therapy",
  emergencyContact: "Emergency contact",
  notes: "Additional notes",
};

function formatHealthInfoLabel(key: string) {
  return (
    healthInfoLabels[key] ??
    key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/^./, (character) => character.toUpperCase())
  );
}

function formatHealthInfoValue(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(formatHealthInfoValue).filter(Boolean).join(", ");
  }
  if (value && typeof value === "object") {
    return Object.values(value)
      .map(formatHealthInfoValue)
      .filter(Boolean)
      .join(", ");
  }
  return "";
}

function TherapistAppointmentCard({
  appointment,
  onStatusChange,
}: {
  appointment: BookingResponse;
  onStatusChange: (
    appointment: BookingResponse,
    status: BookingResponse["status"],
  ) => void;
}) {
  const patientName =
    appointment.patient?.fullName || appointment.patient?.email || "Patient";
  const healthEntries = Object.entries(appointment.patient?.healthInfo ?? {})
    .map(([key, value]) => [key, formatHealthInfoValue(value)] as const)
    .filter(([, value]) => Boolean(value));

  return (
    <article className="rounded-[1.5rem] border border-[#E2E8E6] bg-white p-5 shadow-sm md:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
            Patient
          </p>
          <h3 className="mt-1 break-words text-lg font-black text-[#064F4B]">
            {patientName}
          </h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-[#5F7F7A]">
            {appointment.patient?.email && (
              <span className="break-all">{appointment.patient.email}</span>
            )}
            {appointment.patient?.phone && (
              <span>{appointment.patient.phone}</span>
            )}
            {appointment.patient?.age && (
              <span>{appointment.patient.age} years</span>
            )}
            {appointment.patient?.gender && (
              <span>{appointment.patient.gender}</span>
            )}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
            Session time
          </p>
          <p className="mt-1 font-bold leading-relaxed text-[#064F4B]">
            {formatSlot(appointment.slot?.startTime)}
          </p>
          {appointment.sessionCount > 1 && (
            <p className="mt-1 text-xs font-black uppercase tracking-widest text-[#0A7F7A]">
              {appointment.packageName ??
                `${appointment.sessionCount} sessions`}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:max-w-56 lg:justify-end">
          <span className="w-fit rounded-full bg-[#0A7F7A]/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
            {appointment.status}
          </span>
          {appointment.status === "CONFIRMED" && appointment.meetingLink ? (
            <a
              href={appointment.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[#0A7F7A] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064F4B]"
            >
              <LucideIcon name="video" size={14} />
              Join session
            </a>
          ) : (
            <span className="inline-flex min-h-11 w-fit items-center rounded-full bg-[#F5F8F7] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
              No Zoom link
            </span>
          )}
          <label className="sr-only" htmlFor={`status-${appointment.id}`}>
            Update status for {patientName}
          </label>
          <select
            id={`status-${appointment.id}`}
            value={appointment.status}
            aria-label={`Update status for ${patientName}`}
            onChange={(event) =>
              onStatusChange(
                appointment,
                event.target.value as BookingResponse["status"],
              )
            }
            className="min-h-11 rounded-full border border-[#DDE8E5] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#064F4B] outline-none focus:border-[#0A7F7A] focus:ring-2 focus:ring-[#0A7F7A]/20"
          >
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <details className="group mt-5 rounded-[1.25rem] border border-[#DDE8E5] bg-[#F8FBF8]">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-black text-[#064F4B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A7F7A]">
          <span className="inline-flex items-center gap-2">
            <LucideIcon name="heart-pulse" size={17} />
            Patient health information
          </span>
          <span className="shrink-0 text-[10px] uppercase tracking-widest text-[#5F7F7A]">
            {healthEntries.length > 0
              ? `${healthEntries.length} shared fields`
              : "Not added"}
          </span>
        </summary>
        <div className="border-t border-[#DDE8E5] px-4 py-4">
          {healthEntries.length > 0 ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              {healthEntries.map(([key, value]) => (
                <div key={key} className="min-w-0 rounded-lg bg-white p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                    {formatHealthInfoLabel(key)}
                  </dt>
                  <dd className="mt-2 whitespace-pre-wrap break-words text-sm font-bold leading-relaxed text-[#2E3E3C]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm font-bold text-[#5F7F7A]">
              This patient has not shared health information yet.
            </p>
          )}
          <p className="mt-4 text-xs font-bold text-[#5F7F7A]">
            Health information is private and should only be used for the
            patient&apos;s care.
          </p>
        </div>
      </details>
    </article>
  );
}

export default function TherapistProfilePage() {
  const user = getCurrentUser();
  const [appointments, setAppointments] = useState<BookingResponse[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [caseSheets, setCaseSheets] = useState<CaseSheet[]>([]);
  const [profile, setProfile] = useState<Therapist | null>(null);
  const [slotForm, setSlotForm] = useState({
    startTime: "",
    endTime: "",
  });
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    title: "",
    experience: "0",
    price: "0",
    couplePrice: "",
    image: "",
    voiceIntro: "",
    qualifications: "",
    specialization: "",
    bio: "",
  });
  const [caseForm, setCaseForm] = useState({
    appointmentId: "",
    presentingConcern: "",
    clinicalNotes: "",
    interventionPlan: "",
    followUpPlan: "",
  });
  const [mediaDrafts, setMediaDrafts] = useState<{
    image: { file: File; previewUrl: string } | null;
    voiceIntro: { file: File; previewUrl: string } | null;
  }>({
    image: null,
    voiceIntro: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAppointmentsRefreshing, setIsAppointmentsRefreshing] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<
    "image" | "voiceIntro" | null
  >(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    Promise.all([
      getAppointments(token),
      getMyTherapistProfile(token),
      getMyAvailabilitySlots(token),
      getCaseSheets(token),
    ])
      .then(([appointmentData, profileData, slotData, caseSheetData]) => {
        setAppointments(appointmentData);
        setSlots(slotData);
        setCaseSheets(caseSheetData);
        const effectiveProfile = {
          ...profileData,
          ...(profileData.pendingProfileChanges ?? {}),
        };

        setProfile(profileData);
        setForm({
          name: effectiveProfile.name,
          title: effectiveProfile.title,
          experience: String(effectiveProfile.experience),
          price: String(effectiveProfile.price),
          couplePrice: effectiveProfile.couplePrice
            ? String(effectiveProfile.couplePrice)
            : "",
          image: effectiveProfile.image ?? "",
          voiceIntro: effectiveProfile.voiceIntro ?? "",
          qualifications: effectiveProfile.qualifications ?? "",
          specialization: effectiveProfile.specialization ?? "",
          bio: effectiveProfile.bio ?? "",
        });
      })
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load appointment list.",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (mediaDrafts.image?.previewUrl)
        URL.revokeObjectURL(mediaDrafts.image.previewUrl);
      if (mediaDrafts.voiceIntro?.previewUrl)
        URL.revokeObjectURL(mediaDrafts.voiceIntro.previewUrl);
    };
  }, [mediaDrafts.image?.previewUrl, mediaDrafts.voiceIntro?.previewUrl]);

  const upcoming = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.slot?.startTime &&
        new Date(appointment.slot.startTime).getTime() >= Date.now(),
    );
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
        experience: Number(form.experience),
        price: Number(form.price),
        couplePrice: form.couplePrice ? Number(form.couplePrice) : null,
        image: form.image.trim(),
        voiceIntro: form.voiceIntro.trim(),
        qualifications: form.qualifications.trim() || undefined,
        specialization: form.specialization.trim() || undefined,
        bio: form.bio.trim() || undefined,
      });
      setProfile(updatedProfile);
      setNotice("Profile updates submitted for admin verification.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectProfileMedia = (file: File, field: "image" | "voiceIntro") => {
    setMediaDrafts((current) => {
      if (current[field]?.previewUrl)
        URL.revokeObjectURL(current[field].previewUrl);

      return {
        ...current,
        [field]: {
          file,
          previewUrl: URL.createObjectURL(file),
        },
      };
    });
  };

  const clearProfileMedia = (field: "image" | "voiceIntro") => {
    setMediaDrafts((current) => {
      if (current[field]?.previewUrl)
        URL.revokeObjectURL(current[field].previewUrl);
      return { ...current, [field]: null };
    });
    setForm((current) => ({ ...current, [field]: "" }));
  };

  const uploadProfileMedia = async (field: "image" | "voiceIntro") => {
    const token = getAccessToken();
    const draft = mediaDrafts[field];
    if (!token || !draft) return;

    setUploadingField(field);
    setError("");
    setNotice("");
    try {
      const media = await uploadMedia(token, draft.file);
      setForm((current) => ({ ...current, [field]: media.url }));
      setMediaDrafts((current) => {
        if (current[field]?.previewUrl)
          URL.revokeObjectURL(current[field].previewUrl);
        return { ...current, [field]: null };
      });
      setNotice(
        field === "image"
          ? "Profile image uploaded. Save profile to submit it for approval."
          : "Voice intro uploaded. Save profile to submit it for approval.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload media.");
    } finally {
      setUploadingField(null);
    }
  };

  const saveCaseSheet = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = getAccessToken();
    if (!token) return;

    setError("");
    setNotice("");
    try {
      const saved = await upsertCaseSheet(token, caseForm);
      setCaseSheets((current) => [
        saved,
        ...current.filter((sheet) => sheet.id !== saved.id),
      ]);
      setCaseForm({
        appointmentId: "",
        presentingConcern: "",
        clinicalNotes: "",
        interventionPlan: "",
        followUpPlan: "",
      });
      setNotice("Case sheet saved.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save case sheet.",
      );
    }
  };

  const refreshSlots = async () => {
    const token = getAccessToken();
    if (!token) return;
    setSlots(await getMyAvailabilitySlots(token));
  };

  const refreshAppointments = async () => {
    const token = getAccessToken();
    if (!token) return;

    setIsAppointmentsRefreshing(true);
    setError("");
    try {
      setAppointments(await getAppointments(token));
      setNotice("Appointments and patient health information refreshed.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to refresh appointments.",
      );
    } finally {
      setIsAppointmentsRefreshing(false);
    }
  };

  const saveSlot = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = getAccessToken();
    if (!token) return;

    setError("");
    setNotice("");
    try {
      const payload = {
        startTime: fromIstDateTimeInputValue(slotForm.startTime),
        endTime: fromIstDateTimeInputValue(slotForm.endTime),
      };

      if (editingSlotId) {
        await updateMyAvailabilitySlot(token, editingSlotId, payload);
        setNotice("Availability slot updated.");
      } else {
        await createMyAvailabilitySlot(token, payload);
        setNotice("Availability slot added.");
      }

      setSlotForm({ startTime: "", endTime: "" });
      setEditingSlotId(null);
      await refreshSlots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save slot.");
    }
  };

  const editSlot = (slot: AvailabilitySlot) => {
    setEditingSlotId(slot.id);
    setSlotForm({
      startTime: toIstDateTimeInputValue(slot.startTime),
      endTime: toIstDateTimeInputValue(slot.endTime),
    });
  };

  const removeSlot = async (slot: AvailabilitySlot) => {
    const token = getAccessToken();
    if (!token || !window.confirm("Delete this availability slot?")) return;

    setError("");
    setNotice("");
    try {
      await deleteMyAvailabilitySlot(token, slot.id);
      setNotice("Availability slot removed.");
      await refreshSlots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove slot.");
    }
  };

  const changeAppointmentStatus = async (
    appointment: BookingResponse,
    status: BookingResponse["status"],
  ) => {
    const token = getAccessToken();
    if (!token) return;

    setError("");
    setNotice("");
    try {
      const updatedAppointment = await updateAppointmentStatus(
        appointment.id,
        status,
        token,
      );
      setAppointments((current) =>
        current.map((item) =>
          item.id === appointment.id ? updatedAppointment : item,
        ),
      );
      setNotice("Appointment status updated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update appointment.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FBF8] font-body text-[#2E3E3C]">
      <DashboardNavbar />
      <section className="px-4 pb-20 pt-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] bg-white p-6 md:p-9 shadow-sm border border-[#E2E8E6]">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
              <aside className="rounded-[1.75rem] bg-[#B7C8A3] p-7 text-[#064F4B]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/40">
                  <LucideIcon name="stethoscope" size={32} />
                </div>
                <p className="mt-8 text-[11px] font-black uppercase tracking-[0.22em] text-[#064F4B]/60">
                  Therapist profile
                </p>
                <h1 className="mt-3 text-4xl font-heading font-black leading-tight">
                  Session desk
                </h1>
                <p className="mt-4 font-bold text-[#064F4B]/75">
                  {user?.email}
                </p>

                <div className="mt-8 grid gap-3">
                  <div className="rounded-[1.25rem] bg-white/40 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#064F4B]/60">
                      Upcoming sessions
                    </p>
                    <p className="mt-2 text-3xl font-black">
                      {upcoming.length}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/40 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#064F4B]/60">
                      All appointments
                    </p>
                    <p className="mt-2 text-3xl font-black">
                      {appointments.length}
                    </p>
                  </div>
                </div>

                <span
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-xs font-black uppercase tracking-widest ${profile?.isActive ? "bg-[#064F4B] text-white" : "bg-white/50 text-[#064F4B]"}`}
                >
                  <LucideIcon
                    name={profile?.isActive ? "eye" : "eye-off"}
                    size={16}
                  />
                  {profile?.isActive
                    ? "Public profile active"
                    : "Awaiting admin activation"}
                </span>
              </aside>

              <section className="rounded-[2rem] border border-[#E2E8E6] bg-white p-6 md:p-8 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                      Appointments
                    </p>
                    <h2 className="mt-2 text-3xl font-heading font-black text-[#064F4B]">
                      Assigned schedule
                    </h2>
                  </div>
                  <span className="w-fit rounded-full bg-[#F5F8F7] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#064F4B]">
                    Therapist access
                  </span>
                </div>

                <ProfileTabs
                  tabs={[
                    { id: "profile", label: "Profile" },
                    { id: "availability", label: "Availability" },
                    { id: "appointments", label: "Appointments" },
                    { id: "cases", label: "Case sheets" },
                    { id: "account", label: "Account" },
                  ]}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                  className="mt-8"
                />

                <div className="mt-8">
                  {notice && (
                    <p
                      role="status"
                      aria-live="polite"
                      className="mb-4 rounded-lg bg-[#EAF7F2] p-4 font-bold text-[#075E59]"
                    >
                      {notice}
                    </p>
                  )}
                  {error && (
                    <p
                      role="alert"
                      className="mb-4 rounded-lg bg-red-50 p-4 font-bold text-red-700"
                    >
                      {error}
                    </p>
                  )}
                  {activeTab === "profile" &&
                    profile?.pendingProfileChanges && (
                      <p className="mb-4 rounded-lg bg-amber-50 p-4 text-sm font-bold text-amber-800">
                        Your latest profile changes are waiting for admin
                        approval. Public therapist pages show approved media
                        until then.
                      </p>
                    )}

                  {activeTab === "profile" && (
                    <form
                      onSubmit={saveProfile}
                      className="grid gap-4 rounded-[1.5rem] border border-[#E2E8E6] bg-[#FBFDFC] p-5 md:grid-cols-2"
                    >
                      <Field
                        label="Name"
                        value={form.name}
                        onChange={(value) => setForm({ ...form, name: value })}
                        required
                      />
                      <SelectField
                        label="Title"
                        value={form.title}
                        onChange={(value) => setForm({ ...form, title: value })}
                        options={titleOptions}
                        required
                      />
                      <Field
                        label="Experience"
                        type="number"
                        value={form.experience}
                        onChange={(value) =>
                          setForm({ ...form, experience: value })
                        }
                        required
                      />
                      <Field
                        label="Individual fee"
                        type="number"
                        value={form.price}
                        onChange={(value) => setForm({ ...form, price: value })}
                        required
                      />
                      <Field
                        label="Couple fee"
                        type="number"
                        value={form.couplePrice}
                        onChange={(value) =>
                          setForm({ ...form, couplePrice: value })
                        }
                      />
                      <MediaUploadField
                        label="Profile image"
                        accept="image/*"
                        value={form.image}
                        draftPreviewUrl={mediaDrafts.image?.previewUrl ?? ""}
                        isUploading={uploadingField === "image"}
                        onSelect={(file) => selectProfileMedia(file, "image")}
                        onUpload={() => uploadProfileMedia("image")}
                        onClear={() => clearProfileMedia("image")}
                        preview="image"
                      />
                      <MediaUploadField
                        label="Voice intro"
                        accept="audio/*"
                        value={form.voiceIntro}
                        draftPreviewUrl={
                          mediaDrafts.voiceIntro?.previewUrl ?? ""
                        }
                        isUploading={uploadingField === "voiceIntro"}
                        onSelect={(file) =>
                          selectProfileMedia(file, "voiceIntro")
                        }
                        onUpload={() => uploadProfileMedia("voiceIntro")}
                        onClear={() => clearProfileMedia("voiceIntro")}
                        preview="audio"
                      />
                      <SelectField
                        label="Qualification"
                        value={form.qualifications}
                        onChange={(value) =>
                          setForm({ ...form, qualifications: value })
                        }
                        options={qualificationOptions}
                      />
                      <SelectField
                        label="Specialization"
                        value={form.specialization}
                        onChange={(value) =>
                          setForm({ ...form, specialization: value })
                        }
                        options={specializationOptions}
                      />
                      <label className="md:col-span-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                          Bio
                        </span>
                        <textarea
                          value={form.bio}
                          onChange={(event) =>
                            setForm({ ...form, bio: event.target.value })
                          }
                          className="mt-2 min-h-28 w-full rounded-lg border border-[#DDE8E5] bg-white px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
                        />
                      </label>
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 rounded-full bg-[#064F4B] px-6 py-4 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60"
                        >
                          <LucideIcon name="save" size={16} />
                          {isSaving ? "Saving..." : "Save profile"}
                        </button>
                      </div>
                    </form>
                  )}

                  {activeTab === "availability" && (
                    <section className="rounded-[1.5rem] border border-[#E2E8E6] bg-white p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                            Availability
                          </p>
                          <h3 className="mt-1 text-2xl font-heading font-black text-[#064F4B]">
                            Time slots
                          </h3>
                        </div>
                        <span className="w-fit rounded-full bg-[#F5F8F7] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#064F4B]">
                          {slots.length} slots
                        </span>
                      </div>

                      <form
                        onSubmit={saveSlot}
                        className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
                      >
                        <label>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                            Start (IST)
                          </span>
                          <input
                            type="datetime-local"
                            required
                            min={toIstDateTimeInputValue(
                              getEarliestBookableSlotTime(),
                            )}
                            value={slotForm.startTime}
                            onChange={(event) => {
                              const startTime = event.target.value;
                              setSlotForm({
                                startTime,
                                endTime: addMinutesToIstInput(startTime, 60),
                              });
                            }}
                            className="mt-2 w-full rounded-lg border border-[#DDE8E5] bg-[#FBFDFC] px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
                          />
                        </label>
                        <label>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                            End (IST)
                          </span>
                          <input
                            type="datetime-local"
                            required
                            readOnly
                            value={slotForm.endTime}
                            className="mt-2 w-full rounded-lg border border-[#DDE8E5] bg-[#F5F8F7] px-4 py-3 font-bold text-[#064F4B] outline-none"
                          />
                        </label>
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#064F4B] px-5 py-4 text-xs font-black uppercase tracking-widest text-white"
                        >
                          <LucideIcon
                            name={editingSlotId ? "save" : "plus"}
                            size={16}
                          />
                          {editingSlotId ? "Update" : "Add"}
                        </button>
                      </form>
                      <p className="mt-3 text-xs font-bold text-[#5F7F7A]">
                        {isBookingLeadTimeBypassEnabled
                          ? "Development lead-time bypass is enabled; any future slot may be posted."
                          : "Availability must start at least 24 hours from the current time."}
                      </p>
                      {editingSlotId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSlotId(null);
                            setSlotForm({ startTime: "", endTime: "" });
                          }}
                          className="mt-3 text-xs font-black uppercase tracking-widest text-[#0A7F7A]"
                        >
                          Cancel slot edit
                        </button>
                      )}

                      <div className="mt-5 overflow-hidden rounded-lg border border-[#E2E8E6]">
                        {slots.length === 0 && (
                          <p className="bg-[#F5F8F7] p-5 text-center font-black text-[#064F4B]">
                            No availability slots yet.
                          </p>
                        )}
                        {slots.map((slot) => (
                          <article
                            key={slot.id}
                            className="flex flex-col gap-3 border-b border-[#E2E8E6] p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="font-black text-[#064F4B]">
                                {formatAvailabilitySlotRange(slot)}
                              </p>
                              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                                {slot.status}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={slot.status === "BOOKED"}
                                onClick={() => editSlot(slot)}
                                className="rounded-full border border-[#DDE8E5] p-3 text-[#064F4B] disabled:opacity-40"
                                title="Edit slot"
                                aria-label={`Edit slot ${formatAvailabilitySlotRange(slot)}`}
                              >
                                <LucideIcon name="pencil" size={16} />
                              </button>
                              <button
                                type="button"
                                disabled={slot.status === "BOOKED"}
                                onClick={() => removeSlot(slot)}
                                className="rounded-full border border-red-100 p-3 text-red-600 disabled:opacity-40"
                                title="Delete slot"
                                aria-label={`Delete slot ${formatAvailabilitySlotRange(slot)}`}
                              >
                                <LucideIcon name="trash-2" size={16} />
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  )}

                  {activeTab === "appointments" && (
                    <section className="mt-8">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-xl font-heading font-black text-[#064F4B]">
                            Patient appointments
                          </h3>
                          <p className="mt-1 text-sm font-bold text-[#5F7F7A]">
                            Review current patient details and private health
                            information.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={refreshAppointments}
                          disabled={isAppointmentsRefreshing}
                          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-[#DDE8E5] bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-[#064F4B] disabled:cursor-wait disabled:opacity-60"
                        >
                          <LucideIcon
                            name="refresh-cw"
                            size={15}
                            className={
                              isAppointmentsRefreshing ? "animate-spin" : ""
                            }
                          />
                          {isAppointmentsRefreshing ? "Refreshing" : "Refresh"}
                        </button>
                      </div>
                      {isLoading && (
                        <p className="rounded-[1.5rem] bg-[#F5F8F7] p-5 font-bold text-[#5F7F7A]">
                          Loading appointments...
                        </p>
                      )}
                      {!isLoading && error && (
                        <p className="rounded-[1.5rem] bg-red-50 p-5 font-bold text-red-700">
                          {error}
                        </p>
                      )}
                      {!isLoading && !error && appointments.length === 0 && (
                        <p className="rounded-[1.5rem] bg-[#F5F8F7] p-7 text-center font-black text-[#064F4B]">
                          No appointments have been booked yet.
                        </p>
                      )}
                      {!isLoading && !error && appointments.length > 0 && (
                        <div className="grid gap-4">
                          {appointments.map((appointment) => (
                            <TherapistAppointmentCard
                              key={appointment.id}
                              appointment={appointment}
                              onStatusChange={changeAppointmentStatus}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {activeTab === "cases" && (
                    <section className="rounded-[1.5rem] border border-[#E2E8E6] bg-white p-5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                        Case sheet updates
                      </p>
                      <h3 className="mt-1 text-2xl font-heading font-black text-[#064F4B]">
                        Session notes
                      </h3>
                      <form
                        onSubmit={saveCaseSheet}
                        className="mt-5 grid gap-4"
                      >
                        <label>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                            Appointment
                          </span>
                          <select
                            required
                            value={caseForm.appointmentId}
                            onChange={(event) =>
                              setCaseForm({
                                ...caseForm,
                                appointmentId: event.target.value,
                              })
                            }
                            className="mt-2 w-full rounded-lg border border-[#DDE8E5] bg-white px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
                          >
                            <option value="">Select appointment</option>
                            {appointments.map((appointment) => (
                              <option
                                key={appointment.id}
                                value={appointment.id}
                              >
                                {appointment.patient?.fullName ||
                                  appointment.patient?.email ||
                                  "Patient"}{" "}
                                - {formatSlot(appointment.slot?.startTime)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <TextArea
                          label="Presenting concern"
                          value={caseForm.presentingConcern}
                          onChange={(value) =>
                            setCaseForm({
                              ...caseForm,
                              presentingConcern: value,
                            })
                          }
                        />
                        <TextArea
                          label="Clinical notes"
                          value={caseForm.clinicalNotes}
                          onChange={(value) =>
                            setCaseForm({ ...caseForm, clinicalNotes: value })
                          }
                        />
                        <TextArea
                          label="Intervention plan"
                          value={caseForm.interventionPlan}
                          onChange={(value) =>
                            setCaseForm({
                              ...caseForm,
                              interventionPlan: value,
                            })
                          }
                        />
                        <TextArea
                          label="Follow-up plan"
                          value={caseForm.followUpPlan}
                          onChange={(value) =>
                            setCaseForm({ ...caseForm, followUpPlan: value })
                          }
                        />
                        <button className="w-fit rounded-full bg-[#064F4B] px-6 py-4 text-xs font-black uppercase tracking-widest text-white">
                          Save case sheet
                        </button>
                      </form>
                      <div className="mt-6 overflow-hidden rounded-lg border border-[#E2E8E6]">
                        {caseSheets.length === 0 && (
                          <p className="bg-[#F5F8F7] p-5 text-center font-black text-[#064F4B]">
                            No case sheets yet.
                          </p>
                        )}
                        {caseSheets.map((sheet) => (
                          <article
                            key={sheet.id}
                            className="border-b border-[#E2E8E6] p-5 last:border-b-0"
                          >
                            <p className="font-black text-[#064F4B]">
                              {sheet.patient?.fullName ||
                                sheet.patient?.email ||
                                "Patient"}
                            </p>
                            <p className="mt-1 text-xs font-black uppercase tracking-widest text-[#5F7F7A]">
                              Updated {formatIstDateTime(sheet.updatedAt)}
                            </p>
                            <p className="mt-3 text-sm font-bold text-[#5F7F7A]">
                              {sheet.presentingConcern ||
                                sheet.clinicalNotes ||
                                "No notes entered."}
                            </p>
                          </article>
                        ))}
                      </div>
                    </section>
                  )}

                  {activeTab === "account" && <PasswordChangeForm />}
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

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-24 w-full rounded-lg border border-[#DDE8E5] bg-white px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
      />
    </label>
  );
}

function MediaUploadField({
  label,
  accept,
  value,
  draftPreviewUrl,
  isUploading,
  onSelect,
  onUpload,
  onClear,
  preview,
}: {
  label: string;
  accept: string;
  value: string;
  draftPreviewUrl: string;
  isUploading: boolean;
  onSelect: (file: File) => void;
  onUpload: () => void;
  onClear: () => void;
  preview: "image" | "audio";
}) {
  const uploadedValue = preview === "image" ? getTherapistImage(value) : value;
  const previewValue = draftPreviewUrl || uploadedValue;
  const hasDraft = Boolean(draftPreviewUrl);

  return (
    <div className="rounded-lg border border-[#DDE8E5] bg-white p-4 md:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
            {label}
          </p>
          {hasDraft && (
            <p className="mt-1 text-xs font-black text-[#0A7F7A]">
              Preview before upload
            </p>
          )}
        </div>
        {(value || hasDraft) && (
          <button
            type="button"
            onClick={onClear}
            className="w-fit rounded-full border border-red-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600"
          >
            Remove
          </button>
        )}
      </div>

      {previewValue && preview === "image" && (
        <img
          src={previewValue}
          alt={`${label} preview`}
          loading="lazy"
          decoding="async"
          className="mt-4 h-32 w-32 rounded-lg object-cover"
        />
      )}
      {previewValue && preview === "audio" && (
        <audio controls src={previewValue} className="mt-4 w-full" />
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#DDE8E5] bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-[#064F4B]">
          <LucideIcon
            name={preview === "image" ? "image-plus" : "mic"}
            size={16}
          />
          Choose {label}
          <input
            type="file"
            accept={accept}
            disabled={isUploading}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onSelect(file);
              event.target.value = "";
            }}
          />
        </label>
        <button
          type="button"
          disabled={!hasDraft || isUploading}
          onClick={onUpload}
          className="inline-flex items-center gap-2 rounded-full bg-[#064F4B] px-5 py-3 text-xs font-black uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LucideIcon name="cloud-upload" size={16} />
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

const titleOptions = [
  "Clinical Psychologist",
  "Counselling Psychologist",
  "Psychiatrist",
  "Psychotherapist",
  "Relationship Therapist",
  "Child & Adolescent Therapist",
];
const qualificationOptions = [
  "M.Phil. Clinical Psychology",
  "MA Clinical Psychology",
  "MSc Applied Psychology",
  "PhD Psychology",
  "PG Diploma in Counselling",
  "MBBS Psychiatry",
];
const specializationOptions = [
  "Anxiety",
  "Depression",
  "Trauma",
  "Relationship & Couples",
  "Work Stress",
  "Grief",
  "Postpartum",
  "Student & Youth",
  "LGBTQIA+",
  "Parenting",
];

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
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
        {label}
      </span>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-[#DDE8E5] bg-white px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
        {label}
      </span>
      <select
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-[#DDE8E5] bg-white px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
