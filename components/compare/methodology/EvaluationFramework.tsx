import "./EvaluationFramework.css";

import {
  Brain,
  Users,
  UserRound,
  Workflow,
  BarChart3,
  BadgeDollarSign,
} from "lucide-react";

const framework = [
  {
    icon: Brain,
    title: "AI Capabilities",
    description:
      "Interview intelligence, AI scoring, automation, conversational AI and recommendation engines.",
  },
  {
    icon: Users,
    title: "Recruiter Experience",
    description:
      "Recruiter workflows, collaboration, hiring pipeline management and usability.",
  },
  {
    icon: UserRound,
    title: "Candidate Experience",
    description:
      "Interview flow, accessibility, communication and candidate journey.",
  },
  {
    icon: Workflow,
    title: "Integrations",
    description:
      "ATS integrations, APIs, SSO, calendars and enterprise connectivity.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Reporting, dashboards, hiring insights and recruitment intelligence.",
  },
  {
    icon: BadgeDollarSign,
    title: "Pricing & Value",
    description:
      "Pricing transparency, scalability, ROI and enterprise value.",
  },
];

export default function EvaluationFramework() {
  return (
    <section className="evaluation-section">
      <div className="container">

        <div className="evaluation-header">

          <div className="evaluation-heading">

            <Brain className="heading-icon" />

            <h2>Evaluation Framework</h2>

          </div>

          <p>
            Every AI hiring platform is evaluated using the same standardized
            framework to ensure fair, transparent and consistent comparisons.
          </p>

        </div>

        <div className="evaluation-grid">

          {framework.map((item) => {

            const Icon = item.icon;

            return (

              <div className="evaluation-card" key={item.title}>

                <div className="card-icon">

                  <Icon size={24} />

                </div>

                <h3>{item.title}</h3>

                <p>{item.description}</p>

              </div>

            );

          })}

        </div>

      </div>
    </section>
  );
}