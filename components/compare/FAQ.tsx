interface FAQProps {
  items: Array<{ question: string; answer: string }>;
}

export function FAQ({ items }: FAQProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">FAQ</h3>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.question} className="rounded-2xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">{item.question}</p>
            <p className="mt-2 text-slate-600">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
