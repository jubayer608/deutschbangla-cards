"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Flashcard from "@/components/Flashcard";
import { words, shuffle } from "@/data/words";
import { getProgress, recordReview, type Progress } from "@/lib/progress";

export default function Home() {
  // Start with a stable order so server prerender and client hydration match;
  // shuffle on the client after mount.
  const [order, setOrder] = useState(words);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState<Progress>({ streak: 0, reviewed: 0 });

  useEffect(() => {
    setOrder(shuffle(words));
    setProgress(getProgress());
  }, []);

  const word = order[index];

  const goTo = useCallback(
    (next: number) => {
      setIndex((next + order.length) % order.length);
      setFlipped(false);
    },
    [order.length]
  );

  const handleFlip = () => {
    if (!flipped) {
      // Count a review the first time the meaning is revealed
      setProgress(recordReview());
    }
    setFlipped((f) => !f);
  };

  const handleShuffle = () => {
    setOrder(shuffle(words));
    setIndex(0);
    setFlipped(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Stats */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-orange-100">
          <span className="text-lg" aria-hidden>
            🔥
          </span>
          <span className="text-sm font-bold text-slate-700">
            {progress.streak} day{progress.streak === 1 ? "" : "s"} streak
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-indigo-100">
          <span className="text-lg" aria-hidden>
            📚
          </span>
          <span className="text-sm font-bold text-slate-700">
            {progress.reviewed} reviewed
          </span>
        </div>
      </div>

      {/* Card counter */}
      <p className="text-center text-sm font-semibold text-slate-500">
        Card {index + 1} / {order.length}
      </p>

      {/* Flashcard */}
      <Flashcard word={word} flipped={flipped} onFlip={handleFlip} />

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          className="rounded-full bg-white px-6 py-3 text-lg font-bold text-indigo-700 shadow-md ring-1 ring-indigo-100 transition active:scale-95"
          aria-label="Previous card"
        >
          ←
        </button>
        <button
          type="button"
          onClick={handleShuffle}
          className="rounded-full bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow-md ring-1 ring-indigo-100 transition active:scale-95"
        >
          🔀 Shuffle
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          className="rounded-full bg-indigo-600 px-6 py-3 text-lg font-bold text-white shadow-md shadow-indigo-200 transition active:scale-95"
          aria-label="Next card"
        >
          →
        </button>
      </div>

      {/* Quiz CTA */}
      <Link
        href="/quiz"
        className="mx-auto mt-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-4 text-center text-base font-extrabold text-white shadow-lg shadow-emerald-200 transition active:scale-95"
      >
        ✍️ Test yourself — take the quiz
      </Link>
    </div>
  );
}
