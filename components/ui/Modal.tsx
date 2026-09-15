interface ModalProps {
  title: string;
  children: React.ReactNode;
}

export function Modal({ title, children }: ModalProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 text-slate-600">{children}</div>
    </div>
  );
}
