"use client";

import { useEffect, useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Ulluk (উল্লুক) — the brand's original mascot, a chubby emerald owl.
 * NOT Duolingo's Duo: round body, cream belly, curved ear tufts, blush
 * cheeks and teal wings. Pure SVG, zero emojis.
 *
 * Moods:
 * - idle      : gentle bob + eye blink every ~4s
 * - happy     : springy bounce next to CTAs
 * - sad       : sympathetic tilt with half-mast eyes
 * - celebrate : spin + jump dance for milestones
 * - sleepy    : droop, slow blink, floating Z's (streak at risk)
 */
export type MascotMood = "idle" | "happy" | "sad" | "celebrate" | "sleepy";

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
}

const MOOD_LABEL: Record<MascotMood, string> = {
  idle: "উল্লুক, তোমার পড়ার সাথী",
  happy: "খুশি উল্লুক",
  sad: "দুঃখিত উল্লুক",
  celebrate: "উদযাপন করছে উল্লুক",
  sleepy: "ঘুমন্ত উল্লুক",
};

export default function Mascot({ mood = "idle", size = 96, className }: MascotProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const reduce = useReducedMotion();
  const [blink, setBlink] = useState(false);

  // Eye blink loop — slow and drowsy for the sleepy mood.
  useEffect(() => {
    if (reduce) return;
    const period = mood === "sleepy" ? 5200 : 4000;
    const closeMs = mood === "sleepy" ? 1100 : 160;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(() => {
      setBlink(true);
      timeout = setTimeout(() => setBlink(false), closeMs);
    }, period);
    return () => {
      clearInterval(id);
      if (timeout) clearTimeout(timeout);
    };
  }, [mood, reduce]);

  const bodyGrad = `mascot-body-${uid}`;
  const bellyGrad = `mascot-belly-${uid}`;

  const bodyAnimate = reduce
    ? undefined
    : mood === "happy"
      ? {
          y: [0, -12, 0, -6, 0],
          rotate: [0, -5, 5, 0],
          transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" as const },
        }
      : mood === "celebrate"
        ? {
            y: [0, -22, 0, -12, 0],
            rotate: [0, 360],
            transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" as const },
          }
        : mood === "sad"
          ? {
              rotate: -10,
              y: 5,
              transition: { type: "spring" as const, stiffness: 140, damping: 16 },
            }
          : mood === "sleepy"
            ? { rotate: 7, y: 7, transition: { duration: 1.4, ease: "easeOut" as const } }
            : {
                y: [0, -5, 0],
                transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" as const },
              };

  const eyeScaleY = blink ? 0.08 : mood === "sad" ? 0.55 : mood === "sleepy" ? 0.35 : 1;

  return (
    <motion.svg
      viewBox="0 0 200 224"
      width={size}
      height={(size * 224) / 200}
      role="img"
      aria-label={MOOD_LABEL[mood]}
      className={className}
      animate={bodyAnimate}
    >
      <defs>
        <linearGradient id={bodyGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id={bellyGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fefce8" />
          <stop offset="100%" stopColor="#d1fae5" />
        </linearGradient>
      </defs>

      {/* ear tufts */}
      <path d="M62 44 C56 26 52 14 50 8 C64 12 78 22 86 34 Z" fill="#047857" />
      <path d="M138 44 C144 26 148 14 150 8 C136 12 122 22 114 34 Z" fill="#047857" />

      {/* wings */}
      <ellipse cx="34" cy="136" rx="17" ry="44" fill="#0d9488" transform="rotate(10 34 136)" />
      <ellipse cx="166" cy="136" rx="17" ry="44" fill="#0d9488" transform="rotate(-10 166 136)" />

      {/* body */}
      <ellipse cx="100" cy="128" rx="72" ry="80" fill={`url(#${bodyGrad})`} />
      {/* belly */}
      <ellipse cx="100" cy="154" rx="44" ry="52" fill={`url(#${bellyGrad})`} opacity="0.95" />

      {/* blush cheeks */}
      <circle cx="56" cy="136" r="9" fill="#fbbf24" opacity="0.45" />
      <circle cx="144" cy="136" r="9" fill="#fbbf24" opacity="0.45" />

      {/* eyes */}
      <motion.g
        animate={{ scaleY: eyeScaleY }}
        transition={{ duration: blink ? 0.09 : 0.25 }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
      >
        <ellipse cx="76" cy="108" rx="26" ry="30" fill="#ffffff" />
        <ellipse cx="124" cy="108" rx="26" ry="30" fill="#ffffff" />
        <circle cx="76" cy="114" r="11" fill="#064e3b" />
        <circle cx="124" cy="114" r="11" fill="#064e3b" />
        <circle cx="80" cy="109" r="3.6" fill="#ffffff" />
        <circle cx="128" cy="109" r="3.6" fill="#ffffff" />
      </motion.g>

      {/* beak */}
      <path
        d="M90 136 L110 136 L100 150 Z"
        fill="#f59e0b"
        transform={mood === "sad" ? "translate(0 4)" : undefined}
      />

      {/* feet */}
      <ellipse cx="76" cy="206" rx="15" ry="9" fill="#f59e0b" />
      <ellipse cx="124" cy="206" rx="15" ry="9" fill="#f59e0b" />

      {/* sleepy Z's */}
      {mood === "sleepy" && !reduce && (
        <>
          <motion.text
            x="158"
            y="52"
            fontSize="26"
            fontWeight="bold"
            fill="#94a3b8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 0], y: -22 }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
          >
            Z
          </motion.text>
          <motion.text
            x="172"
            y="66"
            fontSize="18"
            fontWeight="bold"
            fill="#94a3b8"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 1, 0], y: -18 }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut", delay: 1.1 }}
          >
            Z
          </motion.text>
        </>
      )}
    </motion.svg>
  );
}
