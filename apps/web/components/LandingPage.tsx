"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import TrimFeatureSection from "./ProblemSolution";
import InteractiveMockup from "./InteractiveMockup";
import AIReelsSection from "./landing/AIReelsSection";
import BentoGrid from "./BentoGrid";
import HowItWorks from "./HowItWorks";
import Pricing from "./landing/Pricing";
import Footer from "./Footer";
import SignInModal from "./SignInModal";

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSignIn={() => setModalOpen(true)} />
      <HeroSection />
      <TrimFeatureSection />
      <InteractiveMockup />
      <AIReelsSection />
      <BentoGrid />
      <HowItWorks />
      <Pricing onSignIn={() => setModalOpen(true)} />
      <Footer />
      <SignInModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
