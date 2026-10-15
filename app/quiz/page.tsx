"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { shuffle } from "@/data/words";
import {
  buildQuestions,
  type QuizQuestion,
  type QuizMode,
  type QuizDiffSetting,
} from "@/lib/quiz-questions";
import {
  recordReview,
  addXP,
  recordQuiz,
  xpForDifficulty,
  getFullProgress,
} from "@/lib/progress";
import { celebrate, bigCelebration } from "@/lib/confetti";
import Mascot from "@/components/Mascot";
import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Dices,
  Dumbbell,
  Library,
  Lightbulb,
  PartyPopper,
  PenLine,
  Play,
  RotateCcw,
  Settings,
  Sparkles,
  Star,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import CountUp from "@/components/CountUp";

const MODES: { id: QuizMode; Icon: LucideIcon; de: string; bn: string }[] = [
  { id: "vocab", Icon: Library, de: "Wortschatz", bn: "শব্দভাণ্ডার" },
  { id: "grammar", Icon: BookOpen, de: "Grammatik", bn: "ব্যাকরণ" },
  { id: "mixed", Icon: Dices, de: "Gemischt", bn: "মিশ্র" },
];

/** Playful, warm answer feedback — Duolingo tone with Bangla flavor. */
const PRAISE = [
  "দারুণ! Richtig!",
  "বাহ! Genau richtig!",
  "সাবাশ! Weiter so!",
  "চমৎকার! Perfekt!",
  "একদম ঠিক! Super!",
];
const ENCOURAGE = [
  "ভুল হতেই পারে — এভাবেই শেখা হয়!",
  "চিন্তা নেই — আরেকবার চেষ্টা করো!",
  "কাছাকাছি ছিলে — উত্তরটা দেখে নাও!",
  "হার মানা যাবে না — তুমি পারবে!",
];
const DIFFS: { id: QuizDiffSetting; bn: string; de: string }[] = [
  { id: "easy", bn: "সহজ", de: "leicht" },
  { id: "medium", bn: "মাঝারি", de: "mittel" },
  { id: "hard", bn: "কঠিন", de: "schwer" },
  { id: "mixed", bn: "মিশ্র", de: "gemischt" },
];

/** Streak days worth a full-screen celebration. */
const STREAK_MILESTONES = [7, 14, 21, 30, 60, 90, 100, 180, 365];

/**
 * Personal-best *score* per quiz mode. lib/progress.ts only tracks best
 * totals, so this lives under its own key — progress.ts keys untouched.
 */
