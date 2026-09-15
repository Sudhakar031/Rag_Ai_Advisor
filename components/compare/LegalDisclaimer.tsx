interface LegalDisclaimerProps {
  text: string;
}

export function LegalDisclaimer({ text }: LegalDisclaimerProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Legal disclaimer</h3>
      <p className="mt-4 text-slate-600">{text}</p>
    </section>
  );
}
