interface HeroProps {
  title: string;
  description: string;
}

export function Hero({ title, description }: HeroProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Comparison</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-4 max-w-2xl text-slate-600">{description}</p>
    </section>
  );
}
