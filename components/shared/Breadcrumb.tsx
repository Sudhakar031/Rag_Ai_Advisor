import Link from "next/link";

interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          {item.href ? <Link href={item.href} className="hover:text-slate-900">{item.label}</Link> : <span>{item.label}</span>}
          {index < items.length - 1 ? <span>/</span> : null}
        </div>
      ))}
    </nav>
  );
}
