"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Eye,
  Frown,
  Laugh,
  RotateCcw,
  Smile,
  Sparkles,
} from "lucide-react";
import Mascot from "@/components/Mascot";
import SpeakButton from "@/components/SpeakButton";
import { categories } from "@/data/words";
import type { ReviewQueueItem } from "@/lib/review";

// Phase 5 — SM-2 review session (client).
// One flashcard at a time: German word → "উত্তর দেখাও" reveals the
// Bangla meaning + example → one of 4 grades (Abar/Kothin/Bhalo/Shohoj)
// POSTs to /api/review and advances. When the queue empties: celebration.

interface GradeButton {
  label: string;
  hint: string;
  quality: number;
  Icon: typeof RotateCcw;
  className: string;
}

const GRADES: GradeButton[] = [
  { label: "আবার", hint: "মনে নেই — কালকে আবার", quality: 1, Icon: RotateCcw, className: "bg-rose-500 hover:bg-rose-600" },
  { label: "কঠিন", hint: "মনে আছে, কিন্তু কষ্টে", quality: 3, Icon: Frown, className: "bg-sun hover:bg-[#E5A91C] text-navy" },
  { label: "ভালো", hint: "মনে আছে, ঠিকঠাক", quality: 4, Icon: Smile, className: "bg-teal hover:bg-[#0DA678]" },
  { label: "সহজ", hint: "একদম সহজ ছিল", quality: 5, Icon: Laugh, className: "bg-navy hover:bg-[#13294A]" },
];

function formatNextReview(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return "আজকেই আবার";
  if (sameDay(d, tomorrow)) return "আগামীকাল আবার";
  return `${d.toLocaleDateString("bn-BD", { day: "numeric", month: "long" })} আবার`;
}

export default function ReviewSession({
  queue,
  dueCount,
  newCount,
}: {
  queue: ReviewQueueItem[];
  dueCount: number;
  newCount: number;
}) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastNext, setLastNext] = useState<{ word: string; when: string } | null>(null);

  const total = queue.length;
  const done = index;
  const current = queue[index];
  const finished = index >= total;

  async function answer(quality: number) {
    if (!current || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: current.word.id, quality }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { state?: { nextReviewAt?: string } };
      setLastNext({
        word: current.word.german,
        when: data.state?.nextReviewAt ? formatNextReview(data.state.nextReviewAt) : "",
      });
      setIndex((i) => i + 1);
      setRevealed(false);
    } catch {
      setError("উত্তরটা সেভ হলো না — আবার চেষ্টা করো।");
    } finally {
      setSubmitting(false);
    }
  }

  if (total === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center">
        <Mascot mood="celebrate" size={96} />
        <h2 className="font-bangla text-xl font-extrabold text-navy">সব রিভিউ শেষ! 🎉</h2>
        <p className="font-bangla max-w-md text-sm text-mist">
          আজকের জন্য আর কোনো শব্দ বাকি নেই — SM-2 ঠিক সময়ে আবার মনে করিয়ে দেবে।
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/wortschatz"
            className="font-bangla inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0DA678]"
          >
            <BookOpen className="h-4 w-4" aria-hidden /> নতুন শব্দ শিখো
          </Link>
          <Link
            href="/lektionen"
            className="font-bangla inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#13294A]"
          >
            পাঠে যাও
          </Link>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="card flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center">
        <Mascot mood="celebrate" size={96} />
        <h2 className="font-bangla text-xl font-extrabold text-navy">
          আজকের {total}টা রিভিউ শেষ! 🎉
        </h2>
        <p className="font-bangla max-w-md text-sm text-mist">
          প্রতিটা শব্দ ঠিক সময়ে আবার আসবে — ভুলে যাওয়ার আগেই।
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/wortschatz"
            className="font-bangla inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0DA678]"
          >
            <BookOpen className="h-4 w-4" aria-hidden /> নতুন শব্দ শিখো
          </Link>
          <Link
            href="/lektionen"
            className="font-bangla inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#13294A]"
          >
            পাঠে যাও
          </Link>
        </div>
      </div>
    );
  }

  const category = categories.find((c) => c.id === current.word.category);
  const progressPct = Math.round((done / total) * 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div>
        <div className="font-bangla flex items-center justify-between text-xs font-semibold text-mist">
          <span>
            {done + 1} / {total} — বাকি {total - done - 1}টা
          </span>
          <span>
            {dueCount > 0 && `${dueCount}টা বকেয়া`}
            {dueCount > 0 && newCount > 0 && " · "}
            {newCount > 0 && `${newCount}টা নতুন শব্দ আছে`}
          </span>
        </div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            className="h-full rounded-full bg-teal"
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        {lastNext && (
          <p className="font-bangla mt-2 flex items-center gap-1 text-xs text-mist">
            <CheckCircle2 className="h-3.5 w-3.5 text-teal" aria-hidden />
            {lastNext.word} — {lastNext.when}
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.word.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="card rounded-3xl bg-white p-6 text-center md:p-8"
        >
          {current.isNew && (
            <span className="font-bangla mb-3 inline-flex items-center gap-1 rounded-full bg-teal/10 px-3 py-1 text-xs font-bold text-teal">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> নতুন শব্দ
            </span>
          )}
          {category && (
            <p className="font-bangla text-xs font-semibold text-mist">
              {category.german} · {category.bangla}
            </p>
          )}

          <div className="mt-2 flex items-center justify-center gap-3">
            <p className="text-4xl font-extrabold text-navy md:text-5xl">{current.word.german}</p>
            <SpeakButton text={current.word.german} />
          </div>
          <p className="mt-1 text-xs font-semibold tracking-wide text-mist uppercase">
            {current.word.pos}
          </p>

          {revealed ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 flex flex-col items-center gap-2"
            >
              <p className="font-bangla text-2xl font-extrabold text-teal">{current.word.bangla}</p>
              <p className="max-w-md text-sm text-navy italic">“{current.word.example}”</p>
              <p className="font-bangla max-w-md text-sm text-mist">{current.word.exampleBangla}</p>
            </motion.div>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="font-bangla mt-6 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-[#13294A]"
            >
              <Eye className="h-4 w-4" aria-hidden /> উত্তর দেখাও
            </button>
          )}

          {revealed && (
            <div className="mt-6">
              <p className="font-bangla mb-3 text-sm font-semibold text-mist">
                এই শব্দটা কেমন মনে হলো?
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {GRADES.map(({ label, hint, quality, Icon, className }) => (
                  <button
                    key={quality}
                    type="button"
                    disabled={submitting}
                    onClick={() => answer(quality)}
                    className={`font-bangla flex flex-col items-center gap-1 rounded-2xl px-3 py-3.5 text-sm font-bold text-white transition disabled:opacity-50 ${className}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                    {label}
                    <span className="text-[11px] font-medium opacity-80">{hint}</span>
                  </button>
                ))}
              </div>
              {error && <p className="font-bangla mt-3 text-sm font-semibold text-rose-500">{error}</p>}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
