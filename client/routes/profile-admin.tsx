// @refresh reset
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";
import Footer from "../components/Footer";
import PasswordChangeForm from "../components/PasswordChangeForm";
import ProfileTabs from "../components/ProfileTabs";
import { LucideIcon } from "@site-builder/icons";
import { getAccessToken, getCurrentUser } from "../src/lib/auth";
import {
  AdminSummary, AuditEvent, executePrivacyRequest, getAdminSummary,
  getAuditEvents, getPaymentWebhookEvents, getPrivacyRequests,
  getProviderDeliveries, PaymentWebhookEvent, PrivacyRequest, ProviderDelivery,
  retryPaymentWebhook, retryProviderDelivery, reviewPrivacyRequest,
} from "../src/lib/admin";
import {
  AppointmentOperationsUpdate,
  BookingResponse,
  buildManualWhatsAppUrl,
  getAppointments,
  updateAppointmentOperations,
  updateAppointmentStatus,
} from "../src/lib/booking";
import {
  createTherapist,
  getAdminTherapists,
  Therapist,
} from "../src/lib/therapists";
import {
  CaseSheet,
  createPayment,
  getCaseSheets,
  getPayments,
  getTickets,
  openPaymentInvoice,
  Payment,
  refundPayment,
  Ticket,
  updateTicket,
} from "../src/lib/operations";
import { formatIstDateTime } from "../src/lib/dateTime";

export const meta = {
  title: "Admin Profile | Oruma",
  description: "Admin overview for Oruma appointments and therapist records.",
};

