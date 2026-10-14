"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { words } from "@/data/words";
import { lessons } from "@/data/lessons";
import { getFullProgress, type ProgressState } from "@/lib/progress";
import ProgressRing from "@/components/ProgressRing";
import CountUp from "@/components/CountUp";
import Flashcard from "@/components/Flashcard";

function dayKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Guten Morgen! ☀️";
  if (h < 18) return "Guten Tag! 🌤️";
  return "Guten Abend! 🌙";
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

export default function Dashboard() {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [wordOfDay, setWordOfDay] = useState<(typeof words)[number] | null>(null);

  useEffect(() => {
    setProgress(getFullProgress());
    setWordOfDay(words[hashStr(dayKey()) % words.length]);
  }, []);

  const nextLesson = progress
    ? lessons.find((l) => !progress.lessonsDone.includes(l.id)) ?? null
    : null;
  const knownCount = progress?.knownWords.length ?? 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-5">
      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <p className="font-bangla text-sm font-semibold text-emerald-500">স্বাগতম! আজ শিখতে প্রস্তুত?</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-emerald-950">{greeting()}</h1>
        </div>
        <motion.div
          animate={{ scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-4xl"
          aria-label="streak"
        >
          🔥
        </motion.div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <div className="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-emerald-100">
          <p className="text-2xl font-extrabold text-emerald-700">
            {progress ? <CountUp value={progress.streak} /> : "–"}
          </p>
          <p className="font-bangla text-xs font-semibold text-slate-500">দিনের স্ট্রিক</p>
        </div>
        <div className="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-emerald-100">
          <p className="text-2xl font-extrabold text-teal-700">
            {progress ? <CountUp value={progress.xp} /> : "–"}
          </p>
          <p className="font-bangla text-xs font-semibold text-slate-500">মোট XP</p>
        </div>
        <div className="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-emerald-100">
          <p className="text-2xl font-extrabold text-emerald-600">
            {progress ? <CountUp value={knownCount} /> : "–"}
          </p>
          <p className="font-bangla text-xs font-semibold text-slate-500">জানা শব্দ</p>
        </div>
      </motion.div>

      {/* Continue learning */}
      {nextLesson && (
        <motion.div variants={item}>
          <Link
            href={`/lektionen/${nextLesson.id}`}
            className="group flex items-center gap-4 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-xl shadow-emerald-200"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl font-extrabold">
              {nextLesson.id}
            </span>
            <span className="flex-1">
              <span className="font-bangla text-xs font-semibold uppercase tracking-widest text-emerald-200">
                চালিয়ে যাও
              </span>
              <span className="block text-lg font-extrabold leading-tight">
                Lektion {nextLesson.id}: {nextLesson.title}
              </span>
              <span className="font-bangla block text-sm text-emerald-200">{nextLesson.titleBangla}</span>
            </span>
            <motion.span
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="text-2xl"
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      )}

      {/* Word of the day */}
      <motion.div variants={item} className="flex flex-col gap-2">
        <h2 className="font-bangla text-lg font-extrabold text-emerald-950">
          📅 আজকের শব্দ <span className="text-sm font-semibold text-slate-400">— ট্যাপ করে উল্টাও</span>
        </h2>
        {wordOfDay ? (
          <Flashcard word={wordOfDay} compact />
        ) : (
          <div className="h-44 animate-pulse rounded-3xl bg-emerald-50" />
        )}
      </motion.div>

      {/* Lessons grid */}
      <motion.div variants={item} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bangla text-lg font-extrabold text-emerald-950">📖 পাঠসমূহ</h2>
          <Link href="/lektionen" className="font-bangla text-sm font-bold text-emerald-600">
            সবগুলো →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {lessons.map((l) => {
            const done = progress?.lessonsDone.includes(l.id) ?? false;
            return (
              <Link
                key={l.id}
                href={`/lektionen/${l.id}`}
                className={`flex flex-col items-center gap-1 rounded-3xl p-4 text-center shadow-sm ring-1 transition active:scale-95 ${
                  done ? "bg-emerald-50 ring-emerald-200" : "bg-white ring-emerald-100"
                }`}
              >
                <ProgressRing value={done ? 1 : 0} size={44} stroke={5} label={done ? "✓" : `${l.id}`} />
                <p className="text-xs font-bold leading-tight text-emerald-950">{l.title}</p>
                <p className="font-bangla text-[11px] leading-tight text-slate-500">{l.titleBangla}</p>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <Link
          href="/quiz"
          className="rounded-3xl bg-amber-400 p-5 text-center shadow-md shadow-amber-200 transition active:scale-95"
        >
          <p className="text-3xl">✍️</p>
          <p className="font-bangla mt-1 font-extrabold text-amber-950">কুইজ খেলো</p>
        </Link>
        <Link
          href="/wortschatz"
          className="rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-emerald-100 transition active:scale-95"
        >
          <p className="text-3xl">🃏</p>
          <p className="font-bangla mt-1 font-extrabold text-emerald-950">শব্দভাণ্ডার</p>
        </Link>
        <Link
          href="/resources"
          className="rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-emerald-100 transition active:scale-95"
        >
          <p className="text-3xl">🌐</p>
          <p className="font-bangla mt-1 font-extrabold text-emerald-950">রিসোর্স</p>
        </Link>
        <Link
          href="/blog"
          className="rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-emerald-100 transition active:scale-95"
        >
          <p className="text-3xl">✍️</p>
          <p className="font-bangla mt-1 font-extrabold text-emerald-950">ব্লগ</p>
        </Link>
      </motion.div>
    </motion.div>
  );
}
