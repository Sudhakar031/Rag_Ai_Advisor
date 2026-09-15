interface TooltipProps {
  label: string;
  children: React.ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-full bg-slate-900 px-3 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}
