import "./PricingMethodology.css";
import {
  BadgeDollarSign,
  CircleCheckBig,
} from "lucide-react";

const pricing = [
  "Official pricing pages verified",
  "Enterprise plans reviewed where available",
  "Free plans & free trials identified",
  "Monthly vs annual billing compared",
  "Implementation & setup costs included",
  "Pricing reviewed regularly",
];

export default function PricingMethodology() {
  return (
    <section className="pricing-section">
      <div className="container">

        <div className="pricing-header">

          <div className="pricing-title">
            <BadgeDollarSign size={32} />
            <h2>Pricing Comparison Methodology</h2>
          </div>

          <p>
            Pricing comparisons are based on publicly available subscription
            plans, enterprise pricing, implementation costs and billing
            transparency. Every pricing table is reviewed regularly to ensure
            accuracy.
          </p>

        </div>

        <div className="pricing-wrapper">

          <div className="pricing-content">

            <span className="pricing-badge">
              How we compare pricing
            </span>

            <h3>
              Transparent pricing comparisons built for recruiters.
            </h3>

            <p>
              Rather than comparing only headline prices, Hireko evaluates
              implementation costs, enterprise licensing, contract flexibility,
              included features and long-term business value.
            </p>

          </div>

          <div className="pricing-card">

            {pricing.map((item, index) => (
              <div className="pricing-row" key={index}>

                <CircleCheckBig
                  size={18}
                  className="pricing-icon"
                />

                <span>{item}</span>

              </div>
            ))}

          </div>

        </div>

      </div>
    </section>
  );
}