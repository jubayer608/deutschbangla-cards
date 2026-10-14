"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { words, categories, shuffle, type VocabWord } from "@/data/words";
import { phraseGroups } from "@/data/phrases";
import { getFullProgress, markWord, type ProgressState } from "@/lib/progress";
import Flashcard from "@/components/Flashcard";
import SpeakButton from "@/components/SpeakButton";
import EmptyState from "@/components/EmptyState";
import {
  ArrowLeftRight,
  CheckCircle2,
  ChevronDown,
  Layers,
  Library,
  MessageCircle,
  MousePointerClick,
  PartyPopper,
  Play,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

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
            className="btn btn-ghost font-bangla inline-flex items-center gap-1.5 rounded-full px-5 py-2"
          >
            <X className="h-4 w-4" aria-hidden /> বন্ধ করো
          </button>
          <p className="font-bangla text-sm font-bold text-slate-500">
            {studyDone ? "শেষ!" : `${Math.min(deckIndex + 1, deck.length)} / ${deck.length}`}
          </p>
        </div>

        {studyDone ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-navy shadow-xl shadow-navy/10">
              <PartyPopper className="h-11 w-11 text-white" aria-hidden />
            </span>
            <h2 className="font-bangla text-2xl font-extrabold text-navy">শেষ! Gut gemacht!</h2>
            <p className="font-bangla text-slate-500">
              {deck.length}টি শব্দ রিভিউ করলে। ডানদিকে সোয়াইপ = জানি, বামদিকে = জানি না।
            </p>
            <button
              type="button"
              onClick={startStudy}
              className="btn btn-primary inline-flex items-center gap-2 rounded-full px-8 py-3"
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> আবার পড়ো
            </button>
          </div>
        ) : (
          current && (
            <>
              <div className="progress-track h-2 overflow-hidden rounded-full">
                <motion.div
                  className="progress-fill h-full rounded-full"
                  animate={{ width: `${((deckIndex + 1) / deck.length) * 100}%` }}
                />
              </div>
              <AnimatePresence mode="wait">
                <Flashcard key={current.id} word={current} onSwipe={handleSwipe} />
              </AnimatePresence>
              <p className="font-bangla inline-flex items-center justify-center gap-1.5 text-center text-xs text-mist">
                <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden /> বামে সোয়াইপ = জানি না
                &nbsp;·&nbsp; ডানে সোয়াইপ = জানি
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
        <p className="font-bangla text-sm font-semibold text-teal">{words.length}টি A1 শব্দ</p>
        <h1 className="section-heading inline-flex items-center gap-2 text-3xl">
          <Layers className="h-7 w-7 text-teal" aria-hidden /> Wortschatz
        </h1>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 rounded-3xl bg-cream p-1.5">
        {(["words", "phrases"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`font-bangla rounded-2xl py-2.5 font-extrabold transition ${
              tab === t ? "bg-white text-teal shadow" : "text-slate-500"
            }`}
          >
            {t === "words" ? (
              <span className="inline-flex items-center gap-1.5">
                <Library className="h-4 w-4" aria-hidden /> শব্দ
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" aria-hidden /> Redemittel
              </span>
            )}
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
              className="font-bangla min-w-0 flex-1 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-teal"
            />
            <button
              type="button"
              onClick={startStudy}
              className="btn btn-primary font-bangla inline-flex shrink-0 items-center gap-1.5 rounded-2xl px-5"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden /> পড়ো
            </button>
          </div>

          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            <button
              type="button"
              onClick={() => setCat("alle")}
              className={`font-bangla shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                cat === "alle" ? "bg-navy text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
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
                  cat === c.id ? "bg-navy text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                <span className="font-bangla">{c.bangla}</span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState Icon={Search} title="কিছু পাওয়া যায়নি" message="অন্য শব্দ দিয়ে খুঁজে দেখো।" />
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
                      className={`card card-hover relative min-h-28 rounded-3xl p-4 text-left transition active:scale-95 ${
                        known ? "bg-cream ring-teal/30" : "bg-white ring-slate-200"
                      }`}
                    >
                      {known && (
                        <CheckCircle2
                          className="absolute bottom-3 right-3 h-5 w-5 text-teal"
                          aria-hidden
                        />
                      )}
                      {isFlipped ? (
                        <>
                          <p className="font-bangla text-lg font-extrabold text-navy">{w.bangla}</p>
                          <div className="mt-1 flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs italic text-slate-500">{w.example}</p>
                              <p className="font-bangla text-xs text-slate-500">{w.exampleBangla}</p>
                            </div>
                            <SpeakButton text={w.example} className="h-7 w-7" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-lg font-extrabold text-navy">{w.german}</p>
                            <SpeakButton text={w.german} className="h-7 w-7" />
                          </div>
                          <p className="font-bangla mt-1 inline-flex items-center gap-1 text-xs text-mist">
                            ট্যাপ করো <MousePointerClick className="h-3.5 w-3.5" aria-hidden />
                          </p>
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
              <div key={g.id} className="card overflow-hidden rounded-3xl">
                <button
                  type="button"
                  onClick={() => setOpenGroup(open ? null : g.id)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <span>
                    <span className="block font-extrabold text-navy">{g.situation}</span>
                    <span className="font-bangla block text-sm text-slate-500">
                      {g.situationBangla} · {g.items.length}টি বাক্য
                    </span>
                  </span>
                  <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-mist">
                    <ChevronDown className="h-5 w-5" aria-hidden />
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
                      <ul className="flex flex-col gap-2 border-t border-slate-100 p-4">
                        {g.items.map((p, i) => (
                          <li key={i} className="rounded-2xl bg-cream/60 px-3 py-2">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-bold text-navy">{p.german}</p>
                              <SpeakButton text={p.german} className="h-7 w-7" />
                            </div>
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
