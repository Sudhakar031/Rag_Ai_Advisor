import { CheckCircle2 } from "lucide-react";
import "./ComparisonOverview.css";

interface ComparisonOverviewProps {
  competitorName: string;
  overview: string;
}

export default function ComparisonOverview({
  competitorName,
  overview,
}: ComparisonOverviewProps) {
  return (
    <section className="comparisonOverview" id="quick-summary">
      <div className="comparisonOverviewContainer">
        <div className="comparisonOverviewCard">
          <span className="comparisonOverviewEyebrow">
            <CheckCircle2 size={16} />
            Comparison Overview
          </span>

          <h2>
            Hireko vs {competitorName}:{" "}
            <span>Which is Better for Hiring?</span>
          </h2>

          <p>{overview}</p>
        </div>
      </div>
    </section>
  );
}