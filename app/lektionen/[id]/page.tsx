"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getLesson, type Exercise } from "@/data/lessons";
import { words, type Difficulty } from "@/data/words";
import {
  blockingLessonId,
  getFullProgress,
  completeLesson,
  isLessonUnlocked,
  xpForDifficulty,
  type ProgressState,
} from "@/lib/progress";
import { celebrate, bigCelebration } from "@/lib/confetti";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Layers,
  Lock,
  MessageCircle,
  PenLine,
  Target,
} from "lucide-react";
import SpeakButton from "@/components/SpeakButton";
import Mascot from "@/components/Mascot";
import EmptyState from "@/components/EmptyState";
import LessonExam from "@/components/LessonExam";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.,!?¿¡;:'"«»„“”]/g, "")
    .replace(/\s+/g, " ");
}

const diffLabel: Record<Difficulty, string> = { easy: "সহজ", medium: "মাঝারি", hard: "কঠিন" };
const diffColor: Record<Difficulty, string> = {
  easy: "badge bg-teal/15 text-teal",
  medium: "badge bg-sun/30 text-navy",
  hard: "badge bg-navy text-white",
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
      className={`card rounded-3xl p-5 ${
        done ? (correct ? "ring-teal/50" : "ring-rose-300") : "ring-slate-200"
      } ${shakeKey > 0 && !correct && done ? "animate-shake" : ""}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-extrabold text-mist">#{index + 1}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${diffColor[ex.difficulty]}`}>
          {diffLabel[ex.difficulty]} · +{xp} XP
        </span>
      </div>
      <p className="mt-2 text-lg font-bold text-navy">{ex.prompt}</p>
      {ex.promptBangla && <p className="font-bangla mt-1 text-sm text-slate-500">{ex.promptBangla}</p>}

      {/* MCQ */}
      {ex.type === "mcq" && (
        <div className="mt-4 flex flex-col gap-2">
          {ex.options?.map((opt) => {
            const isAns = normalize(opt) === normalize(ex.answer);
            const isPick = mcqPick === opt;
            let cls = "bg-cream/50 text-slate-800 ring-1 ring-slate-200 hover:ring-teal/50";
            if (done && isAns) cls = "bg-teal text-white";
            else if (done && isPick) cls = "bg-rose-500 text-white";
            else if (done) cls = "bg-slate-50 text-mist ring-1 ring-slate-100";
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
            className="font-bangla min-w-0 flex-1 rounded-2xl border-2 border-slate-200 px-4 py-3 font-semibold outline-none focus:border-teal disabled:bg-slate-50"
            onKeyDown={(e) => e.key === "Enter" && checkText()}
          />
          <button
            type="button"
            onClick={checkText}
            disabled={done}
            className="btn btn-primary flex items-center rounded-2xl px-5 disabled:opacity-40"
          >
            <Check className="h-5 w-5" strokeWidth={3} aria-hidden />
          </button>
        </div>
      )}

      {/* Order */}
      {ex.type === "order" && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex min-h-14 flex-wrap gap-2 rounded-2xl bg-cream/60 p-3 ring-1 ring-slate-200">
            {picked.length === 0 && <span className="text-sm text-mist">শব্দগুলো ট্যাপ করে সাজাও…</span>}
            {picked.map((w, i) => (
              <button
                key={`${w}-${i}`}
                type="button"
                disabled={done}
                onClick={() => toggleWord(w, true)}
                className="rounded-xl bg-teal px-3 py-2 font-bold text-white shadow-sm"
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
                className="rounded-xl bg-white px-3 py-2 font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition active:scale-95"
              >
                {w}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={checkOrder}
            disabled={done || picked.length === 0}
            className="btn btn-primary inline-flex items-center gap-1.5 self-start rounded-full px-6 py-2.5 disabled:opacity-40"
          >
            Prüfen <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
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
              correct ? "bg-cream text-navy" : "bg-rose-50 text-rose-800"
            }`}
          >
            {correct ? (
              <p className="flex items-start gap-2">
                <Mascot mood="happy" size={32} className="shrink-0" />
                <span>
                  <b>সঠিক!</b> +{xp} XP — {ex.explanation}
                </span>
              </p>
            ) : (
              <p className="flex items-start gap-2">
                <Mascot mood="angry" size={32} className="shrink-0" />
                <span>
                  <b>সঠিক উত্তর:</b> {ex.answer}
                  <br />
                  {ex.explanation}
                </span>
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
    return <EmptyState Icon={BookOpen} title="পাঠ পাওয়া যায়নি" message="এই নম্বরের কোনো পাঠ নেই।" />;
  }

  // Progress loads client-side (localStorage). Wait for it so a locked
  // lesson never flashes its content before the lock screen appears.
  if (!progress) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Mascot mood="thinking" size={72} />
        <p className="font-bangla text-slate-500">পাঠ লোড হচ্ছে…</p>
      </div>
    );
  }

  const isDone = progress.lessonsDone.includes(lesson.id);
  const locked = !isLessonUnlocked(lesson.id, progress.lessonsDone);
  const blocking = blockingLessonId(lesson.id, progress.lessonsDone);

  // Locked lesson: show the road ahead (title, goals, what it covers)
  // but not the content — plus a button to the required previous lesson.
  if (locked && blocking !== null) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/lektionen"
          className="font-bangla inline-flex items-center gap-1.5 text-sm font-bold text-teal transition hover:gap-2.5"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> সব পাঠ
        </Link>
        <div className="card flex flex-col items-center gap-3 rounded-3xl p-6 text-center sm:p-8">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-navy text-white">
            <Lock className="h-8 w-8" aria-hidden />
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">
            Lektion {lesson.id}: {lesson.title}
          </h1>
          <p className="font-bangla text-slate-500">{lesson.titleBangla}</p>
          <p className="font-bangla max-w-md text-slate-700">
            এই পাঠটা এখনো লক করা। <b>Age Lesson {blocking} shesh koro</b> — ওই পাঠের Exam-এ পাস
            করলেই এই পাঠ খুলে যাবে।
          </p>
          <Link
            href={`/lektionen/${blocking}`}
            className="btn btn-primary mt-1 inline-flex items-center gap-1.5 rounded-full px-8 py-3"
          >
            Lesson {blocking} shesh koro <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        {/* What this lesson covers — visible even while locked */}
        <section className="card rounded-3xl p-5">
          <h2 className="section-heading font-bangla inline-flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-teal" aria-hidden /> এই পাঠে কী শিখবে
          </h2>
          <ul className="font-bangla mt-3 flex flex-col gap-2">
            {lesson.ziele.map((z, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" strokeWidth={3} aria-hidden />{" "}
                {z}
              </li>
            ))}
          </ul>
          <p className="font-bangla mt-4 text-sm text-mist">
            {lesson.vocabIds.length} শব্দ · {lesson.grammar.length} ব্যাকরণ টপিক ·{" "}
            {lesson.uebungen.length} অনুশীলন · ১০ প্রশ্নের Exam (৫ মিনিট, পাস ৭০%)
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {lesson.grammar.map((g, i) => (
              <span
                key={i}
                className="badge rounded-full bg-cream px-3 py-1 text-xs font-bold text-navy"
              >
                {g.title}
              </span>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const handleCorrect = (xp: number) => setXpGained((x) => x + xp);

  // Passing the exam is the ONLY way a lesson enters lessonsDone now
  // (completeLesson keeps the existing +50 XP first-pass rule).
  const handleExamPass = () => {
    const p = completeLesson(lesson.id);
    setProgress(p);
    bigCelebration();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link
          href="/lektionen"
          className="font-bangla inline-flex items-center gap-1.5 text-sm font-bold text-teal transition hover:gap-2.5"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> সব পাঠ
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-2xl font-extrabold text-white shadow-lg">
            {lesson.id}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-navy">
              Lektion {lesson.id}: {lesson.title}
            </h1>
            <p className="font-bangla text-slate-500">{lesson.titleBangla}</p>
          </div>
        </div>
        {isDone && (
          <p className="font-bangla mt-3 inline-flex items-center gap-1.5 badge rounded-full bg-teal/15 px-4 py-1.5 text-sm text-teal">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> এই পাঠ শেষ করেছো!
          </p>
        )}
      </div>

      {/* Lernziele */}
      <section className="card rounded-3xl p-5">
        <h2 className="section-heading font-bangla inline-flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-teal" aria-hidden /> Lernziele — শেখার লক্ষ্য
        </h2>
        <ul className="font-bangla mt-3 flex flex-col gap-2">
          {lesson.ziele.map((z, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" strokeWidth={3} aria-hidden />{" "}
              {z}
            </li>
          ))}
        </ul>
      </section>

      {/* Wortschatz */}
      <section className="flex flex-col gap-3">
        <h2 className="section-heading font-bangla inline-flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5 text-teal" aria-hidden /> Wortschatz — শব্দভাণ্ডার (
          {vocabWords.length})
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {vocabWords.map((w) => (
            <div key={w.id} className="card rounded-2xl p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-extrabold text-navy">{w.german}</p>
                <SpeakButton text={w.german} className="h-7 w-7" />
              </div>
              <p className="font-bangla text-sm text-slate-600">{w.bangla}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grammatik */}
      <section className="flex flex-col gap-3">
        <h2 className="section-heading font-bangla inline-flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-teal" aria-hidden /> Grammatik — ব্যাকরণ
        </h2>
        {lesson.grammar.map((g, i) => (
          <div key={i} className="card rounded-3xl p-5">
            <h3 className="font-extrabold text-navy">{g.title}</h3>
            <p className="font-bangla mt-2 text-slate-700">{g.explanation}</p>
            {g.table && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-64 border-collapse text-sm">
                  <thead>
                    <tr>
                      {g.table.headers.map((h, hi) => (
                        <th key={hi} className="border border-teal/30 bg-cream px-3 py-2 text-left font-bold text-navy">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {g.table.rows.map((row, ri) => (
                      <tr key={ri} className={ri % 2 ? "bg-cream/40" : ""}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="border border-slate-200 px-3 py-2 text-slate-700">
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
                  <li key={ei} className="rounded-xl bg-cream/60 px-3 py-2 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-navy">{e.german}</span>
                      <SpeakButton text={e.german} className="h-7 w-7" />
                    </div>
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
        <h2 className="section-heading font-bangla inline-flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-teal" aria-hidden /> Beispielsätze — উদাহরণ বাক্য
        </h2>
        {lesson.saetze.map((s, i) => (
          <div key={i} className="card rounded-2xl p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-navy">{s.german}</p>
              <SpeakButton text={s.german} className="h-7 w-7" />
            </div>
            <p className="font-bangla text-sm text-slate-600">{s.bangla}</p>
          </div>
        ))}
      </section>

      {/* Übungen */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="section-heading font-bangla inline-flex items-center gap-2 text-lg">
            <PenLine className="h-5 w-5 text-teal" aria-hidden /> Übungen — অনুশীলন{" "}
            <span className="text-sm font-semibold text-mist">(সহজ → কঠিন)</span>
          </h2>
          {xpGained > 0 && (
            <span className="badge rounded-full bg-sun/30 px-3 py-1 text-sm text-navy">
              +{xpGained} XP
            </span>
          )}
        </div>
        {lesson.uebungen.map((ex, i) => (
          <ExerciseCard key={i} ex={ex} index={i} onCorrect={handleCorrect} />
        ))}
      </section>

      {/* Exam — the gate: passing marks the lesson complete */}
      <section id="exam" className="flex scroll-mt-24 flex-col gap-3">
        <h2 className="section-heading font-bangla inline-flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-teal" aria-hidden /> Exam — পরীক্ষা{" "}
          <span className="text-sm font-semibold text-mist">(১০ প্রশ্ন · ৫ মিনিট · পাস ৭০%)</span>
        </h2>
        {isDone && (
          <p className="font-bangla inline-flex items-center gap-1.5 text-sm font-bold text-teal">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> এই পাঠের Exam-এ পাস করেছো — আবার দিয়ে
            সেরা স্কোর বাড়াতে পারো।
          </p>
        )}
        <LessonExam
          key={lesson.id}
          lessonId={lesson.id}
          exam={lesson.exam}
          onPass={handleExamPass}
        />
      </section>

      {/* Prev / Next */}
      <div className="flex flex-col items-center gap-3 pb-4">
        <div className="flex gap-3">
          {lesson.id > 1 && (
            <Link
              href={`/lektionen/${lesson.id - 1}`}
              className="btn btn-ghost font-bangla inline-flex items-center gap-1.5 rounded-full px-6 py-2.5"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> আগের পাঠ
            </Link>
          )}
          {lesson.id < 12 && (
            <Link
              href={`/lektionen/${lesson.id + 1}`}
              className="btn btn-ghost font-bangla inline-flex items-center gap-1.5 rounded-full px-6 py-2.5"
            >
              পরের পাঠ <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
