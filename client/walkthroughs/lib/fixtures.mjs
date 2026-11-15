// A sample world for walkthrough videos, and a fake ORUMA API that serves it.
// Every name, email, phone number and payment here is invented. No real
// patient, practitioner or payment data is used, and no request leaves the
// browser.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function base64Url(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

/** An unsigned token the client can decode. Only the fake API accepts it. */
export function sampleToken(role, userId, extra = {}) {
  return [
    base64Url({ alg: "none", typ: "JWT" }),
    base64Url({
      userId,
      email: extra.email ?? `${role.toLowerCase()}@example.com`,
      role,
      exp: Math.floor(Date.now() / 1000) + 6 * 3600,
      ...extra,
    }),
    "walkthrough",
  ].join(".");
}

function decodeToken(header) {
  const token = header?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
  } catch {
    return null;
  }
}

/** A Date N days from today at the given IST time. */
function ist(daysAhead, hour, minute = 0) {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysAhead,
      hour - 5,
      minute - 30,
    ),
  );
}

let counter = 1000;
const nextId = (prefix) =>
  `${prefix}-0000-4000-8000-${String(++counter).padStart(12, "0")}`;

export function createWorld() {
  const createdAt = new Date(Date.now() - 120 * DAY).toISOString();

  const practitioner = (overrides) => ({
    email: null,
    tags: null,
    couplePrice: null,
    image: null,
    voiceIntro: null,
    voiceIntroTranscript: null,
    imagePublicId: null,
    voiceIntroPublicId: null,
    awardingInstitution: "Sample University",
    specialization: null,
    consultationType: "Video",
    verifiedExperienceHours: null,
    professionalRegistrationNumber: null,
    registrationAuthority: null,
    sessionDurationMinutes: 60,
    engagementRelationship: "Independent practitioner",
    verificationStatus: "VERIFIED",
    pendingProfileChanges: null,
    pendingProfileSubmittedAt: null,
    nextAvailableSlot: null,
    isActive: true,
    archivedAt: null,
    createdAt,
    ...overrides,
  });

  const anjali = practitioner({
    id: "7d3c1d0e-1a2b-4c5d-8e9f-000000000001",
    accountId: "therapist-user-1",
    name: "Anjali Menon",
    email: "anjali.menon@example.com",
    title: "Counselling Psychologist",
    areasOfPractice: ["Relationship Issues", "Couple Therapy", "Marriage Counselling", "Premarital Counselling"],
    languages: ["English", "Malayalam"],
    experience: 8,
    price: 1200,
    couplePrice: 1800,
    qualifications: "MSc Counselling Psychology",
    specialization: "Relationship & Couples",
    bio: "Anjali supports individuals and couples with communication, conflict and life transitions, in English and Malayalam.",
  });
  const rahul = practitioner({
    id: "7d3c1d0e-1a2b-4c5d-8e9f-000000000002",
    accountId: "therapist-user-2",
    name: "Rahul Varma",
    email: "rahul.varma@example.com",
    title: "Counsellor",
    areasOfPractice: ["Anxiety", "Stress & Burnout", "Breakup Recovery"],
    languages: ["English", "Hindi", "Malayalam"],
    experience: 5,
    price: 900,
    qualifications: "MA Psychology",
    specialization: "Anxiety & Stress",
    bio: "Rahul works with stress, anxiety and recovery after a breakup, with practical steps between sessions.",
  });
  const fathima = practitioner({
    id: "7d3c1d0e-1a2b-4c5d-8e9f-000000000003",
    accountId: "therapist-user-3",
    name: "Fathima Rasheed",
    email: "fathima.rasheed@example.com",
    title: "Counselling Psychologist",
    areasOfPractice: ["Parenting Challenges", "Family Counselling", "Postpartum Support"],
    languages: ["English", "Malayalam", "Arabic"],
    experience: 6,
    price: 1000,
    qualifications: "MSc Clinical and Counselling Psychology",
    specialization: "Parenting & Family",
    bio: "Fathima supports parents and families, including adjustment after a new baby.",
  });
  // Has completed her own profile and is waiting for verification.
  const neha = practitioner({
    id: "7d3c1d0e-1a2b-4c5d-8e9f-000000000004",
    accountId: "therapist-user-4",
    name: "Neha Thomas",
    email: "neha.thomas@example.com",
    title: "Counsellor",
    areasOfPractice: ["Breakup Recovery", "Self-esteem", "Emotional Wellbeing"],
    languages: ["English", "Malayalam", "Tamil"],
    experience: 4,
    price: 800,
    qualifications: "MA Counselling Psychology",
    specialization: "Depression & Emotional Wellbeing",
    bio: "Neha supports young adults through breakups, low confidence and life changes.",
    verificationStatus: "UNVERIFIED",
    isActive: false,
    createdAt: new Date(Date.now() - 3 * DAY).toISOString(),
  });
  const therapists = [anjali, rahul, fathima, neha];

  const slot = (therapistId, days, hour, status = "AVAILABLE") => {
    const start = ist(days, hour);
    return {
      id: nextId("5a1b2c3d"),
      therapistId,
      startTime: start.toISOString(),
      endTime: new Date(start.getTime() + HOUR).toISOString(),
      status,
      createdAt,
    };
  };
  const slots = [
    slot(anjali.id, 2, 10),
    slot(anjali.id, 2, 18),
    slot(anjali.id, 3, 11),
    slot(anjali.id, 3, 16),
    slot(rahul.id, 2, 12),
    slot(fathima.id, 4, 15),
  ];
  for (const item of therapists) {
    item.nextAvailableSlot =
      slots.find((s) => s.therapistId === item.id && s.status === "AVAILABLE")?.startTime ?? null;
  }

  const user = (id, fullName, email, phone, role = "PATIENT") => ({
    id,
    email,
    fullName,
    phone,
    age: null,
    gender: null,
    role,
    healthInfo: {},
    mustChangePassword: false,
    createdAt,
  });
  const priya = user("patient-sample-1", "Priya Nair", "patient@example.com", "+919800000001");
  const arjun = user("patient-sample-2", "Arjun Krishnan", "arjun.k@example.com", "+919800000002");
  const meera = user("patient-sample-3", "Meera Suresh", "meera.s@example.com", "+919800000003");
  const sneha = user("patient-sample-4", "Sneha Pillai", "sneha.p@example.com", "+919800000004");
  const admin = user("admin-sample-1", "Oruma Admin", "admin@example.com", "+919800000009", "ADMIN");
  const patients = [priya, arjun, meera, sneha];

  const appointment = (id, patient, therapist, start, status, extra = {}) => {
    const begins = start instanceof Date ? start : new Date(start);
    return {
      id,
      patient: { id: patient.id, email: patient.email, fullName: patient.fullName, phone: patient.phone },
      therapist: { id: therapist.id, name: therapist.name },
      slot: {
        id: nextId("5a1b2c3d"),
        startTime: begins.toISOString(),
        endTime: new Date(begins.getTime() + HOUR).toISOString(),
      },
      status,
      service: "Individual Therapy",
      mode: "Video",
      sessionCount: 1,
      packageName: "Single session",
      packageOriginalAmount: therapist.price,
      packageOfferAmount: therapist.price,
      packageDiscountPercent: 0,
      meetingLink: null,
      meetingLinkAddedAt: null,
      bookingConfirmationSentAt: null,
      meetingLinkSentAt: null,
      reminderSentAt: null,
      staffNotes: null,
      contactName: patient.fullName,
      contactEmail: patient.email,
      contactPhone: patient.phone,
      createdAt: new Date(Date.now() - 2 * HOUR).toISOString(),
      ...extra,
    };
  };

  const appointments = [
    // New paid booking waiting for the care team (admin video).
    appointment("b6f1a2c3-0000-4000-8000-00000000a101", arjun, anjali, ist(1, 17), "PENDING"),
    // Confirmed with a session link (patient session video, practitioner video).
    appointment("b6f1a2c3-0000-4000-8000-00000000a102", priya, anjali, ist(1, 10), "CONFIRMED", {
      meetingLink: "https://meet.google.com/abc-defg-hij",
      meetingLinkAddedAt: new Date(Date.now() - HOUR).toISOString(),
      bookingConfirmationSentAt: new Date(Date.now() - 2 * HOUR).toISOString(),
      meetingLinkSentAt: new Date(Date.now() - HOUR).toISOString(),
    }),
    // Past session, ready for a case sheet.
    appointment("b6f1a2c3-0000-4000-8000-00000000a103", meera, anjali, ist(-3, 11), "COMPLETED", {
      meetingLink: "https://meet.google.com/kln-opqr-stu",
    }),
    // Cancelled but paid: needs a refund (admin video).
    appointment("b6f1a2c3-0000-4000-8000-00000000a104", sneha, fathima, ist(2, 15), "CANCELLED", {
      staffNotes: "Patient cancelled 2 days before the session. Eligible for a full refund.",
    }),
  ];

  const payment = (id, apt, status, extra = {}) => ({
    id,
    appointment: apt,
    patient: { id: apt.patient.id, email: apt.patient.email, fullName: apt.patient.fullName },
    amount: apt.packageOfferAmount,
    refundedAmount: 0,
    status,
    provider: "razorpay",
    reference: `pay_sample_${id.slice(-4)}`,
    providerOrderId: `order_sample_${id.slice(-4)}`,
    providerPaymentId: `pay_sample_${id.slice(-4)}`,
    notes: null,
    refundHistory: null,
    createdAt: apt.createdAt,
    updatedAt: apt.createdAt,
    ...extra,
  });
  const payments = appointments.map((apt, index) =>
    payment(`c7a2b3d4-0000-4000-8000-00000000p10${index + 1}`, apt, "PAID"),
  );

  const caseSheets = [];

  const tickets = [
    {
      id: "d8b3c4e5-0000-4000-8000-00000000t101",
      createdBy: { id: priya.id, email: priya.email, fullName: priya.fullName },
      subject: "Can I change my session time?",
      message: "My office meeting moved. Is a later slot on the same day possible?",
      category: "Booking",
      status: "OPEN",
      adminNote: null,
      createdAt: new Date(Date.now() - 3 * HOUR).toISOString(),
      updatedAt: new Date(Date.now() - 3 * HOUR).toISOString(),
    },
  ];

  const enquiries = [
    {
      id: "e9c4d5f6-0000-4000-8000-00000000e101",
      name: "Rohan Das",
      email: "rohan.das@example.com",
      phone: "+919800000011",
      preferredContact: "whatsapp",
      subject: "Services and fees",
      message: "Do you offer premarital counselling in Malayalam? My fiancée and I live in different cities.",
      pagePath: "/services/premarital-counselling",
      status: "NEW",
      adminNote: null,
      createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    },
    {
      id: "e9c4d5f6-0000-4000-8000-00000000e102",
      name: "Lakshmi Iyer",
      email: "lakshmi.iyer@example.com",
      phone: null,
      preferredContact: "email",
      subject: "Choosing a practitioner",
      message: "I live in Dubai. Which practitioners can see me in the evening, UAE time?",
      pagePath: "/services/nri-online-counselling",
      status: "NEW",
      adminNote: null,
      createdAt: new Date(Date.now() - 5 * HOUR).toISOString(),
      updatedAt: new Date(Date.now() - 5 * HOUR).toISOString(),
    },
  ];

  return {
    therapists,
    slots,
    patients,
    admin,
    appointments,
    payments,
    caseSheets,
    tickets,
    enquiries,
    // Scenario switches a video can flip.
    flags: {
      newPatientEmail: null,
      therapistMustChangePassword: false,
      therapistPasswordChanged: false,
    },
  };
}

