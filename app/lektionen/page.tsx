"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { lessons } from "@/data/lessons";
import { getFullProgress, type ProgressState } from "@/lib/progress";
import { ArrowRight, BookOpen, Check } from "lucide-react";
import ProgressRing from "@/components/ProgressRing";
import EmptyState from "@/components/EmptyState";

export default function LektionenPage() {
  const [progress, setProgress] = useState<ProgressState | null>(null);

  useEffect(() => {
    setProgress(getFullProgress());
  }, []);

  const doneCount = progress?.lessonsDone.length ?? 0;

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
            const done = progress?.lessonsDone.includes(l.id) ?? false;
            return (
              <motion.div
                key={l.id}
                variants={{
                  hidden: { opacity: 0, x: -18 },
                  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
                }}
              >
                <Link
                  href={`/lektionen/${l.id}`}
                  className={`card card-hover flex items-center gap-4 rounded-3xl p-4 transition active:scale-[0.98] ${
                    done ? "bg-cream ring-teal/30" : "bg-white ring-slate-200 hover:ring-teal/40"
                  }`}
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold ${
                      done ? "bg-teal text-white" : "bg-gradient-to-br from-navy to-teal text-white"
                    }`}
                  >
                    {done ? <Check className="h-6 w-6" strokeWidth={3} aria-hidden /> : l.id}
                  </span>
                  <span className="flex-1">
                    <span className="block font-extrabold text-navy">
                      Lektion {l.id}: {l.title}
                    </span>
                    <span className="font-bangla block text-sm text-slate-500">{l.titleBangla}</span>
                    <span className="font-bangla mt-1 block text-xs text-mist">
                      {l.vocabIds.length} শব্দ · {l.uebungen.length} অনুশীলন
                    </span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-mist" aria-hidden />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
