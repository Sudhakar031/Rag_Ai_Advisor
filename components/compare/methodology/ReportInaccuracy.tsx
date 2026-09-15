import "./ReportInaccuracy.css";

import {
  Flag,
  ArrowRight,
} from "lucide-react";

export default function ReportInaccuracy() {
  return (
    <section className="report-section">
      <div className="container">

        <div className="report-card">

          <div className="report-left">

            <div className="report-title">

              <Flag size={30} />

              <h2>Report an Inaccuracy</h2>

            </div>

            <p>
              We continuously review our comparison pages. If you discover
              outdated pricing, missing features or incorrect information,
              please let our editorial team know.
            </p>

          </div>

          <div className="report-right">

            <button className="report-btn" style={{ color: "#ffffff" }}>
              <span style={{ color: "#ffffff" }}>Report an Issue</span>
              <ArrowRight size={18} style={{ color: "#ffffff" }} />
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}