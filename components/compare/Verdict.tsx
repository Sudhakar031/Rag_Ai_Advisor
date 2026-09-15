interface VerdictProps {
  text: string;
}

export function Verdict({ text }: VerdictProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Verdict</h3>
      <p className="mt-4 text-slate-600">{text}</p>
    </section>
  );
}
