import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Code2,
  MessagesSquare,
  UserSearch,
  Video,
} from "lucide-react";

import "./ComparisonCategories.css";

const categories = [
  {
    title: "AI Interview Platforms",
    icon: Bot,
    comparisons: [
      {
        name: "HireVue",
        slug: "hirevue-vs-hireko",
        description:
          "Modern AI hiring platform vs enterprise video interviewing solution",
        difference:
          "Flexible AI hiring workflows vs established enterprise interview infrastructure",
        summary:
          "Hireko: AI-powered hiring workflows and candidate intelligence. HireVue: Enterprise video interviewing and assessments.",
      },
      {
        name: "Talview",
        slug: "talview-vs-hireko",
        description:
          "AI-powered hiring experience vs enterprise assessment platform",
        difference:
          "Integrated hiring intelligence vs assessment-led recruitment workflows",
        summary:
          "Hireko: AI-driven hiring and candidate insights. Talview: Remote assessments, interviews and proctoring.",
      },
      {
        name: "Modern Hire",
        slug: "modern-hire-vs-hireko",
        description:
          "Conversational AI hiring vs enterprise structured assessments (part of HireVue)",
        difference:
          "Agile conversational interviews vs Automated Interview Scoring (AIS) and enterprise compliance",
        summary:
          "Hireko: Interactive conversational AI. Modern Hire: Enterprise assessment and automated interview scoring.",
      },
    ],
  },

  {
    title: "Video Interview Platforms",
    icon: Video,
    comparisons: [
      {
        name: "Spark Hire",
        slug: "sparkhire-vs-hireko",
        description:
          "AI-powered hiring platform vs dedicated video interview software",
        difference:
          "Broader AI hiring intelligence vs specialized video interviewing",
        summary:
          "Hireko: AI hiring workflows and intelligence. Spark Hire: One-way and live video interviewing.",
      },
      {
        name: "myInterview",
        slug: "myinterview-vs-hireko",
        description:
          "AI hiring intelligence vs candidate-first video interviewing",
        difference:
          "End-to-end AI hiring workflows vs video interview screening",
        summary:
          "Hireko: AI-powered hiring platform. myInterview: Video screening and candidate matching.",
      },
      {
        name: "Willo",
        slug: "willo-vs-hireko",
        description:
          "Conversational AI hiring vs asynchronous video interviewing",
        difference:
          "Interactive AI interviews vs asynchronous video screening",
        summary:
          "Hireko: Conversational AI interviews. Willo: Asynchronous video interview workflows.",
      },
    ],
  },

  {
    title: "Technical Assessment Platforms",
    icon: Code2,
    comparisons: [
      {
        name: "CodeSignal",
        slug: "codesignal-vs-hireko",
        description:
          "AI hiring platform vs technical skills assessment solution",
        difference:
          "Holistic candidate evaluation vs deep technical skill validation",
        summary:
          "Hireko: AI interviews and hiring intelligence. CodeSignal: Technical assessments and coding evaluations.",
      },
    ],
  },

  {
    title: "AI Recruiting Assistants",
    icon: MessagesSquare,
    comparisons: [
      {
        name: "Paradox",
        slug: "paradox-vs-hireko",
        description:
          "AI-powered hiring intelligence vs conversational recruiting automation",
        difference:
          "Candidate evaluation vs conversational recruiting automation",
        summary:
          "Hireko: AI interviewing and candidate intelligence. Paradox: Conversational recruiting and scheduling automation.",
      },
      {
        name: "Humanly",
        slug: "humanly-vs-hireko",
        description:
          "AI hiring platform vs conversational recruiting automation",
        difference:
          "AI-led evaluation workflows vs conversational candidate engagement",
        summary:
          "Hireko: AI-powered hiring intelligence. Humanly: Recruiting automation and candidate conversations.",
      },
      {
        name: "Interviewer.AI",
        slug: "interviewer-ai-vs-hireko",
        description:
          "End-to-end AI hiring vs AI-powered candidate screening",
        difference:
          "Unified hiring workflows vs screening-focused AI evaluation",
        summary:
          "Hireko: End-to-end AI hiring. Interviewer.AI: AI-assisted candidate screening and interviews.",
      },
    ],
  },

  {
    title: "Recruiting Intelligence",
    icon: UserSearch,
    comparisons: [
      {
        name: "Metaview",
        slug: "metaview-vs-hireko",
        description:
          "AI hiring platform vs AI recruiting intelligence assistant",
        difference:
          "Candidate-facing AI workflows vs recruiter conversation intelligence",
        summary:
          "Hireko: AI interviews and candidate evaluation. Metaview: AI notes and recruiting conversation intelligence.",
      },
      {
        name: "Mercor",
        slug: "mercor-vs-hireko",
        description:
          "AI-powered hiring workflows vs AI-driven talent matching",
        difference:
          "Interview intelligence vs talent marketplace and matching",
        summary:
          "Hireko: AI interviewing and recruiter workflows. Mercor: AI-powered talent matching.",
      },
    ],
  },

  {
    title: "Enterprise Hiring Platforms",
    icon: BriefcaseBusiness,
    comparisons: [
      {
        name: "Greenhouse",
        slug: "greenhouse-vs-hireko",
        description:
          "AI-powered interviewing vs structured applicant tracking",
        difference:
          "AI candidate intelligence vs established ATS infrastructure",
        summary:
          "Hireko: AI interviewing and candidate intelligence. Greenhouse: Applicant tracking and structured hiring.",
      },
    ],
  },
];

export default function ComparisonCategories() {
  return (
    <section
      className="comparisonCategories"
      id="comparisons"
      aria-labelledby="comparison-categories-title"
    >
      <div className="comparisonCategoriesContainer">
        <header className="comparisonCategoriesHeader">
          <span className="comparisonCategoriesEyebrow">
            Platform Comparisons
          </span>

          <h2 id="comparison-categories-title">
            Explore AI hiring platform comparisons
          </h2>

          <p>
            Compare Hireko with leading hiring technology platforms across AI
            interviews, video interviewing, assessments, recruiting automation,
            and enterprise hiring.
          </p>
        </header>

        <div className="comparisonCategoryList">
          {categories.map((category) => {
            const CategoryIcon = category.icon;

            return (
              <section
                className="comparisonCategoryGroup"
                key={category.title}
              >
                <div className="comparisonCategoryTitle">
                  <div className="comparisonCategoryIcon">
                    <CategoryIcon size={20} strokeWidth={2} />
                  </div>

                  <h3>{category.title}</h3>
                </div>

                <div className="comparisonCardsGrid">
                  {category.comparisons.map((comparison) => (
                    <Link
                      href={`/compare/${comparison.slug}`}
                      className="comparisonCard"
                      key={comparison.slug}
                    >
                      <div className="comparisonCardTop">
                        <div className="comparisonCardTitle">
                          <span className="hirekoName">Hireko</span>
                          <span className="versus">vs</span>
                          <span className="competitorName">
                            {comparison.name}
                          </span>
                        </div>

                        <span className="comparisonCardArrow">
                          <ArrowRight size={20} strokeWidth={2} />
                        </span>
                      </div>

                      <p className="comparisonCardDescription">
                        {comparison.description}
                      </p>

                      <div className="comparisonCardDivider" />

                      <div className="comparisonDifference">
                        <span>Key Difference</span>
                        <p>{comparison.difference}</p>
                      </div>

                      <div className="comparisonSummary">
                        <strong>Quick Take:</strong>{" "}
                        {comparison.summary}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}