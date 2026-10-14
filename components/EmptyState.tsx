import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  Icon: LucideIcon;
  title: string;
  message: string;
}

export default function EmptyState({ Icon, title, message }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 bg-cream px-6 py-12 text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full bg-teal/10"
        aria-hidden
      >
        <Icon className="h-8 w-8 text-teal" />
      </span>
      <h3 className="font-heading text-lg font-extrabold text-navy">{title}</h3>
      <p className="font-bangla max-w-xs text-sm leading-relaxed text-slate-500">{message}</p>
    </div>
  );
}
