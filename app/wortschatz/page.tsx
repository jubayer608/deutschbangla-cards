"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { words, categories, shuffle, type VocabWord } from "@/data/words";
import { phraseGroups } from "@/data/phrases";
import { getFullProgress, markWord, type ProgressState } from "@/lib/progress";
import Flashcard from "@/components/Flashcard";
import EmptyState from "@/components/EmptyState";

type Tab = "words" | "phrases";

export default function WortschatzPage() {
  const [tab, setTab] = useState<Tab>("words");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("alle");
  const [studyMode, setStudyMode] = useState(false);
  const [deck, setDeck] = useState<VocabWord[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(phraseGroups[0]?.id ?? null);

  useEffect(() => {
    setProgress(getFullProgress());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return words.filter((w) => {
      const okCat = cat === "alle" || w.category === cat;
      const okQ =
        !q ||
        w.german.toLowerCase().includes(q) ||
        w.bangla.includes(query.trim());
      return okCat && okQ;
    });
  }, [query, cat]);

  const startStudy = () => {
    const pool = filtered.length > 0 ? filtered : words;
    setDeck(shuffle(pool));
    setDeckIndex(0);
    setStudyMode(true);
  };

  const handleSwipe = (known: boolean) => {
    const w = deck[deckIndex];
    if (w) {
      const p = markWord(w.id, known);
      setProgress(p);
    }
    setDeckIndex((i) => i + 1);
  };

  const current = deck[deckIndex];
  const studyDone = studyMode && deckIndex >= deck.length;

  if (studyMode) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStudyMode(false)}
            className="font-bangla rounded-full bg-white px-5 py-2 font-bold text-indigo-700 shadow-sm ring-1 ring-indigo-100"
          >
            ✕ বন্ধ করো
          </button>
          <p className="font-bangla text-sm font-bold text-slate-500">
            {studyDone ? "শেষ!" : `${Math.min(deckIndex + 1, deck.length)} / ${deck.length}`}
          </p>
        </div>

        {studyDone ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="text-6xl">🎉</p>
            <h2 className="font-bangla text-2xl font-extrabold text-indigo-950">শেষ! Gut gemacht!</h2>
            <p className="font-bangla text-slate-500">
              {deck.length}টি শব্দ রিভিউ করলে। ডানদিকে সোয়াইপ = জানি, বামদিকে = জানি না।
            </p>
            <button
              type="button"
              onClick={startStudy}
              className="rounded-full bg-indigo-600 px-8 py-3 font-bold text-white shadow-md transition active:scale-95"
            >
              🔁 আবার পড়ো
            </button>
          </div>
        ) : (
          current && (
            <>
              <div className="h-2 overflow-hidden rounded-full bg-indigo-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  animate={{ width: `${((deckIndex + 1) / deck.length) * 100}%` }}
                />
              </div>
              <AnimatePresence mode="wait">
                <Flashcard key={current.id} word={current} onSwipe={handleSwipe} />
              </AnimatePresence>
              <p className="font-bangla text-center text-xs text-slate-400">
                👈 বামে সোয়াইপ = জানি না &nbsp;·&nbsp; ডানে সোয়াইপ = জানি 👉
              </p>
            </>
          )
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-bangla text-sm font-semibold text-indigo-500">{words.length}টি A1 শব্দ</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-indigo-950">🃏 Wortschatz</h1>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 rounded-3xl bg-indigo-50 p-1.5">
        {(["words", "phrases"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`font-bangla rounded-2xl py-2.5 font-extrabold transition ${
              tab === t ? "bg-white text-indigo-700 shadow" : "text-slate-500"
            }`}
          >
            {t === "words" ? "📚 শব্দ" : "💬 Redemittel"}
          </button>
        ))}
      </div>

      {tab === "words" && (
        <>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suche… / খুঁজো…"
              className="font-bangla min-w-0 flex-1 rounded-2xl border-2 border-indigo-100 bg-white px-4 py-3 font-semibold outline-none focus:border-indigo-400"
            />
            <button
              type="button"
              onClick={startStudy}
              className="font-bangla shrink-0 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 font-extrabold text-white shadow-md transition active:scale-95"
            >
              ▶️ পড়ো
            </button>
          </div>

          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            <button
              type="button"
              onClick={() => setCat("alle")}
              className={`font-bangla shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                cat === "alle" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-indigo-100"
              }`}
            >
              সব
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                  cat === c.id ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-indigo-100"
                }`}
              >
                <span className="font-bangla">{c.bangla}</span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon="🔍" title="কিছু পাওয়া যায়নি" message="অন্য শব্দ দিয়ে খুঁজে দেখো।" />
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-3">
              <AnimatePresence>
                {filtered.map((w) => {
                  const isFlipped = !!flipped[w.id];
                  const known = progress?.knownWords.includes(w.id);
                  return (
                    <motion.button
                      layout
                      key={w.id}
                      type="button"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setFlipped((f) => ({ ...f, [w.id]: !f[w.id] }))}
                      className={`relative min-h-28 rounded-3xl p-4 text-left shadow-sm ring-1 transition active:scale-95 ${
                        known ? "bg-emerald-50 ring-emerald-200" : "bg-white ring-indigo-100"
                      }`}
                    >
                      {known && <span className="absolute right-3 top-3 text-sm">✅</span>}
                      {isFlipped ? (
                        <>
                          <p className="font-bangla text-lg font-extrabold text-indigo-900">{w.bangla}</p>
                          <p className="mt-1 text-xs italic text-slate-500">{w.example}</p>
                          <p className="font-bangla text-xs text-slate-500">{w.exampleBangla}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-extrabold text-indigo-950">{w.german}</p>
                          <p className="font-bangla mt-1 text-xs text-slate-400">ট্যাপ করো 👆</p>
                        </>
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}

      {tab === "phrases" && (
        <div className="flex flex-col gap-3">
          {phraseGroups.map((g) => {
            const open = openGroup === g.id;
            return (
              <div key={g.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-indigo-100">
                <button
                  type="button"
                  onClick={() => setOpenGroup(open ? null : g.id)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <span>
                    <span className="block font-extrabold text-indigo-950">{g.situation}</span>
                    <span className="font-bangla block text-sm text-slate-500">
                      {g.situationBangla} · {g.items.length}টি বাক্য
                    </span>
                  </span>
                  <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-slate-400">
                    ⌄
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="flex flex-col gap-2 border-t border-indigo-50 p-4">
                        {g.items.map((p, i) => (
                          <li key={i} className="rounded-2xl bg-indigo-50/60 px-3 py-2">
                            <p className="font-bold text-indigo-900">{p.german}</p>
                            <p className="font-bangla text-sm text-slate-600">{p.bangla}</p>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
