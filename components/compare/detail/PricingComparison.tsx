import { BadgeCheck, CircleDollarSign, Info } from "lucide-react";
import "./PricingComparison.css";

interface PricingItem {
  label: string;
  hireko: string;
  competitor: string;
}

interface PricingComparisonProps {
  competitorName: string;
  pricing: PricingItem[];
}

export default function PricingComparison({
  competitorName,
  pricing,
}: PricingComparisonProps) {
  return (
    <section
      className="pricingComparison"
      id="pricing-comparison"
      aria-labelledby="pricing-comparison-title"
    >
      <div className="pricingComparisonContainer">
        {/* HEADER */}
        <div className="pricingComparisonHeader">
          <span className="pricingComparisonEyebrow">
            <CircleDollarSign size={17} />
            Pricing Comparison
          </span>

          <h2 id="pricing-comparison-title">
            Hireko vs {competitorName} pricing
          </h2>

          <p>
            Compare pricing models, starting costs, trial availability, and
            overall pricing structure.
          </p>
        </div>

        {/* TABLE */}
        <div className="pricingComparisonCard">
          <div className="pricingComparisonTableHeader">
            <div>Pricing Factor</div>

            <div className="pricingHirekoHeader">
              <span>Hireko</span>
              <small>AI Hiring Platform</small>
            </div>

            <div>
              <span>{competitorName}</span>
              <small>Competitor</small>
            </div>
          </div>

          <div className="pricingComparisonRows">
            {pricing.map((item, index) => (
              <div
                className="pricingComparisonRow"
                key={`${item.label}-${index}`}
              >
                <div className="pricingLabel">
                  {item.label}
                </div>

                <div className="pricingValue pricingHirekoValue">
                  <BadgeCheck size={18} />
                  <span>{item.hireko}</span>
                </div>

                <div className="pricingValue">
                  <span>{item.competitor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DISCLAIMER */}
        <div className="pricingComparisonDisclaimer">
          <Info size={17} />

          <p>
            Pricing information may include publicly available vendor data and
            third-party reported estimates. Actual pricing can vary based on
            company size, hiring volume, selected modules, integrations, and
            contract terms. Verify current pricing directly with each vendor.
          </p>
        </div>
      </div>
    </section>
  );
}