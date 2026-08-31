import React, { FormEvent, useEffect, useMemo, useState } from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import Footer from "../components/Footer";
import MultiSelectDropdown from "../components/MultiSelectDropdown";
import { LucideIcon } from "@site-builder/icons";
import { getAccessToken } from "../src/lib/auth";
import {
  approveTherapistProfileChanges,
  deleteTherapist,
  getAdminTherapists,
  getTherapistPerformance,
  rejectTherapistProfileChanges,
  restoreTherapist,
  Therapist,
  TherapistPerformance,
  getTherapistImage,
  updateTherapist,
} from "../src/lib/therapists";
import { formatIstDateTime } from "../src/lib/dateTime";
import {
  splitTherapistTags,
  therapistAreaOfPracticeOptions,
  therapistAwardingInstitutionOptions,
  therapistConsultationTypeOptions,
  therapistEngagementRelationshipOptions,
  therapistLanguageOptions,
  therapistProfessionalRoleOptions,
  therapistQualificationOptions,
  therapistSpecializationOptions,
} from "../src/lib/therapistProfileOptions";

export const meta = {
  title: "Manage Therapists | Oruma",
  description: "Admin therapist permissions, details, and performance.",
};

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [performance, setPerformance] = useState<TherapistPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("pending");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<Therapist | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    title: "",
    areasOfPractice: [] as string[],
    languages: [] as string[],
    experience: "",
    specialization: "",
    qualifications: "",
    awardingInstitution: "",
    consultationType: "",
    verifiedExperienceHours: "",
    professionalRegistrationNumber: "",
    registrationAuthority: "",
    sessionDurationMinutes: "60",
    engagementRelationship: "",
    verificationStatus: "UNVERIFIED" as Therapist["verificationStatus"],
    price: "",
    couplePrice: "",
    bio: "",
  });

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
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Unable to load therapists.",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const performanceByTherapist = useMemo(
    () => new Map(performance.map((item) => [item.therapistId, item])),
    [performance],
  );

  const visibleTherapists = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = therapists.filter((therapist) => {
      if (!search) return true;

      return [
        therapist.name,
        therapist.email ?? "",
        therapist.title,
        therapist.specialization ?? "",
        therapist.qualifications ?? "",
        therapist.bio ?? "",
        ...(therapist.areasOfPractice ?? therapist.tags ?? []),
        ...(therapist.languages ?? []),
      ].some((value) => value.toLowerCase().includes(search));
    });

    return [...filtered].sort((a, b) => {
      const statsA = performanceByTherapist.get(a.id);
      const statsB = performanceByTherapist.get(b.id);

      if (sortBy === "bookings")
        return (
          (statsB?.totalAppointments ?? 0) - (statsA?.totalAppointments ?? 0)
        );
      if (sortBy === "fees") return b.price - a.price;
      if (sortBy === "specialization")
        return (a.specialization ?? "").localeCompare(b.specialization ?? "");
      if (sortBy === "active") return Number(b.isActive) - Number(a.isActive);
      if (sortBy === "pending")
        return (
          Number(Boolean(b.pendingProfileChanges)) -
          Number(Boolean(a.pendingProfileChanges))
        );
      return a.name.localeCompare(b.name);
    });
  }, [performanceByTherapist, query, sortBy, therapists]);

  const togglePublication = async (therapist: Therapist) => {
    const token = getAccessToken();
    if (!token) return;

    setError("");
    setNotice("");
    try {
      const isPublishing = !therapist.isActive;
      await updateTherapist(
        token,
        therapist.id,
        { isActive: isPublishing },
      );
      setNotice(
        `${therapist.name}'s profile is now ${isPublishing ? "public" : "hidden"}.`,
      );
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update therapist.",
      );
    }
  };

  const removeTherapist = async (therapist: Therapist) => {
    const token = getAccessToken();
    if (
      !token ||
      !window.confirm(
        `Archive ${therapist.name}? Historical records will be retained.`,
      )
    )
      return;

    setError("");
    setNotice("");
    try {
      await deleteTherapist(token, therapist.id);
      setNotice("Therapist archived.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to archive therapist.",
      );
    }
  };

  const restoreArchivedTherapist = async (therapist: Therapist) => {
    const token = getAccessToken();
    if (!token) return;
    try {
      await restoreTherapist(token, therapist.id);
      setNotice(
        "Therapist restored. Publish the profile when it is ready to return publicly.",
      );
      await loadData();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to restore therapist.",
      );
    }
  };

  const verifyChanges = async (
    therapist: Therapist,
    action: "approve" | "reject",
  ) => {
    const token = getAccessToken();
    if (!token) return;

    setError("");
    setNotice("");
    try {
      if (action === "approve") {
        await approveTherapistProfileChanges(token, therapist.id);
        setNotice(`${therapist.name}'s profile changes were approved.`);
      } else {
        await rejectTherapistProfileChanges(token, therapist.id);
        setNotice(`${therapist.name}'s profile changes were rejected.`);
      }
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to verify profile changes.",
      );
    }
  };

  const openEditor = (therapist: Therapist) => {
    const legacyTags = splitTherapistTags(therapist.tags);
    const areasOfPractice =
      therapist.areasOfPractice ?? legacyTags.areasOfPractice;
    const languages = therapist.languages ?? legacyTags.languages;
    setEditing(therapist);
    setEditForm({
      name: therapist.name,
      title: therapist.title,
      areasOfPractice,
      languages,
      experience: String(therapist.experience),
      specialization: therapist.specialization ?? "",
      qualifications: therapist.qualifications ?? "",
      awardingInstitution: therapist.awardingInstitution ?? "",
      consultationType: therapist.consultationType ?? "",
      verifiedExperienceHours:
        therapist.verifiedExperienceHours == null
          ? ""
          : String(therapist.verifiedExperienceHours),
      professionalRegistrationNumber:
        therapist.professionalRegistrationNumber ?? "",
      registrationAuthority: therapist.registrationAuthority ?? "",
      sessionDurationMinutes: String(therapist.sessionDurationMinutes ?? 60),
      engagementRelationship: therapist.engagementRelationship ?? "",
      verificationStatus: therapist.verificationStatus,
      price: String(therapist.price),
      couplePrice: therapist.couplePrice ? String(therapist.couplePrice) : "",
      bio: therapist.bio ?? "",
    });
  };

  const saveEditor = async (event: FormEvent) => {
    event.preventDefault();
    const token = getAccessToken();
    if (!token || !editing) return;

    setError("");
    setNotice("");
    try {
      await updateTherapist(token, editing.id, {
        name: editForm.name.trim(),
        title: editForm.title.trim(),
        tags: editForm.areasOfPractice,
        areasOfPractice: editForm.areasOfPractice,
        languages: editForm.languages,
        experience: Number(editForm.experience),
        specialization: editForm.specialization.trim() || null,
        qualifications: editForm.qualifications.trim() || null,
        awardingInstitution: editForm.awardingInstitution.trim() || null,
        consultationType: editForm.consultationType.trim() || null,
        verifiedExperienceHours: editForm.verifiedExperienceHours
          ? Number(editForm.verifiedExperienceHours)
          : null,
        professionalRegistrationNumber:
          editForm.professionalRegistrationNumber.trim() || null,
        registrationAuthority:
          editForm.registrationAuthority.trim() || null,
        sessionDurationMinutes: Number(editForm.sessionDurationMinutes),
        engagementRelationship:
          editForm.engagementRelationship.trim() || null,
        verificationStatus: editForm.verificationStatus,
        price: Number(editForm.price),
        couplePrice: editForm.couplePrice ? Number(editForm.couplePrice) : null,
        bio: editForm.bio.trim() || null,
      });
      setEditing(null);
      setNotice("Therapist updated.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save therapist.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FBF8] font-body text-[#2E3E3C]">
      <DashboardNavbar />
      <section className="px-6 pb-20 pt-24">
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0A7F7A]">
              Admin tools
            </p>
            <h1 className="mt-3 text-4xl font-heading font-black text-[#064F4B] md:text-6xl">
              Manage therapists
            </h1>
            <p className="mt-3 max-w-2xl font-bold text-[#5F7F7A]">
              Review therapist details, control public visibility, and monitor
              performance.
            </p>
          </div>

          {notice && (
            <p className="mt-6 rounded-lg bg-[#EAF7F2] p-4 font-bold text-[#075E59]">
              {notice}
            </p>
          )}
          {error && (
            <p className="mt-6 rounded-lg bg-red-50 p-4 font-bold text-red-700">
              {error}
            </p>
          )}

          <section className="mt-8 rounded-lg bg-white p-6 shadow-sm border border-[#E2E8E6]">
            <div className="grid gap-3 pb-5 md:grid-cols-[1fr_240px]">
              <label>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                  Search therapists
                </span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Name, email, specialization, tags"
                  className="mt-2 w-full rounded-lg border border-[#DDE8E5] bg-[#FBFDFC] px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
                />
              </label>
              <label>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                  Sort by
                </span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#DDE8E5] bg-[#FBFDFC] px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
                >
                  <option value="pending">Pending updates</option>
                  <option value="bookings">Number of bookings</option>
                  <option value="fees">Fees</option>
                  <option value="specialization">Specialization</option>
                  <option value="active">Public status</option>
                  <option value="name">Name</option>
                </select>
              </label>
            </div>
            <div className="overflow-hidden rounded-lg border border-[#E2E8E6]">
              {isLoading && (
                <p className="bg-[#F5F8F7] p-5 font-bold text-[#5F7F7A]">
                  Loading therapists...
                </p>
              )}
              {!isLoading && visibleTherapists.length === 0 && (
                <p className="bg-[#F5F8F7] p-7 text-center font-black text-[#064F4B]">
                  No therapist accounts yet.
                </p>
              )}
              {!isLoading &&
                visibleTherapists.map((therapist) => {
                  const stats = performanceByTherapist.get(therapist.id);

                  return (
                    <article
                      key={therapist.id}
                      className="grid gap-4 border-b border-[#E2E8E6] bg-white p-5 last:border-b-0 xl:grid-cols-[1.2fr_1fr_1fr_auto] xl:items-center"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-[#064F4B]">
                            {therapist.name}
                          </p>
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${therapist.isActive ? "bg-[#0A7F7A]/10 text-[#0A7F7A]" : "bg-slate-100 text-slate-500"}`}
                          >
                            {therapist.isActive ? "Public" : "Hidden"}
                          </span>
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
                            {therapist.verificationStatus}
                          </span>
                          {therapist.pendingProfileChanges && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
                              Review changes
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-bold text-[#5F7F7A]">
                          {therapist.email}
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#5F7F7A]">
                          {therapist.title}
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#5F7F7A]">
                          {therapist.specialization || "Specialization pending"}{" "}
                          · Rs.{therapist.price.toLocaleString("en-IN")}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm font-medium text-[#5F7F7A]">
                          {therapist.bio ||
                            "Profile details pending from therapist."}
                        </p>
                        {therapist.pendingProfileChanges && (
                          <div className="mt-4 rounded-lg bg-amber-50 p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                              Submitted{" "}
                              {formatIstDateTime(
                                therapist.pendingProfileSubmittedAt,
                                "recently",
                              )}
                            </p>
                            <PendingProfileChangesReview therapist={therapist} />
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                onClick={() =>
                                  verifyChanges(therapist, "approve")
                                }
                                className="rounded-full bg-[#064F4B] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white"
                              >
                                Approve updates
                              </button>
                              <button
                                onClick={() =>
                                  verifyChanges(therapist, "reject")
                                }
                                className="rounded-full border border-amber-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-amber-700"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                          Bookings
                        </p>
                        <p className="mt-1 text-2xl font-black text-[#064F4B]">
                          {stats?.totalAppointments ?? 0}
                        </p>
                        <p className="text-xs font-bold text-[#5F7F7A]">
                          {stats?.completedAppointments ?? 0} completed,{" "}
                          {stats?.pendingAppointments ?? 0} pending
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                          Performance
                        </p>
                        <p className="mt-1 text-2xl font-black text-[#064F4B]">
                          {stats?.completionRate ?? 0}%
                        </p>
                        <p className="text-xs font-bold text-[#5F7F7A]">
                          Rs.
                          {(
                            stats?.estimatedCompletedRevenue ?? 0
                          ).toLocaleString("en-IN")}{" "}
                          completed revenue
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {therapist.archivedAt ? (
                          <button
                            onClick={() => restoreArchivedTherapist(therapist)}
                            className="rounded-full bg-[#064F4B] px-4 py-3 text-[10px] font-black uppercase text-white"
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openEditor(therapist)}
                              className="inline-flex items-center gap-2 rounded-full border border-[#DDE8E5] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#064F4B]"
                            >
                              <LucideIcon name="pencil" size={16} />
                              Edit
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => togglePublication(therapist)}
                          disabled={
                            Boolean(therapist.archivedAt) ||
                            (!therapist.isActive &&
                              (therapist.verificationStatus !== "VERIFIED" ||
                                Boolean(therapist.pendingProfileChanges)))
                          }
                          title={
                            !therapist.isActive &&
                            therapist.verificationStatus !== "VERIFIED"
                              ? "Verify the complete profile before publishing"
                              : therapist.pendingProfileChanges
                                ? "Review pending changes before publishing"
                                : undefined
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-[#DDE8E5] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#064F4B] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <LucideIcon
                            name={therapist.isActive ? "eye-off" : "eye"}
                            size={16}
                          />
                          {therapist.isActive
                            ? "Hide profile"
                            : "Publish profile"}
                        </button>
                        <button
                          onClick={() => removeTherapist(therapist)}
                          disabled={Boolean(therapist.archivedAt)}
                          className="inline-flex items-center justify-center rounded-full border border-red-100 p-3 text-red-600"
                          title="Archive therapist"
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
      {editing && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#064F4B]/40 p-4">
          <form
            onSubmit={saveEditor}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                  Edit therapist
                </p>
                <h2 className="mt-2 text-2xl font-heading font-black text-[#064F4B]">
                  {editing.email}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full p-2 text-[#064F4B] hover:bg-[#F5F8F7]"
              >
                <LucideIcon name="x" size={18} />
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <EditField
                label="Name"
                value={editForm.name}
                onChange={(value) => setEditForm({ ...editForm, name: value })}
                required
              />
              <EditDatalistField
                label="Exact professional role"
                value={editForm.title}
                onChange={(value) => setEditForm({ ...editForm, title: value })}
                options={therapistProfessionalRoleOptions}
                required
              />
              <EditDatalistField
                label="Qualification"
                value={editForm.qualifications}
                onChange={(value) =>
                  setEditForm({ ...editForm, qualifications: value })
                }
                options={therapistQualificationOptions}
                required
              />
              <EditDatalistField
                label="Awarding institution"
                value={editForm.awardingInstitution}
                onChange={(value) =>
                  setEditForm({ ...editForm, awardingInstitution: value })
                }
                options={therapistAwardingInstitutionOptions}
                required
              />
              <MultiSelectDropdown
                label="Areas of practice"
                values={editForm.areasOfPractice}
                options={therapistAreaOfPracticeOptions}
                onChange={(areasOfPractice) =>
                  setEditForm({ ...editForm, areasOfPractice })
                }
              />
              <MultiSelectDropdown
                label="Languages"
                values={editForm.languages}
                options={therapistLanguageOptions}
                onChange={(languages) =>
                  setEditForm({ ...editForm, languages })
                }
              />
              <EditField
                label="Years of experience"
                type="number"
                value={editForm.experience}
                onChange={(value) =>
                  setEditForm({ ...editForm, experience: value })
                }
              />
              <EditDatalistField
                label="Primary specialization"
                value={editForm.specialization}
                onChange={(value) =>
                  setEditForm({ ...editForm, specialization: value })
                }
                options={therapistSpecializationOptions}
              />
              <EditSelectField
                label="Consultation type"
                value={editForm.consultationType}
                onChange={(value) =>
                  setEditForm({ ...editForm, consultationType: value })
                }
                options={therapistConsultationTypeOptions}
              />
              <EditField
                label="Session duration (minutes)"
                type="number"
                value={editForm.sessionDurationMinutes}
                onChange={(value) =>
                  setEditForm({ ...editForm, sessionDurationMinutes: value })
                }
                required
              />
              <EditField
                label="Verified experience hours"
                type="number"
                value={editForm.verifiedExperienceHours}
                onChange={(value) =>
                  setEditForm({ ...editForm, verifiedExperienceHours: value })
                }
              />
              <EditField
                label="Professional registration number"
                value={editForm.professionalRegistrationNumber}
                onChange={(value) =>
                  setEditForm({
                    ...editForm,
                    professionalRegistrationNumber: value,
                  })
                }
              />
              <EditField
                label="Registration authority"
                value={editForm.registrationAuthority}
                onChange={(value) =>
                  setEditForm({ ...editForm, registrationAuthority: value })
                }
              />
              <EditSelectField
                label="Engagement relationship"
                value={editForm.engagementRelationship}
                onChange={(value) =>
                  setEditForm({ ...editForm, engagementRelationship: value })
                }
                options={therapistEngagementRelationshipOptions}
              />
              <EditSelectField
                label="Verification status"
                value={editForm.verificationStatus}
                onChange={(value) =>
                  setEditForm({
                    ...editForm,
                    verificationStatus:
                      value as Therapist["verificationStatus"],
                  })
                }
                options={["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"]}
                required
              />
              <EditField
                label="Individual fee"
                type="number"
                value={editForm.price}
                onChange={(value) => setEditForm({ ...editForm, price: value })}
                required
              />
              <EditField
                label="Couple fee (leave blank if not offered)"
                type="number"
                value={editForm.couplePrice}
                onChange={(value) =>
                  setEditForm({ ...editForm, couplePrice: value })
                }
              />
              <label className="md:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                  Bio
                </span>
                <textarea
                  maxLength={4000}
                  value={editForm.bio}
                  onChange={(event) =>
                    setEditForm({ ...editForm, bio: event.target.value })
                  }
                  className="mt-2 min-h-28 w-full rounded-lg border border-[#DDE8E5] bg-[#FBFDFC] px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
                />
              </label>
            </div>
            <button className="mt-6 rounded-full bg-[#064F4B] px-6 py-4 text-xs font-black uppercase tracking-widest text-white">
              Save therapist
            </button>
          </form>
        </div>
      )}
      <Footer />
    </main>
  );
}

function PendingProfileChangesReview({ therapist }: { therapist: Therapist }) {
  const pending = therapist.pendingProfileChanges ?? {};
  const entries = Object.entries(pending).filter(
    ([field]) => !field.endsWith("PublicId"),
  );

  const formatValue = (value: unknown) => {
    if (Array.isArray(value)) return value.join(", ") || "None";
    if (value == null || value === "") return "None";
    return String(value);
  };

  return (
    <div className="mt-3 grid gap-3 text-sm font-bold text-[#064F4B]">
      {entries.map(([field, submitted]) => {
        const current = therapist[field as keyof Therapist];
        if (field === "image") {
          return (
            <div key={field} className="rounded-lg bg-white p-3">
              <p className="text-[10px] uppercase tracking-widest text-[#5F7F7A]">
                Profile image · current / submitted
              </p>
              <div className="mt-2 flex gap-3">
                {[current, submitted].map((value, index) =>
                  typeof value === "string" && value ? (
                    <img
                      key={index}
                      src={getTherapistImage(value)}
                      alt={index === 0 ? "Current profile" : "Submitted profile"}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ) : (
                    <span key={index} className="p-3 text-xs text-slate-500">
                      None
                    </span>
                  ),
                )}
              </div>
            </div>
          );
        }
        if (field === "voiceIntro") {
          return (
            <div key={field} className="rounded-lg bg-white p-3">
              <p className="text-[10px] uppercase tracking-widest text-[#5F7F7A]">
                Voice intro · current / submitted
              </p>
              <div className="mt-2 grid gap-2">
                {[current, submitted].map((value, index) =>
                  typeof value === "string" && value ? (
                    <audio key={index} controls src={value} className="w-full" />
                  ) : (
                    <span key={index} className="text-xs text-slate-500">
                      None
                    </span>
                  ),
                )}
              </div>
            </div>
          );
        }
        return (
          <div key={field} className="rounded-lg bg-white p-3">
            <p className="text-[10px] uppercase tracking-widest text-[#5F7F7A]">
              {field.replace(/([a-z])([A-Z])/g, "$1 $2")}
            </p>
            <p className="mt-1 text-xs text-[#5F7F7A]">
              Current: {formatValue(current)}
            </p>
            <p className="mt-1">Submitted: {formatValue(submitted)}</p>
          </div>
        );
      })}
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
        {label}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-[#DDE8E5] bg-[#FBFDFC] px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
      />
    </label>
  );
}

function EditDatalistField({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  required?: boolean;
}) {
  const listId = `admin-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <label>
      <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
        {label}
      </span>
      <input
        list={listId}
        required={required}
        maxLength={255}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-[#DDE8E5] bg-[#FBFDFC] px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </label>
  );
}

function EditSelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  required?: boolean;
}) {
  const hasLegacyValue =
    Boolean(value) && !options.some((option) => option === value);

  return (
    <label>
      <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
        {label}
      </span>
      <select
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-[#DDE8E5] bg-[#FBFDFC] px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {hasLegacyValue && <option value={value}>{value}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
