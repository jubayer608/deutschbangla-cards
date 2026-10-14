import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  Icon: LucideIcon;
  title: string;
  message: string;
}

export default function EmptyState({ Icon, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white px-6 py-12 text-center shadow ring-1 ring-emerald-100">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50"
        aria-hidden
      >
        <Icon className="h-8 w-8 text-emerald-600" />
      </span>
      <h3 className="text-lg font-extrabold text-emerald-950">{title}</h3>
      <p className="font-bangla max-w-xs text-sm leading-relaxed text-slate-500">{message}</p>
    </div>
  );
}
