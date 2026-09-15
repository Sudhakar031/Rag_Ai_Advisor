interface FeatureComparisonTableProps {
  competitorName: string;
  features: Array<{ feature: string; hireko: string; competitor: string }>;
}

export function FeatureComparisonTable({ competitorName, features }: FeatureComparisonTableProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Feature comparison</h3>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3">Feature</th>
              <th className="px-4 py-3">Hireko</th>
              <th className="px-4 py-3">{competitorName}</th>
            </tr>
          </thead>
          <tbody>
            {features.map((row) => (
              <tr key={row.feature} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-900">{row.feature}</td>
                <td className="px-4 py-3 text-slate-600">{row.hireko}</td>
                <td className="px-4 py-3 text-slate-600">{row.competitor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
