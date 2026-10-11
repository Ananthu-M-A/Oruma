import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CommonConcerns } from "../components/HomeSections";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";
import ServiceScopeNotice from "../components/ServiceScopeNotice";
import TherapyIntro from "../components/TherapyIntro";
import { legacyConcernHashPaths } from "../src/lib/concerns";

export default function ConcernsPage() {
  const { hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = legacyConcernHashPaths[hash.replace(/^#/, "")];
    if (path) navigate(path, { replace: true });
  }, [hash, navigate]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white font-body text-[#2E3E3C]">
      <Navbar />
      <FloatingActions />
      <ServiceScopeNotice />
      <TherapyIntro />
      <CommonConcerns />
      <Footer />
    </main>
  );
}
