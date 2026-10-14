"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { words, categories } from "@/data/words";
import { lessons } from "@/data/lessons";
import { getFullProgress, type ProgressState } from "@/lib/progress";
import { BarChart3, BookOpen, CalendarDays, Folders, Sprout } from "lucide-react";
import ProgressRing from "@/components/ProgressRing";
import CountUp from "@/components/CountUp";
import EmptyState from "@/components/EmptyState";
import { StreakFlame, SleepyStreakNotice } from "@/components/StreakIgnition";

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
        <div className="h-40 animate-pulse rounded-3xl bg-cream" />
        <div className="h-24 animate-pulse rounded-3xl bg-cream" />
      </div>
    );
  }

  const level = Math.floor(progress.xp / LEVEL_XP) + 1;
  const levelPct = (progress.xp % LEVEL_XP) / LEVEL_XP;
  const hasAny = progress.xp > 0 || progress.lessonsDone.length > 0 || progress.knownWords.length > 0;
  const todayActive = (progress.activity[dayKey(0)] ?? 0) > 0;
  const streakAtRisk = !todayActive && progress.streak > 0;

  const week = Array.from({ length: 7 }, (_, i) => 6 - i).map((off) => ({
    key: dayKey(off),
    label: weekdayBn(off),
    xp: progress.activity[dayKey(off)] ?? 0,
  }));
  const maxXp = Math.max(1, ...week.map((d) => d.xp));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-bangla text-sm font-semibold text-teal">তোমার অগ্রগতি</p>
        <h1 className="section-heading inline-flex items-center gap-2 text-3xl">
          <BarChart3 className="h-7 w-7 text-teal" aria-hidden /> Fortschritt
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
            className="rounded-3xl bg-navy p-6 text-white shadow-xl shadow-navy/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bangla text-xs font-semibold uppercase tracking-widest text-white/70">
                  লেভেল {level}
                </p>
                <p className="text-4xl font-extrabold">
                  <CountUp value={progress.xp} /> <span className="text-xl text-white/70">XP</span>
                </p>
              </div>
              <StreakFlame todayActive={todayActive} size={80} iconSize={44} />
            </div>
            <div className="progress-track mt-4 h-2.5 overflow-hidden rounded-full bg-white/20">
              <motion.div
                className="progress-fill h-full rounded-full bg-sun"
                initial={{ width: 0 }}
                animate={{ width: `${levelPct * 100}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
              />
            </div>
            <p className="font-bangla mt-2 text-xs text-white/70">
              পরের লেভেলে {LEVEL_XP - (progress.xp % LEVEL_XP)} XP বাকি
            </p>
          </motion.div>

          {/* Streak at risk: sleepy mascot nudge */}
          {streakAtRisk && <SleepyStreakNotice />}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card rounded-3xl p-4 text-center">
              <p className="text-2xl font-extrabold text-teal">
                <CountUp value={progress.streak} />
              </p>
              <p className="font-bangla text-xs font-semibold text-slate-500">দিনের স্ট্রিক</p>
            </div>
            <div className="card rounded-3xl p-4 text-center">
              <p className="text-2xl font-extrabold text-teal">
                <CountUp value={progress.knownWords.length} />
              </p>
              <p className="font-bangla text-xs font-semibold text-slate-500">জানা শব্দ</p>
            </div>
            <div className="card rounded-3xl p-4 text-center">
              <p className="text-2xl font-extrabold text-teal">
                <CountUp value={progress.lessonsDone.length} />
              </p>
              <p className="font-bangla text-xs font-semibold text-slate-500">শেষ পাঠ</p>
            </div>
          </div>

          {/* Weekly activity */}
          <section className="card rounded-3xl p-5">
            <h2 className="section-heading font-bangla inline-flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5 text-teal" aria-hidden /> সাপ্তাহিক অ্যাক্টিভিটি
            </h2>
            <div className="mt-4 flex items-end justify-between gap-2">
              {week.map((d) => (
                <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                  <motion.div
                    className={`w-full rounded-t-xl ${d.xp > 0 ? "bg-teal" : "bg-cream"}`}
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
            <h2 className="section-heading font-bangla inline-flex items-center gap-2 text-lg">
              <Folders className="h-5 w-5 text-teal" aria-hidden /> বিভাগভিত্তিক দক্ষতা
            </h2>
            {mastery.map((m) => (
              <div key={m.id} className="card rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-navy">
                    {m.german} <span className="font-bangla font-semibold text-mist">· {m.bangla}</span>
                  </p>
                  <p className="text-xs font-bold text-slate-500">
                    {m.known}/{m.total}
                  </p>
                </div>
                <div className="progress-track mt-2 h-2 overflow-hidden rounded-full">
                  <motion.div
                    className="progress-fill h-full rounded-full bg-teal"
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
            <h2 className="section-heading font-bangla inline-flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-teal" aria-hidden /> পাঠের অগ্রগতি
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {lessons.map((l) => {
                const done = progress.lessonsDone.includes(l.id);
                return (
                  <Link
                    key={l.id}
                    href={`/lektionen/${l.id}`}
                    className={`card card-hover flex flex-col items-center gap-1 rounded-3xl p-3 text-center transition active:scale-95 ${
                      done ? "bg-cream ring-teal/30" : "bg-white ring-slate-200"
                    }`}
                  >
                    <ProgressRing value={done ? 1 : 0} size={40} stroke={5} label={done ? "✓" : `${l.id}`} />
                    <p className="text-[11px] font-bold leading-tight text-navy">{l.title}</p>
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
