"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, Gamepad2 } from "lucide-react";
import Mascot from "@/components/Mascot";

/**
 * Streak flame ignition — the shared playful streak display used wherever a
 * streak is shown (home dashboard + Fortschritt page).
 *
 * - `todayActive`: today's goal already completed → the Lucide Flame ignites
 *   with a spring scale pop, a warm amber bloom + the emerald `.bloom` glow,
 *   and a playful flicker loop.
 * - inactive streak: dim, sleepy flame (no glow, no motion).
 *
 * `SleepyStreakNotice`: shown when the streak is at risk (no activity today
 * but a live streak) — sleepy Mascot with gentle Bangla copy + quiz CTA.
 */
export function StreakFlame({
  todayActive,
  size = 56,
  iconSize = 28,
  className,
}: {
  todayActive: boolean;
  size?: number;
  iconSize?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ignite = todayActive && !reduce;

  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={todayActive ? "আজকের স্ট্রিক জ্বলছে" : "আজকের স্ট্রিক এখনো জ্বলেনি"}
    >
      {/* warm amber bloom + emerald bloom behind the ignited flame */}
      {todayActive && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-3 rounded-full"
            style={{
              background: "radial-gradient(closest-side, rgba(245,158,11,0.4), transparent)",
            }}
          />
          <span aria-hidden className="bloom pointer-events-none absolute -inset-5 rounded-full" />
        </>
      )}

      <motion.div
        initial={ignite ? { scale: 0.4, rotate: -30, opacity: 0.4 } : false}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 12 }}
        className={`flex h-full w-full items-center justify-center rounded-2xl ${
          todayActive
            ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-300"
            : "bg-white ring-1 ring-emerald-100"
        }`}
      >
        <motion.span
          animate={ignite ? { scale: [1, 1.16, 1], rotate: [0, -5, 5, 0] } : undefined}
          transition={ignite ? { duration: 1.7, repeat: Infinity, ease: "easeInOut" } : undefined}
          className="flex items-center justify-center"
        >
          <Flame
            className={todayActive ? "fill-white/20 text-white" : "text-slate-300"}
            style={{ width: iconSize, height: iconSize }}
            aria-hidden
          />
        </motion.span>
      </motion.div>
    </div>
  );
}

export function SleepyStreakNotice({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className={`glass-card flex items-center gap-3 rounded-3xl p-4 ${className ?? ""}`}
    >
      <Mascot mood="sleepy" size={76} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-bangla text-sm font-extrabold text-emerald-950">
          তোমার স্ট্রিক ঘুমিয়ে যাচ্ছে…
        </p>
        <p className="font-bangla text-xs font-semibold text-slate-500">
          একটা কুইজ করো — স্ট্রিকটা জ্বালিয়ে রাখো!
        </p>
      </div>
      <Link
        href="/quiz"
        className="font-bangla inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-md shadow-amber-200 transition active:scale-95"
      >
        <Gamepad2 className="h-4 w-4" aria-hidden />
        কুইজ
      </Link>
    </motion.div>
  );
}
