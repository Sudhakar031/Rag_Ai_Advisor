import Link from "next/link";

interface RelatedComparisonsProps {
  items: Array<{ slug: string; title: string }>;
}

export function RelatedComparisons({ items }: RelatedComparisonsProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Related comparisons</h3>
      <div className="mt-6 flex flex-wrap gap-3">
        {items.map((item) => (
          <Link key={item.slug} href={`/compare/${item.slug}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            {item.title}
          </Link>
        ))}
      </div>
    </section>
  );
}
