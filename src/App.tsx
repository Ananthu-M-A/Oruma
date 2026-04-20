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
import OnlineCounselling from "../routes/online-counselling";
import Services from "../routes/services";
import CoupleTherapy from "../routes/services/couple-therapy";
import FollowUp from "../routes/services/follow-up";
import IndividualTherapy from "../routes/services/individual-therapy";
import SexualWellness from "../routes/services/sexual-wellness";
import Team from "../routes/team";
import Therapists from "../routes/therapists";

// Route meta for document title
import { meta as indexMeta } from "../routes/index";
import { meta as aboutMeta } from "../routes/about";
import { meta as articlesMeta } from "../routes/articles";
import { meta as careersMeta } from "../routes/careers";
import { meta as concernsMeta } from "../routes/concerns";
import { meta as allConcernsMeta } from "../routes/concerns/all-concerns";
import { meta as consultationMeta } from "../routes/consultation";
import { meta as contactMeta } from "../routes/contact";
import { meta as onlineCounsellingMeta } from "../routes/online-counselling";
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
  "/online-counselling": onlineCounsellingMeta,
  "/services": servicesMeta,
  "/services/couple-therapy": coupleTherapyMeta,
  "/services/follow-up": followUpMeta,
  "/services/individual-therapy": individualTherapyMeta,
  "/services/sexual-wellness": sexualWellnessMeta,
  "/team": teamMeta,
  "/therapists": therapistsMeta,
};

function MetaUpdater() {
  const location = useLocation();

  useEffect(() => {
    const meta = routeMeta[location.pathname];
    if (meta?.title) document.title = meta.title;

    const descTag = document.querySelector('meta[name="description"]');
    if (descTag && meta?.description) {
      descTag.setAttribute("content", meta.description);
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
        <Route path="/online-counselling" element={<OnlineCounselling />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/couple-therapy" element={<CoupleTherapy />} />
        <Route path="/services/follow-up" element={<FollowUp />} />
        <Route path="/services/individual-therapy" element={<IndividualTherapy />} />
        <Route path="/services/sexual-wellness" element={<SexualWellness />} />
        <Route path="/team" element={<Team />} />
        <Route path="/therapists" element={<Therapists />} />
      </Routes>
    </BrowserRouter>
  );
}
