import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Scale,
  Sparkles,
} from "lucide-react";

import "./ComparisonHero.css";

interface ComparisonHeroProps {
  competitor: {
    name: string;
    category: string;
    description: string;
    bestFor?: string;
  };
  updatedAt?: string;
  readTime?: string;
}

export default function ComparisonHero({
  competitor,
  updatedAt = "July 2026",
  readTime = "12 min read",
}: ComparisonHeroProps) {
  return (
    <section className="detailHero">
      <div className="detailHeroContainer">
        {/* BREADCRUMB */}
        

        <div className="detailHeroGrid">
          {/* LEFT CONTENT */}
          <div className="detailHeroContent">
            <div className="detailHeroBadge">
              <Sparkles size={15} />
              {competitor.category} Comparison
            </div>

            <h1>
              Hireko <span>vs</span>
              <br />
              {competitor.name}
            </h1>

            <p className="detailHeroLead">
              Compare Hireko and {competitor.name} across AI capabilities,
              recruiter workflows, candidate experience, pricing, integrations,
              and enterprise readiness.
            </p>

            <p className="detailHeroDescription">
              {competitor.description}
            </p>

            {/* META */}
            <div className="detailHeroMeta">
              <span>
                <CalendarDays size={16} />
                Updated {updatedAt}
              </span>

              <span>
                <Clock3 size={16} />
                {readTime}
              </span>

              <span>
                <CheckCircle2 size={16} />
                Independently researched
              </span>
            </div>

            {/* ACTIONS */}
            <div className="detailHeroActions">
              <a
                href="#feature-comparison"
                className="detailHeroPrimary"
              >
                View Feature Comparison
                <ArrowDown size={18} />
              </a>

              <a
                href="#quick-summary"
                className="detailHeroSecondary"
              >
                See Quick Verdict
                <ArrowRight size={18} />
              </a>
            </div>
          </div>

          {/* RIGHT COMPARISON VISUAL */}
          <div className="detailHeroVisual">
            <div className="detailComparisonPanel">
              <div className="detailComparisonLabel">
                <Scale size={16} />
                Platform Comparison
              </div>

              <div className="detailPlatformGrid">
                {/* HIREKO */}
                <div className="detailPlatform detailPlatformHireko">
                  <div className="detailPlatformLogo detailHirekoLogo">
                    H
                  </div>

                  <span className="detailPlatformTag">
                    AI Hiring Platform
                  </span>

                  <h2>Hireko</h2>

                  <p>
                    AI-powered hiring workflows designed for intelligent,
                    flexible and modern recruitment.
                  </p>

                  <div className="detailPlatformBest">
                    <CheckCircle2 size={17} />
                    <span>
                      Best for AI-powered end-to-end hiring
                    </span>
                  </div>
                </div>

                {/* VS */}
                <div className="detailVsBadge">
                  VS
                </div>

                {/* COMPETITOR */}
                <div className="detailPlatform detailPlatformCompetitor">
                  <div className="detailPlatformLogo detailCompetitorLogo">
                    {competitor.name.charAt(0)}
                  </div>

                  <span className="detailPlatformTag">
                    {competitor.category}
                  </span>

                  <h2>{competitor.name}</h2>

                  <p>
                    {competitor.description}
                  </p>

                  {competitor.bestFor && (
                    <div className="detailPlatformBest">
                      <CheckCircle2 size={17} />
                      <span>
                        Best for {competitor.bestFor}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detailComparisonFooter">
                <span>Research-based comparison</span>

                <span className="detailComparisonStatus">
                  <span />
                  Updated {updatedAt}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}