import Link from "next/link";
import { comparisons } from "@/data/comparisons";
import { featuredComparisons } from "@/data/featured";

export function FeaturedComparisons() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Featured comparisons</h2>
      <div className="mt-6 space-y-3">
        {featuredComparisons.map((slug) => {
          const comparison = comparisons.find((item) => item.slug === slug);
          return comparison ? (
            <Link key={slug} href={`/compare/${slug}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 hover:text-slate-900">
              <span>{comparison.title}</span>
              <span className="text-sm font-semibold">View →</span>
            </Link>
          ) : null;
        })}
      </div>
    </section>
  );
}
