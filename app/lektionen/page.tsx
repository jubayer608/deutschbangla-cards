"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { lessons } from "@/data/lessons";
import {
  blockingLessonId,
  getExamBest,
  getFullProgress,
  isLessonUnlocked,
  type ProgressState,
} from "@/lib/progress";
import { ArrowRight, BookOpen, Check, Lock, Play, Sparkles } from "lucide-react";
import ProgressRing from "@/components/ProgressRing";
import EmptyState from "@/components/EmptyState";

/**
 * Lesson list — sequential path. Lesson 1 is always open; lesson N+1
 * unlocks only when lesson N is done (exam passed). Locked lessons are
 * NOT hidden: title + topics stay visible so users see the road ahead,
 * and the card links to the lock screen on the lesson page.
 */
export default function LektionenPage() {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [examBest, setExamBest] = useState<Record<number, number>>({});

  useEffect(() => {
    setProgress(getFullProgress());
    const best: Record<number, number> = {};
    for (const l of lessons) {
      const b = getExamBest(l.id);
      if (b !== null) best[l.id] = b;
    }
    setExamBest(best);
  }, []);

  const doneCount = progress?.lessonsDone.length ?? 0;
  const lessonsDone = progress?.lessonsDone ?? [];
  // "Current" lesson = first unlocked lesson that is not done yet. It gets
  // the direct "Exam dao" entry point.
  const currentId = lessons.find(
    (l) => isLessonUnlocked(l.id, lessonsDone) && !lessonsDone.includes(l.id),
  )?.id;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-bangla text-sm font-semibold text-teal">A1 কারিকুলাম</p>
          <h1 className="section-heading inline-flex items-center gap-2 text-3xl">
            <BookOpen className="h-7 w-7 text-teal" aria-hidden /> Lektionen
          </h1>
        </div>
        {progress && (
          <div className="flex items-center gap-2">
            <ProgressRing value={doneCount / lessons.length} size={52} stroke={6} label={`${doneCount}/${lessons.length}`} />
          </div>
        )}
      </div>

      {lessons.length === 0 ? (
        <EmptyState Icon={BookOpen} title="কোনো পাঠ নেই" message="শীঘ্রই পাঠ যোগ করা হবে।" />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="flex flex-col gap-3"
        >
          {lessons.map((l) => {
            const done = lessonsDone.includes(l.id);
            const unlocked = isLessonUnlocked(l.id, lessonsDone);
            const blocking = blockingLessonId(l.id, lessonsDone);
            const isCurrent = l.id === currentId;
            const best = examBest[l.id];
            return (
              <motion.div
                key={l.id}
                variants={{
                  hidden: { opacity: 0, x: -18 },
                  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
                }}
              >
                <div
                  className={`card card-hover rounded-3xl p-4 transition ${
                    done
                      ? "ring-teal/40"
                      : isCurrent
                        ? "ring-teal/60"
                        : !unlocked
                          ? "opacity-75 ring-slate-200"
                          : "ring-slate-200 hover:ring-teal/40"
                  }`}
                >
                  <Link
                    href={`/lektionen/${l.id}`}
                    className="flex items-center gap-4 active:scale-[0.98]"
                    aria-label={
                      done
                        ? `Lektion ${l.id}: ${l.title} — শেষ`
                        : !unlocked
                          ? `Lektion ${l.id}: ${l.title} — লক করা`
                          : `Lektion ${l.id}: ${l.title}`
                    }
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold ${
                        done
                          ? "bg-teal text-white"
                          : !unlocked
                            ? "bg-cream text-mist"
                            : "bg-gradient-to-br from-navy to-teal text-white"
                      }`}
                    >
                      {done ? (
                        <Check className="h-6 w-6" strokeWidth={3} aria-hidden />
                      ) : !unlocked ? (
                        <Lock className="h-5 w-5" aria-hidden />
                      ) : (
                        l.id
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block break-words font-extrabold text-navy">
                        Lektion {l.id}: {l.title}
                      </span>
                      <span className="font-bangla block text-sm text-slate-500">{l.titleBangla}</span>
                      <span className="font-bangla mt-1 block text-xs text-mist">
                        {l.vocabIds.length} শব্দ · {l.uebungen.length} অনুশীলন · ১০ প্রশ্নের Exam
                      </span>
                      {best !== undefined && (
                        <span className="font-bangla mt-1 block text-xs font-bold text-teal">
                          Exam সেরা স্কোর: {best}/10
                        </span>
                      )}
                      {!unlocked && blocking !== null && (
                        <span className="font-bangla mt-1 flex items-center gap-1 text-xs font-bold text-navy">
                          <Lock className="h-3.5 w-3.5" aria-hidden /> Age Lesson {blocking} shesh koro
                        </span>
                      )}
                      {isCurrent && (
                        <span className="font-bangla mt-1 flex items-center gap-1 text-xs font-bold text-teal">
                          <Sparkles className="h-3.5 w-3.5" aria-hidden /> এখন এই পাঠটা চলছে
                        </span>
                      )}
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-mist" aria-hidden />
                  </Link>
                  {isCurrent && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <Link
                        href={`/lektionen/${l.id}#exam`}
                        className="btn btn-primary inline-flex items-center gap-1.5 rounded-full px-5 py-3 text-sm"
                      >
                        <Play className="h-4 w-4" aria-hidden /> Exam dao
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
