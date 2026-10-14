"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  Gamepad2,
  Globe,
  Layers,
  MessagesSquare,
  MoonStar,
  MousePointerClick,
  Newspaper,
  Play,
  Sparkles,
  Sun,
  Sunrise,
  type LucideIcon,
} from "lucide-react";
import { words, type VocabWord } from "@/data/words";
import { lessons } from "@/data/lessons";
import { grammarTopics } from "@/data/grammar";
import { phraseGroups } from "@/data/phrases";
import { getFullProgress, type ProgressState } from "@/lib/progress";
import ProgressRing from "@/components/ProgressRing";
import CountUp from "@/components/CountUp";
import Flashcard from "@/components/Flashcard";
import Mascot from "@/components/Mascot";
import { StreakFlame, SleepyStreakNotice } from "@/components/StreakIgnition";

// 3D atmosphere is client-only and intentionally lazy: it renders over the
// static CSS mesh gradient, and the headline/CTAs stay crisp without it.
const HeroScene = dynamic(() => import("@/components/HeroScene"), { ssr: false });

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

function greeting(): { text: string; Icon: LucideIcon } {
  const h = new Date().getHours();
  if (h < 12) return { text: "Guten Morgen!", Icon: Sunrise };
  if (h < 18) return { text: "Guten Tag!", Icon: Sun };
  return { text: "Guten Abend!", Icon: MoonStar };
}

/** Friendly beginner words that hook a visitor in ~10 seconds. */
const HERO_WORD_GERMAN = ["Hallo", "Danke", "Bitte", "Tschüss", "Wasser", "Brot", "Freund", "Haus"];

function heroWords(): VocabWord[] {
  const picked = HERO_WORD_GERMAN.map((g) => words.find((w) => w.german === g)).filter(
    (w): w is VocabWord => Boolean(w)
  );
  return picked.length >= 2 ? picked : words.slice(0, 8);
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 240, damping: 26 } },
};

