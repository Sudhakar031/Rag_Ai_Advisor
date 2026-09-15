interface TabsProps {
  tabs: Array<{ label: string; content: string }>;
}

export function Tabs({ tabs }: TabsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <div key={tab.label} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            {tab.label}
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-600 shadow-sm">
        {tabs[0]?.content}
      </div>
    </div>
  );
}
