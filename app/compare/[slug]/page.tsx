import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { hirekoFaq } from "@/data/hirekoFaq";
import ComparisonHero from "@/components/compare/detail/ComparisonHero";
import ComparisonOverview from "@/components/compare/detail/ComparisonOverview";
import QuickStats from "@/components/compare/detail/QuickStats";
import DetailQuickSummary from "@/components/compare/detail/DetailQuickSummary";
import FeatureComparison from "@/components/compare/detail/FeatureComparison";
import PricingComparison from "@/components/compare/detail/PricingComparison";
import StrengthsTradeoffs from "@/components/compare/detail/StrengthsTradeoffs";
import FinalVerdict from "@/components/compare/detail/FinalVerdict";
import { comparisons } from "@/data/comparisons";
import FAQSection from "@/components/compare/detail/FAQSection";
import Disclaimer from "@/components/compare/detail/Disclaimer";
import RelatedComparisons from "@/components/compare/detail/RelatedComparisons";
import CompareCTA from "@/components/compare/detail/CompareCTA";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface ComparePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return comparisons.map((comparison) => ({
    slug: comparison.slug,
  }));
}

export async function generateMetadata({
  params,
}: ComparePageProps): Promise<Metadata> {
  const { slug } = await params;

  let comparison = comparisons.find((item) => item.slug === slug);
  if (!comparison) {
    comparison = comparisons.find(
      (item) =>
        item.competitorName.toLowerCase() === slug.toLowerCase() ||
        item.slug === `${slug}-vs-hireko` ||
        item.slug.startsWith(slug.toLowerCase())
    );
  }

  if (!comparison) {
    return {
      title: "Comparison Not Found | Hireko Compare",
      description:
        "The requested AI hiring platform comparison could not be found.",
    };
  }

  return {
    title: `${comparison.title} | AI Hiring Platform Comparison`,
    description: comparison.summary,
  };
}

export default async function CompareDetailPage({
  params,
}: ComparePageProps) {
  const { slug } = await params;

  if (slug === "all-competitors" || slug === "all" || slug === "hireko" || slug === "directory") {
    redirect("/compare");
  }

  let comparison = comparisons.find((item) => item.slug === slug);
  if (!comparison) {
    comparison = comparisons.find(
      (item) =>
        item.competitorName.toLowerCase() === slug.toLowerCase() ||
        item.slug === `${slug}-vs-hireko` ||
        item.slug.startsWith(slug.toLowerCase())
    );
  }

  if (!comparison) {
    notFound();
  }

  const competitor = {
    name: comparison.competitorName,
    category: comparison.category,
    description: comparison.overview,
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <ComparisonHero
          competitor={competitor}
          updatedAt="July 2026"
          readTime="12 min read"
        />
         <ComparisonOverview
        competitorName={comparison.competitorName}
        overview={comparison.overview}
        />
       <QuickStats stats={comparison.quickStats} />

  <DetailQuickSummary
    highlights={comparison.highlights}
  />
  <FeatureComparison
    competitorName={comparison.competitorName}
    features={comparison.features}
  />
  <PricingComparison
    competitorName={comparison.competitorName}
    pricing={comparison.pricing}
  />
  <StrengthsTradeoffs
    competitorName={comparison.competitorName}
    strengths={comparison.strengths}
    weaknesses={comparison.weaknesses}
  />
  <FinalVerdict
    competitorName={comparison.competitorName}
    verdict={comparison.verdict}
  />

  <FAQSection faq={hirekoFaq} />
  <Disclaimer disclaimer={comparison.disclaimer} />


  <RelatedComparisons
    relatedSlugs={comparison.relatedSlugs}
    comparisons={comparisons}
  />
  <CompareCTA />  
      </main>
      <Footer />
    </div>
  );
}