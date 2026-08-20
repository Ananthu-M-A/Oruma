import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { applyDocumentSeo, trackPageView } from "./lib/seo";

const Index = lazy(() => import("../routes/index"));
const About = lazy(() => import("../routes/about"));
const Articles = lazy(() => import("../routes/articles"));
const Careers = lazy(() => import("../routes/careers"));
const Concerns = lazy(() => import("../routes/concerns"));
const AllConcerns = lazy(() => import("../routes/concerns/all-concerns"));
const Consultation = lazy(() => import("../routes/consultation"));
const Contact = lazy(() => import("../routes/contact"));
const Login = lazy(() => import("../routes/login"));
const OnlineCounselling = lazy(() => import("../routes/online-counselling"));
const PrivacyPolicy = lazy(() => import("../routes/privacy-policy"));
const RefundPolicy = lazy(() => import("../routes/refund-policy"));
const CancellationPolicy = lazy(() => import("../routes/cancellation-policy"));
const ServiceDeliveryPolicy = lazy(
  () => import("../routes/service-delivery-policy"),
);
const Register = lazy(() => import("../routes/register"));
const Services = lazy(() => import("../routes/services"));
const CoupleTherapy = lazy(() => import("../routes/services/couple-therapy"));
const FollowUp = lazy(() => import("../routes/services/follow-up"));
const IndividualTherapy = lazy(
  () => import("../routes/services/individual-therapy"),
);
const SexualWellness = lazy(() => import("../routes/services/sexual-wellness"));
const TherapistDetail = lazy(() => import("../routes/therapist-detail"));
const Therapists = lazy(() => import("../routes/therapists"));
const Terms = lazy(() => import("../routes/terms"));
const PatientProfile = lazy(() => import("../routes/profile-patient"));
const TherapistProfile = lazy(() => import("../routes/profile-therapist"));
const AdminProfile = lazy(() => import("../routes/profile-admin"));
const AdminTherapists = lazy(() => import("../routes/admin-therapists"));

function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const seo = applyDocumentSeo(pathname);
    trackPageView(pathname, seo);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteEffects />
      <Suspense
        fallback={
          <div
            className="min-h-screen bg-[#F5F8F7]"
            aria-label="Loading page"
          />
        }
      >
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
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/service-delivery-policy"
            element={<ServiceDeliveryPolicy />}
          />
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
          <Route path="/services" element={<Services />} />
          <Route path="/services/couple-therapy" element={<CoupleTherapy />} />
          <Route path="/services/follow-up" element={<FollowUp />} />
          <Route
            path="/services/individual-therapy"
            element={<IndividualTherapy />}
          />
          <Route
            path="/services/sexual-wellness"
            element={<SexualWellness />}
          />
          <Route path="/therapists" element={<Therapists />} />
          <Route path="/therapists/:id" element={<TherapistDetail />} />
          <Route path="/team" element={<Navigate to="/therapists" replace />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/terms-and-conditions" element={<Terms />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
