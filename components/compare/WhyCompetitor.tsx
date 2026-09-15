interface WhyCompetitorProps {
  weaknesses: string[];
}

export function WhyCompetitor({ weaknesses }: WhyCompetitorProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Why a competitor may still be appealing</h3>
      <ul className="mt-4 space-y-2 text-slate-600">
        {weaknesses.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </section>
  );
}
