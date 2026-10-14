"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "framer-motion";
import { Check, X, MousePointerClick } from "lucide-react";
import SpeakButton from "@/components/SpeakButton";
import Mascot from "@/components/Mascot";

interface FlashcardWord {
  id: string | number;
  german: string;
  bangla: string;
  example: string;
  exampleBangla: string;
  pos?: string;
}

interface FlashcardProps {
  word: FlashcardWord;
  /** Controlled flip state. If omitted, the card manages its own flip. */
  flipped?: boolean;
  /** Fired after a swipe past the threshold (deferred ~120ms so the exit animation can start). */
  onSwipe?: (known: boolean) => void;
  onFlip?: () => void;
  compact?: boolean;
}

const posColors: Record<string, string> = {
  noun: "bg-navy/10 text-navy",
  verb: "bg-rose-100 text-rose-800",
  adjective: "bg-sun/25 text-navy",
  adverb: "bg-teal/10 text-teal",
  phrase: "bg-teal/15 text-navy",
};

const SWIPE_THRESHOLD = 100;

/**
 * Personality flourishes on swipe judgement (study mode only — compact cards
 * without onSwipe keep their plain behavior):
 * - "known" (swipe right): happy springy wiggle, then the card flies
 *   up-right toward the XP with a shrink flourish.
 * - "unknown" (swipe left): gentle shake, the card flips to reveal the
 *   answer, and a sympathetic angry Mascot pops in nearby.
 */
type FeedbackFx = "known" | "unknown" | null;

