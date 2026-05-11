import React, { useState, useEffect } from "react";
import { LucideIcon } from "@site-builder/icons";
import {
  AvailabilitySlot,
  getAvailabilitySlots,
  getSlotDateLabel,
  getSlotTimeLabel,
} from "../src/lib/therapists";
import { createAppointment } from "../src/lib/booking";
import { getCurrentUser, getAccessToken } from "../src/lib/auth";

export default function BookingModal({ isOpen, onClose, therapist }) {
  const [step, setStep] = useState(1);
  const [availabilitySlots, setAvailabilitySlots] = useState<
    AvailabilitySlot[]
  >([]);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    service: "Individual Therapy",
    package: "Single Session",
    slotId: "",
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
    age: "",
    mode: "Video Call",
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSubmitError("");
      setSubmitSuccess(false);
      setFormData((prev) => ({
        ...prev,
        service: "Individual Therapy", // Reset to Individual as default
        package: "Single Session",
        slotId: "",
        date: "",
        time: "",
      }));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !therapist?.id) return;

    let isMounted = true;
    setIsAvailabilityLoading(true);
    setAvailabilityError("");

    getAvailabilitySlots(therapist.id)
      .then((slots) => {
        if (isMounted) setAvailabilitySlots(slots);
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

  if (!isOpen) return null;

  // Group Definitions
  const isGroup1 = therapist?.group === 1;
  const isGroup2 = therapist?.group === 2;
  const isGroup3 = therapist?.group === 3;
  const isGroup4 = therapist?.group === 4;
  const isGroup5 = therapist?.group === 5;

  // Therapy Pricing Packages
  const indPackagesG1G3 = [
    {
      name: "Individual Therapy - 4 Sessions",
      discount: "Save ₹400",
      price: "₹3,600",
    },
    {
      name: "Individual Therapy - 8 Sessions",
      discount: "Save ₹1,200",
      price: "₹6,800",
    },
    {
      name: "Individual Therapy - 12 Sessions",
      discount: "Save ₹2,400",
      price: "₹9,600",
    },
  ];

  const indPackagesG2G5 = [
    {
      name: "Individual Therapy - 4 Sessions",
      discount: "Save ₹800",
      price: "₹7,200",
    },
    {
      name: "Individual Therapy - 8 Sessions",
      discount: "Save ₹2,400",
      price: "₹13,600",
    },
    {
      name: "Individual Therapy - 12 Sessions",
      discount: "Save ₹4,800",
      price: "₹19,200",
    },
  ];

  const indPackagesG4 = [
    {
      name: "Individual Therapy - 4 Sessions",
      discount: "Save ₹600",
      price: "₹5,400",
    },
    {
      name: "Individual Therapy - 8 Sessions",
      discount: "Save ₹1,800",
      price: "₹10,200",
    },
    {
      name: "Individual Therapy - 12 Sessions",
      discount: "Save ₹3,600",
      price: "₹14,400",
    },
  ];

  const couplePackagesG2 = [
    {
      name: "Couple Therapy - 4 Sessions",
      discount: "Save ₹1,200",
      price: "₹10,800",
    },
    {
      name: "Couple Therapy - 8 Sessions",
      discount: "Save ₹3,600",
      price: "₹20,400",
    },
    {
      name: "Couple Therapy - 12 Sessions",
      discount: "Save ₹7,200",
      price: "₹28,800",
    },
  ];

  const couplePackagesG5 = [
    {
      name: "Couple Therapy - 4 Sessions",
      discount: "Save ₹900",
      price: "₹8,100",
    },
    {
      name: "Couple Therapy - 8 Sessions",
      discount: "Save ₹2,700",
      price: "₹15,300",
    },
    {
      name: "Couple Therapy - 12 Sessions",
      discount: "Save ₹5,400",
      price: "₹21,600",
    },
  ];

  const couplePackagesG3G4 = [
    {
      name: "Couple Therapy - 4 Sessions",
      discount: "Save ₹600",
      price: "₹5,400",
    },
    {
      name: "Couple Therapy - 8 Sessions",
      discount: "Save ₹1,800",
      price: "₹10,200",
    },
    {
      name: "Couple Therapy - 12 Sessions",
      discount: "Save ₹3,600",
      price: "₹14,400",
    },
  ];

  const getActivePackages = () => {
    if (formData.service === "Couple Therapy") {
      if (isGroup2) return couplePackagesG2;
      if (isGroup5) return couplePackagesG5;
      return couplePackagesG3G4;
    }
    if (isGroup2 || isGroup5) return indPackagesG2G5;
    if (isGroup4) return indPackagesG4;
    return indPackagesG1G3;
  };

  const activePackages = getActivePackages();

  const getSingleSessionPrice = () => {
    if (formData.service === "Couple Therapy") {
      if (isGroup2) return "₹3,000";
      if (isGroup5) return "₹2,250";
      if (isGroup4 || isGroup3) return "₹1,500";
    }
    if (isGroup2 || isGroup5) return "₹2,000";
    if (isGroup4) return "₹1,500";
    return "₹1,000";
  };

  const getPackagePrice = (pkgName) => {
    const pkg = activePackages.find((p) => p.name === pkgName);
    return pkg ? pkg.price : "₹0";
  };

  const selectSlot = (slot: AvailabilitySlot) => {
    setFormData({
      ...formData,
      slotId: slot.id,
      date: getSlotDateLabel(slot),
      time: getSlotTimeLabel(slot),
    });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LucideIcon
                  name="chevron-left"
                  size={20}
                  className="text-gray-600"
                />
              </button>
            )}
            <h3 className="text-xl font-bold text-[#064F4B]">
              {step === 1 && "Service Selection"}
              {step === 2 && "Appointments"}
              {step === 3 && "Your Information"}
              {step === 4 && "Payment Summary"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LucideIcon name="x" size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6">
          {/* Step 1: Service & Packages */}
          {step === 1 && (
            <div className="space-y-6">
              {therapist && (
                <div className="flex items-center gap-4 p-4 bg-[#B7C8A3]/10 rounded-2xl mb-4">
                  <img
                    src={therapist.image || therapist.img}
                    className="w-12 h-12 rounded-full object-cover"
                    alt={therapist.name}
                  />
                  <div>
                    <p className="font-bold text-[#064F4B]">{therapist.name}</p>
                    <p className="text-xs text-[#064F4B]/60">
                      {therapist.role || therapist.title}
                    </p>
                    <span className="text-[10px] font-black uppercase text-[#064F4B]/40">
                      Group {therapist.group} Professional
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Service:
                </label>
                <select
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#A3B899] appearance-none"
                  value={formData.service}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      service: e.target.value,
                      package: "Single Session",
                    })
                  }
                >
                  <option>Individual Therapy</option>
                  {(isGroup2 || isGroup3 || isGroup4 || isGroup5) && (
                    <option>Couple Therapy</option>
                  )}
                </select>
                {isGroup1 && (
                  <p className="text-[10px] text-orange-600 font-bold mt-2 flex items-center gap-1">
                    <LucideIcon name="info" size={10} /> Couple therapy is
                    available with Group 2, 5, 4 & Group 3 professionals.
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-500 font-medium">
                  Choose a session package for better value:
                </p>
                {activePackages.map((pkg) => (
                  <button
                    key={pkg.name}
                    onClick={() =>
                      setFormData({ ...formData, package: pkg.name })
                    }
                    className={`w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center group ${formData.package === pkg.name ? "border-[#A3B899] bg-[#A3B899]/5 ring-1 ring-[#A3B899]" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div>
                      <p className="font-bold text-gray-800 text-xs">
                        {pkg.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-[#B7C8A3] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {pkg.discount}
                        </span>
                        <span className="text-gray-400 text-[10px] uppercase font-bold">
                          {formData.service} Pack
                        </span>
                      </div>
                    </div>
                    <p className="font-black text-gray-700 text-sm">
                      {pkg.price}
                    </p>
                  </button>
                ))}
              </div>

              <div className="relative py-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <span className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Or
                </span>
              </div>

              <button
                onClick={() =>
                  setFormData({ ...formData, package: "Single Session" })
                }
                className={`w-full p-6 border rounded-2xl transition-all font-bold text-left flex justify-between items-center ${formData.package === "Single Session" ? "border-[#A3B899] bg-[#A3B899]/5 ring-1 ring-[#A3B899]" : "border-gray-200 hover:border-gray-300"}`}
              >
                <span>Single Session</span>
                <span className="text-[#064F4B] font-black">
                  {getSingleSessionPrice()}
                </span>
              </button>
            </div>
          )}

          {/* Step 2: Appointments */}
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
                        No detailed slots are published yet.
                      </p>
                      <p className="text-xs font-medium text-gray-500 mt-1">
                        Continue and our team will confirm the timing with you.
                      </p>
                    </div>
                  )}

                {!isAvailabilityLoading &&
                  !availabilityError &&
                  availabilitySlots.length > 0 && (
                    <div className="grid gap-3 max-h-72 overflow-y-auto pr-1">
                      {availabilitySlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => selectSlot(slot)}
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
                  )}
              </div>
            </div>
          )}

          {/* Step 3: Your Information */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#A3B899]"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#A3B899]"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  placeholder="+91"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#A3B899]"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">
                  Mode of Therapy
                </label>
                <div className="flex gap-3">
                  {["Video", "Audio", "Chat"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setFormData({ ...formData, mode: m })}
                      className={`flex-1 py-3 rounded-xl border font-bold transition-all ${formData.mode === m ? "bg-[#A3B899] border-[#A3B899] text-white" : "border-gray-200 text-gray-600"}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Summary & Payment */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-[#B7C8A3]/10 border border-[#B7C8A3]/20 p-6 rounded-[2rem]">
                <h4 className="text-xs font-black text-[#064F4B] uppercase tracking-widest mb-4">
                  Order Summary
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800">
                        {formData.service}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formData.package}
                      </p>
                    </div>
                    <p className="font-black text-[#064F4B]">
                      {formData.package === "Single Session"
                        ? getSingleSessionPrice()
                        : getPackagePrice(formData.package)}
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

              <div className="text-center">
                <p className="text-xs text-gray-400">
                  Clicking confirm will book your appointment and send
                  confirmation details via WhatsApp.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 sticky bottom-0 z-10">
          {submitSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm font-bold text-green-700">
                ✓ Appointment booked successfully!
              </p>
              <p className="text-xs text-green-600 mt-1">
                Confirmation details have been sent to your WhatsApp and email.
              </p>
            </div>
          )}

          {submitError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm font-bold text-red-700">✗ {submitError}</p>
            </div>
          )}

          {step < 4 ? (
            <button
              onClick={nextStep}
              disabled={isSubmitting}
              className="w-full bg-[#064F4B] text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-[#0A7F7A] transition-all disabled:opacity-50"
            >
              Next Step
            </button>
          ) : (
            <button
              className="w-full bg-[#00D494] text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-[#00B37E] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={handleBooking}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <LucideIcon name="loader" size={20} className="animate-spin" />
              )}
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  async function handleBooking() {
    try {
      setSubmitError("");
      setIsSubmitting(true);

      // Check if user is authenticated
      const currentUser = getCurrentUser();
      const accessToken = getAccessToken();

      if (!currentUser || !accessToken) {
        setSubmitError("Please log in to book an appointment");
        // Could redirect to login here
        return;
      }

      // Validate required fields
      if (!formData.slotId && availabilitySlots.length > 0) {
        setSubmitError("Please select a time slot");
        setIsSubmitting(false);
        return;
      }

      if (!formData.name || !formData.email || !formData.phone) {
        setSubmitError("Please fill in all required information");
        setIsSubmitting(false);
        return;
      }

      // Create appointment
      const appointment = await createAppointment(
        {
          slotId: formData.slotId,
          notes: `Service: ${formData.service}\nPackage: ${formData.package}\nMode: ${formData.mode}\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}`,
        },
        accessToken,
      );

      setSubmitSuccess(true);

      // Send WhatsApp message with confirmation
      const confirmationText = `Hi ${therapist?.name}, I have successfully booked an appointment!%0A%0AAppointment ID: ${appointment.id}%0ADate: ${formData.date}%0ATime: ${formData.time}%0AMode: ${formData.mode}%0A%0AThank you!`;

      // Optional: Send to therapist's WhatsApp or keep it for user reference
      setTimeout(() => {
        window.open(
          `https://wa.me/918157039987?text=${confirmationText}`,
          "_blank",
        );
        onClose();
      }, 2000);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to book appointment. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }
}
