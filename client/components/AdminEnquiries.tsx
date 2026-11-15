import { useCallback, useEffect, useState } from "react";
import { isSignedIn } from "../src/lib/auth";
import {
  getEnquiries,
  updateEnquiry,
  type Enquiry,
} from "../src/lib/operations";
import { formatIstDateTime } from "../src/lib/dateTime";

const statusLabels: Record<Enquiry["status"], string> = {
  NEW: "New",
  REPLIED: "Replied",
  CLOSED: "Closed",
};

const contactLabels: Record<Enquiry["preferredContact"], string> = {
  email: "Email",
  phone: "Phone call",
  whatsapp: "WhatsApp",
};

/** Contact-form enquiries, for the admin dashboard. Loads its own data. */
export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const signedIn = isSignedIn();
    if (!signedIn) return;
    try {
      const data = await getEnquiries();
      setEnquiries(data);
      setNotes(
        Object.fromEntries(data.map((item) => [item.id, item.adminNote ?? ""])),
      );
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load enquiries.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (
    enquiry: Enquiry,
    payload: { status?: Enquiry["status"]; adminNote?: string },
  ) => {
    const signedIn = isSignedIn();
    if (!signedIn) return;
    try {
      await updateEnquiry(enquiry.id, payload);
      setNotice("Enquiry updated.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update enquiry.");
    }
  };

  const newCount = enquiries.filter((item) => item.status === "NEW").length;

  return (
    <section className="rounded-lg border border-[#E2E8E6] bg-white p-6 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
        Contact form
      </p>
      <h2 className="mt-2 text-3xl font-heading font-black text-[#064F4B]">
        Website enquiries {newCount > 0 ? `(${newCount} new)` : ""}
      </h2>
      <p className="mt-2 text-sm font-medium text-[#5F7F7A]">
        Reply to each enquiry by its preferred contact method, then mark it as
        replied. Replied and closed enquiries are deleted after the retention
        period when the retention worker is switched on.
      </p>
      {notice && (
        <p className="mt-4 rounded-lg bg-[#EAF7F2] p-4 font-bold text-[#075E59]">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-4 font-bold text-red-800">
          {error}
        </p>
      )}
      <div className="mt-6 overflow-hidden rounded-lg border border-[#E2E8E6]">
        {isLoading && (
          <p className="bg-[#F5F8F7] p-5 text-center font-black text-[#064F4B]">
            Loading enquiries…
          </p>
        )}
        {!isLoading && enquiries.length === 0 && !error && (
          <p className="bg-[#F5F8F7] p-5 text-center font-black text-[#064F4B]">
            No enquiries yet.
          </p>
        )}
        {enquiries.map((enquiry) => (
          <article
            key={enquiry.id}
            className="grid gap-4 border-b border-[#E2E8E6] p-5 last:border-b-0 lg:grid-cols-[1fr_220px] lg:items-start"
          >
            <div>
              <p className="font-black text-[#064F4B]">
                {enquiry.subject}
                {enquiry.status === "NEW" && (
                  <span className="ml-2 rounded-full bg-[#E5ECCE] px-2 py-0.5 text-[10px] uppercase tracking-widest text-[#607D2E]">
                    New
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm font-bold text-[#5F7F7A]">
                {enquiry.name} · {enquiry.email}
                {enquiry.phone ? ` · ${enquiry.phone}` : ""}
              </p>
              <p className="mt-1 text-xs font-bold text-[#5F7F7A]">
                Reply by {contactLabels[enquiry.preferredContact]} ·{" "}
                {formatIstDateTime(enquiry.createdAt)}
                {enquiry.pagePath ? ` · from ${enquiry.pagePath}` : ""}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm font-medium text-[#375651]">
                {enquiry.message}
              </p>
              <label className="mt-4 block">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                  Admin note
                </span>
                <textarea
                  value={notes[enquiry.id] ?? ""}
                  onChange={(event) =>
                    setNotes({ ...notes, [enquiry.id]: event.target.value })
                  }
                  className="mt-2 min-h-20 w-full rounded-lg border border-[#DDE8E5] bg-[#FBFDFC] px-4 py-3 text-sm font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
                />
              </label>
            </div>
            <div className="grid gap-3">
              <select
                aria-label={`Status for enquiry from ${enquiry.name}`}
                value={enquiry.status}
                onChange={(event) =>
                  save(enquiry, {
                    status: event.target.value as Enquiry["status"],
                    adminNote: notes[enquiry.id] ?? "",
                  })
                }
                className="rounded-full border border-[#DDE8E5] bg-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#064F4B] outline-none"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => save(enquiry, { adminNote: notes[enquiry.id] ?? "" })}
                className="rounded-full bg-[#064F4B] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white"
              >
                Save note
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
