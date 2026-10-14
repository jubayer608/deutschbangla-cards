"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  /** Progress as a fraction, 0..1 */
  value: number;
  size?: number;
  stroke?: number;
  /** Center label; defaults to "75%" */
  label?: string;
  color?: string;
}

export default function ProgressRing({
  value,
  size = 96,
  stroke = 10,
  label,
  color = "#10B981",
}: ProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#0B1F3B" strokeOpacity={0.12} strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - clamped) }}
          transition={{ type: "spring", stiffness: 55, damping: 14 }}
        />
      </svg>
      <span className="font-heading absolute text-sm font-extrabold text-navy">
        {label ?? `${Math.round(clamped * 100)}%`}
      </span>
    </div>
  );
}
