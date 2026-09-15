import {
  ArrowRight,
  CircleCheckBig,
  BrainCircuit,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";

import "./CompareCTA.css";

export default function CTA() {
  return (
    <section className="compareCta">
      <div className="compareCtaContainer">
        <div className="compareCtaContent">
          <span className="compareCtaBadge">
            Get Started Today
          </span>

          <h2 className="compareCtaTitle">
            Ready to Transform
            <span>Your Hiring Process?</span>
          </h2>

          <p className="compareCtaDescription">
            Experience AI-powered recruitment with intelligent interviews,
            resume screening, TalentCast, analytics and collaborative hiring —
            all from one unified platform.
          </p>

          <div className="compareCtaFeatures">
            <div className="compareCtaFeature">
              <CircleCheckBig size={17} />
              <span>AI Interviews</span>
            </div>

            <div className="compareCtaFeature">
              <BrainCircuit size={17} />
              <span>Resume Intelligence</span>
            </div>

            <div className="compareCtaFeature">
              <Sparkles size={17} />
              <span>TalentCast</span>
            </div>

            <div className="compareCtaFeature">
              <LayoutDashboard size={17} />
              <span>Recruiter Dashboard</span>
            </div>
          </div>

          <div className="compareCtaActions">
            <a
              href="https://app.hireko.ai"
              className="compareCtaPrimary"
              style={{ color: "#ffffff" }}
            >
              <span style={{ color: "#ffffff" }}>Start Free</span>
              <ArrowRight size={18} style={{ color: "#ffffff" }} />
            </a>

            <a
              href="https://hireko.ai"
              className="compareCtaSecondary"
              style={{ color: "#13264b" }}
            >
              <span style={{ color: "#13264b" }}>Book a Demo</span>
            </a>
          </div>

          <div className="compareCtaTrust">
            <div className="compareCtaStars" aria-label="5 star rating">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>

            <p>Trusted by Modern Recruiting Teams</p>
          </div>
        </div>
      </div>
    </section>
  );
}