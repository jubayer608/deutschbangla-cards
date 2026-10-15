"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Lightbulb, Play, RotateCcw, Skull, Swords, Trophy, XCircle } from "lucide-react";
import Mascot from "./Mascot";
import type { BossQuestion } from "@/lib/boss";

// Phase 5 — Boss-Word Battle (single-player).
// Flow: intro → GET /api/boss (questions, no answers) → per-answer
// POST /api/boss { action: "answer" } for live HP updates → when the
// battle ends (boss HP ≤ 0, player HP ≤ 0, or questions exhausted),
// POST /api/boss { action: "finish" } with the full transcript for
// server-side validation + XP. The client never knows the answers.

type Phase = "intro" | "playing" | "done";

interface BreakdownRow {
  wordId: string;
  german: string;
  picked: string;
  correctAnswer: string | null;
  correct: boolean;
}

interface FinishResult {
  outcome: "win" | "loss";
  correctCount: number;
  bossHp: number;
  playerHp: number;
  xp: number;
  breakdown: BreakdownRow[];
}

const BOSS_HP = 100;
const PLAYER_HP = 100;

function HpBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <span className="font-bangla text-xs font-bold text-navy">{label}</span>
        <span className="text-xs font-extrabold text-navy">
          {Math.max(0, value)} / {max}
        </span>
      </div>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          className={`h-full rounded-full ${color}`}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 160, damping: 22 }}
        />
      </div>
    </div>
  );
}