function json(route, body, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

function performance(world) {
  return world.therapists.map((therapist) => {
    const mine = world.appointments.filter((a) => a.therapist.id === therapist.id);
    const count = (status) => mine.filter((a) => a.status === status).length;
    return {
      therapistId: therapist.id,
      therapistName: therapist.name,
      email: therapist.email ?? "",
      totalAppointments: mine.length,
      pendingAppointments: count("PENDING"),
      confirmedAppointments: count("CONFIRMED"),
      completedAppointments: count("COMPLETED"),
      cancelledAppointments: count("CANCELLED"),
      completionRate: mine.length ? Math.round((count("COMPLETED") / mine.length) * 100) : 0,
      estimatedCompletedRevenue: count("COMPLETED") * therapist.price,
    };
  });
}

function summary(world) {
  const paid = world.payments.filter((p) => p.status === "PAID");
  return {
    patients: world.patients.length,
    therapistUsers: world.therapists.length,
    therapists: world.therapists.length,
    activeTherapists: world.therapists.filter((t) => t.isActive).length,
    appointments: world.appointments.length,
    sessions: world.appointments.filter((a) => a.status === "COMPLETED").length,
    pendingAppointments: world.appointments.filter((a) => a.status === "PENDING").length,
    revenue: paid.reduce((sum, p) => sum + p.amount, 0),
    pendingTherapistUpdates: world.therapists.filter((t) => t.pendingProfileChanges).length,
    payments: {
      collected: paid.reduce((sum, p) => sum + p.amount, 0),
      refunds: world.payments.reduce((sum, p) => sum + (p.refundedAmount ?? 0), 0),
      pending: world.payments.filter((p) => p.status === "PENDING").length,
    },
    tickets: {
      open: world.tickets.filter((t) => t.status !== "RESOLVED" && t.status !== "CLOSED").length,
      resolved: world.tickets.filter((t) => t.status === "RESOLVED").length,
    },
    caseSheets: { monitored: world.caseSheets.length, updated: world.caseSheets.length },
  };
}

/** Serves `world` as the ORUMA API for one browser context. */
export async function installFakeApi(context, world) {
  const state = { paid: false, bookedAppointment: null, bookedPayment: null };

  await context.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api/, "");
    const method = request.method();
    const body = (() => {
      try {
        return request.postDataJSON() ?? {};
      } catch {
        return {};
      }
    })();
    const caller = decodeToken(await request.headerValue("authorization"));
    const role = caller?.role;
    const therapistForCaller = world.therapists.find((t) => t.accountId === caller?.userId);
    const segments = path.split("/").filter(Boolean);

    // ---- Accounts --------------------------------------------------------
    if (method === "POST" && path === "/auth/register") {
      world.flags.newPatientEmail = body.email;
      return json(route, { id: "patient-new-1", role: "PATIENT" }, 201);
    }
    if (method === "POST" && path === "/auth/login/otp/request")
      return json(route, { message: "We sent a 6-digit login code to your email." });
    if (method === "POST" && path === "/auth/login/otp/verify")
      return json(route, {
        accessToken: sampleToken("PATIENT", "patient-new-1", {
          email: body.identifier ?? world.flags.newPatientEmail ?? "patient@example.com",
        }),
      });
    if (method === "POST" && path === "/auth/login") {
      const isTherapist = String(body.email).includes("anjali");
      const isAdmin = String(body.email).startsWith("admin");
      if (isTherapist)
        return json(route, {
          accessToken: sampleToken("THERAPIST", "therapist-user-1", {
            email: body.email,
            mustChangePassword:
              world.flags.therapistMustChangePassword && !world.flags.therapistPasswordChanged,
          }),
        });
      if (isAdmin) return json(route, { accessToken: sampleToken("ADMIN", world.admin.id, { email: body.email }) });
      return json(route, { accessToken: sampleToken("PATIENT", "patient-sample-1", { email: body.email }) });
    }
    if (method === "PATCH" && path === "/user/me/password") {
      world.flags.therapistPasswordChanged = true;
      return json(route, { message: "Password updated. Please log in again with your new password." });
    }
    if (method === "GET" && path === "/user/me") {
      if (caller?.userId === "patient-new-1")
        return json(route, {
          id: "patient-new-1",
          email: caller.email,
          fullName: "Kavya Raj",
          phone: "+919800000021",
          age: null,
          gender: null,
          role: "PATIENT",
          healthInfo: {},
          createdAt: new Date().toISOString(),
        });
      const known = [...world.patients, world.admin].find((u) => u.id === caller?.userId);
      return json(route, known ?? world.patients[0]);
    }
    if (method === "PATCH" && path === "/user/me") return json(route, { ...world.patients[0], ...body });

    // ---- Practitioners ---------------------------------------------------
    if (method === "GET" && path === "/therapists")
      return json(route, world.therapists.filter((t) => t.isActive && t.verificationStatus === "VERIFIED"));
    if (method === "GET" && path === "/therapists/admin") return json(route, world.therapists);
    if (method === "GET" && path === "/therapists/admin/performance") return json(route, performance(world));
    if (path === "/therapists/me/profile") {
      if (method === "GET") return json(route, therapistForCaller ?? world.therapists[0]);
      const target = therapistForCaller ?? world.therapists[0];
      target.pendingProfileChanges = { ...body };
      target.pendingProfileSubmittedAt = new Date().toISOString();
      return json(route, target);
    }
    if (method === "POST" && path === "/therapists") {
      // A new account starts blank; the practitioner fills in the profile.
      const localPart = String(body.email ?? "new.practitioner").split("@")[0];
      const created = {
        ...world.therapists[0],
        id: nextId("7d3c1d0e"),
        accountId: "therapist-user-new",
        name: localPart
          .split(/[._-]/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        email: body.email,
        title: "Counsellor",
        areasOfPractice: [],
        languages: [],
        experience: 0,
        price: 0,
        couplePrice: null,
        qualifications: null,
        specialization: null,
        bio: null,
        image: null,
        nextAvailableSlot: null,
        verificationStatus: "UNVERIFIED",
        isActive: false,
        pendingProfileChanges: null,
        credentialsQueued: true,
        createdAt: new Date().toISOString(),
      };
      world.therapists.push(created);
      return json(route, created, 201);
    }
    if (segments[0] === "therapists" && segments.length === 2) {
      const target = world.therapists.find((t) => t.id === segments[1]);
      if (method === "GET") return target ? json(route, target) : json(route, { message: "Not found" }, 404);
      if (method === "PATCH" && target) {
        Object.assign(target, body);
        return json(route, target);
      }
    }

    // ---- Availability ----------------------------------------------------
    if (path === "/availability/me") {
      const mine = () =>
        world.slots
          .filter((s) => s.therapistId === (therapistForCaller ?? world.therapists[0]).id)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
      if (method === "GET") return json(route, mine());
      if (method === "POST") {
        const created = {
          id: nextId("5a1b2c3d"),
          therapistId: (therapistForCaller ?? world.therapists[0]).id,
          startTime: new Date(body.startTime).toISOString(),
          endTime: new Date(body.endTime).toISOString(),
          status: "AVAILABLE",
          createdAt: new Date().toISOString(),
        };
        world.slots.push(created);
        return json(route, created, 201);
      }
    }
    if (segments[0] === "availability" && segments.length === 2) {
      const slotIndex = world.slots.findIndex((s) => s.id === segments[1]);
      if (method === "DELETE" && slotIndex >= 0) {
        const [removed] = world.slots.splice(slotIndex, 1);
        return json(route, removed);
      }
      if (method === "PATCH" && slotIndex >= 0) {
        Object.assign(world.slots[slotIndex], body);
        return json(route, world.slots[slotIndex]);
      }
      if (method === "GET")
        return json(
          route,
          world.slots.filter((s) => s.therapistId === segments[1] && s.status === "AVAILABLE"),
        );
    }

    // ---- Appointments ----------------------------------------------------
    if (method === "POST" && path === "/appointments") {
      const chosen = world.slots.find((s) => s.id === body.slotId) ?? world.slots[0];
      const therapist = world.therapists.find((t) => t.id === chosen.therapistId) ?? world.therapists[0];
      const patient = world.patients[0];
      state.bookedAppointment = {
        id: "b6f1a2c3-0000-4000-8000-00000000a001",
        patient: { id: patient.id, email: patient.email, fullName: patient.fullName, phone: patient.phone },
        therapist: { id: therapist.id, name: therapist.name },
        slot: { id: chosen.id, startTime: chosen.startTime, endTime: chosen.endTime },
        status: "PENDING",
        service: body.service ?? "Individual Therapy",
        mode: body.mode ?? "Video",
        sessionCount: 1,
        packageName: "Single session",
        packageOriginalAmount: therapist.price,
        packageOfferAmount: therapist.price,
        packageDiscountPercent: 0,
        meetingLink: null,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        createdAt: new Date().toISOString(),
      };
      return json(route, state.bookedAppointment, 201);
    }
    if (method === "GET" && path === "/appointments/me") {
      if (state.bookedAppointment) return json(route, state.paid ? [state.bookedAppointment] : []);
      return json(
        route,
        world.appointments.filter((a) => a.patient.id === (caller?.userId ?? "patient-sample-1")),
      );
    }
    if (method === "GET" && path === "/appointments") {
      if (role === "THERAPIST")
        return json(
          route,
          world.appointments.filter((a) => a.therapist.id === (therapistForCaller ?? world.therapists[0]).id),
        );
      return json(route, world.appointments);
    }
    if (segments[0] === "appointments" && segments.length === 3 && method === "PATCH") {
      const target = world.appointments.find((a) => a.id === segments[1]);
      if (!target) return json(route, { message: "Not found" }, 404);
      const now = new Date().toISOString();
      if (segments[2] === "status") target.status = body.status;
      if (segments[2] === "operations") {
        if (body.meetingLink !== undefined && body.meetingLink !== target.meetingLink) {
          target.meetingLink = body.meetingLink;
          target.meetingLinkAddedAt = now;
          target.meetingLinkSentAt = null;
        }
        if (body.markBookingConfirmationSent) target.bookingConfirmationSentAt = now;
        if (body.markMeetingLinkSent) target.meetingLinkSentAt = now;
        if (body.markReminderSent) target.reminderSentAt = now;
        if (body.staffNotes !== undefined) target.staffNotes = body.staffNotes;
      }
      return json(route, target);
    }

    // ---- Payments --------------------------------------------------------
    if (method === "POST" && path === "/payments/razorpay/order") {
      const amount = state.bookedAppointment?.packageOfferAmount ?? 1200;
      return json(route, {
        keyId: "rzp_test_walkthrough",
        orderId: "order_walkthrough_001",
        amount,
        currency: "INR",
        sessionCount: 1,
        packageName: "Single session",
        originalAmount: amount,
        discountPercent: 0,
      });
    }
    if (method === "GET" && path.startsWith("/payments/razorpay/order/"))
      return json(route, {
        orderId: "order_walkthrough_001",
        status: state.paid ? "PAID" : "PENDING",
        updatedAt: new Date().toISOString(),
      });
    if (method === "POST" && path === "/payments/razorpay/verify") {
      state.paid = true;
      state.bookedPayment = {
        id: "c7a2b3d4-0000-4000-8000-00000000p001",
        appointment: state.bookedAppointment,
        patient: { id: world.patients[0].id, email: world.patients[0].email, fullName: world.patients[0].fullName },
        amount: state.bookedAppointment?.packageOfferAmount ?? 1200,
        refundedAmount: 0,
        status: "PAID",
        provider: "razorpay",
        reference: "pay_walkthrough_001",
        providerOrderId: "order_walkthrough_001",
        providerPaymentId: "pay_walkthrough_001",
        notes: null,
        refundHistory: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return json(route, state.bookedPayment);
    }
    if (method === "GET" && path === "/payments/me") {
      if (state.bookedAppointment) return json(route, state.bookedPayment ? [state.bookedPayment] : []);
      return json(
        route,
        world.payments.filter((p) => p.patient.id === (caller?.userId ?? "patient-sample-1")),
      );
    }
    if (method === "GET" && path === "/payments") return json(route, world.payments);
    if (segments[0] === "payments" && segments[2] === "refund" && method === "PATCH") {
      const target = world.payments.find((p) => p.id === segments[1]);
      if (!target) return json(route, { message: "Not found" }, 404);
      const amount = Number(body.amount ?? target.amount);
      target.refundedAmount = (target.refundedAmount ?? 0) + amount;
      target.status = target.refundedAmount >= target.amount ? "REFUNDED" : target.status;
      target.refundHistory = [
        ...(target.refundHistory ?? []),
        { amount, reason: body.reason ?? null, status: "PROCESSED", createdAt: new Date().toISOString() },
      ];
      target.updatedAt = new Date().toISOString();
      return json(route, target);
    }
    if (method === "GET" && path === "/payments/admin/refunds") return json(route, []);

    // ---- Case sheets, tickets, enquiries ----------------------------------
    if (path === "/case-sheets") {
      if (method === "GET") return json(route, world.caseSheets);
      if (method === "POST" || method === "PATCH") {
        const apt = world.appointments.find((a) => a.id === body.appointmentId);
        const existing = world.caseSheets.find((c) => c.appointment?.id === body.appointmentId);
        const record = {
          id: existing?.id ?? nextId("f1d2e3c4"),
          appointment: apt ?? null,
          patient: apt ? { id: apt.patient.id, email: apt.patient.email, fullName: apt.patient.fullName } : null,
          therapist: apt ? { id: apt.therapist.id, name: apt.therapist.name } : null,
          presentingConcern: body.presentingConcern ?? null,
          clinicalNotes: body.clinicalNotes ?? null,
          interventionPlan: body.interventionPlan ?? null,
          followUpPlan: body.followUpPlan ?? null,
          createdAt: existing?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (existing) Object.assign(existing, record);
        else world.caseSheets.push(record);
        return json(route, record, existing ? 200 : 201);
      }
    }
    if (path === "/tickets") {
      if (method === "GET")
        return json(
          route,
          role === "ADMIN"
            ? world.tickets
            : world.tickets.filter((t) => t.createdBy?.id === (caller?.userId ?? "patient-sample-1")),
        );
      if (method === "POST") {
        const patient = world.patients.find((p) => p.id === caller?.userId) ?? world.patients[0];
        const created = {
          id: nextId("d8b3c4e5"),
          createdBy: { id: patient.id, email: patient.email, fullName: patient.fullName },
          subject: body.subject,
          message: body.message,
          category: body.category ?? "General",
          status: "OPEN",
          adminNote: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        world.tickets.unshift(created);
        return json(route, created, 201);
      }
    }
    if (segments[0] === "tickets" && segments.length === 2 && method === "PATCH") {
      const target = world.tickets.find((t) => t.id === segments[1]);
      if (target) Object.assign(target, body, { updatedAt: new Date().toISOString() });
      return json(route, target ?? {});
    }
    if (path === "/enquiries" && method === "GET") return json(route, world.enquiries);
    if (segments[0] === "enquiries" && segments.length === 2 && method === "PATCH") {
      const target = world.enquiries.find((e) => e.id === segments[1]);
      if (target) Object.assign(target, body, { updatedAt: new Date().toISOString() });
      return json(route, target ?? {});
    }

    // ---- Admin -------------------------------------------------------------
    if (method === "GET" && path === "/admin/summary") return json(route, summary(world));

    // Everything else (notifications, audit, reliability, privacy) is empty.
    return json(route, method === "GET" ? [] : {});
  });

  return state;
}

/** Signs a role in before any page loads. */
export async function signIn(context, token) {
  await context.addInitScript((value) => {
    try {
      window.localStorage.setItem("oruma_access_token", value);
    } catch {
      // Storage is always available on the walkthrough origin.
    }
  }, token);
}

/**
 * A stand-in for the Razorpay checkout window, so the video never touches a
 * real payment gateway. It is labelled as a demonstration.
 */
export async function installDemoCheckout(context) {
  await context.route("https://checkout.razorpay.com/v1/checkout.js", (route) =>
    route.fulfill({ contentType: "application/javascript", body: demoCheckoutScript }),
  );
}

const demoCheckoutScript = `
window.Razorpay = function (options) {
  this.options = options;
  this.handlers = {};
};
window.Razorpay.prototype.on = function (event, handler) {
  this.handlers[event] = handler;
};
window.Razorpay.prototype.open = function () {
  var options = this.options;
  var amount = (options.amount / 100).toLocaleString("en-IN");
  var overlay = document.createElement("div");
  overlay.id = "demo-checkout";
  overlay.style.cssText = "position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,sans-serif";
  overlay.innerHTML =
    '<div style="width:380px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,.35)">' +
      '<div style="background:#064F4B;color:#fff;padding:20px 24px">' +
        '<div style="font-size:13px;opacity:.75">Secure payment · demonstration</div>' +
        '<div style="font-size:20px;font-weight:800;margin-top:4px">' + options.name + '</div>' +
        '<div style="font-size:28px;font-weight:800;margin-top:8px">₹' + amount + '</div>' +
      '</div>' +
      '<div style="padding:20px 24px">' +
        '<div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Pay using</div>' +
        ['UPI · scan QR or pay by app', 'Cards', 'Netbanking', 'Wallets'].map(function (label, index) {
          return '<div style="margin-top:10px;padding:14px;border:' + (index === 0 ? '2px solid #0A7F7A' : '1px solid #e2e8f0') + ';border-radius:12px;font-weight:700;color:#0f172a">' + label + '</div>';
        }).join('') +
        '<button id="demo-pay" style="margin-top:18px;width:100%;padding:14px;border:0;border-radius:12px;background:#0A7F7A;color:#fff;font-size:16px;font-weight:800;cursor:pointer">Pay ₹' + amount + '</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);
  document.getElementById("demo-pay").addEventListener("click", function () {
    this.textContent = "Processing payment…";
    setTimeout(function () {
      overlay.remove();
      options.handler({
        razorpay_order_id: options.order_id,
        razorpay_payment_id: "pay_walkthrough_001",
        razorpay_signature: "walkthrough",
      });
    }, 1500);
  });
};
`;
