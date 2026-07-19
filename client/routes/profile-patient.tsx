import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";
import Footer from "../components/Footer";
import PasswordChangeForm from "../components/PasswordChangeForm";
import ProfileTabs from "../components/ProfileTabs";
import { LucideIcon } from "@site-builder/icons";
import {
  AuthAccount,
  getAccessToken,
  getCurrentUser,
  getMyAccount,
  updateMyAccount,
} from "../src/lib/auth";
import {
  BookingResponse,
  canPatientCancelAppointment,
  cancelAppointment,
  getMyAppointments,
  POST_PAYMENT_NOTICE_KEY,
} from "../src/lib/booking";
import {
  createTicket,
  getMyPayments,
  getTickets,
  openPaymentInvoice,
  Payment,
  Ticket,
} from "../src/lib/operations";
import {
  COUNTRY_OPTIONS,
  formatPhoneNumber,
  isValidPhoneNumber,
  parsePhoneInput,
} from "../src/lib/phone";
import { formatIstDateTime } from "../src/lib/dateTime";

export const meta = {
  title: "Patient Profile | Oruma",
  description: "Manage your Oruma patient profile and therapy appointments.",
};

function formatDate(value?: string) {
  return formatIstDateTime(value, "To be scheduled");
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Unable to load Razorpay checkout.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });
}

