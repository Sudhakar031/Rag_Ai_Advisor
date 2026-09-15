import "./page.css";

import Hero from "@/components/compare/methodology/Hero";
import ResearchProcess from "@/components/compare/methodology/ResearchProcess";
import EvaluationFramework from "@/components/compare/methodology/EvaluationFramework";
import FeatureCriteria from "@/components/compare/methodology/FeatureCriteria";
import PricingMethodology from "@/components/compare/methodology/PricingMethodology";
import FairnessDisclaimer from "@/components/compare/methodology/FairnessDisclaimer";
import ReportInaccuracy from "@/components/compare/methodology/ReportInaccuracy";
import CTA from "@/components/compare/methodology/CTA";

export default function MethodologyPage() {
  return (
    <>
      <Hero />

     
      <ResearchProcess />

      
      <EvaluationFramework />

     
      <FeatureCriteria />

     
      <PricingMethodology />

     
      <FairnessDisclaimer />

    
      <ReportInaccuracy />

      
      <CTA />
    </>
  );
}