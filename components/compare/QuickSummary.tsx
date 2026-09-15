interface QuickSummaryProps {
  summary: string;
  highlights: string[];
}

export function QuickSummary({ summary, highlights }: QuickSummaryProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Quick summary</h3>
      <p className="mt-4 text-slate-600">{summary}</p>
      <ul className="mt-6 space-y-2 text-slate-600">
        {highlights.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </section>
  );
}