export default function Flashcard({ word, flipped, onSwipe, onFlip, compact }: FlashcardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [exitDir, setExitDir] = useState<0 | 1 | -1>(0);
  const [fx, setFx] = useState<FeedbackFx>(null);
  const reduce = useReducedMotion();
  const swipeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const controlled = flipped !== undefined;
  const isFlipped = controlled ? flipped : internalFlipped;

  // Reset flip/exit/personality state whenever the card changes
  useEffect(() => {
    setInternalFlipped(false);
    setExitDir(0);
    setFx(null);
  }, [word.id]);

  useEffect(
    () => () => {
      if (swipeTimer.current) clearTimeout(swipeTimer.current);
    },
    []
  );

  const x = useMotionValue(0);
  const knownOpacity = useTransform(x, [40, SWIPE_THRESHOLD + 20], [0, 1]);
  const unknownOpacity = useTransform(x, [-(SWIPE_THRESHOLD + 20), -40], [1, 0]);

  const handleTap = () => {
    if (fx) return; // personality moment in progress
    if (!controlled) setInternalFlipped((f) => !f);
    onFlip?.();
  };

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    if (fx || !onSwipe) return;
    const offset = info.offset.x;
    if (offset > SWIPE_THRESHOLD) {
      // Known! Happy wiggle, then fly toward the XP.
      setFx("known");
      setExitDir(1);
      swipeTimer.current = setTimeout(() => onSwipe(true), reduce ? 250 : 620);
    } else if (offset < -SWIPE_THRESHOLD) {
      // Unknown. Gentle shake + flip to reveal the answer + sad mascot.
      setFx("unknown");
      setExitDir(-1);
      if (!controlled) setInternalFlipped(true);
      swipeTimer.current = setTimeout(() => onSwipe(false), reduce ? 600 : 1700);
    }
  };

  const personalityAnimate = !reduce
    ? fx === "known"
      ? {
          rotate: [0, -10, 8, -5, 0],
          scale: [1, 1.07, 0.99, 1.04, 1],
          transition: { duration: 0.55, ease: "easeInOut" as const },
        }
      : fx === "unknown"
        ? { x: [0, -16, 13, -9, 6, 0], transition: { duration: 0.55, ease: "easeInOut" as const } }
        : undefined
    : undefined;

  const exitAnim =
    exitDir === 1
      ? reduce
        ? { x: 60, opacity: 0, transition: { duration: 0.2 } }
        : // happy flourish: the card hops toward the XP, shrinking away
          {
            x: 170,
            y: -340,
            scale: 0.45,
            rotate: 14,
            opacity: 0,
            transition: { duration: 0.45, ease: "easeIn" as const },
          }
      : { x: exitDir * 420, opacity: 0, transition: { duration: 0.25, ease: "easeIn" as const } };

  return (
    <motion.div
      drag={fx === null ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={exitAnim}
      style={{ x }}
      className="relative cursor-grab select-none active:cursor-grabbing"
      role="button"
      tabIndex={0}
      aria-label={isFlipped ? "Show German word" : "Reveal Bangla meaning"}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleTap();
        }
      }}
    >
      {/* Angry-mascot comfort overlay for a missed word */}
      {fx === "unknown" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 0.25, type: "spring", stiffness: 300, damping: 18 }}
          className="absolute -top-9 right-1 z-20 flex items-end gap-1.5"
          aria-hidden
        >
          <span className="font-bangla max-w-40 rounded-2xl rounded-br-sm bg-cream px-3 py-2 text-xs font-bold text-navy shadow-md ring-1 ring-teal/20">
            ভুল হতেই পারে — উত্তরটা দেখে নাও!
          </span>
          <Mascot mood="angry" size={52} />
        </motion.div>
      )}

      {/* Happy-mascot cheer overlay for a known word */}
      {fx === "known" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 0.15, type: "spring", stiffness: 300, damping: 18 }}
          className="absolute -top-9 left-1 z-20 flex items-end gap-1.5"
          aria-hidden
        >
          <Mascot mood="happy" size={52} />
          <span className="font-bangla max-w-40 rounded-2xl rounded-bl-sm bg-cream px-3 py-2 text-xs font-bold text-navy shadow-md ring-1 ring-teal/20">
            দারুণ! এই শব্দটা তোমার পকেটে!
          </span>
        </motion.div>
      )}

      {/* Swipe overlays */}
      <motion.div
        style={{ opacity: knownOpacity }}
        className="pointer-events-none absolute inset-0 z-10 flex items-start justify-start p-5"
        aria-hidden
      >
        <span className="font-bangla inline-flex items-center gap-2 rounded-2xl bg-teal px-4 py-2 text-lg font-extrabold text-white shadow-lg">
          জানি <Check className="h-5 w-5" strokeWidth={3} aria-hidden />
        </span>
      </motion.div>
      <motion.div
        style={{ opacity: unknownOpacity }}
        className="pointer-events-none absolute inset-0 z-10 flex items-start justify-end p-5"
        aria-hidden
      >
        <span className="font-bangla inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-2 text-lg font-extrabold text-white shadow-lg">
          জানি না <X className="h-5 w-5" strokeWidth={3} aria-hidden />
        </span>
      </motion.div>

      {/* Personality wrapper (happy wiggle / gentle shake) */}
      <motion.div animate={personalityAnimate}>
      {/* Flipping card */}
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className={`relative ${compact ? "h-56" : "h-72 sm:h-80"} [transform-style:preserve-3d]`}
      >
        {/* Front: German word */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl bg-gradient-to-br from-navy to-teal p-6 text-cream shadow-xl shadow-navy/25 [backface-visibility:hidden]">
          {word.pos && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                posColors[word.pos] ?? "bg-white/20 text-white"
              }`}
            >
              {word.pos}
            </span>
          )}
          <p className="font-heading text-center text-4xl font-extrabold tracking-tight sm:text-5xl">{word.german}</p>
          <SpeakButton text={word.german} dark />
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-cream/70">
            <MousePointerClick className="h-4 w-4" aria-hidden /> Tap to reveal meaning
          </p>
        </div>

        {/* Back: Bangla meaning + example */}
        <div className="card absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-cream p-6 text-center shadow-xl shadow-navy/10 ring-1 ring-teal/20 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="font-bangla text-4xl font-extrabold text-navy sm:text-5xl">{word.bangla}</p>
          <div className="mt-2 w-full rounded-2xl bg-white p-4 ring-1 ring-teal/10">
            <div className="flex items-start justify-between gap-2">
              <p className="font-body text-base font-semibold text-navy">{word.example}</p>
              <SpeakButton text={word.example} className="h-7 w-7" />
            </div>
            <p className="font-bangla mt-1 text-sm text-navy/60">{word.exampleBangla}</p>
          </div>
        </div>
      </motion.div>
      </motion.div>
    </motion.div>
  );
}
