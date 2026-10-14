"use client";

import { useEffect, useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Ulluk (উল্লুক) — the brand mascot, a round navy owl with a cream face,
 * big amber eyes and an orange beak (see brand reference art).
 * Pure hand-drawn SVG, zero emojis.
 *
 * Moods:
 * - study     : graduation cap + open book (German-flag stripes) — default
 * - idle      : alias of `study` (backward compat)
 * - thinking  : one wing on chin + green "?" bubble
 * - gaming    : teal headphones + small game controller
 * - happy     : wink + sparkles
 * - sleepy    : droopy half-closed eyes + floating Z's + tilted cap
 * - angry     : furrowed brows, narrowed eyes, red cheek tint (funny, not scary)
 * - sad       : alias of `angry` (backward compat)
 * - celebrate : confetti + raised wings + party sparkles
 */
export type MascotMood =
  | "study"
  | "thinking"
  | "gaming"
  | "happy"
  | "sleepy"
  | "angry"
  | "celebrate"
  | "idle"
  | "sad";

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
  /** Set false for static contexts (e.g. loading indicators). Default true. */
  animate?: boolean;
}

const MOOD_LABEL: Record<MascotMood, string> = {
  study: "উল্লুক, তোমার পড়ার সাথী",
  idle: "উল্লুক, তোমার পড়ার সাথী",
  thinking: "ভাবছে উল্লুক",
  gaming: "গেম খেলছে উল্লুক",
  happy: "খুশি উল্লুক",
  sleepy: "ঘুমন্ত উল্লুক",
  angry: "রাগী উল্লুক",
  sad: "দুঃখিত উল্লুক",
  celebrate: "উদযাপন করছে উল্লুক",
};

/** Resolve backward-compat aliases to their canonical mood. */
function resolveMood(mood: MascotMood): "study" | "thinking" | "gaming" | "happy" | "sleepy" | "angry" | "celebrate" {
  if (mood === "idle") return "study";
  if (mood === "sad") return "angry";
  return mood;
}

