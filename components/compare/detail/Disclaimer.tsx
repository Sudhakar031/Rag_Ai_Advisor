import { Info } from "lucide-react";
import "./Disclaimer.css";

interface DisclaimerProps {
  disclaimer: string;
}

export default function Disclaimer({
  disclaimer,
}: DisclaimerProps) {
  return (
    <section className="disclaimerSection">
      <div className="disclaimerContainer">
        <div className="disclaimerCard">
          <div className="disclaimerIcon">
            <Info size={22} strokeWidth={2} />
          </div>

          <div className="disclaimerContent">
            <span>Comparison Disclaimer</span>
            <p>{disclaimer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}