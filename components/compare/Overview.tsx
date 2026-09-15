interface OverviewProps {
  text: string;
}

export function Overview({ text }: OverviewProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Overview</h3>
      <p className="mt-4 text-slate-600">{text}</p>
    </section>
  );
}
