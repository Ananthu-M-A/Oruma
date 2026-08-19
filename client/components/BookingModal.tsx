import React, { useEffect, useRef, useState } from "react";
import { LucideIcon } from "@site-builder/icons";
import {
  AvailabilitySlot,
  getAvailabilitySlots,
  getSlotDateLabel,
  getSlotTimeLabel,
} from "../src/lib/therapists";
import {
  createAppointment,
  createQuickAppointment,
  cancelAppointment,
  isBookingLeadTimeBypassEnabled,
  POST_PAYMENT_NOTICE_KEY,
} from "../src/lib/booking";
import {
  getAccessToken,
  getCurrentUser,
  getMyAccount,
  saveAccessToken,
  requestBookingOtp,
  verifyBookingOtp,
} from "../src/lib/auth";
import {
  completeDevelopmentPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../src/lib/operations";
import {
  calculateSessionPackagePricing,
  formatINR,
  SESSION_PACKAGE_OPTIONS,
} from "../src/lib/sessionPackages";
import {
  getRazorpayPaymentFailureMessage,
  RAZORPAY_UPI_CHECKOUT_CONFIG,
} from "../src/lib/razorpay";

const isPaymentBypassEnabled =
  import.meta.env.DEV && import.meta.env.VITE_PAYMENT_BYPASS_ENABLED === "true";
function redirectToPatientProfile(notice: string) {
  try {
    window.sessionStorage.setItem(POST_PAYMENT_NOTICE_KEY, notice);
  } catch {
    // The redirect still works when browser storage is unavailable.
  }

  // A full navigation removes any Razorpay iframe/backdrop before the profile
  // renders and guarantees that the profile reloads its confirmed payment.
  window.location.replace("/profile/patient");
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

export default function BookingModal({
  isOpen,
  onClose,
  therapist,
  initialSlot = null,
}) {
  const [step, setStep] = useState(1);
  const [availabilitySlots, setAvailabilitySlots] = useState<
    AvailabilitySlot[]
  >([]);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [bookingOtp, setBookingOtp] = useState("");
  const [bookingVerificationToken, setBookingVerificationToken] = useState("");
  const [bookingOtpRequested, setBookingOtpRequested] = useState(false);
  const [bookingOtpLoading, setBookingOtpLoading] = useState(false);
  const [bookingDevCode, setBookingDevCode] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    service: "Individual Therapy",
    sessionCount: 1,
    slotId: "",
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
    mode: "Video",
  });

  useEffect(() => {
    if (!isOpen) return;

    const currentUser = getCurrentUser();
    if (currentUser) {
      getMyAccount()
        .then((account) => {
          setFormData((prev) => ({
            ...prev,
            name: prev.name || account.fullName || "",
            phone: prev.phone || account.phone || "",
          }));
        })
        .catch(() => undefined);
    }
    setStep(1);
    setSubmitError("");
    setSubmitSuccess(false);
    setBookingOtp("");
    setBookingVerificationToken("");
    setBookingOtpRequested(false);
    setBookingDevCode("");
    setFormData((prev) => ({
      ...prev,
      service: "Individual Therapy",
      sessionCount: 1,
      slotId: initialSlot?.id ?? "",
      date: initialSlot ? getSlotDateLabel(initialSlot) : "",
      time: initialSlot ? getSlotTimeLabel(initialSlot) : "",
      email: currentUser?.email ?? prev.email,
    }));
  }, [initialSlot, isOpen]);

  useEffect(() => {
    if (!isOpen || !therapist?.id) return;

    let isMounted = true;
    setIsAvailabilityLoading(true);
    setAvailabilityError("");

    getAvailabilitySlots(therapist.id)
      .then((slots) => {
        if (!isMounted) return;
        setAvailabilitySlots(slots);
        setFormData((current) => {
          if (
            !current.slotId ||
            slots.some((slot) => slot.id === current.slotId)
          ) {
            return current;
          }

          return { ...current, slotId: "", date: "", time: "" };
        });
      })
      .catch((err) => {
        if (isMounted)
          setAvailabilityError(
            err instanceof Error
              ? err.message
              : "Unable to load availability slots.",
          );
      })
      .finally(() => {
        if (isMounted) setIsAvailabilityLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, therapist?.id]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() =>
      dialogRef.current?.focus(),
    );
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const isGroup1 = therapist?.group === 1;
  const canBookCoupleTherapy = !isGroup1 && Boolean(therapist?.couplePrice);
  const sessionPrice =
    formData.service === "Couple Therapy"
      ? Number(therapist?.couplePrice ?? therapist?.price ?? 0)
      : Number(therapist?.price ?? 0);
  const packagePricing = calculateSessionPackagePricing(
    sessionPrice,
    formData.sessionCount,
  );
  const formattedSessionPrice = formatINR(sessionPrice);
  const formattedPrice = formatINR(packagePricing.offerAmount);

  const selectSlot = (slot: AvailabilitySlot) => {
    setFormData({
      ...formData,
      slotId: slot.id,
      date: getSlotDateLabel(slot),
      time: getSlotTimeLabel(slot),
    });
  };

  const canContinue = () => {
    if (step === 1) return Boolean(formData.service);
    if (step === 2) return Boolean(formData.slotId);
    if (step === 3) {
      const detailsComplete = Boolean(
        formData.name.trim() &&
          formData.email.trim() &&
          formData.phone.trim() &&
          formData.mode,
      );
      return detailsComplete && (Boolean(getCurrentUser()) || Boolean(bookingVerificationToken));
    }
    return true;
  };

  const nextStep = () => {
    setSubmitError("");

    if (!canContinue()) {
      setSubmitError("Please complete the required options before continuing.");
      return;
    }

    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const bookingIdentifier = formData.email.trim();

  const sendBookingOtp = async () => {
    if (!bookingIdentifier) return setSubmitError("Enter an email to verify.");
    setBookingOtpLoading(true); setSubmitError("");
    try {
      const result = await requestBookingOtp({ identifier: bookingIdentifier });
      setBookingOtpRequested(true);
      setBookingDevCode(result.devCode ?? "");
    } catch (error) { setSubmitError(error instanceof Error ? error.message : "Unable to send code."); }
    finally { setBookingOtpLoading(false); }
  };

  const confirmBookingOtp = async () => {
    setBookingOtpLoading(true); setSubmitError("");
    try {
      const result = await verifyBookingOtp({ identifier: bookingIdentifier, code: bookingOtp });
      setBookingVerificationToken(result.verificationToken);
    } catch (error) { setSubmitError(error instanceof Error ? error.message : "Unable to verify code."); }
    finally { setBookingOtpLoading(false); }
  };

  async function handleBooking() {
    let appointmentId: string | null = null;
    let accessToken = getAccessToken();
    const currentUser = getCurrentUser();
    const isQuickBooking = !currentUser || !accessToken;
    let paymentCompleted = false;
    let paymentVerificationStarted = false;

    try {
      setSubmitError("");
      setIsSubmitting(true);

      if (currentUser && currentUser.role !== "PATIENT") {
        setSubmitError("Please use a patient account to book an appointment.");
        setIsSubmitting(false);
        return;
      }

      if (!formData.slotId) {
        setSubmitError("Please select a time slot");
        setIsSubmitting(false);
        return;
      }

      if (!formData.name || !formData.email || !formData.phone) {
        setSubmitError("Please fill in all required information");
        setIsSubmitting(false);
        return;
      }

      const bookingPayload = {
        slotId: formData.slotId,
        sessionCount: formData.sessionCount,
        contactName: formData.name,
        contactEmail: formData.email,
        contactPhone: formData.phone,
        service: formData.service,
        mode: formData.mode,
        notes: `Service: ${formData.service}\nPackage: ${packagePricing.label}\nMode: ${formData.mode}\nName: ${formData.name}\nEmail: ${formData.email || "Not shared"}\nPhone: ${formData.phone}`,
        ...(isQuickBooking ? { verificationToken: bookingVerificationToken } : {}),
      };

      if (!isQuickBooking) {
        const appointment = await createAppointment(
          bookingPayload,
          accessToken!,
        );
        appointmentId = appointment.id;
      } else {
        const result = await createQuickAppointment(bookingPayload);
        saveAccessToken(result.accessToken);
        accessToken = result.accessToken;
        appointmentId = result.appointment.id;
      }

      if (!appointmentId) {
        throw new Error("Unable to create appointment.");
      }

      if (isPaymentBypassEnabled) {
        await completeDevelopmentPayment(accessToken!, appointmentId);
        paymentCompleted = true;
        setSubmitSuccess(true);
        setSubmitError("");
        setIsSubmitting(false);
        setTimeout(() => {
          onClose();
          redirectToPatientProfile(
            "Test booking completed. The care team will confirm the appointment and share joining instructions.",
          );
        }, 1000);
        return;
      }

      await loadRazorpayCheckout();
      if (!window.Razorpay) {
        throw new Error("Razorpay checkout is unavailable.");
      }

      const order = await createRazorpayOrder(accessToken!, appointmentId);
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        name: "Oruma",
        description: `${packagePricing.shortLabel} ${formData.service ?? "Therapy session"} with ${therapist?.name ?? "therapist"}`,
        order_id: order.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        config: RAZORPAY_UPI_CHECKOUT_CONFIG,
        handler: async (response) => {
          paymentVerificationStarted = true;
          try {
            await verifyRazorpayPayment(accessToken!, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            paymentCompleted = true;
            setSubmitSuccess(true);
            setSubmitError("");
            setTimeout(() => {
              onClose();
              redirectToPatientProfile(
                "Booking and payment received. The care team will confirm your appointment and contact you on WhatsApp with joining instructions.",
              );
            }, 1000);
          } catch (err) {
            setSubmitError(
              err instanceof Error ? err.message : "Unable to verify payment.",
            );
            if (appointmentId) {
              await cancelAppointment(appointmentId, accessToken!);
            }
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: async () => {
            if (
              !paymentCompleted &&
              !paymentVerificationStarted &&
              appointmentId
            ) {
              await cancelAppointment(appointmentId, accessToken!).catch(
                () => undefined,
              );
            }
            setIsSubmitting(false);
          },
        },
      });

      checkout.on("payment.failed", (response) => {
        setSubmitError(getRazorpayPaymentFailureMessage(response));
      });

      checkout.open();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to book appointment. Please try again.",
      );
      if (appointmentId && accessToken) {
        await cancelAppointment(appointmentId, accessToken).catch(
          () => undefined,
        );
      }
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center sm:p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-dialog-title"
        aria-describedby="booking-dialog-progress"
        aria-busy={isSubmitting}
        tabIndex={-1}
        className="relative flex max-h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl outline-none animate-in zoom-in-95 duration-300 sm:max-h-[90dvh] sm:rounded-[2rem]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-4 sm:p-6">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                aria-label="Go to previous booking step"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A7F7A]"
              >
                <LucideIcon
                  name="chevron-left"
                  size={20}
                  className="text-gray-600"
                />
              </button>
            )}
            <h3
              id="booking-dialog-title"
              className="text-lg font-bold text-[#064F4B] sm:text-xl"
            >
              {step === 1 && "Service Selection"}
              {step === 2 && "Appointments"}
              {step === 3 && "Your Information"}
              {step === 4 && "Session Summary"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close booking dialog"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A7F7A] disabled:opacity-50"
          >
            <LucideIcon name="x" size={24} className="text-gray-400" />
          </button>
        </div>

        <p id="booking-dialog-progress" className="sr-only">
          Step {step} of 4
        </p>

        <div className="overflow-y-auto p-4 sm:p-6">
          {step === 1 && (
            <div className="space-y-6">
              {therapist && (
                <div className="flex items-center gap-4 p-4 bg-[#B7C8A3]/10 rounded-2xl mb-4">
                  <img
                    src={therapist.image || therapist.img}
                    className="w-12 h-12 rounded-full object-cover"
                    alt={therapist.name}
                    width="48"
                    height="48"
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <p className="font-bold text-[#064F4B]">{therapist.name}</p>
                    <p className="text-xs text-[#064F4B]/60">
                      {therapist.role || therapist.title}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="booking-service"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  Service
                </label>
                <select
                  id="booking-service"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#A3B899] appearance-none"
                  value={formData.service}
                  onChange={(event) =>
                    setFormData({ ...formData, service: event.target.value })
                  }
                >
                  <option>Individual Therapy</option>
                  {canBookCoupleTherapy && <option>Couple Therapy</option>}
                </select>
                {isGroup1 && (
                  <p className="text-[10px] text-orange-600 font-bold mt-2 flex items-center gap-1">
                    <LucideIcon name="info" size={10} /> Couple therapy is
                    available with eligible professionals.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Session package
                </label>
                <div className="grid gap-3">
                  {SESSION_PACKAGE_OPTIONS.map((option) => {
                    const pricing = calculateSessionPackagePricing(
                      sessionPrice,
                      option.sessionCount,
                    );
                    const isSelected =
                      formData.sessionCount === option.sessionCount;

                    return (
                      <button
                        key={option.sessionCount}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            sessionCount: option.sessionCount,
                          })
                        }
                        className={`rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-[#A3B899] bg-[#A3B899] text-white shadow-lg"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#A3B899]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-black">{option.label}</span>
                          <span className="text-sm font-black">
                            {formatINR(pricing.offerAmount)}
                          </span>
                        </div>
                        <p
                          className={`mt-1 text-xs font-bold ${isSelected ? "text-white/75" : "text-gray-500"}`}
                        >
                          {option.discountPercent > 0
                            ? `${option.discountPercent}% package offer on ${formatINR(pricing.originalAmount)}`
                            : `${formattedSessionPrice} per session`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-[#E2E8E6] bg-[#F5F8F7] p-5">
                <p className="text-[10px] font-black text-[#064F4B]/50 uppercase tracking-widest">
                  Payable now
                </p>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="font-black text-[#064F4B]">
                    {packagePricing.label}
                  </p>
                  <p className="text-xl font-black text-[#064F4B]">
                    {formattedPrice}
                  </p>
                </div>
                {packagePricing.discountAmount > 0 && (
                  <p className="mt-1 text-xs font-bold text-[#0A7F7A]">
                    You save {formatINR(packagePricing.discountAmount)}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="font-bold text-gray-800">Available Slots</p>
                  <span className="text-[10px] font-black text-[#064F4B]/50 uppercase tracking-widest">
                    IST
                  </span>
                </div>

                {isAvailabilityLoading && (
                  <div className="grid gap-3">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-16 rounded-xl bg-white animate-pulse"
                      />
                    ))}
                  </div>
                )}

                {!isAvailabilityLoading && availabilityError && (
                  <div className="rounded-xl bg-red-50 p-4">
                    <p className="text-sm font-bold text-red-700">
                      {availabilityError}
                    </p>
                  </div>
                )}

                {!isAvailabilityLoading &&
                  !availabilityError &&
                  availabilitySlots.length === 0 && (
                    <div className="rounded-xl bg-white p-4">
                      <p className="text-sm font-bold text-gray-700">
                        {isBookingLeadTimeBypassEnabled
                          ? "No future slots are available."
                          : "No slots bookable at least 24 hours in advance are available."}
                      </p>
                      <p className="text-xs font-medium text-gray-500 mt-1">
                        Please choose another therapist or check again later.
                      </p>
                    </div>
                  )}

                {!isAvailabilityLoading &&
                  !availabilityError &&
                  availabilitySlots.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-bold text-gray-500">
                        {isBookingLeadTimeBypassEnabled
                          ? "Development lead-time bypass is enabled."
                          : "Appointments must be scheduled at least 24 hours in advance."}
                      </p>
                      <div className="grid gap-3 max-h-72 overflow-y-auto pr-1">
                        {availabilitySlots.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => selectSlot(slot)}
                            aria-pressed={formData.slotId === slot.id}
                            className={`w-full rounded-xl border p-4 text-left transition-all ${
                              formData.slotId === slot.id
                                ? "bg-[#A3B899] border-[#A3B899] text-white shadow-lg"
                                : "bg-white border-gray-200 text-gray-700 hover:border-[#A3B899]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-black text-sm">
                                {getSlotDateLabel(slot)}
                              </span>
                              <span
                                className={`text-[10px] font-black uppercase tracking-widest ${formData.slotId === slot.id ? "text-white/70" : "text-[#064F4B]/40"}`}
                              >
                                Available
                              </span>
                            </div>
                            <p
                              className={`mt-1 text-xs font-bold ${formData.slotId === slot.id ? "text-white/80" : "text-gray-500"}`}
                            >
                              {getSlotTimeLabel(slot)}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <label className="block space-y-1">
                <span className="text-sm font-bold text-gray-700">Name</span>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#A3B899]"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-bold text-gray-700">
                  Email
                </span>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#A3B899]"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData({ ...formData, email: event.target.value })
                  }
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-bold text-gray-700">
                  WhatsApp number for care-team contact
                </span>
                <input
                  type="tel"
                  placeholder="+91"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#A3B899]"
                  value={formData.phone}
                  onChange={(event) =>
                    setFormData({ ...formData, phone: event.target.value })
                  }
                />
              </label>
              <fieldset className="space-y-3">
                <legend className="text-sm font-bold text-gray-700">
                  Mode of Therapy
                </legend>
                <div className="grid grid-cols-3 gap-3">
                  {["Video", "Audio", "Chat"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFormData({ ...formData, mode })}
                      aria-pressed={formData.mode === mode}
                      className={`min-h-11 rounded-xl border px-2 py-3 font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A7F7A] ${formData.mode === mode ? "bg-[#A3B899] border-[#A3B899] text-white" : "border-gray-200 text-gray-600"}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </fieldset>
              {!getCurrentUser() && (
                <div className="rounded-xl border border-[#B7C8A3] bg-[#F5F8F7] p-4">
                  <p className="text-sm font-black text-[#064F4B]">Verify your booking contact</p>
                  <p className="mt-1 text-xs text-[#5F7F7A]">We will send a six-digit verification code to {bookingIdentifier || "your email"}. Staff will use WhatsApp only for appointment support and joining instructions.</p>
                  {!bookingVerificationToken && !bookingOtpRequested && <button type="button" disabled={bookingOtpLoading} onClick={sendBookingOtp} className="mt-3 rounded-full bg-[#064F4B] px-5 py-3 text-xs font-black text-white disabled:opacity-50">Send verification code</button>}
                  {!bookingVerificationToken && bookingOtpRequested && <div className="mt-3 flex flex-wrap gap-2">
                    <input aria-label="Booking verification code" inputMode="numeric" maxLength={6} value={bookingOtp} onChange={(event) => setBookingOtp(event.target.value.replace(/\D/g, ""))} className="min-h-11 flex-1 rounded-xl border border-gray-200 bg-white px-4" placeholder="6-digit code" />
                    <button type="button" disabled={bookingOtpLoading || bookingOtp.length !== 6} onClick={confirmBookingOtp} className="rounded-full bg-[#064F4B] px-5 py-3 text-xs font-black text-white disabled:opacity-50">Verify</button>
                  </div>}
                  {bookingDevCode && !bookingVerificationToken && <p className="mt-2 text-xs font-bold text-[#0A7F7A]">Development code: {bookingDevCode}</p>}
                  {bookingVerificationToken && <p className="mt-3 text-sm font-black text-[#0A7F7A]">Contact verified</p>}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-[#B7C8A3]/10 border border-[#B7C8A3]/20 p-6 rounded-[2rem]">
                <h4 className="text-xs font-black text-[#064F4B] uppercase tracking-widest mb-4">
                  Session Summary
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800">
                        {formData.service}
                      </p>
                      <p className="mt-1 text-xs font-bold text-[#5F7F7A]">
                        {packagePricing.label}
                      </p>
                    </div>
                    <p className="font-black text-[#064F4B]">
                      {formattedPrice}
                    </p>
                  </div>
                  <div className="border-t border-dashed border-[#B7C8A3]/30 pt-4 space-y-2">
                    <div className="flex items-center gap-3 text-sm text-[#064F4B] font-medium">
                      <LucideIcon name="calendar" size={16} />
                      <span>
                        {formData.date
                          ? `Date: ${formData.date}`
                          : "Contacting for date"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#064F4B] font-medium">
                      <LucideIcon name="clock" size={16} />
                      <span>{formData.time || "Contacting for time"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400">
                {isPaymentBypassEnabled
                  ? "Development testing is enabled. No money will be collected; the booking will continue through the post-payment flow."
                  : "Clicking confirm will reserve your selected slot and start payment. After payment, the care team will confirm the appointment and share joining instructions."}
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 border-t border-gray-100 bg-gray-50/95 p-4 backdrop-blur sm:p-6">
          {submitSuccess && (
            <div
              role="status"
              aria-live="polite"
              className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl"
            >
              <p className="text-sm font-bold text-green-700">
                Appointment booked successfully.
              </p>
              <p className="text-xs text-green-600 mt-1">
                Your booking is recorded on ORUMA. The care team will contact
                you manually on WhatsApp with confirmation and joining details.
              </p>
            </div>
          )}

          {submitError && (
            <div
              role="alert"
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <p className="text-sm font-bold text-red-700">{submitError}</p>
            </div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting}
              className="w-full bg-[#064F4B] text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-[#0A7F7A] transition-all disabled:opacity-50"
            >
              Next Step
            </button>
          ) : (
            <button
              type="button"
              className="w-full bg-[#00D494] text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-[#00B37E] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={handleBooking}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <LucideIcon name="loader" size={20} className="animate-spin" />
              )}
              {isSubmitting
                ? isPaymentBypassEnabled
                  ? "Completing test booking..."
                  : "Please complete payment..."
                : isPaymentBypassEnabled
                  ? "Confirm test booking"
                  : "Pay & confirm booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
