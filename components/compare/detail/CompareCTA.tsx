import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import "./CompareCTA.css";

export default function CompareCTA() {
  return (
    <section className="compareCTA">
      <div className="compareCTAContainer">
        <div className="compareCTACard">
          <div className="compareCTAIcon">
            <Sparkles size={24} strokeWidth={2} />
          </div>

          <span className="compareCTAEyebrow">
            AI-Powered Hiring
          </span>

          <h2>Ready to experience smarter hiring?</h2>

          <p>
            Discover how Hireko helps teams interview, evaluate, and understand
            candidates with AI-powered hiring intelligence.
          </p>

          <div className="compareCTAActions">
            <Link
              href="https://hireko.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="compareCTAPrimary"
              style={{ color: "#ffffff" }}
            >
              <span style={{ color: "#ffffff" }}>Explore Hireko</span>
              <ArrowRight size={18} style={{ color: "#ffffff" }} />
            </Link>

            <Link
              href="/compare"
              className="compareCTASecondary"
              style={{ color: "#13264b" }}
            >
              <span style={{ color: "#13264b" }}>Explore comparisons</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}