export default function AdminProfilePage() {
  const user = getCurrentUser();
  const [appointments, setAppointments] = useState<BookingResponse[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [caseSheets, setCaseSheets] = useState<CaseSheet[]>([]);
  const [providerDeliveries, setProviderDeliveries] = useState<ProviderDelivery[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<PaymentWebhookEvent[]>([]);
  const [privacyRequests, setPrivacyRequests] = useState<PrivacyRequest[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [paymentForm, setPaymentForm] = useState({
    appointmentId: "",
    amount: "",
    reference: "",
  });
  const [refundForm, setRefundForm] = useState<Record<string, string>>({});
  const [ticketNotes, setTicketNotes] = useState<Record<string, string>>({});
  const [appointmentDrafts, setAppointmentDrafts] = useState<
    Record<string, { meetingLink: string; staffNotes: string }>
  >({});
  const [savingAppointmentId, setSavingAppointmentId] = useState("");

  const loadAdminData = async () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    const [
      appointmentData,
      therapistData,
      summaryData,
      paymentData,
      ticketData,
      caseSheetData,
      providerData,
      webhookData,
      privacyData,
      auditData,
    ] = await Promise.all([
      getAppointments(token),
      getAdminTherapists(token),
      getAdminSummary(token),
      getPayments(token),
      getTickets(token),
      getCaseSheets(token),
      getProviderDeliveries(token),
      getPaymentWebhookEvents(token),
      getPrivacyRequests(token),
      getAuditEvents(token),
    ]);
    setAppointments(appointmentData);
    setAppointmentDrafts(
      Object.fromEntries(
        appointmentData.map((appointment) => [
          appointment.id,
          {
            meetingLink: appointment.meetingLink ?? "",
            staffNotes: appointment.staffNotes ?? "",
          },
        ]),
      ),
    );
    setTherapists(therapistData);
    setSummary(summaryData);
    setPayments(paymentData);
    setTickets(ticketData);
    setTicketNotes(
      Object.fromEntries(
        ticketData.map((ticket) => [ticket.id, ticket.adminNote ?? ""]),
      ),
    );
    setCaseSheets(caseSheetData);
    setProviderDeliveries(providerData);
    setWebhookEvents(webhookData);
    setPrivacyRequests(privacyData);
    setAuditEvents(auditData);
  };

  const retryReliabilityItem = async (type: "delivery" | "webhook", id: string) => {
    const token = getAccessToken(); if (!token) return;
    try { if (type === "delivery") await retryProviderDelivery(token, id); else await retryPaymentWebhook(token, id); setNotice("Retry queued."); await loadAdminData(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to retry item."); }
  };

  const reviewPrivacy = async (id: string, status: "APPROVED" | "REJECTED") => {
    const token = getAccessToken(); if (!token) return;
    try { await reviewPrivacyRequest(token, id, status); setNotice(`Privacy request ${status.toLowerCase()}.`); await loadAdminData(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to review request."); }
  };

  const executePrivacy = async (id: string) => {
    const token = getAccessToken(); if (!token || !window.confirm("Execute this approved erasure now?")) return;
    try { await executePrivacyRequest(token, id); setNotice("Approved erasure completed."); await loadAdminData(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to execute request."); }
  };

  const handleRecordPayment = async (event: FormEvent) => {
    event.preventDefault();
    const token = getAccessToken();
    if (!token) return;

    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      await createPayment(token, {
        appointmentId: paymentForm.appointmentId,
        amount: Number(paymentForm.amount),
        reference: paymentForm.reference,
      });
      setPaymentForm({ appointmentId: "", amount: "", reference: "" });
      setNotice("Payment recorded.");
      await loadAdminData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to record payment.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefund = async (payment: Payment) => {
    const token = getAccessToken();
    const amount = Number(refundForm[payment.id]);
    if (!token || !amount) return;

    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      await refundPayment(token, payment.id, { amount });
      setRefundForm((current) => ({ ...current, [payment.id]: "" }));
      setNotice("Refund initiated to the original payment method.");
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to record refund.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenInvoice = async (payment: Payment) => {
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

  const handleTicketUpdate = async (
    ticket: Ticket,
    payload: { status?: Ticket["status"]; adminNote?: string },
  ) => {
    const token = getAccessToken();
    if (!token) return;

    try {
      await updateTicket(token, ticket.id, payload);
      setNotice("Ticket updated.");
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update ticket.");
    }
  };

  useEffect(() => {
    loadAdminData()
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Unable to load admin overview.",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const pendingCount = useMemo(
    () =>
      appointments.filter((appointment) => appointment.status === "PENDING")
        .length,
    [appointments],
  );
  const inactiveTherapistCount = useMemo(
    () => therapists.filter((therapist) => !therapist.isActive).length,
    [therapists],
  );
  const paidAppointmentIds = useMemo(
    () =>
      new Set(
        payments
          .filter((payment) => payment.status === "PAID")
          .map((payment) => payment.appointment?.id)
          .filter((id): id is string => Boolean(id)),
      ),
    [payments],
  );

  const updateAppointmentRecord = (updated: BookingResponse) => {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === updated.id ? updated : appointment,
      ),
    );
    setAppointmentDrafts((current) => ({
      ...current,
      [updated.id]: {
        meetingLink: updated.meetingLink ?? "",
        staffNotes: updated.staffNotes ?? current[updated.id]?.staffNotes ?? "",
      },
    }));
  };

  const changeAppointmentStatus = async (
    appointment: BookingResponse,
    status: BookingResponse["status"],
  ) => {
    const token = getAccessToken();
    if (!token) return;
    if (
      status === "CANCELLED" &&
      !window.confirm(
        "Cancel this appointment and release its slot? Refunds remain a separate staff action.",
      )
    ) {
      return;
    }
    setSavingAppointmentId(appointment.id);
    setError("");
    setNotice("");
    try {
      const updated = await updateAppointmentStatus(
        appointment.id,
        status,
        token,
      );
      updateAppointmentRecord(updated);
      setNotice(`Appointment marked ${status.toLowerCase()}.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update appointment.",
      );
    } finally {
      setSavingAppointmentId("");
    }
  };

  const saveAppointmentHandoff = async (
    appointment: BookingResponse,
    payload: AppointmentOperationsUpdate,
    successMessage: string,
  ) => {
    const token = getAccessToken();
    if (!token) return;
    setSavingAppointmentId(appointment.id);
    setError("");
    setNotice("");
    try {
      const updated = await updateAppointmentOperations(
        appointment.id,
        payload,
        token,
      );
      updateAppointmentRecord(updated);
      setNotice(successMessage);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update staff handoff.",
      );
    } finally {
      setSavingAppointmentId("");
    }
  };

  const openManualWhatsApp = (
    appointment: BookingResponse,
    kind: ManualWhatsAppMessageKind,
  ) => {
    const url = buildManualWhatsAppUrl(
      appointment.contactPhone ?? appointment.patient?.phone,
      createManualWhatsAppMessage(appointment, kind),
    );
    if (!url) {
      setError("This appointment does not have a WhatsApp number.");
      return;
    }
    setError("");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCreateTherapist = async (event: FormEvent) => {
    event.preventDefault();
    const token = getAccessToken();
    if (!token) return;

    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      const therapist = await createTherapist(token, {
        email: email.trim().toLowerCase(),
      });
      setNotice(
        therapist.credentialsSent
          ? "Therapist account created and credentials email sent."
          : "Therapist account created. Configure email delivery to send credentials automatically.",
      );
      setEmail("");
      setIsCreateOpen(false);
      await loadAdminData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create therapist.",
      );
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
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0A7F7A]">
                Admin dashboard
              </p>
              <h1 className="mt-3 text-4xl font-heading font-black text-[#064F4B] md:text-6xl">
                Operations overview
              </h1>
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
              <Link
                to="/profile/admin/therapists"
                className="inline-flex items-center gap-2 rounded-full border border-[#E2E8E6] bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-[#064F4B]"
              >
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
              { id: "payments", label: "Payments" },
              { id: "cases", label: "Case sheets" },
              { id: "tickets", label: "Tickets" },
              { id: "reliability", label: "Reliability & privacy" },
              { id: "account", label: "Account" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="mt-10"
          />

          <div className="mt-8">
            {notice && (
              <p className="mb-6 rounded-lg bg-[#EAF7F2] p-4 font-bold text-[#075E59]">
                {notice}
              </p>
            )}
            {error && (
              <p className="mb-6 rounded-lg bg-red-50 p-4 font-bold text-red-700">
                {error}
              </p>
            )}

            {activeTab === "overview" && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Metric
                    icon="users"
                    label="Patients"
                    value={summary?.patients ?? 0}
                  />
                  <Metric
                    icon="user-round-check"
                    label="Therapists"
                    value={summary?.therapistUsers ?? therapists.length}
                  />
                  <Metric
                    icon="calendar-check"
                    label="Appointments"
                    value={summary?.appointments ?? appointments.length}
                  />
                  <Metric
                    icon="badge-indian-rupee"
                    label="Revenue"
                    value={`Rs.${(summary?.revenue ?? 0).toLocaleString("en-IN")}`}
                  />
                  <Metric
                    icon="video"
                    label="Completed sessions"
                    value={summary?.sessions ?? 0}
                  />
                  <Metric
                    icon="clock-alert"
                    label="Pending appointments"
                    value={summary?.pendingAppointments ?? pendingCount}
                  />
                  <Metric
                    icon="user-round-cog"
                    label="Awaiting activation"
                    value={inactiveTherapistCount}
                  />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <StatusPanel
                    title="Payments"
                    rows={[
                      `Collected: Rs.${(summary?.payments.collected ?? 0).toLocaleString("en-IN")}`,
                      `Refunds: Rs.${summary?.payments.refunds ?? 0}`,
                      `Pending: Rs.${summary?.payments.pending ?? 0}`,
                    ]}
                  />
                  <StatusPanel
                    title="Case sheets"
                    rows={[
                      `Monitored: ${summary?.caseSheets.monitored ?? 0}`,
                      `Updated: ${summary?.caseSheets.updated ?? 0}`,
                    ]}
                  />
                  <StatusPanel
                    title="Tickets"
                    rows={[
                      `Open: ${summary?.tickets.open ?? 0}`,
                      `Resolved: ${summary?.tickets.resolved ?? 0}`,
                      `Therapist updates: ${summary?.pendingTherapistUpdates ?? 0}`,
                    ]}
                  />
                </div>
              </>
            )}

            {activeTab === "appointments" && (
              <section className="rounded-lg bg-white p-6 shadow-sm border border-[#E2E8E6]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                  Manual care workflow
                </p>
                <h2 className="mt-2 text-3xl font-heading font-black text-[#064F4B]">
                  Appointment handoffs
                </h2>
                <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-[#5F7F7A]">
                  ORUMA is the booking record. After payment, confirm the
                  appointment, create one unique Zoom meeting, add its link,
                  and use the prepared WhatsApp messages to contact the patient.
                </p>
                <div className="mt-6 grid gap-5">
                  {isLoading && (
                    <p className="rounded-lg bg-[#F5F8F7] p-5 font-bold text-[#5F7F7A]">
                      Loading admin data...
                    </p>
                  )}
                  {!isLoading && appointments.length === 0 && (
                    <p className="rounded-lg bg-[#F5F8F7] p-7 text-center font-black text-[#064F4B]">
                      No appointment data is available yet.
                    </p>
                  )}
                  {appointments.slice(0, 25).map((appointment) => (
                    <AppointmentOperationsCard
                      key={appointment.id}
                      appointment={appointment}
                      draft={
                        appointmentDrafts[appointment.id] ?? {
                          meetingLink: appointment.meetingLink ?? "",
                          staffNotes: appointment.staffNotes ?? "",
                        }
                      }
                      isPaid={paidAppointmentIds.has(appointment.id)}
                      isSaving={savingAppointmentId === appointment.id}
                      onDraftChange={(draft) =>
                        setAppointmentDrafts((current) => ({
                          ...current,
                          [appointment.id]: draft,
                        }))
                      }
                      onStatusChange={(status) =>
                        changeAppointmentStatus(appointment, status)
                      }
                      onSave={(payload, message) =>
                        saveAppointmentHandoff(appointment, payload, message)
                      }
                      onOpenWhatsApp={(kind) =>
                        openManualWhatsApp(appointment, kind)
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            {activeTab === "therapists" && (
              <section className="rounded-lg bg-white p-6 shadow-sm border border-[#E2E8E6]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                      Therapist manager
                    </p>
                    <h2 className="mt-2 text-3xl font-heading font-black text-[#064F4B]">
                      Therapists
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#064F4B] px-6 py-4 text-xs font-black uppercase tracking-widest text-white"
                  >
                    <LucideIcon name="user-plus" size={16} />
                    Create therapist
                  </button>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <StatusPanel
                    title="Total therapists"
                    rows={[`Count: ${therapists.length}`]}
                  />
                  <StatusPanel
                    title="Inactive"
                    rows={[`Awaiting activation: ${inactiveTherapistCount}`]}
                  />
                </div>
                <div className="mt-6 overflow-hidden rounded-lg border border-[#E2E8E6]">
                  {therapists.length === 0 && (
                    <p className="bg-[#F5F8F7] p-5 text-center font-black text-[#064F4B]">
                      No therapists have been registered yet.
                    </p>
                  )}
                  {therapists.map((therapist) => (
                    <article
                      key={therapist.id}
                      className="grid gap-4 border-b border-[#E2E8E6] bg-white p-5 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center"
                    >
                      <div>
                        <p className="font-black text-[#064F4B]">
                          {therapist.name || therapist.email}
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#5F7F7A]">
                          {therapist.email}
                        </p>
                      </div>
                      <span
                        className={`w-fit rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest ${therapist.isActive ? "bg-[#EAF7F2] text-[#075E59]" : "bg-[#F5F8F7] text-[#064F4B]"}`}
                      >
                        {therapist.isActive ? "Active" : "Inactive"}
                      </span>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "payments" && (
              <section className="rounded-lg border border-[#E2E8E6] bg-white p-6 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                  Payment monitoring
                </p>
                <h2 className="mt-2 text-3xl font-heading font-black text-[#064F4B]">
                  Payments & refunds
                </h2>
                <form
                  onSubmit={handleRecordPayment}
                  className="mt-6 grid gap-4 md:grid-cols-[1fr_160px_1fr_auto] md:items-end"
                >
                  <Field
                    label="Appointment"
                    value={paymentForm.appointmentId}
                    onChange={(value) =>
                      setPaymentForm({ ...paymentForm, appointmentId: value })
                    }
                    required
                    options={appointments.map((appointment) => ({
                      value: appointment.id,
                      label: `${appointment.patient?.email ?? "Patient"} - ${appointment.therapist?.name ?? "Therapist"}`,
                    }))}
                  />
                  <Field
                    label="Amount"
                    type="number"
                    value={paymentForm.amount}
                    onChange={(value) =>
                      setPaymentForm({ ...paymentForm, amount: value })
                    }
                    required
                  />
                  <Field
                    label="Reference"
                    value={paymentForm.reference}
                    onChange={(value) =>
                      setPaymentForm({ ...paymentForm, reference: value })
                    }
                  />
                  <button
                    disabled={isSaving}
                    className="rounded-full bg-[#064F4B] px-5 py-4 text-xs font-black uppercase tracking-widest text-white"
                  >
                    Record
                  </button>
                </form>
                <div className="mt-6 overflow-hidden rounded-lg border border-[#E2E8E6]">
                  {payments.length === 0 && (
                    <p className="bg-[#F5F8F7] p-5 text-center font-black text-[#064F4B]">
                      No payments recorded yet.
                    </p>
                  )}
                  {payments.map((payment) => (
                    <article
                      key={payment.id}
                      className="grid gap-3 border-b border-[#E2E8E6] p-5 last:border-b-0 lg:grid-cols-[1fr_120px_120px_auto] lg:items-center"
                    >
                      <ActivityItem
                        label="Patient"
                        value={payment.patient?.email ?? "Patient"}
                      />
                      <ActivityItem
                        label="Paid"
                        value={`Rs.${payment.amount.toLocaleString("en-IN")}`}
                      />
                      <ActivityItem
                        label="Refunded"
                        value={`Rs.${payment.refundedAmount.toLocaleString("en-IN")}`}
                      />
                      <div className="flex flex-wrap gap-2">
                        {(payment.status === "PAID" ||
                          payment.status === "REFUNDED") && (
                          <button
                            type="button"
                            onClick={() => handleOpenInvoice(payment)}
                            className="rounded-full border border-[#DDE8E5] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#064F4B]"
                          >
                            Invoice
                          </button>
                        )}
                        <input
                          type="number"
                          min="1"
                          placeholder="Refund"
                          value={refundForm[payment.id] ?? ""}
                          onChange={(event) =>
                            setRefundForm({
                              ...refundForm,
                              [payment.id]: event.target.value,
                            })
                          }
                          className="w-28 rounded-lg border border-[#DDE8E5] px-3 py-2 text-sm font-bold outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRefund(payment)}
                          className="rounded-full border border-[#DDE8E5] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#064F4B]"
                        >
                          Refund
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "cases" && (
              <section className="rounded-lg border border-[#E2E8E6] bg-white p-6 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                  Case sheet monitoring
                </p>
                <h2 className="mt-2 text-3xl font-heading font-black text-[#064F4B]">
                  Case sheets
                </h2>
                <div className="mt-6 overflow-hidden rounded-lg border border-[#E2E8E6]">
                  {caseSheets.length === 0 && (
                    <p className="bg-[#F5F8F7] p-5 text-center font-black text-[#064F4B]">
                      No case sheets have been submitted yet.
                    </p>
                  )}
                  {caseSheets.map((sheet) => (
                    <article
                      key={sheet.id}
                      className="grid gap-3 border-b border-[#E2E8E6] p-5 last:border-b-0 md:grid-cols-3"
                    >
                      <ActivityItem
                        label="Patient"
                        value={sheet.patient?.email ?? "Patient"}
                      />
                      <ActivityItem
                        label="Therapist"
                        value={sheet.therapist?.name ?? "Therapist"}
                      />
                      <ActivityItem
                        label="Updated"
                        value={formatIstDateTime(sheet.updatedAt)}
                      />
                      <p className="text-sm font-bold text-[#5F7F7A] md:col-span-3">
                        {sheet.presentingConcern ||
                          sheet.clinicalNotes ||
                          "No notes entered."}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "tickets" && (
              <section className="rounded-lg border border-[#E2E8E6] bg-white p-6 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                  Ticket management
                </p>
                <h2 className="mt-2 text-3xl font-heading font-black text-[#064F4B]">
                  Support tickets
                </h2>
                <div className="mt-6 overflow-hidden rounded-lg border border-[#E2E8E6]">
                  {tickets.length === 0 && (
                    <p className="bg-[#F5F8F7] p-5 text-center font-black text-[#064F4B]">
                      No tickets yet.
                    </p>
                  )}
                  {tickets.map((ticket) => (
                    <article
                      key={ticket.id}
                      className="grid gap-4 border-b border-[#E2E8E6] p-5 last:border-b-0 lg:grid-cols-[1fr_220px] lg:items-start"
                    >
                      <div>
                        <p className="font-black text-[#064F4B]">
                          {ticket.subject}
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#5F7F7A]">
                          {ticket.createdBy?.email ?? "User"} ·{" "}
                          {ticket.category}
                        </p>
                        <p className="mt-2 text-sm font-medium text-[#5F7F7A]">
                          {ticket.message}
                        </p>
                        <label className="mt-4 block">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                            Admin note
                          </span>
                          <textarea
                            value={ticketNotes[ticket.id] ?? ""}
                            onChange={(event) =>
                              setTicketNotes({
                                ...ticketNotes,
                                [ticket.id]: event.target.value,
                              })
                            }
                            className="mt-2 min-h-24 w-full rounded-lg border border-[#DDE8E5] bg-[#FBFDFC] px-4 py-3 text-sm font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
                          />
                        </label>
                      </div>
                      <div className="grid gap-3">
                        <select
                          value={ticket.status}
                          onChange={(event) =>
                            handleTicketUpdate(ticket, {
                              status: event.target.value as Ticket["status"],
                              adminNote: ticketNotes[ticket.id] ?? "",
                            })
                          }
                          className="rounded-full border border-[#DDE8E5] bg-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#064F4B] outline-none"
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                        <button
                          type="button"
                          onClick={() =>
                            handleTicketUpdate(ticket, {
                              adminNote: ticketNotes[ticket.id] ?? "",
                            })
                          }
                          className="rounded-full bg-[#064F4B] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white"
                        >
                          Save note
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "account" && <PasswordChangeForm />}
            {activeTab === "reliability" && <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-[#E2E8E6] bg-white p-6">
                <h2 className="text-2xl font-black text-[#064F4B]">Provider delivery jobs</h2>
                <div className="mt-4 space-y-3">{providerDeliveries.slice(0, 20).map((job) => <div key={job.id} className="rounded-lg bg-[#F5F8F7] p-4"><p className="font-black">{job.kind} · {job.status}</p><p className="text-xs">Attempts {job.attempts}/{job.maxAttempts}{job.lastError ? ` · ${job.lastError}` : ""}</p>{job.status === "DEAD" && job.kind === "EMAIL" && <button onClick={() => retryReliabilityItem("delivery", job.id)} className="mt-2 text-xs font-black text-[#0A7F7A]">Retry</button>}</div>)}</div>
              </div>
              <div className="rounded-lg border border-[#E2E8E6] bg-white p-6">
                <h2 className="text-2xl font-black text-[#064F4B]">Payment webhooks</h2>
                <div className="mt-4 space-y-3">{webhookEvents.slice(0, 20).map((event) => <div key={event.id} className="rounded-lg bg-[#F5F8F7] p-4"><p className="font-black">{event.eventType ?? "Unknown"} · {event.status}</p>{event.status === "DEAD" && <button onClick={() => retryReliabilityItem("webhook", event.id)} className="mt-2 text-xs font-black text-[#0A7F7A]">Retry</button>}</div>)}</div>
              </div>
              <div className="rounded-lg border border-[#E2E8E6] bg-white p-6">
                <h2 className="text-2xl font-black text-[#064F4B]">Privacy requests</h2>
                <div className="mt-4 space-y-3">{privacyRequests.map((request) => <div key={request.id} className="rounded-lg bg-[#F5F8F7] p-4"><p className="font-black">{request.type} · {request.requester?.email ?? "Anonymized"}</p><p className="text-xs">{request.status}</p>{request.status === "PENDING" && <div className="mt-2 flex gap-2"><button onClick={() => reviewPrivacy(request.id, "APPROVED")} className="text-xs font-black text-[#0A7F7A]">Approve</button><button onClick={() => reviewPrivacy(request.id, "REJECTED")} className="text-xs font-black text-red-700">Reject</button></div>}{request.status === "APPROVED" && request.type === "ERASURE" && <button onClick={() => executePrivacy(request.id)} className="mt-2 text-xs font-black text-red-700">Execute erasure</button>}</div>)}</div>
              </div>
              <div className="rounded-lg border border-[#E2E8E6] bg-white p-6">
                <h2 className="text-2xl font-black text-[#064F4B]">Audit events</h2>
                <div className="mt-4 space-y-3">{auditEvents.slice(0, 30).map((event) => <div key={event.id} className="rounded-lg bg-[#F5F8F7] p-4"><p className="font-black">{event.action} {event.resource}</p><p className="text-xs">{event.actorRole ?? "SYSTEM"} · {event.metadata?.outcome ?? "recorded"} · {event.requestId}</p></div>)}</div>
              </div>
            </section>}
          </div>
        </div>
      </section>

      {isCreateOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#064F4B]/40 p-4">
          <form
            onSubmit={handleCreateTherapist}
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                  New therapist
                </p>
                <h2 className="mt-2 text-2xl font-heading font-black text-[#064F4B]">
                  Create account
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full p-2 text-[#064F4B] hover:bg-[#F5F8F7]"
              >
                <LucideIcon name="x" size={18} />
              </button>
            </div>
            <label className="mt-6 block">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
                Email address
              </span>
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

type ManualWhatsAppMessageKind = "confirmation" | "meeting-link" | "reminder";

function createManualWhatsAppMessage(
  appointment: BookingResponse,
  kind: ManualWhatsAppMessageKind,
) {
  const patientName =
    appointment.contactName ?? appointment.patient?.fullName ?? "there";
  const bookingId = appointment.id.slice(0, 8).toUpperCase();
  const service = appointment.service ?? "Therapy session";
  const therapist = appointment.therapist?.name ?? "your therapist";
  const slot = formatIstDateTime(appointment.slot?.startTime, "the booked time");
  const sharedDetails = [
    `Booking ID: ${bookingId}`,
    `Service: ${service}`,
    `Therapist: ${therapist}`,
    `Time: ${slot}`,
  ];

  if (kind === "meeting-link") {
    return [
      `Hello ${patientName},`,
      "",
      "Your secure ORUMA consultation link is ready.",
      ...sharedDetails,
      `Join Zoom: ${appointment.meetingLink ?? "Link pending"}`,
      "",
      "Please join a few minutes early. Use your ORUMA dashboard for the official appointment status.",
    ].join("\n");
  }

  if (kind === "reminder") {
    return [
      `Hello ${patientName},`,
      "",
      "This is a reminder for your upcoming ORUMA consultation.",
      ...sharedDetails,
      `Join Zoom: ${appointment.meetingLink ?? "Link pending"}`,
      "",
      "If you need help, reply to this official ORUMA WhatsApp chat.",
    ].join("\n");
  }

  return [
    `Hello ${patientName},`,
    "",
    "Your ORUMA appointment is confirmed.",
    ...sharedDetails,
    "Our care team will share a unique Zoom link before the session.",
    "For cancellations or support, please use your ORUMA dashboard.",
  ].join("\n");
}

function AppointmentOperationsCard({
  appointment,
  draft,
  isPaid,
  isSaving,
  onDraftChange,
  onStatusChange,
  onSave,
  onOpenWhatsApp,
}: {
  appointment: BookingResponse;
  draft: { meetingLink: string; staffNotes: string };
  isPaid: boolean;
  isSaving: boolean;
  onDraftChange: (draft: { meetingLink: string; staffNotes: string }) => void;
  onStatusChange: (status: BookingResponse["status"]) => void;
  onSave: (payload: AppointmentOperationsUpdate, message: string) => void;
  onOpenWhatsApp: (kind: ManualWhatsAppMessageKind) => void;
}) {
  const isClosed =
    appointment.status === "CANCELLED" || appointment.status === "COMPLETED";
  const isConfirmed = appointment.status === "CONFIRMED";
  const phone = appointment.contactPhone ?? appointment.patient?.phone;
  const patientName =
    appointment.contactName ??
    appointment.patient?.fullName ??
    appointment.patient?.email ??
    "Patient";
  const statusButtonClass =
    "inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <article className="rounded-[1.5rem] border border-[#DDE8E5] bg-[#FBFDFC] p-5 md:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#0A7F7A]/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
              {appointment.status}
            </span>
            <span
              className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-widest ${
                isPaid
                  ? "bg-[#EAF7F2] text-[#075E59]"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {isPaid ? "Paid" : "Awaiting payment"}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-black text-[#064F4B]">
            {patientName} with {appointment.therapist?.name ?? "Therapist"}
          </h3>
          <p className="mt-1 text-sm font-bold text-[#5F7F7A]">
            {formatIstDateTime(appointment.slot?.startTime)} · {appointment.service ?? "Therapy session"}
          </p>
          <p className="mt-1 text-xs font-bold text-[#5F7F7A]">
            {phone || "No WhatsApp number"} · Booking {appointment.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        {!isClosed && (
          <div className="flex flex-wrap gap-2">
            {appointment.status === "PENDING" && (
              <button
                type="button"
                disabled={!isPaid || isSaving}
                onClick={() => onStatusChange("CONFIRMED")}
                className={`${statusButtonClass} bg-[#064F4B] text-white`}
              >
                Confirm paid appointment
              </button>
            )}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onStatusChange("CANCELLED")}
              className={`${statusButtonClass} border border-red-200 bg-white text-red-700`}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {isClosed ? (
        <p className="mt-5 rounded-lg bg-white p-4 text-sm font-bold text-[#5F7F7A]">
          This appointment is closed. Its manual communication record is kept
          for operational history.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-[#E2E8E6] bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
              1. Manual confirmation
            </p>
            <p className="mt-2 text-xs font-bold text-[#5F7F7A]">
              {appointment.bookingConfirmationSentAt
                ? `Recorded ${formatIstDateTime(appointment.bookingConfirmationSentAt)}`
                : "Open the prepared message in WhatsApp, send it, then record completion."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!isConfirmed || !phone || isSaving}
                onClick={() => onOpenWhatsApp("confirmation")}
                className={`${statusButtonClass} bg-[#25D366] text-[#063E2A]`}
              >
                Open WhatsApp
              </button>
              <button
                type="button"
                disabled={!isConfirmed || !phone || isSaving}
                onClick={() =>
                  onSave(
                    { markBookingConfirmationSent: true },
                    "Manual booking confirmation recorded.",
                  )
                }
                className={`${statusButtonClass} border border-[#DDE8E5] bg-white text-[#064F4B]`}
              >
                Mark confirmation sent
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-[#E2E8E6] bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
              2. Unique Zoom link
            </p>
            <input
              type="url"
              value={draft.meetingLink}
              disabled={!isConfirmed || isSaving}
              placeholder="https://us06web.zoom.us/j/..."
              onChange={(event) =>
                onDraftChange({ ...draft, meetingLink: event.target.value })
              }
              className="mt-3 w-full rounded-lg border border-[#DDE8E5] bg-[#FBFDFC] px-4 py-3 text-sm font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A] disabled:opacity-60"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!isConfirmed || !draft.meetingLink.trim() || isSaving}
                onClick={() =>
                  onSave(
                    { meetingLink: draft.meetingLink.trim() },
                    "Secure Zoom link saved to the appointment.",
                  )
                }
                className={`${statusButtonClass} bg-[#064F4B] text-white`}
              >
                Save Zoom link
              </button>
              {appointment.meetingLink && (
                <a
                  href={appointment.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${statusButtonClass} border border-[#DDE8E5] bg-white text-[#064F4B]`}
                >
                  Check link
                </a>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-[#E2E8E6] bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
              3. Share link manually
            </p>
            <p className="mt-2 text-xs font-bold text-[#5F7F7A]">
              {appointment.meetingLinkSentAt
                ? `Recorded ${formatIstDateTime(appointment.meetingLinkSentAt)}`
                : "Send the unique link to the patient from the official ORUMA WhatsApp number."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!appointment.meetingLink || !phone || isSaving}
                onClick={() => onOpenWhatsApp("meeting-link")}
                className={`${statusButtonClass} bg-[#25D366] text-[#063E2A]`}
              >
                Open link message
              </button>
              <button
                type="button"
                disabled={!appointment.meetingLink || !phone || isSaving}
                onClick={() =>
                  onSave(
                    { markMeetingLinkSent: true },
                    "Manual Zoom link delivery recorded.",
                  )
                }
                className={`${statusButtonClass} border border-[#DDE8E5] bg-white text-[#064F4B]`}
              >
                Mark link sent
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-[#E2E8E6] bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
              4. Session reminder
            </p>
            <p className="mt-2 text-xs font-bold text-[#5F7F7A]">
              {appointment.reminderSentAt
                ? `Last recorded ${formatIstDateTime(appointment.reminderSentAt)}`
                : "Send a reminder before the session and record it here."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!appointment.meetingLinkSentAt || !phone || isSaving}
                onClick={() => onOpenWhatsApp("reminder")}
                className={`${statusButtonClass} bg-[#25D366] text-[#063E2A]`}
              >
                Open reminder
              </button>
              <button
                type="button"
                disabled={!appointment.meetingLinkSentAt || !phone || isSaving}
                onClick={() =>
                  onSave(
                    { markReminderSent: true },
                    "Manual session reminder recorded.",
                  )
                }
                className={`${statusButtonClass} border border-[#DDE8E5] bg-white text-[#064F4B]`}
              >
                Mark reminder sent
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-[#E2E8E6] bg-white p-4 lg:col-span-2">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                Private staff notes
              </span>
              <textarea
                rows={3}
                value={draft.staffNotes}
                disabled={isSaving}
                onChange={(event) =>
                  onDraftChange({ ...draft, staffNotes: event.target.value })
                }
                placeholder="Operational notes only. Do not add clinical information or therapy notes here."
                className="mt-3 w-full rounded-lg border border-[#DDE8E5] bg-[#FBFDFC] px-4 py-3 text-sm font-medium text-[#064F4B] outline-none focus:border-[#0A7F7A]"
              />
            </label>
            <button
              type="button"
              disabled={isSaving}
              onClick={() =>
                onSave(
                  { staffNotes: draft.staffNotes },
                  "Private staff notes saved.",
                )
              }
              className={`${statusButtonClass} mt-3 bg-[#064F4B] text-white`}
            >
              {isSaving ? "Saving..." : "Save staff notes"}
            </button>
          </section>
        </div>
      )}
    </article>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-[#E2E8E6]">
      <LucideIcon name={icon} size={26} className="text-[#0A7F7A]" />
      <p className="mt-5 text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
        {label}
      </p>
      <p className="mt-2 text-4xl font-black text-[#064F4B]">{value}</p>
    </div>
  );
}

function StatusPanel({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-[#E2E8E6]">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
        {title}
      </p>
      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <p key={row} className="text-sm font-black text-[#064F4B]">
            {row}
          </p>
        ))}
      </div>
    </div>
  );
}

function ActivityItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
        {label}
      </p>
      <p className="mt-1 font-bold text-[#064F4B]">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  options?: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
        {label}
      </span>
      {options ? (
        <select
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 w-full rounded-lg border border-[#DDE8E5] bg-[#FBFDFC] px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 w-full rounded-lg border border-[#DDE8E5] bg-[#FBFDFC] px-4 py-3 font-bold text-[#064F4B] outline-none focus:border-[#0A7F7A]"
        />
      )}
    </label>
  );
}
