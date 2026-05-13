import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Routes
import Index from "../routes/index";
import About from "../routes/about";
import Articles from "../routes/articles";
import Careers from "../routes/careers";
import Concerns from "../routes/concerns";
import AllConcerns from "../routes/concerns/all-concerns";
import Consultation from "../routes/consultation";
import Contact from "../routes/contact";
import Login from "../routes/login";
import OnlineCounselling from "../routes/online-counselling";
import Register from "../routes/register";
import Services from "../routes/services";
import CoupleTherapy from "../routes/services/couple-therapy";
import FollowUp from "../routes/services/follow-up";
import IndividualTherapy from "../routes/services/individual-therapy";
import SexualWellness from "../routes/services/sexual-wellness";
import Team from "../routes/team";
import TherapistDetail, { meta as therapistDetailMeta } from "../routes/therapist-detail";
import Therapists from "../routes/therapists";
import PatientProfile, { meta as patientProfileMeta } from "../routes/profile-patient";
import TherapistProfile, { meta as therapistProfileMeta } from "../routes/profile-therapist";
import AdminProfile, { meta as adminProfileMeta } from "../routes/profile-admin";
import AdminTherapists, { meta as adminTherapistsMeta } from "../routes/admin-therapists";
import ProtectedRoute from "./components/ProtectedRoute";

// Route meta for document title
import { meta as indexMeta } from "../routes/index";
import { meta as aboutMeta } from "../routes/about";
import { meta as articlesMeta } from "../routes/articles";
import { meta as careersMeta } from "../routes/careers";
import { meta as concernsMeta } from "../routes/concerns";
import { meta as allConcernsMeta } from "../routes/concerns/all-concerns";
import { meta as consultationMeta } from "../routes/consultation";
import { meta as contactMeta } from "../routes/contact";
import { meta as loginMeta } from "../routes/login";
import { meta as onlineCounsellingMeta } from "../routes/online-counselling";
import { meta as registerMeta } from "../routes/register";
import { meta as servicesMeta } from "../routes/services";
import { meta as coupleTherapyMeta } from "../routes/services/couple-therapy";
import { meta as followUpMeta } from "../routes/services/follow-up";
import { meta as individualTherapyMeta } from "../routes/services/individual-therapy";
import { meta as sexualWellnessMeta } from "../routes/services/sexual-wellness";
import { meta as teamMeta } from "../routes/team";
import { meta as therapistsMeta } from "../routes/therapists";

declare const lucide: { createIcons: () => void } | undefined;

const routeMeta: Record<string, { title?: string; description?: string }> = {
  "/": indexMeta,
  "/about": aboutMeta,
  "/articles": articlesMeta,
  "/careers": careersMeta,
  "/concerns": concernsMeta,
  "/concerns/all-concerns": allConcernsMeta,
  "/consultation": consultationMeta,
  "/contact": contactMeta,
  "/login": loginMeta,
  "/online-counselling": onlineCounsellingMeta,
  "/register": registerMeta,
  "/profile/patient": patientProfileMeta,
  "/profile/therapist": therapistProfileMeta,
  "/profile/admin": adminProfileMeta,
  "/profile/admin/therapists": adminTherapistsMeta,
  "/services": servicesMeta,
  "/services/couple-therapy": coupleTherapyMeta,
  "/services/follow-up": followUpMeta,
  "/services/individual-therapy": individualTherapyMeta,
  "/services/sexual-wellness": sexualWellnessMeta,
  "/team": teamMeta,
  "/therapists/:id": therapistDetailMeta,
  "/therapists": therapistsMeta,
};

function MetaUpdater() {
  const location = useLocation();

  useEffect(() => {
    const meta = routeMeta[location.pathname];
    const dynamicMeta = location.pathname.startsWith("/therapists/") ? routeMeta["/therapists/:id"] : undefined;
    const activeMeta = meta ?? dynamicMeta;
    if (activeMeta?.title) document.title = activeMeta.title;

    const descTag = document.querySelector('meta[name="description"]');
    if (descTag && activeMeta?.description) {
      descTag.setAttribute("content", activeMeta.description);
    }

    // Re-init lucide icons after route change
    setTimeout(() => {
      if (typeof lucide !== "undefined") lucide.createIcons();
    }, 50);
  }, [location.pathname]);

  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <MetaUpdater />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/concerns" element={<Concerns />} />
        <Route path="/concerns/all-concerns" element={<AllConcerns />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/online-counselling" element={<OnlineCounselling />} />
        <Route
          path="/profile/patient"
          element={
            <ProtectedRoute allowedRoles={["PATIENT"]}>
              <PatientProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/therapist"
          element={
            <ProtectedRoute allowedRoles={["THERAPIST"]}>
              <TherapistProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/admin/therapists"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminTherapists />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/couple-therapy" element={<CoupleTherapy />} />
        <Route path="/services/follow-up" element={<FollowUp />} />
        <Route path="/services/individual-therapy" element={<IndividualTherapy />} />
        <Route path="/services/sexual-wellness" element={<SexualWellness />} />
        <Route path="/team" element={<Team />} />
        <Route path="/therapists" element={<Therapists />} />
        <Route path="/therapists/:id" element={<TherapistDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
