interface QuickStatsProps {
  stats: Array<{ label: string; value: string }>;
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">{stat.label}</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{stat.value}</p>
        </div>
      ))}
    </section>
  );
}
