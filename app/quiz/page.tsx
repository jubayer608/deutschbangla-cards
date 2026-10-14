"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { words, shuffle, type Difficulty, type VocabWord } from "@/data/words";
import { grammarTopics } from "@/data/grammar";
import {
  recordReview,
  addXP,
  recordQuiz,
  xpForDifficulty,
  getFullProgress,
} from "@/lib/progress";
import { celebrate, bigCelebration } from "@/lib/confetti";
import {
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

type Mode = "vocab" | "grammar" | "mixed";
type DiffSetting = Difficulty | "mixed";

interface Q {
  difficulty: Difficulty;
  prompt: string;
  promptBangla: string;
  options: string[];
  answer: string;
  explanation: string;
}

const ARTICLES = ["der", "die", "das"];

function articleOf(w: VocabWord): string | null {
  if (w.pos !== "noun") return null;
  const first = w.german.split(" ")[0];
  return ARTICLES.includes(first) ? first : null;
}
function baseOf(w: VocabWord): string {
  const a = articleOf(w);
  return a ? w.german.slice(a.length + 1) : w.german;
}

function distinctBanglaOptions(word: VocabWord, n: number): string[] {
  const pool = shuffle(words.filter((w) => w.id !== word.id && w.bangla !== word.bangla));
  const opts = [word.bangla];
  for (const w of pool) {
    if (opts.length >= n) break;
    if (!opts.includes(w.bangla)) opts.push(w.bangla);
  }
  return shuffle(opts);
}
function distinctGermanOptions(word: VocabWord, n: number): string[] {
  const pool = shuffle(
    words.filter((w) => w.id !== word.id && w.german !== word.german && w.pos === word.pos)
  );
  const opts = [word.german];
  for (const w of pool) {
    if (opts.length >= n) break;
    if (!opts.includes(w.german)) opts.push(w.german);
  }
  // fall back to any pos if not enough
  if (opts.length < n) {
    for (const w of shuffle(words)) {
      if (opts.length >= n) break;
      if (w.id !== word.id && !opts.includes(w.german)) opts.push(w.german);
    }
  }
  return shuffle(opts);
}

function buildVocab(diff: DiffSetting): Q[] {
  const ds: Difficulty[] = diff === "mixed" ? ["easy", "medium", "hard"] : [diff];
  const per: Record<Difficulty, (ws: VocabWord[]) => Q[]> = {
    easy: (ws) =>
      ws.map((w) => ({
        difficulty: "easy" as Difficulty,
        prompt: w.german,
        promptBangla: "এর বাংলা অর্থ কী?",
        options: distinctBanglaOptions(w, 4),
        answer: w.bangla,
        explanation: `${w.example} — ${w.exampleBangla}`,
      })),
    medium: (ws) =>
      ws.map((w) => {
        const art = articleOf(w);
        if (art) {
          return {
            difficulty: "medium" as Difficulty,
            prompt: `___ ${baseOf(w)}`,
            promptBangla: "সঠিক article বাছাই করো",
            options: shuffle([...ARTICLES]),
            answer: art,
            explanation: `সঠিক: ${w.german} — ${w.bangla}`,
          };
        }
        return {
          difficulty: "medium" as Difficulty,
          prompt: w.bangla,
          promptBangla: "এর জার্মান শব্দ কী?",
          options: distinctGermanOptions(w, 4),
          answer: w.german,
          explanation: `${w.example} — ${w.exampleBangla}`,
        };
      }),
    hard: (ws) =>
      ws.map((w) => {
        const base = baseOf(w);
        const re = new RegExp(base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        const blanked = w.example.replace(re, "___");
        if (blanked === w.example) {
          // fallback: medium-style
          return {
            difficulty: "medium" as Difficulty,
            prompt: w.bangla,
            promptBangla: "এর জার্মান শব্দ কী?",
            options: distinctGermanOptions(w, 4),
            answer: w.german,
            explanation: `${w.example} — ${w.exampleBangla}`,
          };
        }
        return {
          difficulty: "hard" as Difficulty,
          prompt: blanked,
          promptBangla: "শূন্যস্থানে সঠিক শব্দ বসাও",
          options: distinctGermanOptions(w, 4),
          answer: w.german,
          explanation: `${w.example} — ${w.exampleBangla}`,
        };
      }),
  };
  const out: Q[] = [];
  for (const d of ds) out.push(...per[d](shuffle(words).slice(0, 4)));
  return shuffle(out);
}

function buildGrammar(diff: DiffSetting): Q[] {
  const pool = grammarTopics.flatMap((t) =>
    t.quiz.map((q) => ({ ...q, topic: t.title }))
  );
  const filtered = diff === "mixed" ? pool : pool.filter((q) => q.difficulty === diff);
  return shuffle(filtered)
    .slice(0, 10)
    .map((q) => ({
      difficulty: q.difficulty,
      prompt: q.q,
      promptBangla: q.qBangla ?? "সঠিক উত্তর বাছাই করো",
      options: shuffle([...q.options]),
      answer: q.answer,
      explanation: q.explanation,
    }));
}

function buildQuestions(mode: Mode, diff: DiffSetting): Q[] {
  if (mode === "vocab") return buildVocab(diff).slice(0, 10);
  if (mode === "grammar") return buildGrammar(diff).slice(0, 10);
  const v = buildVocab(diff).slice(0, 5);
  const g = buildGrammar(diff).slice(0, 5);
  const mixed = shuffle([...v, ...g]);
  return mixed.slice(0, 10);
}

const MODES: { id: Mode; Icon: LucideIcon; de: string; bn: string }[] = [
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
const DIFFS: { id: DiffSetting; bn: string; de: string }[] = [
  { id: "easy", bn: "সহজ", de: "leicht" },
  { id: "medium", bn: "মাঝারি", de: "mittel" },
  { id: "hard", bn: "কঠিন", de: "schwer" },
  { id: "mixed", bn: "মিশ্র", de: "gemischt" },
];

export default function QuizPage() {
  const [stage, setStage] = useState<"setup" | "playing" | "done" | "reviewDone">("setup");
  const [mode, setMode] = useState<Mode>("vocab");
  const [diff, setDiff] = useState<DiffSetting>("mixed");
  const [questions, setQuestions] = useState<Q[]>([]);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [missed, setMissed] = useState<Q[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [reviewScore, setReviewScore] = useState(0);
  const [mainScore, setMainScore] = useState(0);
  const [mainTotal, setMainTotal] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const start = () => {
    const qs = buildQuestions(mode, diff);
    if (qs.length === 0) return;
    setQuestions(qs);
    setQi(0);
    setPicked(null);
    setScore(0);
    setXpEarned(0);
    setBest(null);
    setMissed([]);
    setReviewing(false);
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
    setStage("done");
    const ratio = finalScore / questions.length;
    if (ratio >= 0.9) bigCelebration();
    else if (ratio >= 0.6) celebrate();
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
        <div>
          <p className="font-bangla text-sm font-semibold text-emerald-500">নিজেকে যাচাই করো</p>
          <h1 className="inline-flex items-center gap-2 text-3xl font-extrabold tracking-tight text-emerald-950">
            <PenLine className="h-7 w-7 text-emerald-600" aria-hidden /> Quiz
          </h1>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bangla font-extrabold text-emerald-950">কোন বিষয়ে খেলবে?</p>
          <div className="grid grid-cols-3 gap-3">
            {MODES.map((m) => (
              <motion.button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                whileTap={{ scale: 0.95 }}
                className={`rounded-3xl p-4 text-center shadow-sm ring-2 transition ${
                  mode === m.id ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white ring-emerald-100"
                }`}
              >
                <m.Icon
                  className={`mx-auto h-8 w-8 ${mode === m.id ? "text-white" : "text-emerald-600"}`}
                  aria-hidden
                />
                <p className="mt-1 text-sm font-extrabold">{m.de}</p>
                <p className={`font-bangla text-xs ${mode === m.id ? "text-emerald-200" : "text-slate-500"}`}>
                  {m.bn}
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bangla font-extrabold text-emerald-950">কাঠিন্য বাছাই করো</p>
          <div className="grid grid-cols-4 gap-2">
            {DIFFS.map((d) => (
              <motion.button
                key={d.id}
                type="button"
                onClick={() => setDiff(d.id)}
                whileTap={{ scale: 0.95 }}
                className={`rounded-2xl py-3 text-center shadow-sm ring-2 transition ${
                  diff === d.id ? "bg-teal-600 text-white ring-teal-600" : "bg-white ring-emerald-100"
                }`}
              >
                <p className="font-bangla text-sm font-extrabold">{d.bn}</p>
                <p className={`text-xs ${diff === d.id ? "text-teal-200" : "text-slate-400"}`}>{d.de}</p>
              </motion.button>
            ))}
          </div>
          <p className="font-bangla text-xs text-slate-400">
            সহজ = চেনা · মাঝারি = মনে করা · কঠিন = বাক্য-স্তর
          </p>
        </div>

        <button
          type="button"
          onClick={start}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-lg font-extrabold text-white shadow-xl shadow-emerald-200 transition active:scale-95"
        >
          <Play className="h-5 w-5 fill-current" aria-hidden /> Start — 10 Fragen
        </button>
      </div>
    );
  }

  /* ---------- done ---------- */
  if (stage === "done") {
    const ratio = questions.length ? score / questions.length : 0;
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-200"
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
        <p className="text-4xl font-extrabold text-emerald-950">
          <CountUp value={score} /> <span className="text-2xl text-slate-400">/ {questions.length}</span>
        </p>
        <div className="font-bangla flex gap-2 text-sm font-bold">
          <span className="rounded-full bg-amber-100 px-4 py-1.5 text-amber-700">+{xpEarned} XP</span>
          {best !== null && (
            <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-emerald-700">সেরা: {best}</span>
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
              className="font-bangla inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-extrabold text-white shadow-lg shadow-amber-200"
            >
              <Target className="h-5 w-5" aria-hidden /> ভুলগুলো আবার চেষ্টা করো ({missed.length}টি)
            </motion.button>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={start}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 py-3 font-bold text-white shadow-md transition active:scale-95"
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> আবার খেলো
            </button>
            <button
              type="button"
              onClick={() => setStage("setup")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-100 transition active:scale-95"
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
          className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-200"
        >
          {ratio === 1 ? (
            <Trophy className="h-11 w-11 text-white" aria-hidden />
          ) : ratio >= 0.5 ? (
            <PartyPopper className="h-11 w-11 text-white" aria-hidden />
          ) : (
            <Dumbbell className="h-11 w-11 text-white" aria-hidden />
          )}
        </motion.div>
        <h2 className="font-bangla text-2xl font-extrabold text-emerald-950">রিভিউ শেষ!</h2>
        <div className="font-bangla flex flex-col gap-2 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-emerald-100">
          <p className="text-sm text-slate-500">
            প্রথম রাউন্ড: <b className="text-slate-800">{mainScore} / {mainTotal}</b>
          </p>
          <p className="text-lg font-extrabold text-emerald-700">
            রিভিউ রাউন্ড: {reviewScore} / {total}
          </p>
          <p className="text-sm text-slate-500">
            {ratio === 1
              ? "সব ভুল শুধরে নিয়েছো — fantastisch!"
              : "ভুল থেকে শেখাই আসল শেখা — weiter so!"}
          </p>
        </div>
        <div className="font-bangla flex gap-2 text-sm font-bold">
          <span className="rounded-full bg-amber-100 px-4 py-1.5 text-amber-700">+{xpEarned} XP</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={start}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 py-3 font-bold text-white shadow-md transition active:scale-95"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> নতুন কুইজ
          </button>
          <button
            type="button"
            onClick={() => setStage("setup")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-100 transition active:scale-95"
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
            <span className="font-bangla inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-700">
              <Target className="h-3.5 w-3.5" aria-hidden /> রিভিউ {qi + 1} / {questions.length}
            </span>
          ) : (
            <>Frage {qi + 1} / {questions.length}</>
          )}
        </p>
        <p className="rounded-full bg-white px-4 py-1 text-sm font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
            <CountUp value={score} />
          </span>
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
          animate={{ width: `${((qi + 1) / questions.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-center shadow-xl shadow-emerald-200">
        <p className="font-bangla text-sm font-semibold uppercase tracking-widest text-emerald-200">
          {q.promptBangla}
        </p>
        <p className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">{q.prompt}</p>
      </div>

      <div className={`flex flex-col gap-3 ${answered && picked !== q.answer ? "animate-shake" : ""}`}>
        {q.options.map((opt) => {
          const isAns = opt === q.answer;
          const isPick = opt === picked;
          let cls = "bg-white text-slate-800 ring-1 ring-emerald-100 hover:ring-emerald-300";
          if (answered && isAns) cls = "bg-emerald-500 text-white ring-emerald-500";
          else if (answered && isPick) cls = "bg-rose-500 text-white ring-rose-500";
          else if (answered) cls = "bg-white text-slate-400 ring-1 ring-slate-100";
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
              picked === q.answer ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
            }`}
          >
            {picked === q.answer ? (
              <>
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                {feedback}
              </>
            ) : (
              <>
                <Lightbulb className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
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
