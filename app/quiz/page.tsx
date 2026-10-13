"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { words, shuffle, type Word } from "@/data/words";
import { recordReview } from "@/lib/progress";

const QUESTIONS_PER_ROUND = 10;

interface Question {
  word: Word;
  /** Bangla meanings, shuffled, first element is not necessarily correct */
  options: string[];
}

function buildQuestions(): Question[] {
  const picked = shuffle(words).slice(0, QUESTIONS_PER_ROUND);
  return picked.map((word) => {
    const distractors = shuffle(
      words.filter((w) => w.id !== word.id && w.bangla !== word.bangla)
    )
      .slice(0, 3)
      .map((w) => w.bangla);
    return { word, options: shuffle([word.bangla, ...distractors]) };
  });
}

function resultMessage(score: number, total: number): string {
  const ratio = score / total;
  if (ratio === 1) return "Perfekt! 🏆 Flawless!";
  if (ratio >= 0.7) return "Sehr gut! 🎉 Great job!";
  if (ratio >= 0.4) return "Gut gemacht! 💪 Keep going!";
  return "Weiter üben! 📚 Practice makes perfect!";
}

export default function QuizPage() {
  // Built in an effect so server prerender and client hydration match
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setQuestions(buildQuestions());
  }, []);

  if (!questions) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-4xl" aria-hidden>
          🃏
        </p>
        <p className="font-semibold text-slate-500">Preparing your quiz…</p>
      </div>
    );
  }

  const finished = qIndex >= questions.length;

  const restart = () => {
    setQuestions(buildQuestions());
    setQIndex(0);
    setSelected(null);
    setScore(0);
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-5 py-8 text-center">
        <p className="text-6xl" aria-hidden>
          {score === questions.length ? "🏆" : score >= 7 ? "🎉" : "💪"}
        </p>
        <h1 className="text-3xl font-extrabold text-indigo-950">
          {score} / {questions.length}
        </h1>
        <p className="text-lg font-semibold text-slate-600">{resultMessage(score, questions.length)}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={restart}
            className="rounded-full bg-indigo-600 px-8 py-3 font-bold text-white shadow-md shadow-indigo-200 transition active:scale-95"
          >
            🔁 Play again
          </button>
          <Link
            href="/"
            className="rounded-full bg-white px-8 py-3 text-center font-bold text-indigo-700 shadow-md ring-1 ring-indigo-100 transition active:scale-95"
          >
            🃏 Back to cards
          </Link>
        </div>
      </div>
    );
  }

  const q = questions[qIndex];
  const answered = selected !== null;

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
    if (option === q.word.bangla) setScore((s) => s + 1);
    recordReview();
  };

  const handleNext = () => {
    setQIndex((i) => i + 1);
    setSelected(null);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-500">
          Question {qIndex + 1} / {questions.length}
        </p>
        <p className="rounded-full bg-white px-4 py-1 text-sm font-bold text-indigo-700 shadow-sm ring-1 ring-indigo-100">
          ⭐ Score: {score}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-indigo-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
          style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-center shadow-xl shadow-indigo-200">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200">
          What does this mean in Bangla?
        </p>
        <p className="mt-2 text-4xl font-extrabold text-white sm:text-5xl">{q.word.german}</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {q.options.map((option) => {
          const isCorrect = option === q.word.bangla;
          const isPicked = option === selected;
          let cls =
            "bg-white text-slate-800 ring-1 ring-indigo-100 hover:ring-indigo-300 hover:bg-indigo-50";
          if (answered && isCorrect) cls = "bg-emerald-500 text-white ring-emerald-500";
          else if (answered && isPicked) cls = "bg-rose-500 text-white ring-rose-500";
          else if (answered) cls = "bg-white text-slate-400 ring-1 ring-slate-100";

          return (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={`font-bangla rounded-2xl px-6 py-4 text-left text-xl font-bold shadow-sm transition active:scale-[0.98] ${cls}`}
            >
              <span className="mr-2" aria-hidden>
                {answered && isCorrect ? "✅" : answered && isPicked ? "❌" : "▫️"}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Feedback + next */}
      {answered && (
        <div className="flex flex-col items-center gap-3">
          <p className="font-bangla text-center text-sm text-slate-600">
            {selected === q.word.bangla ? (
              <>🎉 Richtig! <span className="font-bold text-emerald-600">সঠিক!</span></>
            ) : (
              <>
                💡 The answer was <span className="font-bold text-indigo-700">{q.word.bangla}</span>
                <br />
                <span className="italic text-slate-500">{q.word.example}</span>
                <br />
                <span>{q.word.exampleBangla}</span>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-full bg-indigo-600 px-10 py-3 font-bold text-white shadow-md shadow-indigo-200 transition active:scale-95"
          >
            {qIndex + 1 === questions.length ? "See result →" : "Next →"}
          </button>
        </div>
      )}
    </div>
  );
}
