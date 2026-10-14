"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { words, categories } from "@/data/words";
import { lessons } from "@/data/lessons";
import { getFullProgress, type ProgressState } from "@/lib/progress";
import { BarChart3, BookOpen, CalendarDays, Flame, Folders, Sprout } from "lucide-react";
import ProgressRing from "@/components/ProgressRing";
import CountUp from "@/components/CountUp";
import EmptyState from "@/components/EmptyState";

const LEVEL_XP = 200;

function dayKey(offsetDays = 0): string {
  const d = new Date(Date.now() - offsetDays * 86_400_000);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function weekdayBn(offsetDays: number): string {
  const names = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
  return names[new Date(Date.now() - offsetDays * 86_400_000).getDay()];
}

export default function FortschrittPage() {
  const [progress, setProgress] = useState<ProgressState | null>(null);

  useEffect(() => {
    setProgress(getFullProgress());
  }, []);

  const mastery = useMemo(() => {
    if (!progress) return [];
    return categories.map((c) => {
      const total = words.filter((w) => w.category === c.id).length;
      const known = words.filter(
        (w) => w.category === c.id && progress.knownWords.includes(w.id)
      ).length;
      return { ...c, total, known, pct: total ? known / total : 0 };
    });
  }, [progress]);

  if (!progress) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-40 animate-pulse rounded-3xl bg-emerald-50" />
        <div className="h-24 animate-pulse rounded-3xl bg-emerald-50" />
      </div>
    );
  }

  const level = Math.floor(progress.xp / LEVEL_XP) + 1;
  const levelPct = (progress.xp % LEVEL_XP) / LEVEL_XP;
  const hasAny = progress.xp > 0 || progress.lessonsDone.length > 0 || progress.knownWords.length > 0;

  const week = Array.from({ length: 7 }, (_, i) => 6 - i).map((off) => ({
    key: dayKey(off),
    label: weekdayBn(off),
    xp: progress.activity[dayKey(off)] ?? 0,
  }));
  const maxXp = Math.max(1, ...week.map((d) => d.xp));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-bangla text-sm font-semibold text-emerald-500">তোমার অগ্রগতি</p>
        <h1 className="inline-flex items-center gap-2 text-3xl font-extrabold tracking-tight text-emerald-950">
          <BarChart3 className="h-7 w-7 text-emerald-600" aria-hidden /> Fortschritt
        </h1>
      </div>

      {!hasAny ? (
        <EmptyState
          Icon={Sprout}
          title="এখনো শুরু করোনি"
          message="একটা পাঠ পড়ো বা কুইজ খেলো — তোমার XP, স্ট্রিক আর অগ্রগতি এখানে দেখা যাবে।"
        />
      ) : (
        <>
          {/* Level hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-xl shadow-emerald-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bangla text-xs font-semibold uppercase tracking-widest text-emerald-200">
                  লেভেল {level}
                </p>
                <p className="text-4xl font-extrabold">
                  <CountUp value={progress.xp} /> <span className="text-xl text-emerald-200">XP</span>
                </p>
              </div>
              <motion.span
                animate={{ scale: [1, 1.2, 1], rotate: [0, -8, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15"
              >
                <Flame className="h-11 w-11 text-amber-400" aria-hidden />
              </motion.span>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/20">
              <motion.div
                className="h-full rounded-full bg-amber-400"
                initial={{ width: 0 }}
                animate={{ width: `${levelPct * 100}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
              />
            </div>
            <p className="font-bangla mt-2 text-xs text-emerald-200">
              পরের লেভেলে {LEVEL_XP - (progress.xp % LEVEL_XP)} XP বাকি
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-emerald-100">
              <p className="text-2xl font-extrabold text-emerald-700">
                <CountUp value={progress.streak} />
              </p>
              <p className="font-bangla text-xs font-semibold text-slate-500">দিনের স্ট্রিক</p>
            </div>
            <div className="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-emerald-100">
              <p className="text-2xl font-extrabold text-emerald-600">
                <CountUp value={progress.knownWords.length} />
              </p>
              <p className="font-bangla text-xs font-semibold text-slate-500">জানা শব্দ</p>
            </div>
            <div className="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-emerald-100">
              <p className="text-2xl font-extrabold text-teal-700">
                <CountUp value={progress.lessonsDone.length} />
              </p>
              <p className="font-bangla text-xs font-semibold text-slate-500">শেষ পাঠ</p>
            </div>
          </div>

          {/* Weekly activity */}
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-emerald-100">
            <h2 className="font-bangla inline-flex items-center gap-2 text-lg font-extrabold text-emerald-950">
              <CalendarDays className="h-5 w-5 text-emerald-600" aria-hidden /> সাপ্তাহিক অ্যাক্টিভিটি
            </h2>
            <div className="mt-4 flex items-end justify-between gap-2">
              {week.map((d) => (
                <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                  <motion.div
                    className={`w-full rounded-t-xl ${d.xp > 0 ? "bg-gradient-to-t from-emerald-500 to-teal-400" : "bg-emerald-50"}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(8, (d.xp / maxXp) * 90)}px` }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    title={`${d.xp} XP`}
                  />
                  <span className="font-bangla text-[11px] font-semibold text-slate-500">{d.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Category mastery */}
          <section className="flex flex-col gap-3">
            <h2 className="font-bangla inline-flex items-center gap-2 text-lg font-extrabold text-emerald-950">
              <Folders className="h-5 w-5 text-emerald-600" aria-hidden /> বিভাগভিত্তিক দক্ষতা
            </h2>
            {mastery.map((m) => (
              <div key={m.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-emerald-950">
                    {m.german} <span className="font-bangla font-semibold text-slate-400">· {m.bangla}</span>
                  </p>
                  <p className="text-xs font-bold text-slate-500">
                    {m.known}/{m.total}
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-50">
                  <motion.div
                    className={`h-full rounded-full ${m.pct === 1 ? "bg-emerald-500" : "bg-gradient-to-r from-emerald-500 to-teal-500"}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${m.pct * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 90, damping: 20 }}
                  />
                </div>
              </div>
            ))}
          </section>

          {/* Lessons checklist */}
          <section className="flex flex-col gap-3">
            <h2 className="font-bangla inline-flex items-center gap-2 text-lg font-extrabold text-emerald-950">
              <BookOpen className="h-5 w-5 text-emerald-600" aria-hidden /> পাঠের অগ্রগতি
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {lessons.map((l) => {
                const done = progress.lessonsDone.includes(l.id);
                return (
                  <Link
                    key={l.id}
                    href={`/lektionen/${l.id}`}
                    className={`flex flex-col items-center gap-1 rounded-3xl p-3 text-center shadow-sm ring-1 transition active:scale-95 ${
                      done ? "bg-emerald-50 ring-emerald-200" : "bg-white ring-emerald-100"
                    }`}
                  >
                    <ProgressRing value={done ? 1 : 0} size={40} stroke={5} label={done ? "✓" : `${l.id}`} />
                    <p className="text-[11px] font-bold leading-tight text-emerald-950">{l.title}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
