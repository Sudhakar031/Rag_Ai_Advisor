interface WhyHirekoProps {
  strengths: string[];
}

export function WhyHireko({ strengths }: WhyHirekoProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Why Hireko</h3>
      <ul className="mt-4 space-y-2 text-slate-600">
        {strengths.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </section>
  );
}
