import "./FeatureCriteria.css";
import { CircleCheckBig, ClipboardCheck } from "lucide-react";

const criteria = [
  {
    title: "Verified Official Product Documentation",
    description:
      "Only features published on official websites or validated through product testing are included in our comparisons.",
  },
  {
    title: "Equal Plan-to-Plan Comparisons",
    description:
      "Platforms are compared using equivalent subscription plans to ensure fair and consistent evaluation.",
  },
  {
    title: "Pricing Validated from Official Sources",
    description:
      "Pricing information is reviewed using official pricing pages, enterprise documentation and vendor resources.",
  },
  {
    title: "Hands-on Recruiter Workflow Testing",
    description:
      "Recruiter workflows are evaluated through practical testing to understand usability beyond marketing claims.",
  },
  {
    title: "Real Customer Review Analysis",
    description:
      "Insights from G2, Capterra, Reddit and trusted communities help validate real-world customer experiences.",
  },
  {
    title: "Regular Feature & Pricing Updates",
    description:
      "Comparison pages are reviewed periodically to reflect new AI capabilities, pricing updates and integrations.",
  },
];

export default function FeatureCriteria() {
  return (
    <section className="criteria-section">
      <div className="container">

        <div className="criteria-header">

          <div className="criteria-title">
            <ClipboardCheck size={32} />
            <h2>Feature Comparison Criteria</h2>
          </div>

          <p>
            Every Hireko comparison follows the same evaluation checklist so
            every platform is assessed consistently, objectively and
            transparently.
          </p>

        </div>

        <div className="criteria-card">

          {criteria.map((item, index) => (
            <div className="criteria-row" key={index}>

              <CircleCheckBig className="criteria-icon" size={22} />

              <div>

                <h4>{item.title}</h4>

                <p>{item.description}</p>

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}