export default function BossBattle() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<BossQuestion[]>([]);
  const [seed, setSeed] = useState(0);
  const [wordIds, setWordIds] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState(0);
  const [index, setIndex] = useState(0);
  const [bossHp, setBossHp] = useState(BOSS_HP);
  const [playerHp, setPlayerHp] = useState(PLAYER_HP);
  const [picked, setPicked] = useState<number | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [result, setResult] = useState<FinishResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const answersRef = useRef<number[]>([]);
  const correctRef = useRef(0);
  const finishingRef = useRef(false);

  const finishBattle = useCallback(
    async (finalAnswers: number[], finalBossHp: number, finalPlayerHp: number) => {
      if (finishingRef.current) return;
      finishingRef.current = true;
      try {
        const res = await fetch("/api/boss", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "finish", seed, wordIds, answers: finalAnswers, startedAt }),
        });
        const data = (await res.json().catch(() => null)) as FinishResult | null;
        if (!res.ok || !data) throw new Error("finish_failed");
        setResult(data);
        setBossHp(data.bossHp);
        setPlayerHp(data.playerHp);
      } catch {
        // Server validation failed (or too fast / stale) — still show
        // the end screen with the locally computed outcome.
        const outcome = finalBossHp <= 0 ? "win" : "loss";
        setResult({
          outcome,
          correctCount: correctRef.current,
          bossHp: finalBossHp,
          playerHp: finalPlayerHp,
          xp: 0,
          breakdown: [],
        });
      } finally {
        setPhase("done");
      }
    },
    [seed, wordIds, startedAt],
  );

  const start = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/boss");
      const data = (await res.json().catch(() => null)) as {
        seed?: number;
        wordIds?: string[];
        questions?: BossQuestion[];
        startedAt?: number;
      } | null;
      if (!res.ok || !data?.questions?.length) throw new Error("start_failed");
      setSeed(data.seed ?? 0);
      setWordIds(data.wordIds ?? []);
      setStartedAt(data.startedAt ?? Date.now());
      setQuestions(data.questions);
      setIndex(0);
      setBossHp(BOSS_HP);
      setPlayerHp(PLAYER_HP);
      setPicked(null);
      setLastCorrect(null);
      setLog(["Boss elo! 10-ta shobdo diye juddho."]);
      setResult(null);
      answersRef.current = [];
      correctRef.current = 0;
      finishingRef.current = false;
      setPhase("playing");
    } catch {
      setError("Battle shuru kora jayni — ekto pore abar chesta koro.");
    } finally {
      setLoading(false);
    }
  }, []);

  const choose = useCallback(
    async (answerIndex: number) => {
      if (phase !== "playing" || picked !== null) return;
      const q = questions[index];
      if (!q) return;
      setPicked(answerIndex);
      let correct = false;
      try {
        const res = await fetch("/api/boss", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "answer",
            seed,
            wordIds,
            questionIndex: index,
            answerIndex,
          }),
        });
        const data = (await res.json().catch(() => null)) as { correct?: boolean } | null;
        correct = !!data?.correct;
      } catch {
        correct = false;
      }
      setLastCorrect(correct);
      const nextBossHp = correct ? bossHp - 12 : bossHp;
      const nextPlayerHp = correct ? playerHp : playerHp - 20;
      setBossHp(nextBossHp);
      setPlayerHp(nextPlayerHp);
      setLog((l) => [...l, correct ? `Shothik! Boss -12 HP` : `Bhul! Tumi -20 HP`].slice(-4));
      if (correct) correctRef.current += 1;
      const nextAnswers = [...answersRef.current, answerIndex];
      answersRef.current = nextAnswers;

      const battleOver = nextBossHp <= 0 || nextPlayerHp <= 0 || index + 1 >= questions.length;
      window.setTimeout(
        () => {
          setPicked(null);
          setLastCorrect(null);
          if (battleOver) {
            finishBattle(nextAnswers, nextBossHp, nextPlayerHp);
          } else {
            setIndex((i) => i + 1);
          }
        },
        battleOver ? 700 : 900,
      );
    },
    [phase, picked, questions, index, seed, wordIds, bossHp, playerHp, finishBattle],
  );

  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <Mascot mood="angry" size={140} animate />
        <div>
          <h2 className="font-bangla text-2xl font-extrabold text-navy">Boss Battle</h2>
          <p className="font-bangla mx-auto mt-2 max-w-md text-sm text-mist">
            Boss-er HP 100, tomar HP 100. Prottek shothik uttore Boss -12 HP, bhul uttore tumi -20 HP.
            Boss-er HP shesh korlei joy! Login thakle joy-e <b>+30 XP</b>, harleo <b>+10 XP</b>.
          </p>
        </div>
        {error && (
          <p className="font-bangla rounded-2xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-800">{error}</p>
        )}
        <button
          type="button"
          onClick={start}
          disabled={loading}
          className="font-bangla inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-base font-extrabold text-white shadow-lg shadow-navy/20 transition active:scale-95 disabled:opacity-60"
        >
          <Play className="h-5 w-5" aria-hidden /> {loading ? "Boss asche…" : "Battle Shuru Koro"}
        </button>
      </div>
    );
  }

  if (phase === "done" && result) {
    const won = result.outcome === "win";
    const escaped = !won && result.correctCount < questions.length && result.playerHp > 0;
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <Mascot mood={won ? "celebrate" : "sleepy"} size={120} animate />
          <h2 className="font-bangla text-2xl font-extrabold text-navy">
            {won ? "Boss Harlo! 🎉" : escaped ? "Boss Paliye Gelo!" : "Boss Jitlo!"}
          </h2>
          <p className="font-bangla text-sm text-mist">
            {won
              ? `${result.correctCount}-ta shothik uttor — boss-ke hariye dile!`
              : escaped
                ? "Proshno shesh, kintu boss beche gelo. Abar chesta koro!"
                : "Boss-er akromon-e tumi here gele. Abar chesta koro!"}
          </p>
          {result.xp > 0 && (
            <p className="font-bangla inline-flex items-center gap-1 rounded-full bg-sun/30 px-4 py-1.5 text-sm font-extrabold text-navy">
              <Trophy className="h-4 w-4 text-sun" aria-hidden /> +{result.xp} XP
            </p>
          )}
        </div>

        {result.breakdown.length > 0 && (
          <div className="flex flex-col gap-2">
            {result.breakdown.map((row) => (
              <div
                key={row.wordId}
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100"
              >
                {row.correct ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-teal" aria-hidden />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-rose-500" aria-hidden />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold text-navy">{row.german}</span>
                  <span className="font-bangla block text-xs text-mist">
                    {row.correct ? `Shothik: ${row.correctAnswer}` : `Tomar uttor: ${row.picked} · Shothik: ${row.correctAnswer}`}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={start}
          disabled={loading}
          className="font-bangla inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-base font-extrabold text-white shadow-lg shadow-navy/20 transition active:scale-95 disabled:opacity-60"
        >
          <RotateCcw className="h-5 w-5" aria-hidden /> {loading ? "Boss asche…" : "Abar Khelbo"}
        </button>
      </div>
    );
  }

  const q = questions[index];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skull className="h-6 w-6 text-rose-500" aria-hidden />
          <span className="font-bangla text-base font-extrabold text-navy">Boss</span>
        </div>
        <Mascot mood={lastCorrect === null ? "angry" : lastCorrect ? "happy" : "angry"} size={56} animate />
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-teal" aria-hidden />
          <span className="font-bangla text-base font-extrabold text-navy">Tumi</span>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <HpBar value={bossHp} max={BOSS_HP} color="bg-rose-500" label="Boss HP" />
        <HpBar value={playerHp} max={PLAYER_HP} color="bg-teal" label="Tomar HP" />
      </div>

      {q ? (
        <>
          <p className="font-bangla text-center text-sm font-semibold text-mist">
            Round {index + 1} / {questions.length}
          </p>
          <div className="rounded-3xl bg-navy p-8 text-center shadow-xl shadow-navy/10">
            <p className="font-bangla text-sm font-semibold uppercase tracking-widest text-white/70">
              Ei shobdo-tar Bangla ortho ki?
            </p>
            <p className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">{q.german}</p>
          </div>
          <div className={`flex flex-col gap-3 ${picked !== null && lastCorrect === false ? "animate-shake" : ""}`}>
            {q.options.map((opt, i) => {
              const isPick = picked === i;
              let cls = "card bg-white text-slate-800 ring-1 ring-slate-200 hover:ring-teal/40";
              if (picked !== null) {
                if (isPick && lastCorrect) cls = "bg-teal text-white ring-teal";
                else if (isPick) cls = "bg-rose-500 text-white ring-rose-500";
                else cls = "bg-white text-mist ring-1 ring-slate-100";
              }
              return (
                <motion.button
                  key={opt}
                  type="button"
                  onClick={() => choose(i)}
                  disabled={picked !== null}
                  whileTap={picked === null ? { scale: 0.98 } : undefined}
                  className={`font-bangla rounded-2xl px-6 py-4 text-left text-lg font-bold shadow-sm ${cls}`}
                >
                  {opt}
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence>
            {picked !== null && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-bangla flex items-center justify-center gap-2 rounded-2xl p-4 text-center text-sm font-bold ${
                  lastCorrect ? "bg-teal/10 text-navy" : "bg-rose-50 text-rose-800"
                }`}
              >
                {lastCorrect ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-teal" aria-hidden /> Shothik! Boss -12 HP
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-5 w-5 shrink-0 text-rose-500" aria-hidden /> Bhul! Tumi -20 HP
                  </>
                )}
              </motion.p>
            )}
          </AnimatePresence>
        </>
      ) : (
        <p className="font-bangla text-center text-sm text-mist">Proshno asche…</p>
      )}

      {log.length > 0 && (
        <div className="font-bangla rounded-2xl bg-white p-4 text-xs text-mist shadow-sm ring-1 ring-slate-100">
          {log.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}