function AppointmentCard({
  appointment,
  payment,
  isPaid,
  isCancelling,
  policyNow,
  onInvoice,
  onCancel,
}: {
  appointment: BookingResponse;
  payment?: Payment;
  isPaid: boolean;
  isCancelling: boolean;
  policyNow: number;
  onInvoice: (payment: Payment) => void;
  onCancel: (appointment: BookingResponse) => void;
}) {
  const canJoinSession =
    appointment.status === "CONFIRMED" && Boolean(appointment.meetingLink);
  const canOpenInvoice =
    payment?.status === "PAID" || payment?.status === "REFUNDED";
  const canCancel = canPatientCancelAppointment(appointment, policyNow);

  return (
    <article className="rounded-[1.5rem] border border-[#E2E8E6] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
            {appointment.status}
          </p>
          <h3 className="mt-2 text-lg font-black text-[#064F4B]">
            {appointment.therapist?.name ?? "Therapist"}
          </h3>
          <p className="mt-1 text-sm font-bold text-[#5F7F7A]">
            {formatDate(appointment.slot?.startTime)}
          </p>
          {appointment.sessionCount > 1 && (
            <p className="mt-2 text-xs font-black uppercase tracking-widest text-[#0A7F7A]">
              {appointment.packageName ??
                `${appointment.sessionCount} sessions`}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {isPaid && (
            <span className="w-fit rounded-full bg-[#F5F8F7] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#064F4B]">
              Paid
            </span>
          )}
          {payment && canOpenInvoice && (
            <button
              type="button"
              onClick={() => onInvoice(payment)}
              className="inline-flex items-center gap-2 rounded-full border border-[#DDE8E5] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#064F4B]"
            >
              <LucideIcon name="receipt-text" size={14} />
              Invoice
            </button>
          )}
          {canJoinSession && (
            <a
              href={appointment.meetingLink ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#0A7F7A] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white"
            >
              <LucideIcon name="video" size={14} />
              Join session
            </a>
          )}
          {canCancel && (
            <button
              type="button"
              onClick={() => onCancel(appointment)}
              disabled={isCancelling}
              className="inline-flex items-center gap-2 rounded-full border border-[#F0BAB0] bg-[#FFECE8] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#A94433] disabled:opacity-60"
            >
              {isCancelling ? "Cancelling..." : "Cancel"}
            </button>
          )}
        </div>
      </div>
      {appointment.status === "CONFIRMED" && !appointment.meetingLink && (
        <p className="mt-4 rounded-lg bg-[#F5F8F7] px-4 py-3 text-xs font-bold text-[#5F7F7A]">
          Zoom link will appear here once the session link is generated.
        </p>
      )}
      {!canCancel &&
        appointment.status !== "CANCELLED" &&
        appointment.status !== "COMPLETED" && (
          <p className="mt-4 rounded-lg bg-[#F5F8F7] px-4 py-3 text-xs font-bold text-[#5F7F7A]">
            Online cancellation is available for one hour after booking. All
            appointment times are shown in IST.
          </p>
        )}
    </article>
  );
}

export default function PatientProfilePage() {
  const user = getCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [account, setAccount] = useState<AuthAccount | null>(null);
  const [appointments, setAppointments] = useState<BookingResponse[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [personalForm, setPersonalForm] = useState({
    fullName: "",
    phone: "",
    age: "",
    gender: "",
  });
  const [phoneCountry, setPhoneCountry] = useState("+91");
  const [phoneError, setPhoneError] = useState("");
  const [healthForm, setHealthForm] = useState({
    primaryConcern: "",
    currentSymptoms: "",
    medication: "",
    previousTherapy: "",
    emergencyContact: "",
    notes: "",
  });
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "Booking",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("appointments");
  const [policyNow, setPolicyNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setPolicyNow(Date.now()), 15_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const paymentNotice = window.sessionStorage.getItem(
        POST_PAYMENT_NOTICE_KEY,
      );
      if (!paymentNotice) return;

      window.sessionStorage.removeItem(POST_PAYMENT_NOTICE_KEY);
      setNotice(paymentNotice);
      setActiveTab("appointments");
    } catch {
      // The profile remains usable when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    const state = location.state as {
      notice?: string;
      activeTab?: string;
    } | null;
    if (!state?.notice) return;

    setNotice(state.notice);
    if (state.activeTab) setActiveTab(state.activeTab);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    Promise.all([
      getMyAppointments(token),
      getMyAccount(),
      getTickets(token),
      getMyPayments(token),
    ])
      .then(([appointmentData, accountData, ticketData, paymentData]) => {
        setAppointments(appointmentData);
        setTickets(ticketData);
        setPayments(paymentData);
        setAccount(accountData);
        const parsedPhone = parsePhoneInput(accountData.phone);
        setPhoneCountry(parsedPhone.dialCode);
        setPersonalForm({
          fullName: accountData.fullName ?? "",
          phone: parsedPhone.raw,
          age: accountData.age ? String(accountData.age) : "",
          gender: accountData.gender ?? "",
        });
        const healthInfo = (accountData.healthInfo ?? {}) as Record<
          string,
          string
        >;
        setHealthForm({
          primaryConcern: healthInfo.primaryConcern ?? "",
          currentSymptoms: healthInfo.currentSymptoms ?? "",
          medication: healthInfo.medication ?? "",
          previousTherapy: healthInfo.previousTherapy ?? "",
          emergencyContact: healthInfo.emergencyContact ?? "",
          notes: healthInfo.notes ?? "",
        });
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Unable to load appointments.",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const paidAppointmentIds = useMemo(
    () =>
      new Set(
        payments
          .filter(
            (payment) =>
              payment.status === "PAID" || payment.status === "REFUNDED",
          )
          .map((payment) => payment.appointment?.id)
          .filter((id): id is string => Boolean(id)),
      ),
    [payments],
  );

  const visibleAppointments = useMemo(
    () =>
      appointments.filter((appointment) =>
        paidAppointmentIds.has(appointment.id),
      ),
    [appointments, paidAppointmentIds],
  );

  const paymentByAppointmentId = useMemo(() => {
    const map = new Map<string, Payment>();
    payments
      .filter(
        (payment) => payment.status === "PAID" || payment.status === "REFUNDED",
      )
      .forEach((payment) => {
        const appointmentId = payment.appointment?.id;
        if (appointmentId && !map.has(appointmentId)) {
          map.set(appointmentId, payment);
        }
      });

    return map;
  }, [payments]);

  const nextAppointment = useMemo(() => {
    return visibleAppointments
      .filter(
        (appointment) =>
          appointment.slot?.startTime &&
          new Date(appointment.slot.startTime).getTime() >= Date.now(),
      )
      .sort(
        (a, b) =>
          new Date(a.slot.startTime).getTime() -
          new Date(b.slot.startTime).getTime(),
      )[0];
  }, [visibleAppointments]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setNotice("");
    setPhoneError("");

    if (!isValidPhoneNumber(personalForm.phone, phoneCountry)) {
      setPhoneError(
        "Please enter a valid phone number for the selected country.",
      );
      setIsSaving(false);
      return;
    }

    try {
      const updated = await updateMyAccount({
        fullName: personalForm.fullName,
        phone: formatPhoneNumber(personalForm.phone, phoneCountry),
        age: personalForm.age ? Number(personalForm.age) : null,
        gender: personalForm.gender,
        healthInfo: healthForm,
      });
      setAccount(updated);
      setNotice("Profile updated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const submitTicket = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = getAccessToken();
    if (!token) return;

    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const ticket = await createTicket(token, ticketForm);
      setTickets((current) => [ticket, ...current]);
      setTicketForm({ subject: "", category: "Booking", message: "" });
      setNotice("Support ticket created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create ticket.");
    } finally {
      setIsSaving(false);
    }
  };

  const openInvoice = async (payment: Payment) => {
    const token = getAccessToken();
    if (!token) return;

    setError("");
    setNotice("");

    try {
      await openPaymentInvoice(token, payment.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open invoice.");
    }
  };

  const cancelBooking = async (appointment: BookingResponse) => {
    const token = getAccessToken();
    if (!token) return;
    if (
      !window.confirm(
        "Cancel this appointment? The slot will be released. Any eligible refund is processed separately under the Refund Policy.",
      )
    ) {
      return;
    }

    setError("");
    setNotice("");
    setCancellingAppointmentId(appointment.id);

    try {
      const cancelledAppointment = await cancelAppointment(
        appointment.id,
        token,
      );
      setAppointments((current) =>
        current.map((item) =>
          item.id === appointment.id ? cancelledAppointment : item,
        ),
      );
      setNotice(
        "Appointment cancelled. Any eligible refund is reviewed under the Refund Policy.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to cancel appointment.",
      );
    } finally {
      setCancellingAppointmentId("");
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FBF8] font-body text-[#2E3E3C]">
      <DashboardNavbar />
      <section className="px-4 pb-20 pt-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <section className="rounded-[2rem] bg-[#064F4B] p-7 md:p-9 text-white shadow-xl shadow-[#064F4B]/10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <LucideIcon name="heart-handshake" size={32} />
              </div>
              <p className="mt-8 text-[11px] font-black uppercase tracking-[0.22em] text-white/60">
                Patient profile
              </p>
              <h1 className="mt-3 text-4xl md:text-5xl font-heading font-black leading-tight">
                Welcome back
                {account?.fullName ? `, ${account.fullName.split(" ")[0]}` : ""}
              </h1>
              <p className="mt-4 text-white/75 font-medium leading-relaxed">
                {user?.email}
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] bg-white/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Paid sessions
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    {visibleAppointments.length}
                  </p>
                </div>
                <div className="rounded-[1.25rem] bg-white/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Next session
                  </p>
                  <p className="mt-2 text-sm font-black">
                    {nextAppointment
                      ? formatDate(nextAppointment.slot.startTime)
                      : "Not booked"}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  to="/therapists"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-[#064F4B]"
                >
                  <LucideIcon name="calendar-plus" size={16} />
                  Book session
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-4 text-xs font-black uppercase tracking-widest text-white"
                >
                  <LucideIcon name="message-circle" size={16} />
                  Need help
                </Link>
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#E2E8E6] bg-white p-6 md:p-8 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                    Care timeline
                  </p>
                  <h2 className="mt-2 text-3xl font-heading font-black text-[#064F4B]">
                    Your appointments
                  </h2>
                </div>
                <Link
                  to="/therapists"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#0A7F7A]"
                >
                  Find therapist
                  <LucideIcon name="arrow-right" size={16} />
                </Link>
              </div>

              <ProfileTabs
                tabs={[
                  { id: "appointments", label: "Appointments" },
                  { id: "personal", label: "Personal info" },
                  { id: "health", label: "Health info" },
                  { id: "tickets", label: "Tickets" },
                  { id: "account", label: "Account" },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
                className="mt-8"
              />

              <div className="mt-8">
                {notice && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mb-4 rounded-2xl border border-[#BFE8D9] bg-[#EAF7F2] p-4"
                  >
                    <p className="font-bold text-[#075E59]">{notice}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("personal")}
                        className="rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#064F4B]"
                      >
                        Personal info
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("health")}
                        className="rounded-full bg-[#064F4B] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white"
                      >
                        Health info
                      </button>
                    </div>
                  </div>
                )}
                {error && (
                  <p
                    role="alert"
                    className="mb-4 rounded-lg bg-red-50 p-4 font-bold text-red-700"
                  >
                    {error}
                  </p>
                )}

                {activeTab === "appointments" && (
                  <div className="space-y-4">
                    {isLoading && (
                      <p className="rounded-[1.25rem] bg-[#F5F8F7] p-5 font-bold text-[#5F7F7A]">
                        Loading appointments...
                      </p>
                    )}
                    {!isLoading && visibleAppointments.length === 0 && (
                      <div className="rounded-[1.5rem] bg-[#F5F8F7] p-7 text-center">
                        <p className="font-black text-[#064F4B]">
                          No appointments yet.
                        </p>
                        <p className="mt-2 text-sm font-bold text-[#5F7F7A]">
                          Book a session and complete payment to see it here.
                        </p>
                      </div>
                    )}
                    {!isLoading &&
                      visibleAppointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          payment={paymentByAppointmentId.get(appointment.id)}
                          isPaid={paidAppointmentIds.has(appointment.id)}
                          isCancelling={
                            cancellingAppointmentId === appointment.id
                          }
                          policyNow={policyNow}
                          onInvoice={openInvoice}
                          onCancel={cancelBooking}
                        />
                      ))}
                  </div>
                )}

                {activeTab === "personal" && (
                  <form onSubmit={saveProfile} className="space-y-6">
                    <section className="rounded-[2rem] border border-[#E2E8E6] bg-[#FBFDFC] p-6 md:p-8 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                        Personal info
                      </p>
                      <h3 className="mt-2 text-3xl font-heading font-black text-[#064F4B]">
                        Your details
                      </h3>
                      <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:items-start">
                        <Field
                          label="Full name"
                          value={personalForm.fullName}
                          onChange={(value) =>
                            setPersonalForm({
                              ...personalForm,
                              fullName: value,
                            })
                          }
                        />
                        <label>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                            Phone
                          </span>
                          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                            <select
                              value={phoneCountry}
                              onChange={(event) =>
                                setPhoneCountry(event.target.value)
                              }
                              className="w-full rounded-lg border border-[#DDE8E5] bg-white px-3 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A] sm:w-36"
                            >
                              {COUNTRY_OPTIONS.map((option) => (
                                <option
                                  key={option.dialCode}
                                  value={option.dialCode}
                                >
                                  {option.label} ({option.dialCode})
                                </option>
                              ))}
                            </select>
                            <input
                              type="tel"
                              value={personalForm.phone}
                              onChange={(event) =>
                                setPersonalForm({
                                  ...personalForm,
                                  phone: event.target.value.replace(/\D/g, ""),
                                })
                              }
                              className="flex-1 rounded-lg border border-[#DDE8E5] bg-white px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
                              inputMode="tel"
                            />
                          </div>
                          {phoneError && (
                            <p className="mt-2 text-sm font-bold text-red-600">
                              {phoneError}
                            </p>
                          )}
                        </label>
                        <Field
                          label="Age"
                          type="number"
                          value={personalForm.age}
                          onChange={(value) =>
                            setPersonalForm({ ...personalForm, age: value })
                          }
                        />
                        <label>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                            Gender
                          </span>
                          <select
                            value={personalForm.gender}
                            onChange={(event) =>
                              setPersonalForm({
                                ...personalForm,
                                gender: event.target.value,
                              })
                            }
                            className="mt-2 w-full rounded-lg border border-[#DDE8E5] bg-white px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
                          >
                            <option value="">Select gender</option>
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                            <option value="Non-binary">Non-binary</option>
                            <option value="Prefer not to say">
                              Prefer not to say
                            </option>
                            <option value="Other">Other</option>
                          </select>
                        </label>
                      </div>
                    </section>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-full bg-[#064F4B] px-7 py-4 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60"
                    >
                      <LucideIcon name="save" size={16} />
                      {isSaving ? "Saving..." : "Save profile"}
                    </button>
                  </form>
                )}

                {activeTab === "health" && (
                  <form onSubmit={saveProfile} className="space-y-6">
                    <section className="rounded-[2rem] border border-[#E2E8E6] bg-[#FBFDFC] p-6 md:p-8 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                        Health info
                      </p>
                      <h3 className="mt-2 text-3xl font-heading font-black text-[#064F4B]">
                        Care context
                      </h3>
                      <div className="mt-6 grid gap-4">
                        <Field
                          label="Primary concern"
                          value={healthForm.primaryConcern}
                          onChange={(value) =>
                            setHealthForm({
                              ...healthForm,
                              primaryConcern: value,
                            })
                          }
                        />
                        <Field
                          label="Current symptoms"
                          value={healthForm.currentSymptoms}
                          onChange={(value) =>
                            setHealthForm({
                              ...healthForm,
                              currentSymptoms: value,
                            })
                          }
                        />
                        <Field
                          label="Medication"
                          value={healthForm.medication}
                          onChange={(value) =>
                            setHealthForm({ ...healthForm, medication: value })
                          }
                        />
                        <Field
                          label="Previous therapy"
                          value={healthForm.previousTherapy}
                          onChange={(value) =>
                            setHealthForm({
                              ...healthForm,
                              previousTherapy: value,
                            })
                          }
                        />
                        <Field
                          label="Emergency contact"
                          value={healthForm.emergencyContact}
                          onChange={(value) =>
                            setHealthForm({
                              ...healthForm,
                              emergencyContact: value,
                            })
                          }
                        />
                        <label>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                            Additional notes
                          </span>
                          <textarea
                            value={healthForm.notes}
                            onChange={(event) =>
                              setHealthForm({
                                ...healthForm,
                                notes: event.target.value,
                              })
                            }
                            className="mt-2 min-h-28 w-full rounded-lg border border-[#DDE8E5] bg-white px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
                          />
                        </label>
                      </div>
                    </section>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-full bg-[#064F4B] px-7 py-4 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60"
                    >
                      <LucideIcon name="save" size={16} />
                      {isSaving ? "Saving..." : "Save profile"}
                    </button>
                  </form>
                )}

                {activeTab === "tickets" && (
                  <section className="space-y-6">
                    <form
                      onSubmit={submitTicket}
                      className="rounded-[2rem] border border-[#E2E8E6] bg-[#FBFDFC] p-6 md:p-8 shadow-sm"
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                        Support
                      </p>
                      <h3 className="mt-2 text-3xl font-heading font-black text-[#064F4B]">
                        Raise a ticket
                      </h3>
                      <div className="mt-6 grid gap-4">
                        <Field
                          label="Subject"
                          value={ticketForm.subject}
                          onChange={(value) =>
                            setTicketForm({ ...ticketForm, subject: value })
                          }
                        />
                        <label>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                            Category
                          </span>
                          <select
                            value={ticketForm.category}
                            onChange={(event) =>
                              setTicketForm({
                                ...ticketForm,
                                category: event.target.value,
                              })
                            }
                            className="mt-2 w-full rounded-lg border border-[#DDE8E5] bg-white px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
                          >
                            <option>Booking</option>
                            <option>Payment</option>
                            <option>Therapist</option>
                            <option>Technical</option>
                            <option>General</option>
                          </select>
                        </label>
                        <label>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                            Message
                          </span>
                          <textarea
                            required
                            value={ticketForm.message}
                            onChange={(event) =>
                              setTicketForm({
                                ...ticketForm,
                                message: event.target.value,
                              })
                            }
                            className="mt-2 min-h-28 w-full rounded-lg border border-[#DDE8E5] bg-white px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
                          />
                        </label>
                      </div>
                      <button
                        disabled={isSaving}
                        className="mt-6 rounded-full bg-[#064F4B] px-7 py-4 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60"
                      >
                        Create ticket
                      </button>
                    </form>
                    <div className="space-y-4">
                      {tickets.length === 0 && (
                        <p className="rounded-[1.25rem] bg-[#F5F8F7] p-5 text-center font-black text-[#064F4B]">
                          No tickets yet.
                        </p>
                      )}
                      {tickets.map((ticket) => (
                        <article
                          key={ticket.id}
                          className="rounded-[1.5rem] border border-[#E2E8E6] bg-white p-5 shadow-sm"
                        >
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                            {ticket.status}
                          </p>
                          <h3 className="mt-2 font-black text-[#064F4B]">
                            {ticket.subject}
                          </h3>
                          <p className="mt-1 text-sm font-bold text-[#5F7F7A]">
                            {ticket.category}
                          </p>
                          <p className="mt-3 text-sm font-medium text-[#5F7F7A]">
                            {ticket.message}
                          </p>
                          {ticket.adminNote && (
                            <p className="mt-3 rounded-lg bg-[#F5F8F7] p-3 text-sm font-bold text-[#064F4B]">
                              Admin note: {ticket.adminNote}
                            </p>
                          )}
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
        {label}
      </span>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 rounded-lg border border-[#DDE8E5] bg-white px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
      />
    </label>
  );
}
