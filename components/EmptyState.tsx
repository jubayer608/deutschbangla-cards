interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white px-6 py-12 text-center shadow ring-1 ring-indigo-100">
      <span className="text-5xl" aria-hidden>
        {icon}
      </span>
      <h3 className="text-lg font-extrabold text-indigo-950">{title}</h3>
      <p className="font-bangla max-w-xs text-sm leading-relaxed text-slate-500">{message}</p>
    </div>
  );
}
