import { CheckCircle2, AlertCircle } from "lucide-react";
import "./StrengthsTradeoffs.css";

interface StrengthsTradeoffsProps {
  competitorName: string;
  strengths: string[];
  weaknesses: string[];
}

export default function StrengthsTradeoffs({
  competitorName,
  strengths,
  weaknesses,
}: StrengthsTradeoffsProps) {
  return (
    <section className="strengthsTradeoffs">
      <div className="strengthsTradeoffsContainer">
        <div className="strengthsTradeoffsHeader">
          <span className="strengthsTradeoffsEyebrow">
            Strengths & Trade-offs
          </span>

          <h2>
            Where Hireko stands out
          </h2>

          <p>
            A practical look at Hireko&apos;s strengths and the areas where{" "}
            {competitorName} may have an advantage.
          </p>
        </div>

        <div className="strengthsTradeoffsGrid">
          <div className="strengthsCard">
            <div className="strengthsCardHeader">
              <CheckCircle2 size={24} />
              <h3>Hireko Strengths</h3>
            </div>

            <ul>
              {strengths.map((strength, index) => (
                <li key={index}>
                  <CheckCircle2 size={18} />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="tradeoffsCard">
            <div className="tradeoffsCardHeader">
              <AlertCircle size={24} />
              <h3>Considerations</h3>
            </div>

            <ul>
              {weaknesses.map((weakness, index) => (
                <li key={index}>
                  <AlertCircle size={18} />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}