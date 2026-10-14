"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Check, X, MousePointerClick } from "lucide-react";
import SpeakButton from "@/components/SpeakButton";

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
  noun: "bg-sky-100 text-sky-800",
  verb: "bg-rose-100 text-rose-800",
  adjective: "bg-amber-100 text-amber-800",
  adverb: "bg-teal-100 text-teal-800",
  phrase: "bg-emerald-100 text-emerald-800",
};

const SWIPE_THRESHOLD = 100;

export default function Flashcard({ word, flipped, onSwipe, onFlip, compact }: FlashcardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [exitDir, setExitDir] = useState<0 | 1 | -1>(0);
  const swipeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const controlled = flipped !== undefined;
  const isFlipped = controlled ? flipped : internalFlipped;

  // Reset flip/exit state whenever the card changes
  useEffect(() => {
    setInternalFlipped(false);
    setExitDir(0);
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
    if (!controlled) setInternalFlipped((f) => !f);
    onFlip?.();
  };

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    const offset = info.offset.x;
    if (offset > SWIPE_THRESHOLD) {
      setExitDir(1);
      swipeTimer.current = setTimeout(() => onSwipe?.(true), 120);
    } else if (offset < -SWIPE_THRESHOLD) {
      setExitDir(-1);
      swipeTimer.current = setTimeout(() => onSwipe?.(false), 120);
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ x: exitDir * 420, opacity: 0, transition: { duration: 0.25, ease: "easeIn" } }}
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
      {/* Swipe overlays */}
      <motion.div
        style={{ opacity: knownOpacity }}
        className="pointer-events-none absolute inset-0 z-10 flex items-start justify-start p-5"
        aria-hidden
      >
        <span className="font-bangla inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-lg font-extrabold text-white shadow-lg">
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

      {/* Flipping card */}
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className={`relative ${compact ? "h-56" : "h-72 sm:h-80"} [transform-style:preserve-3d]`}
      >
        {/* Front: German word */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-6 text-white shadow-xl shadow-emerald-200 [backface-visibility:hidden]">
          {word.pos && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                posColors[word.pos] ?? "bg-white/20 text-white"
              }`}
            >
              {word.pos}
            </span>
          )}
          <p className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl">{word.german}</p>
          <SpeakButton text={word.german} dark />
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-200">
            <MousePointerClick className="h-4 w-4" aria-hidden /> Tap to reveal meaning
          </p>
        </div>

        {/* Back: Bangla meaning + example */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-white p-6 text-center shadow-xl shadow-emerald-200 ring-1 ring-emerald-100 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="font-bangla text-4xl font-extrabold text-emerald-950 sm:text-5xl">{word.bangla}</p>
          <div className="mt-2 w-full rounded-2xl bg-emerald-50 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-base font-semibold text-slate-800">{word.example}</p>
              <SpeakButton text={word.example} className="h-7 w-7" />
            </div>
            <p className="font-bangla mt-1 text-sm text-slate-600">{word.exampleBangla}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
