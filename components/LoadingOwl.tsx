"use client";

import Mascot from "@/components/Mascot";

interface LoadingOwlProps {
  /** Loading text shown under the owl. */
  text?: string;
  /** Owl size in px (the ring scales with it). */
  size?: number;
  className?: string;
}

/**
 * Lightweight mascot loading indicator — a static study-mood Ulluk inside a
 * spinning teal progress ring. Component only: it adds no global loading
 * screen and no navigation delay. Render it inside a Suspense fallback or
 * any inline loading state.
 */
export default function LoadingOwl({ text = "Deutsch wird geladen…", size = 72, className }: LoadingOwlProps) {
  const ring = size + 24;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={text}
      className={`flex flex-col items-center gap-2 ${className ?? ""}`}
    >
      <div className="relative flex items-center justify-center" style={{ width: ring, height: ring }}>
        {/* progress ring — CSS-only spin, teal on a soft track */}
        <span
          aria-hidden
          className="absolute inset-0 animate-spin rounded-full border-[3px] border-teal/20 border-t-teal motion-reduce:animate-none"
        />
        <span aria-hidden className="absolute inset-[7px] rounded-full bg-cream" />
        <Mascot mood="study" size={size} animate={false} className="relative" />
      </div>
      <p className="font-bangla text-sm font-semibold text-navy/70">{text}</p>
    </div>
  );
}

export { LoadingOwl };
