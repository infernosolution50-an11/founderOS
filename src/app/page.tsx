import { CtaSection } from "@/components/landing/CtaSection";
import { EmberSection } from "@/components/landing/EmberSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { ScoreCallout } from "@/components/landing/ScoreCallout";
import { WorkflowSteps } from "@/components/landing/WorkflowSteps";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-os-bg text-os-text">
      <LandingNav />
      <HeroSection />
      <ProductPreview />
      <FeatureGrid />
      <EmberSection />
      <WorkflowSteps />
      <ScoreCallout />
      <CtaSection />
      <LandingFooter />
    </main>
  );
}
