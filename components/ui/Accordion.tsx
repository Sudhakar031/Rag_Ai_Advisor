interface AccordionProps {
  items: Array<{ title: string; content: string }>;
}

export function Accordion({ items }: AccordionProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <summary className="cursor-pointer font-semibold text-slate-900">{item.title}</summary>
          <p className="mt-3 text-sm text-slate-600">{item.content}</p>
        </details>
      ))}
    </div>
  );
}
