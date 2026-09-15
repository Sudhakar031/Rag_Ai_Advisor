import {
  SearchCheck,
  BrainCircuit,
  Scale,
} from "lucide-react";

import "./WhyCompare.css";

const reasons = [
  {
    icon: SearchCheck,
    title: "Independent Research",
    description:
      "We evaluate AI hiring platforms using consistent research criteria across features, workflows, integrations, pricing and enterprise readiness.",
  },
  {
    icon: BrainCircuit,
    title: "AI Capability Analysis",
    description:
      "Understand how platforms differ across AI interviewing, candidate evaluation, automation, scoring and recruiter intelligence.",
  },
  {
    icon: Scale,
    title: "Transparent Evaluation",
    description:
      "Our comparisons focus on meaningful product differences to help hiring teams evaluate platforms with greater clarity and confidence.",
  },
];

export default function WhyCompare() {
  return (
    <section className="whyCompare" aria-labelledby="why-compare-title">
      <div className="whyCompareContainer">
        <div className="whyCompareHeader">
          <span className="whyCompareEyebrow">Why Compare?</span>

          <h2 id="why-compare-title">
            Make a more informed hiring technology decision
          </h2>
        </div>

        <div className="whyCompareGrid">
          {reasons.map(({ icon: Icon, title, description }) => (
            <article className="whyCompareItem" key={title}>
              <div className="whyCompareIcon" aria-hidden="true">
                <Icon size={22} strokeWidth={2} />
              </div>

              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}