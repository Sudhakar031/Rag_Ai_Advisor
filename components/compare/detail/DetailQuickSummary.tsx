import { Check } from "lucide-react";
import "./DetailQuickSummary.css";

interface DetailQuickSummaryProps {
  highlights: string[];
}

export default function DetailQuickSummary({
  highlights,
}: DetailQuickSummaryProps) {
  return (
    <section className="detailSummary">
      <div className="detailSummaryContainer">
        <div className="detailSummaryCard">
          <h2>Quick Summary</h2>

          <div className="detailSummaryList">
            {highlights.map((highlight) => (
              <div
                className="detailSummaryItem"
                key={highlight}
              >
                <span className="detailSummaryCheck">
                  <Check size={18} strokeWidth={3} />
                </span>

                <p>{highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}