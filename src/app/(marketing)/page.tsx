import { HeroSection } from "@/components/landing/hero-section";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WhyPliex } from "@/components/landing/why-pliex";
import { CtaSection } from "@/components/landing/cta-section";

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <FeatureGrid />
      <HowItWorks />
      <WhyPliex />
      <CtaSection />
    </main>
  );
}
