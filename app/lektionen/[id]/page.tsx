"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getLesson, type Exercise } from "@/data/lessons";
import { words, type Difficulty } from "@/data/words";
import {
  getFullProgress,
  completeLesson,
  xpForDifficulty,
  type ProgressState,
} from "@/lib/progress";
import { celebrate, bigCelebration } from "@/lib/confetti";
import EmptyState from "@/components/EmptyState";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.,!?¿¡;:'"«»„“”]/g, "")
    .replace(/\s+/g, " ");
}

const diffLabel: Record<Difficulty, string> = { easy: "সহজ", medium: "মাঝারি", hard: "কঠিন" };
const diffColor: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-rose-100 text-rose-700",
};

function ExerciseCard({
  ex,
  index,
  onCorrect,
}: {
  ex: Exercise;
  index: number;
  onCorrect: (xp: number) => void;
}) {
  const [mcqPick, setMcqPick] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    if (ex.type === "order") setRemaining(ex.options ?? []);
  }, [ex]);

  const xp = xpForDifficulty(ex.difficulty, "exercise");

  const succeed = () => {
    setDone(true);
    setCorrect(true);
    onCorrect(xp);
    celebrate();
  };
  const fail = () => {
    setDone(true);
    setCorrect(false);
    setShakeKey((k) => k + 1);
  };

  const checkMcq = (opt: string) => {
    if (done) return;
    setMcqPick(opt);
    if (normalize(opt) === normalize(ex.answer)) succeed();
    else fail();
  };

  const checkText = () => {
    if (done || !text.trim()) return;
    if (normalize(text) === normalize(ex.answer)) succeed();
    else fail();
  };

  const checkOrder = () => {
    if (done || picked.length === 0) return;
    if (normalize(picked.join(" ")) === normalize(ex.answer)) succeed();
    else fail();
  };

  const toggleWord = (w: string, fromPicked: boolean) => {
    if (done) return;
    if (fromPicked) {
      setPicked((p) => p.filter((x) => x !== w));
      setRemaining((r) => [...r, w]);
    } else {
      setRemaining((r) => r.filter((x) => x !== w));
      setPicked((p) => [...p, w]);
    }
  };

  return (
    <motion.div
      key={shakeKey}
      className={`rounded-3xl bg-white p-5 shadow-sm ring-1 ${
        done ? (correct ? "ring-emerald-300" : "ring-rose-300") : "ring-emerald-100"
      } ${shakeKey > 0 && !correct && done ? "animate-shake" : ""}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-extrabold text-slate-400">#{index + 1}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${diffColor[ex.difficulty]}`}>
          {diffLabel[ex.difficulty]} · +{xp} XP
        </span>
      </div>
      <p className="mt-2 text-lg font-bold text-emerald-950">{ex.prompt}</p>
      {ex.promptBangla && <p className="font-bangla mt-1 text-sm text-slate-500">{ex.promptBangla}</p>}

      {/* MCQ */}
      {ex.type === "mcq" && (
        <div className="mt-4 flex flex-col gap-2">
          {ex.options?.map((opt) => {
            const isAns = normalize(opt) === normalize(ex.answer);
            const isPick = mcqPick === opt;
            let cls = "bg-emerald-50/50 text-slate-800 ring-1 ring-emerald-100 hover:ring-emerald-300";
            if (done && isAns) cls = "bg-emerald-500 text-white";
            else if (done && isPick) cls = "bg-rose-500 text-white";
            else if (done) cls = "bg-slate-50 text-slate-400 ring-1 ring-slate-100";
            return (
              <motion.button
                key={opt}
                type="button"
                disabled={done}
                onClick={() => checkMcq(opt)}
                whileTap={!done ? { scale: 0.98 } : undefined}
                animate={done && isAns ? { scale: [1, 1.04, 1] } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`rounded-2xl px-4 py-3 text-left font-bold shadow-sm ${cls}`}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Fillblank / Translate */}
      {(ex.type === "fillblank" || ex.type === "translate") && (
        <div className="mt-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={done}
            placeholder={ex.type === "fillblank" ? "উত্তর লিখো…" : "Auf Deutsch schreiben…"}
            className="font-bangla min-w-0 flex-1 rounded-2xl border-2 border-emerald-100 px-4 py-3 font-semibold outline-none focus:border-emerald-400 disabled:bg-slate-50"
            onKeyDown={(e) => e.key === "Enter" && checkText()}
          />
          <button
            type="button"
            onClick={checkText}
            disabled={done}
            className="rounded-2xl bg-emerald-600 px-5 font-bold text-white shadow-md transition active:scale-95 disabled:opacity-40"
          >
            ✓
          </button>
        </div>
      )}

      {/* Order */}
      {ex.type === "order" && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex min-h-14 flex-wrap gap-2 rounded-2xl bg-emerald-50/60 p-3 ring-1 ring-emerald-100">
            {picked.length === 0 && <span className="text-sm text-slate-400">শব্দগুলো ট্যাপ করে সাজাও…</span>}
            {picked.map((w, i) => (
              <button
                key={`${w}-${i}`}
                type="button"
                disabled={done}
                onClick={() => toggleWord(w, true)}
                className="rounded-xl bg-emerald-600 px-3 py-2 font-bold text-white shadow-sm"
              >
                {w}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {remaining.map((w, i) => (
              <button
                key={`${w}-${i}`}
                type="button"
                disabled={done}
                onClick={() => toggleWord(w, false)}
                className="rounded-xl bg-white px-3 py-2 font-bold text-slate-700 shadow-sm ring-1 ring-emerald-100 transition active:scale-95"
              >
                {w}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={checkOrder}
            disabled={done || picked.length === 0}
            className="self-start rounded-full bg-emerald-600 px-6 py-2.5 font-bold text-white shadow-md transition active:scale-95 disabled:opacity-40"
          >
            Prüfen ✓
          </button>
        </div>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={`font-bangla mt-3 overflow-hidden rounded-2xl p-3 text-sm ${
              correct ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
            }`}
          >
            {correct ? (
              <p>
                🎉 <b>সঠিক!</b> +{xp} XP — {ex.explanation}
              </p>
            ) : (
              <p>
                💡 <b>সঠিক উত্তর:</b> {ex.answer}
                <br />
                {ex.explanation}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LessonDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const lesson = useMemo(() => getLesson(id), [id]);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    setProgress(getFullProgress());
  }, []);

  const vocabWords = useMemo(
    () =>
      lesson
        ? lesson.vocabIds
            .map((wid) => words.find((w) => w.id === wid))
            .filter((w): w is (typeof words)[number] => Boolean(w))
        : [],
    [lesson]
  );

  if (!lesson) {
    return <EmptyState icon="📖" title="পাঠ পাওয়া যায়নি" message="এই নম্বরের কোনো পাঠ নেই।" />;
  }

  const isDone = progress?.lessonsDone.includes(lesson.id) ?? false;

  const handleCorrect = (xp: number) => setXpGained((x) => x + xp);

  const handleComplete = () => {
    const p = completeLesson(lesson.id);
    setProgress(p);
    bigCelebration();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link href="/lektionen" className="font-bangla text-sm font-bold text-emerald-600">
          ← সব পাঠ
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-2xl font-extrabold text-white shadow-lg">
            {lesson.id}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950">
              Lektion {lesson.id}: {lesson.title}
            </h1>
            <p className="font-bangla text-slate-500">{lesson.titleBangla}</p>
          </div>
        </div>
        {isDone && (
          <p className="font-bangla mt-3 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold text-emerald-700">
            ✅ এই পাঠ শেষ করেছো!
          </p>
        )}
      </div>

      {/* Lernziele */}
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-emerald-100">
        <h2 className="font-bangla text-lg font-extrabold text-emerald-950">🎯 Lernziele — শেখার লক্ষ্য</h2>
        <ul className="font-bangla mt-3 flex flex-col gap-2">
          {lesson.ziele.map((z, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-700">
              <span className="text-emerald-500">✓</span> {z}
            </li>
          ))}
        </ul>
      </section>

      {/* Wortschatz */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bangla text-lg font-extrabold text-emerald-950">
          🃏 Wortschatz — শব্দভাণ্ডার ({vocabWords.length})
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {vocabWords.map((w) => (
            <div key={w.id} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-emerald-100">
              <p className="font-extrabold text-emerald-900">{w.german}</p>
              <p className="font-bangla text-sm text-slate-600">{w.bangla}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grammatik */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bangla text-lg font-extrabold text-emerald-950">📖 Grammatik — ব্যাকরণ</h2>
        {lesson.grammar.map((g, i) => (
          <div key={i} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-emerald-100">
            <h3 className="font-extrabold text-emerald-900">{g.title}</h3>
            <p className="font-bangla mt-2 text-slate-700">{g.explanation}</p>
            {g.table && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-64 border-collapse text-sm">
                  <thead>
                    <tr>
                      {g.table.headers.map((h, hi) => (
                        <th key={hi} className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-left font-bold text-emerald-900">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {g.table.rows.map((row, ri) => (
                      <tr key={ri} className={ri % 2 ? "bg-emerald-50/40" : ""}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="border border-emerald-100 px-3 py-2 text-slate-700">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {g.examples && (
              <ul className="mt-3 flex flex-col gap-1.5">
                {g.examples.map((e, ei) => (
                  <li key={ei} className="rounded-xl bg-emerald-50/60 px-3 py-2 text-sm">
                    <span className="font-bold text-emerald-900">{e.german}</span>
                    <span className="font-bangla block text-slate-600">{e.bangla}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* Beispielsätze */}
      <section className="flex flex-col gap-2">
        <h2 className="font-bangla text-lg font-extrabold text-emerald-950">💬 Beispielsätze — উদাহরণ বাক্য</h2>
        {lesson.saetze.map((s, i) => (
          <div key={i} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-emerald-100">
            <p className="font-bold text-emerald-900">{s.german}</p>
            <p className="font-bangla text-sm text-slate-600">{s.bangla}</p>
          </div>
        ))}
      </section>

      {/* Übungen */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bangla text-lg font-extrabold text-emerald-950">
            ✍️ Übungen — অনুশীলন <span className="text-sm font-semibold text-slate-400">(সহজ → কঠিন)</span>
          </h2>
          {xpGained > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
              +{xpGained} XP
            </span>
          )}
        </div>
        {lesson.uebungen.map((ex, i) => (
          <ExerciseCard key={i} ex={ex} index={i} onCorrect={handleCorrect} />
        ))}
      </section>

      {/* Complete */}
      <div className="flex flex-col items-center gap-3 pb-4">
        {isDone ? (
          <p className="font-bangla text-emerald-700 font-bold">🎉 Lektion abgeschlossen! পরের পাঠে এগিয়ে যাও।</p>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-10 py-4 text-lg font-extrabold text-white shadow-xl shadow-emerald-200 transition active:scale-95"
          >
            🏁 Lektion abschließen (+50 XP)
          </button>
        )}
        <div className="flex gap-3">
          {lesson.id > 1 && (
            <Link href={`/lektionen/${lesson.id - 1}`} className="font-bangla rounded-full bg-white px-6 py-2.5 font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
              ← আগের পাঠ
            </Link>
          )}
          {lesson.id < 12 && (
            <Link href={`/lektionen/${lesson.id + 1}`} className="font-bangla rounded-full bg-white px-6 py-2.5 font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
              পরের পাঠ →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
