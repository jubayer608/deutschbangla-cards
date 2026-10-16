"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Exercise } from "@/data/lessons";
import {
  EXAM_DURATION_SECONDS,
  EXAM_PASS_SCORE,
  EXAM_TOTAL_QUESTIONS,
  getExamBest,
  recordExamScore,
} from "@/lib/progress";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flag,
  Play,
  RotateCcw,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import Mascot from "@/components/Mascot";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.,!?¿¡;:'"«»„“”]/g, "")
    .replace(/\s+/g, " ");
}

function fmt(seconds: number): string {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface ExamResult {
  score: number;
  best: number;
  isNewBest: boolean;
}

/**
 * Timed lesson exam — the gate for lesson completion.
 * Rules: exactly 10 questions (lesson.exam), 5-minute countdown,
 * auto-submit at 0:00, pass mark >= 7/10 (70%), unlimited retakes,
 * best score kept. Passing calls onPass() (parent marks the lesson
 * complete via the existing completeLesson() — same +50 XP, first
 * pass only). No XP is awarded for the exam itself.
 */
export default function LessonExam({
  lessonId,
  exam,
  onPass,
}: {
  lessonId: number;
  exam: Exercise[] | undefined;
  onPass: () => void;
}) {
  const questions = exam ?? [];
  const total = questions.length;
  const [stage, setStage] = useState<"intro" | "playing" | "result">("intro");
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => Array(total).fill(""));
  const [orderPicked, setOrderPicked] = useState<Record<number, number[]>>({});
  const [secondsLeft, setSecondsLeft] = useState(EXAM_DURATION_SECONDS);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const submittedRef = useRef(false);
  const passReportedRef = useRef(false);

  useEffect(() => {
    setBest(getExamBest(lessonId));
  }, [lessonId]);

  const submit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const score = questions.reduce(
      (n, q, i) => n + (normalize(answers[i] ?? "") === normalize(q.answer) ? 1 : 0),
      0,
    );
    const { best: newBest, isNewBest } = recordExamScore(lessonId, score);
    setBest(newBest);
    setResult({ score, best: newBest, isNewBest });
    setStage("result");
    if (score >= EXAM_PASS_SCORE && !passReportedRef.current) {
      passReportedRef.current = true;
      onPass();
    }
  }, [answers, lessonId, onPass, questions]);

  // Latest submit wins — the timer effect must never call a stale closure.
  const submitRef = useRef(submit);
  submitRef.current = submit;

  // Countdown: ticks while playing, auto-submits at 0:00.
  useEffect(() => {
    if (stage !== "playing") return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          submitRef.current();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [stage]);

  const start = () => {
    submittedRef.current = false;
    passReportedRef.current = false;
    setAnswers(Array(total).fill(""));
    setOrderPicked({});
    setQi(0);
    setResult(null);
    setSecondsLeft(EXAM_DURATION_SECONDS);
    setStage("playing");
  };

  const retry = () => {
    start();
    setStage("intro");
  };

  const setAnswer = (i: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  };

  const toggleOrderWord = (qIndex: number, optIndex: number, fromPicked: boolean) => {
    setOrderPicked((prev) => {
      const picked = [...(prev[qIndex] ?? [])];
      if (fromPicked) {
        const next = picked.filter((x) => x !== optIndex);
        setAnswer(qIndex, next.map((x) => questions[qIndex].options?.[x] ?? "").join(" "));
        return { ...prev, [qIndex]: next };
      }
      const next = [...picked, optIndex];
      setAnswer(qIndex, next.map((x) => questions[qIndex].options?.[x] ?? "").join(" "));
      return { ...prev, [qIndex]: next };
    });
  };

  if (total === 0) {
    return (
      <div className="card rounded-3xl p-5">
        <p className="font-bangla text-slate-600">এই পাঠের Exam এখনো তৈরি হয়নি — শীঘ্রই আসছে।</p>
      </div>
    );
  }

  const answered = answers.filter((a) => a.trim() !== "").length;
  const q = questions[qi];
  const pickedIdx = orderPicked[qi] ?? [];
  const remainingIdx = (q?.options ?? []).map((_, i) => i).filter((i) => !pickedIdx.includes(i));
  const lowTime = secondsLeft < 60;
  const passed = result !== null && result.score >= EXAM_PASS_SCORE;

  return (
    <div className="flex flex-col gap-4">
      {/* Intro */}
      {stage === "intro" && (
        <div className="card rounded-3xl p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-white">
              <Target className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h3 className="text-lg font-extrabold text-navy">Exam — পরীক্ষা</h3>
              <p className="font-bangla mt-1 text-sm text-slate-600">
                {EXAM_TOTAL_QUESTIONS}টি প্রশ্ন · ৫ মিনিট · পাস করতে লাগবে অন্তত {EXAM_PASS_SCORE}/
                {EXAM_TOTAL_QUESTIONS} (৭০%)। সময় শেষ হলে Exam নিজে থেকে জমা হয়ে যাবে। যতবার খুশি
                আবার দিতে পারবে — সেরা স্কোরটা থেকে যাবে।
              </p>
            </div>
          </div>
          <div className="font-bangla mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 font-bold text-navy">
              <Clock className="h-4 w-4 text-teal" aria-hidden /> ৫:০০ মিনিট
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 font-bold text-navy">
              <Trophy className="h-4 w-4 text-sun" aria-hidden />{" "}
              {best !== null ? `সেরা স্কোর: ${best}/${total}` : "এখনো Exam দাওনি"}
            </span>
          </div>
          <button
            type="button"
            onClick={start}
            className="btn btn-primary mt-4 inline-flex items-center gap-2 rounded-full px-8 py-3"
          >
            <Play className="h-5 w-5" aria-hidden /> Exam শুরু করো
          </button>
          <p className="font-bangla mt-3 text-xs text-mist">
            পাস করলেই পাঠটি শেষ হবে (+50 XP, প্রথমবার) আর পরের পাঠ খুলে যাবে।
          </p>
        </div>
      )}

      {/* Playing */}
      {stage === "playing" && q && (
        <div className="card rounded-3xl p-5">
          {/* Timer + progress */}
          <div className="flex items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-extrabold tabular-nums ${
                lowTime ? "bg-rose-100 text-rose-700" : "bg-cream text-navy"
              }`}
              role="timer"
              aria-label={`বাকি সময় ${fmt(secondsLeft)}`}
            >
              <Clock className="h-4 w-4" aria-hidden /> {fmt(secondsLeft)}
            </span>
            <span className="font-bangla text-sm font-bold text-mist">
              প্রশ্ন {qi + 1}/{total} · {answered}টি উত্তর দেওয়া
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal to-sun transition-all"
              style={{ width: `${(answered / total) * 100}%` }}
            />
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={qi}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.18 }}
            >
              <p className="mt-4 text-lg font-bold text-navy">{q.prompt}</p>
              {q.promptBangla && (
                <p className="font-bangla mt-1 text-sm text-slate-500">{q.promptBangla}</p>
              )}

              {/* MCQ — pick one, no instant feedback (it's an exam) */}
              {q.type === "mcq" && (
                <div className="mt-4 flex flex-col gap-2">
                  {q.options?.map((opt) => {
                    const selected = answers[qi] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswer(qi, opt)}
                        aria-pressed={selected}
                        className={`rounded-2xl px-4 py-3 text-left font-bold shadow-sm transition active:scale-[0.98] ${
                          selected
                            ? "bg-teal text-white ring-2 ring-teal"
                            : "bg-cream/50 text-slate-800 ring-1 ring-slate-200 hover:ring-teal/50"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fillblank / Translate — text input */}
              {(q.type === "fillblank" || q.type === "translate") && (
                <div className="mt-4">
                  <input
                    value={answers[qi] ?? ""}
                    onChange={(e) => setAnswer(qi, e.target.value)}
                    placeholder={q.type === "fillblank" ? "উত্তর লিখো…" : "Auf Deutsch schreiben…"}
                    className="font-bangla w-full rounded-2xl border-2 border-slate-200 px-4 py-3 font-semibold outline-none focus:border-teal"
                    autoFocus
                  />
                </div>
              )}

              {/* Order — tap-to-arrange word chunks */}
              {q.type === "order" && (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex min-h-14 flex-wrap gap-2 rounded-2xl bg-cream/60 p-3 ring-1 ring-slate-200">
                    {pickedIdx.length === 0 && (
                      <span className="text-sm text-mist">শব্দগুলো ট্যাপ করে সাজাও…</span>
                    )}
                    {pickedIdx.map((optIndex, pos) => (
                      <button
                        key={`${optIndex}-${pos}`}
                        type="button"
                        onClick={() => toggleOrderWord(qi, optIndex, true)}
                        className="rounded-xl bg-teal px-3 py-2 font-bold text-white shadow-sm"
                      >
                        {q.options?.[optIndex]}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {remainingIdx.map((optIndex) => (
                      <button
                        key={optIndex}
                        type="button"
                        onClick={() => toggleOrderWord(qi, optIndex, false)}
                        className="rounded-xl bg-white px-3 py-2 font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition active:scale-95"
                      >
                        {q.options?.[optIndex]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setQi((v) => Math.max(0, v - 1))}
              disabled={qi === 0}
              className="btn btn-ghost inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> আগেরটা
            </button>
            {qi < total - 1 ? (
              <button
                type="button"
                onClick={() => setQi((v) => Math.min(total - 1, v + 1))}
                className="btn btn-primary inline-flex items-center gap-1.5 rounded-full px-6 py-2.5"
              >
                পরেরটা <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                className="btn btn-primary inline-flex items-center gap-1.5 rounded-full px-6 py-2.5"
              >
                <Flag className="h-4 w-4" aria-hidden /> Result দেখো
              </button>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {stage === "result" && result && (
        <div className="flex flex-col gap-4">
          <div className="card rounded-3xl p-5 text-center">
            <Mascot mood={passed ? "celebrate" : "thinking"} size={72} className="mx-auto" />
            <h3 className="mt-2 text-2xl font-extrabold text-navy">
              {passed ? "Bestanden! পাস করেছো!" : "এবার হয়নি — আবার চেষ্টা করো!"}
            </h3>
            <p className="font-bangla mt-1 text-slate-600">
              স্কোর: <b className="text-navy">{result.score}/{total}</b>
              {result.isNewBest && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-sun/30 px-3 py-0.5 text-sm font-bold text-navy">
                  <Trophy className="h-4 w-4" aria-hidden /> নতুন সেরা স্কোর!
                </span>
              )}
              {result.best !== result.score && (
                <span className="ml-2 text-sm text-mist">(সেরা: {result.best}/{total})</span>
              )}
            </p>
            {passed ? (
              <p className="font-bangla mt-2 text-sm text-teal">
                এই পাঠ শেষ! +50 XP (প্রথমবার) আর পরের পাঠ খুলে গেছে।
              </p>
            ) : (
              <p className="font-bangla mt-2 text-sm text-slate-600">
                পাস করতে {EXAM_PASS_SCORE}/{total} লাগবে। নিচে ভুলগুলো দেখে নাও, তারপর আবার দাও।
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={retry}
                className="btn btn-secondary inline-flex items-center gap-1.5 rounded-full px-6 py-2.5"
              >
                <RotateCcw className="h-4 w-4" aria-hidden /> Abar dao
              </button>
              {passed && lessonId < 12 && (
                <Link
                  href={`/lektionen/${lessonId + 1}`}
                  className="btn btn-primary inline-flex items-center gap-1.5 rounded-full px-6 py-2.5"
                >
                  Porer lesson <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
              {passed && lessonId >= 12 && (
                <Link
                  href="/certificate"
                  className="btn btn-primary inline-flex items-center gap-1.5 rounded-full px-6 py-2.5"
                >
                  Certificate দেখো <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>
          </div>

          {/* Per-question review */}
          <div className="flex flex-col gap-3">
            <h4 className="section-heading font-bangla text-base">Review — ভুলগুলো দেখে নাও</h4>
            {questions.map((ex, i) => {
              const userAns = (answers[i] ?? "").trim();
              const correct = normalize(userAns) === normalize(ex.answer);
              return (
                <div
                  key={i}
                  className={`card rounded-3xl p-4 ${
                    correct ? "ring-teal/40" : "ring-rose-300"
                  }`}
                >
                  <p className="flex items-start gap-2 font-bold text-navy">
                    {correct ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" aria-hidden />
                    )}
                    <span>
                      <span className="text-sm text-mist">#{i + 1} — </span>
                      {ex.prompt}
                    </span>
                  </p>
                  <div className="font-bangla mt-2 flex flex-col gap-1 text-sm">
                    <p className="text-slate-600">
                      তোমার উত্তর:{" "}
                      <b className={correct ? "text-teal" : "text-rose-600"}>
                        {userAns === "" ? "— উত্তর দাওনি —" : userAns}
                      </b>
                    </p>
                    {!correct && (
                      <>
                        <p className="text-slate-600">
                          সঠিক উত্তর: <b className="text-teal">{ex.answer}</b>
                        </p>
                        <p className="text-slate-700">{ex.explanation}</p>
                      </>
                    )}
                    {correct && (
                      <p className="text-teal">সঠিক!</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