function bestScoreKey(modeKey: string): string {
  return `dbc-quizbest-score-${modeKey}`;
}
function readBestScore(modeKey: string): number | null {
  try {
    const raw = localStorage.getItem(bestScoreKey(modeKey));
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
}
function writeBestScore(modeKey: string, s: number): void {
  try {
    localStorage.setItem(bestScoreKey(modeKey), String(s));
  } catch {
    /* storage unavailable */
  }
}

/** Animated XP tally pill used on every quiz end screen. */
function XpTally({ value }: { value: number }) {
  return (
    <span className="font-bangla inline-flex items-center gap-1 rounded-full bg-sun/25 px-4 py-1.5 text-navy">
      +<CountUp value={value} /> XP
    </span>
  );
}

type FinaleTier = "normal" | "best" | "milestone";

export default function QuizPage() {
  const [stage, setStage] = useState<"setup" | "playing" | "done" | "reviewDone">("setup");
  const [mode, setMode] = useState<QuizMode>("vocab");
  const [diff, setDiff] = useState<QuizDiffSetting>("mixed");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [missed, setMissed] = useState<QuizQuestion[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [reviewScore, setReviewScore] = useState(0);
  const [mainScore, setMainScore] = useState(0);
  const [mainTotal, setMainTotal] = useState(0);
  const [finaleTier, setFinaleTier] = useState<FinaleTier | null>(null);
  const [prevBest, setPrevBest] = useState<number | null>(null);
  const [milestoneDays, setMilestoneDays] = useState(0);
  const prevStreakRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const start = () => {
    const qs = buildQuestions(mode, diff);
    if (qs.length === 0) return;
    const modeKey = `${mode}-${diff}`;
    setQuestions(qs);
    setQi(0);
    setPicked(null);
    setScore(0);
    setXpEarned(0);
    setBest(null);
    setMissed([]);
    setReviewing(false);
    setFinaleTier(null);
    // Snapshot before the round so the finale can detect a streak milestone
    // (recordReview bumps the streak during play) and a new personal best.
    prevStreakRef.current = getFullProgress().streak;
    setPrevBest(readBestScore(modeKey));
    setStage("playing");
  };

  const startReview = () => {
    const qs = shuffle([...missed]);
    if (qs.length === 0) return;
    setQuestions(qs);
    setQi(0);
    setPicked(null);
    setScore(0);
    setXpEarned(0);
    setReviewing(true);
    setStage("playing");
  };

  const finish = (finalScore: number, finalXp: number) => {
    if (reviewing) {
      addXP(finalXp);
      setReviewScore(finalScore);
      setReviewing(false);
      setStage("reviewDone");
      const ratio = questions.length ? finalScore / questions.length : 0;
      if (ratio === 1) bigCelebration();
      else if (ratio >= 0.5) celebrate();
      return;
    }
    const modeKey = `${mode}-${diff}`;
    const p = recordQuiz(modeKey, finalScore, questions.length);
    addXP(finalXp);
    setBest(p.quizBest[modeKey] ?? finalScore);
    setMainScore(finalScore);
    setMainTotal(questions.length);

    // Tiered finale — celebration proportional to the achievement.
    const newStreak = getFullProgress().streak;
    const hitMilestone =
      STREAK_MILESTONES.includes(newStreak) && prevStreakRef.current < newStreak;
    const isNewBest = prevBest !== null && finalScore > prevBest;
    if (prevBest === null || finalScore > prevBest) writeBestScore(modeKey, finalScore);
    const tier: FinaleTier = hitMilestone ? "milestone" : isNewBest ? "best" : "normal";
    setFinaleTier(tier);
    setMilestoneDays(newStreak);
    setStage("done");
    if (hitMilestone || isNewBest) {
      bigCelebration();
    } else {
      const ratio = finalScore / questions.length;
      if (ratio >= 0.9) bigCelebration();
      else if (ratio >= 0.6) celebrate();
    }
  };

  const choose = (opt: string) => {
    if (picked !== null) return;
    const q = questions[qi];
    setPicked(opt);
    recordReview();
    let s = score;
    let x = xpEarned;
    if (opt === q.answer) {
      s += 1;
      const gained = reviewing
        ? Math.ceil(xpForDifficulty(q.difficulty, "quiz") / 2)
        : xpForDifficulty(q.difficulty, "quiz");
      x += gained;
      setScore(s);
      setXpEarned(x);
      setFeedback(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
    } else {
      setShakeKey((k) => k + 1);
      if (!reviewing) setMissed((m) => [...m, q]);
      setFeedback(ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]);
    }
    timer.current = setTimeout(() => {
      if (qi + 1 >= questions.length) finish(s, x);
      else {
        setQi((i) => i + 1);
        setPicked(null);
      }
    }, 1500);
  };

  /* ---------- setup ---------- */
  if (stage === "setup") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-bangla text-sm font-semibold text-teal">নিজেকে যাচাই করো</p>
            <h1 className="section-heading inline-flex items-center gap-2 text-3xl">
              <PenLine className="h-7 w-7 text-teal" aria-hidden /> Quiz
            </h1>
          </div>
          <Mascot mood="thinking" size={64} animate className="shrink-0" />
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bangla font-extrabold text-navy">কোন বিষয়ে খেলবে?</p>
          <div className="grid grid-cols-3 gap-3">
            {MODES.map((m) => (
              <motion.button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                whileTap={{ scale: 0.95 }}
                className={`card-hover rounded-3xl p-4 text-center shadow-sm ring-2 transition ${
                  mode === m.id ? "bg-navy text-white ring-navy" : "bg-white ring-slate-200"
                }`}
              >
                <m.Icon
                  className={`mx-auto h-8 w-8 ${mode === m.id ? "text-sun" : "text-teal"}`}
                  aria-hidden
                />
                <p className="mt-1 text-sm font-extrabold">{m.de}</p>
                <p className={`font-bangla text-xs ${mode === m.id ? "text-white/80" : "text-slate-500"}`}>
                  {m.bn}
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bangla font-extrabold text-navy">কাঠিন্য বাছাই করো</p>
          <div className="grid grid-cols-4 gap-2">
            {DIFFS.map((d) => (
              <motion.button
                key={d.id}
                type="button"
                onClick={() => setDiff(d.id)}
                whileTap={{ scale: 0.95 }}
                className={`rounded-2xl py-3 text-center shadow-sm ring-2 transition ${
                  diff !== d.id
                    ? "bg-white ring-slate-200"
                    : d.id === "medium"
                      ? "bg-sun text-navy ring-sun"
                      : d.id === "hard"
                        ? "bg-navy text-white ring-navy"
                        : "bg-teal text-white ring-teal"
                }`}
              >
                <p className="font-bangla text-sm font-extrabold">{d.bn}</p>
                <p className={`text-xs ${diff !== d.id ? "text-mist" : d.id === "medium" ? "text-navy/70" : "text-white/80"}`}>{d.de}</p>
              </motion.button>
            ))}
          </div>
          <p className="font-bangla text-xs text-mist">
            সহজ = চেনা · মাঝারি = মনে করা · কঠিন = বাক্য-স্তর
          </p>
        </div>

        <button
          type="button"
          onClick={start}
          className="btn btn-primary inline-flex items-center justify-center gap-2 rounded-full py-4 text-lg"
        >
          <Play className="h-5 w-5 fill-current" aria-hidden /> Start — 10 Fragen
        </button>
      </div>
    );
  }

  /* ---------- done (tiered finale) ---------- */
  if (stage === "done") {
    const ratio = questions.length ? score / questions.length : 0;
    const modeBn = MODES.find((m) => m.id === mode)?.bn ?? "";
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        {/* (c) streak milestone: full-screen confetti fires in finish() + celebrating mascot banner */}
        {finaleTier === "milestone" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 20 }}
            className="w-full rounded-3xl bg-cream p-6 shadow-xl"
          >
            <Mascot mood="celebrate" size={104} className="mx-auto" />
            <h2 className="font-bangla mt-2 text-3xl font-extrabold text-navy">
              <CountUp value={milestoneDays} /> দিনের স্ট্রিক!
            </h2>
            <p className="font-bangla mt-1 font-bold text-slate-600">
              অসাধারণ ধারাবাহিকতা — এভাবেই চালিয়ে যাও!
            </p>
          </motion.div>
        )}

        {/* (b) new personal best: full-width gradient banner + badge unlock card */}
        {finaleTier === "best" && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 20 }}
              className="bg-brand-gradient w-full rounded-3xl p-5 text-white shadow-xl shadow-navy/10"
            >
              <Trophy className="mx-auto h-10 w-10" aria-hidden />
              <h2 className="font-bangla mt-2 text-2xl font-extrabold">নতুন ব্যক্তিগত রেকর্ড!</h2>
              <p className="font-bangla text-sm font-semibold text-cream">
                আগের সেরা {prevBest} — এখন {score}!
              </p>
            </motion.div>
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.25 }}
              className="card flex items-center gap-3 rounded-3xl px-5 py-4"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sun text-navy shadow-md shadow-sun/30">
                <BadgeCheck className="h-7 w-7" aria-hidden />
              </span>
              <span className="text-left">
                <span className="font-bangla block text-sm font-extrabold text-navy">
                  ব্যাজ আনলকড!
                </span>
                <span className="font-bangla block text-xs font-semibold text-slate-500">
                  কুইজ মাস্টার · {modeBn}
                </span>
              </span>
              <Mascot mood="happy" size={56} className="shrink-0" />
            </motion.div>
          </>
        )}

        {finaleTier === "normal" && (
          <Mascot
            mood={ratio === 1 ? "celebrate" : ratio >= 0.6 ? "happy" : "thinking"}
            size={76}
            animate
          />
        )}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-navy shadow-xl shadow-navy/10"
        >
          {ratio === 1 ? (
            <Trophy className="h-11 w-11 text-white" aria-hidden />
          ) : ratio >= 0.7 ? (
            <PartyPopper className="h-11 w-11 text-white" aria-hidden />
          ) : ratio >= 0.4 ? (
            <Dumbbell className="h-11 w-11 text-white" aria-hidden />
          ) : (
            <BookOpen className="h-11 w-11 text-white" aria-hidden />
          )}
        </motion.div>
        <p className="text-4xl font-extrabold text-navy">
          <CountUp value={score} /> <span className="text-2xl text-mist">/ {questions.length}</span>
        </p>
        <div className="flex gap-2 text-sm font-bold">
          <XpTally value={xpEarned} />
          {best !== null && (
            <span className="badge font-bangla rounded-full bg-teal/15 px-4 py-1.5 text-teal">সেরা: {best}</span>
          )}
        </div>
        <p className="font-bangla text-slate-500">
          {ratio === 1
            ? "Perfekt! অসাধারণ!"
            : ratio >= 0.7
              ? "Sehr gut! খুব ভালো!"
              : ratio >= 0.4
                ? "Gut gemacht! চালিয়ে যাও!"
                : "Weiter üben! আরও অনুশীলন দরকার।"}
        </p>
        <div className="flex w-full max-w-xs flex-col gap-3">
          {missed.length > 0 && (
            <motion.button
              type="button"
              onClick={startReview}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
              className="btn font-bangla inline-flex w-full items-center justify-center gap-2 rounded-full bg-sun px-8 py-3 font-extrabold text-navy shadow-lg shadow-sun/30"
            >
              <Target className="h-5 w-5" aria-hidden /> ভুলগুলো আবার চেষ্টা করো ({missed.length}টি)
            </motion.button>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={start}
              className="btn btn-primary inline-flex items-center justify-center gap-2 rounded-full px-8 py-3"
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> আবার খেলো
            </button>
            <button
              type="button"
              onClick={() => setStage("setup")}
              className="btn btn-ghost inline-flex items-center justify-center gap-2 rounded-full px-8 py-3"
            >
              <Settings className="h-4 w-4" aria-hidden /> সেটিং বদলাও
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- review done ---------- */
  if (stage === "reviewDone") {
    const total = questions.length;
    const ratio = total ? reviewScore / total : 0;
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-navy shadow-xl shadow-navy/10"
        >
          {ratio === 1 ? (
            <Trophy className="h-11 w-11 text-white" aria-hidden />
          ) : ratio >= 0.5 ? (
            <PartyPopper className="h-11 w-11 text-white" aria-hidden />
          ) : (
            <Dumbbell className="h-11 w-11 text-white" aria-hidden />
          )}
        </motion.div>
        <h2 className="font-bangla text-2xl font-extrabold text-navy">রিভিউ শেষ!</h2>
        <div className="card font-bangla flex flex-col gap-2 rounded-3xl p-5">
          <p className="text-sm text-slate-500">
            প্রথম রাউন্ড: <b className="text-slate-800">{mainScore} / {mainTotal}</b>
          </p>
          <p className="text-lg font-extrabold text-teal">
            রিভিউ রাউন্ড: {reviewScore} / {total}
          </p>
          <p className="text-sm text-slate-500">
            {ratio === 1
              ? "সব ভুল শুধরে নিয়েছো — fantastisch!"
              : "ভুল থেকে শেখাই আসল শেখা — weiter so!"}
          </p>
        </div>
        <div className="flex gap-2 text-sm font-bold">
          <XpTally value={xpEarned} />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={start}
            className="btn btn-primary inline-flex items-center justify-center gap-2 rounded-full px-8 py-3"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> নতুন কুইজ
          </button>
          <button
            type="button"
            onClick={() => setStage("setup")}
            className="btn btn-ghost inline-flex items-center justify-center gap-2 rounded-full px-8 py-3"
          >
            <Settings className="h-4 w-4" aria-hidden /> সেটিং বদলাও
          </button>
        </div>
      </div>
    );
  }

  /* ---------- playing ---------- */
  const q = questions[qi];
  const answered = picked !== null;
  if (!q) return null;

  return (
    <div className="flex flex-col gap-5" key={shakeKey}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-500">
          {reviewing ? (
            <span className="font-bangla inline-flex items-center gap-1 rounded-full bg-sun/25 px-3 py-1 text-navy">
              <Target className="h-3.5 w-3.5" aria-hidden /> রিভিউ {qi + 1} / {questions.length}
            </span>
          ) : (
            <>Frage {qi + 1} / {questions.length}</>
          )}
        </p>
        <span className="flex items-center gap-2">
          <Mascot
            mood={!answered ? "thinking" : picked === q.answer ? "happy" : "angry"}
            size={48}
            animate={!answered}
            className="shrink-0"
          />
          <p className="rounded-full bg-white px-4 py-1 text-sm font-bold text-teal shadow-sm ring-1 ring-slate-200">
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-sun text-sun" aria-hidden />
              <CountUp value={score} />
            </span>
          </p>
        </span>
      </div>
      <div className="progress-track h-2 overflow-hidden rounded-full">
        <motion.div
          className="progress-fill h-full rounded-full"
          animate={{ width: `${((qi + 1) / questions.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <div className="rounded-3xl bg-navy p-8 text-center shadow-xl shadow-navy/10">
        <p className="font-bangla text-sm font-semibold uppercase tracking-widest text-white/70">
          {q.promptBangla}
        </p>
        <p className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">{q.prompt}</p>
      </div>

      <div className={`flex flex-col gap-3 ${answered && picked !== q.answer ? "animate-shake" : ""}`}>
        {q.options.map((opt) => {
          const isAns = opt === q.answer;
          const isPick = opt === picked;
          let cls = "card bg-white text-slate-800 ring-1 ring-slate-200 hover:ring-teal/40";
          if (answered && isAns) cls = "bg-teal text-white ring-teal";
          else if (answered && isPick) cls = "bg-rose-500 text-white ring-rose-500";
          else if (answered) cls = "bg-white text-mist ring-1 ring-slate-100";
          return (
            <motion.button
              key={opt}
              type="button"
              onClick={() => choose(opt)}
              disabled={answered}
              whileTap={!answered ? { scale: 0.98 } : undefined}
              animate={answered && isAns ? { scale: [1, 1.05, 1] } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 14 }}
              className={`font-bangla rounded-2xl px-6 py-4 text-left text-lg font-bold shadow-sm ${cls}`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-bangla flex items-center justify-center gap-2 rounded-2xl p-4 text-center text-sm font-bold ${
              picked === q.answer ? "bg-teal/10 text-navy" : "bg-rose-50 text-rose-800"
            }`}
          >
            {picked === q.answer ? (
              <>
                <CheckCircle2 className="h-5 w-5 shrink-0 text-teal" aria-hidden />
                {feedback}
              </>
            ) : (
              <>
                <Lightbulb className="h-5 w-5 shrink-0 text-rose-500" aria-hidden />
                <span>
                  {feedback} <span className="font-semibold">{q.explanation}</span>
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
