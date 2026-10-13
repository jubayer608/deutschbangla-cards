"use client";

import type { Word } from "@/data/words";

const posColors: Record<Word["pos"], string> = {
  noun: "bg-sky-100 text-sky-800",
  verb: "bg-rose-100 text-rose-800",
  adjective: "bg-amber-100 text-amber-800",
  adverb: "bg-violet-100 text-violet-800",
  phrase: "bg-emerald-100 text-emerald-800",
};

interface Props {
  word: Word;
  flipped: boolean;
  onFlip: () => void;
}

export default function Flashcard({ word, flipped, onFlip }: Props) {
  return (
    <button
      type="button"
      onClick={onFlip}
      aria-label={flipped ? "Show German word" : "Reveal Bangla meaning"}
      className="dbc-perspective block w-full cursor-pointer text-left focus:outline-none"
    >
      <div className={`dbc-flip-inner relative h-72 sm:h-80 ${flipped ? "dbc-flipped" : ""}`}>
        {/* Front: German word */}
        <div className="dbc-face absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-200">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${posColors[word.pos]}`}
          >
            {word.pos}
          </span>
          <p className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
            {word.german}
          </p>
          <p className="text-sm font-medium text-indigo-200">👆 Tap to reveal meaning</p>
        </div>

        {/* Back: Bangla meaning + example */}
        <div className="dbc-face dbc-back absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-white p-6 text-center shadow-xl shadow-indigo-200 ring-1 ring-indigo-100">
          <p className="font-bangla text-4xl font-extrabold text-indigo-950 sm:text-5xl">
            {word.bangla}
          </p>
          <div className="mt-2 w-full rounded-2xl bg-indigo-50 p-4">
            <p className="text-base font-semibold text-slate-800">{word.example}</p>
            <p className="font-bangla mt-1 text-sm text-slate-600">{word.exampleBangla}</p>
          </div>
        </div>
      </div>
    </button>
  );
}