export default function Mascot({ mood = "idle", size = 96, className, animate = true }: MascotProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const reduce = useReducedMotion();
  const [blink, setBlink] = useState(false);
  const resolved = resolveMood(mood);
  const animated = animate && !reduce;

  // Eye blink loop — slow and drowsy for the sleepy mood.
  useEffect(() => {
    if (!animated) return;
    const period = resolved === "sleepy" ? 5200 : 4000;
    const closeMs = resolved === "sleepy" ? 1100 : 160;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(() => {
      setBlink(true);
      timeout = setTimeout(() => setBlink(false), closeMs);
    }, period);
    return () => {
      clearInterval(id);
      if (timeout) clearTimeout(timeout);
    };
  }, [resolved, animated]);

  const bodyGrad = `mascot-body-${uid}`;
  const faceGrad = `mascot-face-${uid}`;
  const bookClip = `mascot-book-${uid}`;

  const bodyAnimate = !animated
    ? undefined
    : resolved === "happy"
      ? {
          y: [0, -12, 0, -6, 0],
          rotate: [0, -5, 5, 0],
          transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" as const },
        }
      : resolved === "celebrate"
        ? {
            y: [0, -22, 0, -12, 0],
            rotate: [0, 360],
            transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" as const },
          }
        : resolved === "angry"
          ? {
              rotate: [0, -2, 2, 0],
              transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" as const },
            }
          : resolved === "sleepy"
            ? { rotate: 7, y: 7, transition: { duration: 1.4, ease: "easeOut" as const } }
            : resolved === "gaming"
              ? {
                  y: [0, -4, 0],
                  rotate: [0, -2, 2, 0],
                  transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" as const },
                }
              : {
                  y: [0, -5, 0],
                  transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" as const },
                };

  const eyeScaleY = blink ? 0.08 : resolved === "angry" ? 0.55 : resolved === "sleepy" ? 0.35 : 1;
  const cheekColor = resolved === "angry" ? "#f87171" : "#fbbf24";
  const cheekOpacity = resolved === "angry" ? 0.55 : 0.35;

  return (
    <motion.svg
      viewBox="0 0 200 230"
      width={size}
      height={(size * 230) / 200}
      role="img"
      aria-label={MOOD_LABEL[mood]}
      className={className}
      animate={bodyAnimate}
    >
      <defs>
        <linearGradient id={bodyGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#0b1f3b" />
        </linearGradient>
        <radialGradient id={faceGrad} cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#fffdf5" />
          <stop offset="100%" stopColor="#fef3c7" />
        </radialGradient>
        <clipPath id={bookClip}>
          <path d="M52 162 L100 174 L148 162 L148 200 L100 212 L52 200 Z" />
        </clipPath>
      </defs>

      {/* ---- graduation cap (study + sleepy, tilted when sleepy) ---- */}
      {(resolved === "study" || resolved === "sleepy") && (
        <g transform={resolved === "sleepy" ? "rotate(14 100 30)" : undefined}>
          {/* tassel */}
          <path d="M142 30 L154 56" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="155" cy="62" rx="5" ry="8" fill="#fbbf24" />
          {/* mortarboard */}
          <polygon points="100,4 166,28 100,52 34,28" fill="#0b1f3b" />
          <polygon points="100,4 166,28 100,52 34,28" fill="none" stroke="#1e3a5f" strokeWidth="2" />
          {/* head band */}
          <path d="M56 40 Q100 24 144 40 L144 52 Q100 36 56 52 Z" fill="#13294b" />
        </g>
      )}

      {/* ---- gaming headphones ---- */}
      {resolved === "gaming" && (
        <g>
          <path d="M36 78 Q100 6 164 78" fill="none" stroke="#10b981" strokeWidth="9" strokeLinecap="round" />
          <rect x="26" y="70" width="20" height="34" rx="9" fill="#10b981" />
          <rect x="154" y="70" width="20" height="34" rx="9" fill="#10b981" />
          <circle cx="36" cy="87" r="6" fill="#0b1f3b" />
          <circle cx="164" cy="87" r="6" fill="#0b1f3b" />
        </g>
      )}

      {/* ---- thinking "?" bubble ---- */}
      {resolved === "thinking" && (
        <g>
          <circle cx="164" cy="34" r="20" fill="#10b981" />
          <path d="M156 48 L148 62 L164 52 Z" fill="#10b981" />
          <text x="164" y="42" fontSize="26" fontWeight="bold" fill="#ffffff" textAnchor="middle">
            ?
          </text>
        </g>
      )}

      {/* ---- celebrate confetti ---- */}
      {resolved === "celebrate" && (
        <g aria-hidden>
          <circle cx="22" cy="34" r="4" fill="#fbbf24" />
          <circle cx="40" cy="16" r="3" fill="#10b981" />
          <circle cx="178" cy="30" r="4" fill="#f59e0b" />
          <circle cx="162" cy="12" r="3" fill="#10b981" />
          <circle cx="188" cy="56" r="3" fill="#fbbf24" />
          <circle cx="14" cy="60" r="3" fill="#f59e0b" />
          <rect x="30" y="44" width="7" height="7" rx="1.5" fill="#10b981" transform="rotate(24 33 47)" />
          <rect x="164" y="44" width="7" height="7" rx="1.5" fill="#fbbf24" transform="rotate(-20 167 47)" />
        </g>
      )}

      {/* ---- happy / celebrate sparkles ---- */}
      {(resolved === "happy" || resolved === "celebrate") && (
        <g fill="#fbbf24" aria-hidden>
          <path d="M24 84 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 Z" />
          <path d="M178 92 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" />
          {resolved === "celebrate" && (
            <path d="M100 6 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" />
          )}
        </g>
      )}

      {/* ---- wings (raised for celebrate) ---- */}
      {resolved === "celebrate" ? (
        <>
          <ellipse cx="22" cy="108" rx="15" ry="40" fill="#13294b" transform="rotate(38 22 108)" />
          <ellipse cx="178" cy="108" rx="15" ry="40" fill="#13294b" transform="rotate(-38 178 108)" />
        </>
      ) : (
        <>
          <ellipse cx="34" cy="140" rx="17" ry="44" fill="#13294b" transform="rotate(10 34 140)" />
          <ellipse cx="166" cy="140" rx="17" ry="44" fill="#13294b" transform="rotate(-10 166 140)" />
        </>
      )}

      {/* ---- body ---- */}
      <ellipse cx="100" cy="132" rx="72" ry="80" fill={`url(#${bodyGrad})`} />
      {/* belly (hidden behind the book in study mood) */}
      {resolved !== "study" && (
        <ellipse cx="100" cy="160" rx="44" ry="48" fill="#f8fafc" opacity="0.96" />
      )}

      {/* ---- cream face ---- */}
      <path
        d="M100 58 C66 58 40 78 40 106 C40 132 66 152 100 152 C134 152 160 132 160 106 C160 78 134 58 100 58 Z"
        fill={`url(#${faceGrad})`}
      />

      {/* ---- thinking wing on chin ---- */}
      {resolved === "thinking" && (
        <ellipse cx="132" cy="150" rx="16" ry="22" fill="#13294b" transform="rotate(-24 132 150)" />
      )}

      {/* ---- cheeks ---- */}
      <circle cx="56" cy="136" r="9" fill={cheekColor} opacity={cheekOpacity} />
      <circle cx="144" cy="136" r="9" fill={cheekColor} opacity={cheekOpacity} />

      {/* ---- eyes ---- */}
      <motion.g
        animate={{ scaleY: eyeScaleY }}
        transition={{ duration: blink ? 0.09 : 0.25 }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
      >
        {/* left eye */}
        <ellipse cx="76" cy="106" rx="24" ry="27" fill="#ffffff" />
        <circle cx="76" cy="108" r="15" fill="#f59e0b" />
        <circle cx="76" cy="108" r="9.5" fill="#0b1f3b" />
        <circle cx="80" cy="103" r="3.4" fill="#ffffff" />
        {/* right eye — a wink arc when happy */}
        {resolved === "happy" ? (
          <path d="M112 106 Q124 118 136 106" fill="none" stroke="#0b1f3b" strokeWidth="4" strokeLinecap="round" />
        ) : (
          <>
            <ellipse cx="124" cy="106" rx="24" ry="27" fill="#ffffff" />
            <circle cx="124" cy="108" r="15" fill="#f59e0b" />
            <circle cx="124" cy="108" r="9.5" fill="#0b1f3b" />
            <circle cx="128" cy="103" r="3.4" fill="#ffffff" />
          </>
        )}
      </motion.g>

      {/* ---- angry brows ---- */}
      {resolved === "angry" && (
        <g stroke="#0b1f3b" strokeWidth="5" strokeLinecap="round">
          <path d="M54 78 L94 90" />
          <path d="M146 78 L106 90" />
        </g>
      )}

      {/* ---- sleepy lids ---- */}
      {resolved === "sleepy" && (
        <g fill="#0b1f3b" opacity="0.9">
          <path d="M52 100 Q76 88 100 100 L100 94 L52 94 Z" />
          <path d="M100 100 Q124 88 148 100 L148 94 L100 94 Z" />
        </g>
      )}

      {/* ---- beak ---- */}
      <path d="M89 136 L111 136 L100 152 Z" fill="#f59e0b" />
      <path d="M93 136 L107 136 L100 144 Z" fill="#fbbf24" />

      {/* ---- study book: German-flag stripes (black / red / gold) ---- */}
      {resolved === "study" && (
        <g>
          <g clipPath={`url(#${bookClip})`}>
            <rect x="52" y="160" width="96" height="14" fill="#111111" />
            <rect x="52" y="174" width="96" height="14" fill="#dd0000" />
            <rect x="52" y="188" width="96" height="24" fill="#ffce00" />
            <path d="M52 162 L100 174 L148 162" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
          </g>
          <path
            d="M52 162 L100 174 L148 162 L148 200 L100 212 L52 200 Z"
            fill="none"
            stroke="#0b1f3b"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M100 174 L100 212" stroke="#0b1f3b" strokeWidth="2.5" />
        </g>
      )}

      {/* ---- gaming controller ---- */}
      {resolved === "gaming" && (
        <g>
          <rect x="72" y="182" width="56" height="26" rx="13" fill="#0b1f3b" stroke="#10b981" strokeWidth="2" />
          <circle cx="88" cy="195" r="4" fill="#fbbf24" />
          <circle cx="100" cy="195" r="4" fill="#f59e0b" />
          <circle cx="114" cy="192" r="2.5" fill="#ffffff" />
          <circle cx="120" cy="198" r="2.5" fill="#ffffff" />
        </g>
      )}

      {/* ---- feet ---- */}
      <ellipse cx="74" cy="214" rx="14" ry="8" fill="#f59e0b" />
      <ellipse cx="126" cy="214" rx="14" ry="8" fill="#f59e0b" />

      {/* ---- sleepy Z's ---- */}
      {resolved === "sleepy" &&
        (animated ? (
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
        ) : (
          <text x="160" y="48" fontSize="22" fontWeight="bold" fill="#94a3b8">
            Z z z
          </text>
        ))}
    </motion.svg>
  );
}
