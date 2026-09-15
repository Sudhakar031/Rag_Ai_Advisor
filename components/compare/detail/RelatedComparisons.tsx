import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComparisonOverview } from "@/types/comparison";
import "./RelatedComparisons.css";

interface RelatedComparisonsProps {
  relatedSlugs: string[];
  comparisons: ComparisonOverview[];
}

export default function RelatedComparisons({
  relatedSlugs,
  comparisons,
}: RelatedComparisonsProps) {
  const related = relatedSlugs
    .map((slug) => comparisons.find((item) => item.slug === slug))
    .filter(
      (item): item is ComparisonOverview => Boolean(item)
    );

  if (related.length === 0) return null;

  return (
    <section className="relatedComparisons">
      <div className="relatedComparisonsContainer">
        <header className="relatedComparisonsHeader">
          <span className="relatedComparisonsEyebrow">
            Keep Comparing
          </span>

          <h2>Related comparisons</h2>

          <p>
            Explore more AI hiring platforms and compare their capabilities,
            workflows, and pricing.
          </p>
        </header>

        <div className="relatedComparisonsGrid">
          {related.map((comparison) => (
            <Link
              href={`/compare/${comparison.slug}`}
              className="relatedComparisonCard"
              key={comparison.slug}
            >
              <div>
                <span className="relatedComparisonCategory">
                  {comparison.category}
                </span>

                <h3>{comparison.title}</h3>

                <p>{comparison.summary}</p>
              </div>

              <span className="relatedComparisonLink">
                View comparison
                <ArrowRight size={18} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}