import Navbar from "../../components/Navbar";
import IntimacyHero from "../../components/IntimacyHero";
import AssessmentBanner from "../../components/AssessmentBanner";
import ConcernsGrid from "../../components/ConcernsGrid";
import EducationalCards from "../../components/EducationalCards";
import FAQSection from "../../components/FAQSection";
import Footer from "../../components/Footer";
import FloatingActions from "../../components/FloatingActions";
import CoupleTherapyVideo from "../../components/CoupleTherapyVideo";
import ServiceScopeNotice from "../../components/ServiceScopeNotice";

export default function SexualWellnessPage() {
  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <FloatingActions />
      <ServiceScopeNotice />

      <IntimacyHero />

      {/* Added Ivade Section */}
      <CoupleTherapyVideo />

      <AssessmentBanner />

      <ConcernsGrid />

      <EducationalCards />

      <FAQSection />

      <Footer />
    </main>
  );
}
