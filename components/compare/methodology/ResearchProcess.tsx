import "./ResearchProcess.css";
import {
  Search,
  Brain,
  ShieldCheck,
  BadgeDollarSign,
  Flag,
  FileText,
  FlaskConical,
  MessageSquareQuote,
  RefreshCw,
} from "lucide-react";

const steps = [
  {
    title: "Official Sources",
    description:
      "Every feature, pricing plan, API and integration is verified using official documentation before publication.",
    icon: <FileText size={24} />,
  },
  {
    title: "Hands-on Testing",
    description:
      "Recruiter and candidate workflows are evaluated to validate real-world platform experience beyond marketing claims.",
    icon: <FlaskConical size={24} />,
  },
  {
    title: "Community Feedback",
    description:
      "Insights from G2, Capterra, Reddit and verified customers help validate usability and product quality.",
    icon: <MessageSquareQuote size={24} />,
  },
  {
    title: "Continuous Updates",
    description:
      "Comparison pages are reviewed regularly to keep pricing, AI capabilities and integrations accurate.",
    icon: <RefreshCw size={24} />,
  },
];

export default function ResearchProcess() {
  return (
    <section className="research-section">
      <div className="container">

        <div className="research-header">

          <div className="research-heading">

            <Search className="heading-icon" />

            <h2>Research Process</h2>

          </div>

          <p>
            Every Hireko comparison follows a standardized research methodology
            based on official documentation, practical testing, recruiter
            workflows and verified community feedback.
          </p>

        </div>

        <div className="research-grid">

          {steps.map((item) => (

            <div className="research-card" key={item.title}>

              <div className="card-icon">
                {item.icon}
              </div>

              <h3>{item.title}</h3>

              <p>{item.description}</p>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}