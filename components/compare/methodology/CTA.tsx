import "./CTA.css";

import {
  ArrowRight,
  CircleCheckBig,
  BrainCircuit,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";

export default function CTA() {
  return (
    <section className="methodology-cta">
      <div className="container">

        <div className="cta-card">

          <span className="cta-badge">
            GET STARTED TODAY
          </span>

          <h2 className="cta-title">
            Ready to Transform{" "}
            <span>Your Hiring Process?</span>
          </h2>

          <p className="cta-description">
            Experience AI-powered recruitment with intelligent interviews,
            resume screening, TalentCast, analytics and collaborative hiring —
            all from one unified platform.
          </p>

          <div className="cta-features">

            <div className="feature-pill">
              <CircleCheckBig size={18} />
              AI Interviews
            </div>

            <div className="feature-pill">
              <BrainCircuit size={18} />
              Resume Intelligence
            </div>

            <div className="feature-pill">
              <Sparkles size={18} />
              TalentCast
            </div>

            <div className="feature-pill">
              <LayoutDashboard size={18} />
              Recruiter Dashboard
            </div>

          </div>

          <div className="cta-buttons">
            <button className="primary-btn" style={{ color: "#ffffff" }}>
              <span style={{ color: "#ffffff" }}>Start Free</span>
            </button>

            <button className="secondary-btn" style={{ color: "#13264B" }}>
              <span style={{ color: "#13264B" }}>Book a Demo</span>
            </button>
          </div>

          <div className="cta-trust">
            ⭐⭐⭐⭐⭐
            <span>Trusted by Modern Recruiting Teams</span>
          </div>

        </div>

      </div>
    </section>
  );
}