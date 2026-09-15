import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import "./FinalVerdict.css";

interface FinalVerdictProps {
  competitorName: string;
  verdict: string;
}

export default function FinalVerdict({
  competitorName,
  verdict,
}: FinalVerdictProps) {
  return (
    <section className="finalVerdict">
      <div className="finalVerdictContainer">
        <div className="finalVerdictCard">
          <div className="finalVerdictIcon">
            <Sparkles size={24} />
          </div>

          <span className="finalVerdictEyebrow">Final Verdict</span>

          <h2>
            Hireko or {competitorName}?
          </h2>

          <p>{verdict}</p>

          <Link href="/compare" className="finalVerdictLink">
            Explore more comparisons
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}