function HeroMiniCard() {
  const list = useMemo(heroWords, []);
  const [index, setIndex] = useState(0);
  const [touched, setTouched] = useState(false);

  // Auto-cycle until the visitor interacts; their tap takes over from then on.
  useEffect(() => {
    if (touched || list.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % list.length), 4200);
    return () => clearInterval(id);
  }, [touched, list.length]);

  const word = list[index % list.length];

  return (
    <div className="relative">
      <div aria-hidden className="bloom pointer-events-none absolute -inset-8 rounded-full" />
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: 1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 120, damping: 18 }}
        className="relative"
      >
        <Flashcard
          word={word}
          compact
          onFlip={() => setTouched(true)}
          onSwipe={() => setTouched(true)}
        />
        <p className="font-bangla mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-slate-500">
          <MousePointerClick className="h-4 w-4 text-emerald-600" aria-hidden />
          ট্যাপ করে অর্থ দেখো — {touched ? "তুমি এখন নিয়ন্ত্রণে" : "প্রতি কয়েক সেকেন্ডে নতুন শব্দ"}
        </p>
      </motion.div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden">
      {/* Static mesh gradient (always there) + WebGL atmosphere (progressive) */}
      <div aria-hidden className="mesh-gradient-animated absolute inset-0" />
      <HeroScene />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-8 lg:pb-28">
        {/* Copy column */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start gap-6"
        >
          <motion.span
            variants={item}
            className="font-bangla inline-flex items-center gap-2.5 rounded-full bg-white/70 py-1.5 pl-3 pr-4 text-sm font-bold text-emerald-900 shadow-sm ring-1 ring-emerald-200/60 backdrop-blur"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            A1 • বাংলায় জার্মান
          </motion.span>

          <motion.h1
            variants={item}
            className="text-[clamp(3rem,8vw,6rem)] font-extrabold leading-[1.02] tracking-tight text-emerald-950"
          >
            জার্মান শেখো,
            <br />
            <span className="text-gradient-animated">মজা করে।</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="font-bangla max-w-md text-lg leading-relaxed text-slate-600"
          >
            ফ্ল্যাশকার্ড, কুইজ আর Redemittel দিয়ে A1 জার্মান শেখো — সব বাংলায়, সম্পূর্ণ ফ্রি।
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap items-center gap-3">
            <Link
              href="/lektionen"
              className="bg-brand-gradient group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-extrabold text-white shadow-xl shadow-emerald-600/25 transition hover:shadow-2xl hover:shadow-emerald-600/30 active:scale-95"
            >
              <Play className="h-5 w-5 fill-current" aria-hidden />
              শেখা শুরু করো
              <ArrowRight
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
            <Link
              href="/quiz"
              className="glass-card inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-extrabold text-emerald-800 transition hover:bg-white/85 active:scale-95"
            >
              <Gamepad2 className="h-5 w-5" aria-hidden />
              কুইজ খেলো
            </Link>
          </motion.div>

          {/* Ulluk the mascot — playful companion next to the CTAs */}
          <motion.div variants={item} className="flex items-center gap-3">
            <Mascot mood="happy" size={84} className="shrink-0 drop-shadow-md" />
            <p className="font-bangla glass-card max-w-52 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm font-bold text-emerald-900">
              আমি উল্লুক! চলো, আজকে কিছু নতুন শিখি!
            </p>
          </motion.div>

          <motion.p
            variants={item}
            className="font-bangla flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-slate-500"
          >
            {["ফ্রি", "সাইন-আপ লাগবে না", "২ মিনিটে শুরু"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" strokeWidth={3} aria-hidden />
                {t}
              </span>
            ))}
          </motion.p>
        </motion.div>

        {/* Live product: a real clickable mini-flashcard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mx-auto w-full max-w-sm lg:max-w-md"
        >
          <HeroMiniCard />
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({
  value,
  label,
  Icon,
  active,
}: {
  value: number;
  label: string;
  Icon: LucideIcon;
  active: boolean;
}) {
  return (
    <div className="glass-card flex flex-col items-center gap-1 rounded-3xl p-4 text-center sm:p-5">
      <Icon className="mb-1 h-5 w-5 text-emerald-600" aria-hidden />
      <p className="text-2xl font-extrabold text-emerald-800 sm:text-3xl">
        {active ? <CountUp value={value} /> : "–"}
      </p>
      <p className="font-bangla text-xs font-bold text-slate-500 sm:text-sm">{label}</p>
    </div>
  );
}

function SocialProof({ wordOfDay }: { wordOfDay: VocabWord | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const stats = useMemo(
    () => [
      { value: words.length, label: "শব্দ", Icon: Layers },
      { value: lessons.length, label: "লেসন", Icon: BookOpen },
      {
        value: grammarTopics.reduce((n, t) => n + t.quiz.length, 0),
        label: "গ্রামার প্রশ্ন",
        Icon: Brain,
      },
      {
        value: phraseGroups.reduce((n, g) => n + g.items.length, 0),
        label: "Redemittel",
        Icon: MessagesSquare,
      },
    ],
    []
  );

  return (
    <div ref={ref} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} active={inView} />
        ))}
      </div>

      {/* Wort des Tages teaser */}
      {wordOfDay && (
        <Link
          href="/wortschatz"
          className="group glass-card flex items-center gap-4 rounded-3xl p-4 transition hover:bg-white/85 active:scale-[0.99]"
        >
          <span className="bg-brand-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md shadow-emerald-600/20">
            <Sparkles className="h-6 w-6" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-bangla block text-xs font-bold uppercase tracking-widest text-emerald-600">
              আজকের শব্দ
            </span>
            <span className="block truncate text-lg font-extrabold text-emerald-950">
              {wordOfDay.german}
              <span className="font-bangla ml-2 font-semibold text-slate-500">
                — {wordOfDay.bangla}
              </span>
            </span>
          </span>
          <ArrowRight
            className="h-5 w-5 shrink-0 text-emerald-600 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [wordOfDay, setWordOfDay] = useState<VocabWord | null>(null);

  useEffect(() => {
    setProgress(getFullProgress());
    setWordOfDay(words[hashStr(dayKey()) % words.length]);
  }, []);

  const nextLesson = progress
    ? (lessons.find((l) => !progress.lessonsDone.includes(l.id)) ?? null)
    : null;
  const knownCount = progress?.knownWords.length ?? 0;
  const { text: greetText, Icon: GreetIcon } = greeting();
  const todayActive = progress ? (progress.activity[dayKey()] ?? 0) > 0 : false;
  const streakAtRisk = !!progress && !todayActive && progress.streak > 0;

  return (
    <div className="flex flex-col">
      <Hero />

      {/* Skewed gradient divider (Stripe-style, subtle) */}
      <div aria-hidden className="relative left-1/2 z-10 w-screen -translate-x-1/2">
        <div className="-my-5 h-12 -rotate-1 scale-x-105 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 opacity-90 shadow-lg shadow-emerald-900/10 sm:h-16" />
      </div>

      {/* Social proof */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-3 pt-10"
      >
        <SocialProof wordOfDay={wordOfDay} />
      </motion.section>

      {/* Dashboard */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="flex flex-col gap-5 pt-8"
      >
        {/* Header */}
        <motion.div variants={item} className="flex items-end justify-between">
          <div>
            <p className="font-bangla text-sm font-semibold text-emerald-500">
              স্বাগতম! আজ শিখতে প্রস্তুত?
            </p>
            <h2 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-emerald-950">
              <GreetIcon className="h-7 w-7 text-amber-500" aria-hidden />
              {greetText}
            </h2>
          </div>
          <StreakFlame todayActive={todayActive} />
        </motion.div>

        {/* Streak at risk: sleepy mascot nudge */}
        {streakAtRisk && (
          <motion.div variants={item} className="w-full">
            <SleepyStreakNotice />
          </motion.div>
        )}

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
                <span className="font-bangla block text-sm text-emerald-200">
                  {nextLesson.titleBangla}
                </span>
              </span>
              <ArrowRight
                className="h-6 w-6 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </motion.div>
        )}

        {/* Word of the day */}
        <motion.div variants={item} id="wort-des-tages" className="flex flex-col gap-2 scroll-mt-24">
          <h2 className="font-bangla flex items-center gap-2 text-lg font-extrabold text-emerald-950">
            <CalendarDays className="h-5 w-5 text-emerald-600" aria-hidden />
            আজকের শব্দ
            <span className="text-sm font-semibold text-slate-400">— ট্যাপ করে উল্টাও</span>
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
            <h2 className="font-bangla flex items-center gap-2 text-lg font-extrabold text-emerald-950">
              <BookOpen className="h-5 w-5 text-emerald-600" aria-hidden />
              পাঠসমূহ
            </h2>
            <Link
              href="/lektionen"
              className="font-bangla inline-flex items-center gap-1 text-sm font-bold text-emerald-600"
            >
              সবগুলো <ArrowRight className="h-4 w-4" aria-hidden />
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
            <Gamepad2 className="mx-auto h-8 w-8 text-amber-950" aria-hidden />
            <p className="font-bangla mt-1 font-extrabold text-amber-950">কুইজ খেলো</p>
          </Link>
          <Link
            href="/wortschatz"
            className="rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-emerald-100 transition active:scale-95"
          >
            <Layers className="mx-auto h-8 w-8 text-emerald-700" aria-hidden />
            <p className="font-bangla mt-1 font-extrabold text-emerald-950">শব্দভাণ্ডার</p>
          </Link>
          <Link
            href="/resources"
            className="rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-emerald-100 transition active:scale-95"
          >
            <Globe className="mx-auto h-8 w-8 text-emerald-700" aria-hidden />
            <p className="font-bangla mt-1 font-extrabold text-emerald-950">রিসোর্স</p>
          </Link>
          <Link
            href="/blog"
            className="rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-emerald-100 transition active:scale-95"
          >
            <Newspaper className="mx-auto h-8 w-8 text-emerald-700" aria-hidden />
            <p className="font-bangla mt-1 font-extrabold text-emerald-950">ব্লগ</p>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
