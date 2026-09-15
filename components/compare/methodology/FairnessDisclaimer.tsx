import "./FairnessDisclaimer.css";

import {
  ShieldCheck,
  SearchCheck,
  CircleCheckBig,
  RefreshCcw,
} from "lucide-react";

const principles = [
  {
    icon: SearchCheck,
    title: "Independent Research",
    description:
      "Every comparison is created using official documentation, hands-on evaluation and publicly available product information.",
  },
  {
    icon: CircleCheckBig,
    title: "Verified Information",
    description:
      "Features, integrations, pricing and AI capabilities are verified before publication to ensure accuracy.",
  },
  {
    icon: RefreshCcw,
    title: "Continuous Updates",
    description:
      "Comparison pages are reviewed regularly to reflect new features, pricing changes and platform improvements.",
  },
  {
    icon: ShieldCheck,
    title: "Editorial Independence",
    description:
      "Hireko does not sell rankings or accept paid placements. Editorial decisions remain independent of commercial relationships.",
  },
];

export default function FairnessDisclaimer() {
  return (
    <section className="fairness-section">
      <div className="container">

        <div className="fairness-header">

          <div className="fairness-title">

            <ShieldCheck size={30} />

            <h2>Fairness & Editorial Standards</h2>

          </div>

          <p>
            Every comparison published on Hireko follows transparent editorial
            standards designed to ensure fairness, consistency and trust.
          </p>

        </div>

        <div className="fairness-grid">

          {principles.map((item) => {

            const Icon = item.icon;

            return (

              <div className="fairness-card" key={item.title}>

                <div className="fairness-icon">

                  <Icon size={22} />

                </div>

                <div>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>

                </div>

              </div>

            );

          })}

        </div>

      </div>
    </section>
  );
}