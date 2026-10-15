"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Copy,
  Crown,
  Lightbulb,
  Loader2,
  RotateCcw,
  Swords,
  Trophy,
} from "lucide-react";
import Mascot from "@/components/Mascot";
import { QUIZ_MODES } from "@/lib/quiz-questions";
import type {
  DuelPlayerInfo,
  DuelPlayerScore,
  DuelPublicQuestion,
  DuelScores,
  DuelStatus,
} from "@/lib/duel";

// Phase 5 — interactive duel room.
// Polling (NOT WebSockets): GET /api/duel/[code]/state every 2s while
// status is `waiting`/`playing`; polling stops when `finished`.
// True push realtime would need Pusher/Ably keys — polling keeps
// Phase 5 key-free.

interface InitialDuel {
  code: string;
  status: string;
  category: string;
  difficulty: string;
  creator: DuelPlayerInfo;
  opponent: DuelPlayerInfo | null;
  scores: DuelScores;
  questions: DuelPublicQuestion[];
  myId: string;
}

interface Feedback {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
}

const POLL_MS = 2000;

function playerName(p: DuelPlayerInfo | null): string {
  if (!p) return "প্রতিপক্ষ";
  return p.name ?? p.username ?? "প্রতিপক্ষ";
}

function Avatar({ p, size = "md" }: { p: DuelPlayerInfo | null; size?: "md" | "lg" }) {
  const cls = size === "lg" ? "h-14 w-14 text-xl" : "h-10 w-10 text-sm";
  if (p?.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={p.image} alt="" className={`${cls} rounded-full object-cover ring-2 ring-teal/40`} />;
  }
  return (
    <span className={`font-bangla flex ${cls} items-center justify-center rounded-full bg-teal font-extrabold text-white`}>
      {(playerName(p) || "?").slice(0, 1).toUpperCase()}
    </span>
  );
}

export default function DuelRoom({ initial }: { initial: InitialDuel }) {
  const router = useRouter();
  const [status, setStatus] = useState<DuelStatus>(initial.status as DuelStatus);
  const [scores, setScores] = useState<DuelScores>(initial.scores);
  const [opponent, setOpponent] = useState<DuelPlayerInfo | null>(initial.opponent);
  const [correctAnswers, setCorrectAnswers] = useState<string[] | null>(null);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [rematching, setRematching] = useState(false);
  const [rematchError, setRematchError] = useState("");

  const [qi, setQi] = useState(() => {
    const mine = initial.scores[initial.myId];
    if (!mine) return 0;
    const first = mine.answers.findIndex((a) => a === null);
    return first === -1 ? initial.questions.length : first;
  });
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const myId = initial.myId;
  const questions = initial.questions;
  const myScore: DuelPlayerScore | undefined = scores[myId];
  const oppId = opponent?.id ?? (initial.creator.id === myId ? null : initial.creator.id);
  const oppScore: DuelPlayerScore | undefined = oppId ? scores[oppId] : undefined;
  const myFinished = myScore?.finishedAt !== null && myScore?.finishedAt !== undefined;
  const oppFinished = oppScore?.finishedAt !== null && oppScore?.finishedAt !== undefined;
  const iAmCreator = initial.creator.id === myId;
  const other: DuelPlayerInfo | null = iAmCreator ? opponent : initial.creator;

  // Poll the lightweight state endpoint while the duel is live.
  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/duel/${initial.code}/state`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        status: DuelStatus;
        scores: DuelScores;
        winnerId: string | null;
        opponentId: string | null;
      };
      setScores(data.scores);
      setStatus(data.status);
      if (data.winnerId) setWinnerId(data.winnerId);
      if (data.status === "finished") {
        // Fetch the full duel once for the per-question breakdown.
        const full = await fetch(`/api/duel/${initial.code}`);
        if (full.ok) {
          const fd = (await full.json()) as {
            duel?: { answers?: string[] | null; opponent?: DuelPlayerInfo | null; winnerId?: string | null };
          };
          if (fd.duel?.answers) setCorrectAnswers(fd.duel.answers);
          if (fd.duel?.opponent) setOpponent(fd.duel.opponent);
          if (fd.duel?.winnerId !== undefined) setWinnerId(fd.duel.winnerId);
        }
      }
    } catch {
      /* polling must never crash the room */
    }
  }, [initial.code]);

  useEffect(() => {
    if (status === "finished") return;
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [status, poll]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copyLink() {
    const link = `${window.location.origin}/duel/${initial.code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function answer(optionIndex: number) {
    if (picked !== null || status !== "playing") return;
    setPicked(optionIndex);
    try {
      const res = await fetch(`/api/duel/${initial.code}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIndex: qi, answerIndex: optionIndex }),
      });
      const data = (await res.json()) as {
        correct?: boolean;
        correctAnswer?: string;
        explanation?: string;
        score?: number;
        error?: string;
      };
      if (!res.ok) {
        // Already answered / duel ended meanwhile — refresh from the server.
        setPicked(null);
        await poll();
        return;
      }
      setFeedback({
        correct: data.correct ?? false,
        correctAnswer: data.correctAnswer ?? "",
        explanation: data.explanation ?? "",
      });
      setScores((prev) => {
        const mine = prev[myId];
        if (!mine) return prev;
        const answers = [...mine.answers];
        answers[qi] = optionIndex;
        return {
          ...prev,
          [myId]: {
            answers,
            score: data.score ?? mine.score,
            finishedAt:
              answers.every((a) => a !== null)
                ? new Date().toISOString()
                : mine.finishedAt,
          },
        };
      });
      timer.current = setTimeout(() => {
        setPicked(null);
        setFeedback(null);
        setQi((i) => i + 1);
      }, 1600);
    } catch {
      setPicked(null);
      await poll();
    }
  }

  async function rematch() {
    setRematching(true);
    setRematchError("");
    try {
      const res = await fetch("/api/duel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: initial.category, difficulty: initial.difficulty }),
      });
      const data = (await res.json()) as { duel?: { code?: string }; error?: string };
      if (!res.ok || !data.duel?.code) {
        setRematchError("আবার ডুয়েল বানানো যায়নি।");
        return;
      }
      router.push(`/duel/${data.duel.code}`);
      router.refresh();
    } catch {
      setRematchError("আবার ডুয়েল বানানো যায়নি।");
    } finally {
      setRematching(false);
    }
  }

  const modeBn = QUIZ_MODES.find((m) => m.id === initial.category)?.bn ?? initial.category;
  const inviteLink = `/duel/${initial.code}`;

  /* ---------- waiting ---------- */
  if (status === "waiting") {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <Mascot mood="thinking" size={88} animate />
        <div>
          <h1 className="font-bangla text-2xl font-extrabold text-navy">প্রতিপক্ষের অপেক্ষায়…</h1>
          <p className="font-bangla mt-1 text-sm text-mist">
            {modeBn} · লিংক বা কোড শেয়ার করো — বন্ধু যোগ দিলেই ডুয়েল শুরু হবে।
          </p>
        </div>
        <div className="card flex items-center gap-3 rounded-3xl bg-white px-6 py-4">
          <span className="text-3xl font-extrabold tracking-[0.3em] text-navy">{initial.code}</span>
          <button
            type="button"
            onClick={copyLink}
            className="font-bangla inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-navy/90 active:scale-95"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
            {copied ? "কপি হয়েছে!" : "লিংক কপি করো"}
          </button>
        </div>
        <p className="font-bangla text-xs text-mist">লিংক: {inviteLink}</p>
        <Link href="/duel" className="font-bangla text-sm font-bold text-teal hover:underline">
          ← লবিতে ফিরে যাও
        </Link>
      </div>
    );
  }

  /* ---------- finished ---------- */
  if (status === "finished") {
    const isTie = winnerId === null;
    const iWon = winnerId === myId;
    return (
      <div className="flex flex-col items-center gap-5 py-4 text-center">
        <Mascot mood={isTie ? "happy" : iWon ? "celebrate" : "sleepy"} size={96} animate />
        <div>
          <h1 className="font-bangla text-3xl font-extrabold text-navy">
            {isTie ? "ড্র! সমান সমান!" : iWon ? "জিতেছো! Champion!" : "হেরে গেছো — পরের বার!"}
          </h1>
          <p className="font-bangla mt-1 text-sm text-mist">
            {isTie
              ? "দুজনেই সমান — দারুণ লড়াই!"
              : iWon
                ? "XP বোনাস +৫০ — অভিনন্দন!"
                : "অংশগ্রহণের জন্য +১০ XP পেয়েছো — আবার চেষ্টা করো!"}
          </p>
        </div>

        {/* Final scoreboard */}
        <div className="card flex w-full max-w-md items-center justify-between gap-3 rounded-3xl bg-white p-5">
          <div className="flex flex-col items-center gap-1.5">
            <Avatar p={initial.creator} size="lg" />
            <span className="font-bangla max-w-28 truncate text-sm font-extrabold text-navy">
              {playerName(initial.creator)}
              {initial.creator.id === myId ? " (তুমি)" : ""}
            </span>
            <span className="text-3xl font-extrabold text-navy">{scores[initial.creator.id]?.score ?? 0}</span>
          </div>
          <span className="text-2xl font-extrabold text-mist">:</span>
          <div className="flex flex-col items-center gap-1.5">
            <Avatar p={opponent} size="lg" />
            <span className="font-bangla max-w-28 truncate text-sm font-extrabold text-navy">
              {playerName(opponent)}
              {opponent?.id === myId ? " (তুমি)" : ""}
            </span>
            <span className="text-3xl font-extrabold text-navy">
              {opponent ? (scores[opponent.id]?.score ?? 0) : "—"}
            </span>
          </div>
        </div>
        {winnerId && (
          <p className="font-bangla inline-flex items-center gap-1.5 rounded-full bg-sun/25 px-4 py-1.5 text-sm font-bold text-navy">
            <Crown className="h-4 w-4" aria-hidden />
            বিজয়ী: {winnerId === initial.creator.id ? playerName(initial.creator) : playerName(opponent)}
          </p>
        )}

        {/* Per-question breakdown */}
        {correctAnswers && (
          <div className="card w-full max-w-2xl rounded-3xl bg-white p-5 text-left">
            <h2 className="font-bangla mb-3 text-base font-extrabold text-navy">প্রশ্নে প্রশ্নে ফলাফল</h2>
            <div className="flex flex-col gap-2">
              {questions.map((q, i) => {
                const myAns = scores[myId]?.answers[i];
                const oppAns = opponent ? scores[opponent.id]?.answers[i] : undefined;
                const correctIdx = q.options.indexOf(correctAnswers[i] ?? "");
                const meOk = myAns !== null && myAns !== undefined && myAns === correctIdx;
                const oppOk = oppAns !== null && oppAns !== undefined && oppAns === correctIdx;
                return (
                  <div key={i} className="rounded-2xl bg-cream px-4 py-3">
                    <p className="font-bangla text-sm font-bold text-navy">
                      {i + 1}. {q.prompt}
                    </p>
                    <p className="font-bangla mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
                      <span className={meOk ? "font-bold text-teal" : "font-bold text-rose-600"}>
                        তুমি: {myAns === null || myAns === undefined ? "—" : q.options[myAns]} {meOk ? "✓" : "✗"}
                      </span>
                      <span className={oppOk ? "font-bold text-teal" : "font-bold text-rose-600"}>
                        {playerName(opponent)}:{" "}
                        {oppAns === null || oppAns === undefined ? "—" : q.options[oppAns]} {oppOk ? "✓" : "✗"}
                      </span>
                      <span className="font-bold text-slate-500">সঠিক: {correctAnswers[i]}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {rematchError && <p className="font-bangla text-sm font-bold text-rose-600">{rematchError}</p>}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={rematch}
            disabled={rematching}
            className="btn btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm disabled:opacity-50"
          >
            {rematching ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RotateCcw className="h-4 w-4" aria-hidden />
            )}
            আবার ডুয়েল
          </button>
          <Link
            href="/duel"
            className="btn btn-ghost inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm"
          >
            লবিতে ফিরে যাও
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- playing ---------- */
  const q = questions[qi];
  const answered = picked !== null;

  return (
    <div className="flex flex-col gap-5">
      {/* Live scoreboard */}
      <div className="card flex items-center justify-between gap-2 rounded-3xl bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar p={initial.creator} />
          <div className="min-w-0">
            <p className="font-bangla truncate text-xs font-extrabold text-navy">
              {playerName(initial.creator)}
              {initial.creator.id === myId ? " (তুমি)" : ""}
            </p>
            <p className="text-lg font-extrabold leading-none text-navy">
              {scores[initial.creator.id]?.score ?? 0}
              <span className="text-xs font-bold text-mist"> / 10</span>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center">
          <Swords className="h-5 w-5 text-sun" aria-hidden />
          <span className="font-bangla text-[11px] font-bold text-mist">
            {myFinished
              ? oppFinished
                ? "ফলাফল আসছে…"
                : "তুমি শেষ! প্রতিপক্ষের অপেক্ষায়…"
              : `প্রশ্ন ${Math.min(qi + 1, 10)} / 10`}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <div className="min-w-0 text-right">
            <p className="font-bangla truncate text-xs font-extrabold text-navy">
              {playerName(opponent)}
              {opponent?.id === myId ? " (তুমি)" : ""}
            </p>
            <p className="text-lg font-extrabold leading-none text-navy">
              {opponent ? (scores[opponent.id]?.score ?? 0) : "—"}
              <span className="text-xs font-bold text-mist"> / 10</span>
            </p>
          </div>
          <Avatar p={opponent} />
        </div>
      </div>

      {/* Progress dots: mine (top) + opponent (bottom) */}
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1">
          {questions.map((_, i) => {
            const a = scores[myId]?.answers[i];
            return (
              <span
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  a === null || a === undefined ? "bg-slate-200" : "bg-teal"
                }`}
              />
            );
          })}
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => {
            const a = opponent ? scores[opponent.id]?.answers[i] : undefined;
            return (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  a === null || a === undefined ? "bg-slate-100" : "bg-sun"
                }`}
              />
            );
          })}
        </div>
      </div>

      {myFinished ? (
        <div className="card flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center">
          <Mascot mood="happy" size={72} animate />
          <h2 className="font-bangla text-xl font-extrabold text-navy">তোমার ১০ প্রশ্ন শেষ!</h2>
          <p className="font-bangla text-sm text-mist">
            স্কোর: {myScore?.score ?? 0} / 10 — প্রতিপক্ষ শেষ করলেই ফলাফল আসবে।
          </p>
        </div>
      ) : q ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-500">Frage {qi + 1} / {questions.length}</p>
            <Mascot
              mood={!answered ? "gaming" : feedback?.correct ? "happy" : "angry"}
              size={48}
              animate={!answered}
              className="shrink-0"
            />
          </div>

          <div className="rounded-3xl bg-navy p-8 text-center shadow-xl shadow-navy/10">
            <p className="font-bangla text-sm font-semibold uppercase tracking-widest text-white/70">
              {q.promptBangla}
            </p>
            <p className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">{q.prompt}</p>
          </div>

          <div className="flex flex-col gap-3">
            {q.options.map((opt, oi) => {
              const isPick = oi === picked;
              const isCorrectOpt = feedback ? opt === feedback.correctAnswer : false;
              let cls = "card bg-white text-slate-800 ring-1 ring-slate-200 hover:ring-teal/40";
              if (answered && isCorrectOpt) cls = "bg-teal text-white ring-teal";
              else if (answered && isPick) cls = "bg-rose-500 text-white ring-rose-500";
              else if (answered) cls = "bg-white text-mist ring-1 ring-slate-100";
              return (
                <motion.button
                  key={opt}
                  type="button"
                  onClick={() => answer(oi)}
                  disabled={answered}
                  whileTap={!answered ? { scale: 0.98 } : undefined}
                  className={`font-bangla rounded-2xl px-6 py-4 text-left text-lg font-bold shadow-sm ${cls}`}
                >
                  {opt}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {answered && feedback && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-bangla flex items-center justify-center gap-2 rounded-2xl p-4 text-center text-sm font-bold ${
                  feedback.correct ? "bg-teal/10 text-navy" : "bg-rose-50 text-rose-800"
                }`}
              >
                {feedback.correct ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-teal" aria-hidden />
                    সঠিক!
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-5 w-5 shrink-0 text-rose-500" aria-hidden />
                    <span>
                      ভুল — সঠিক উত্তর: <b>{feedback.correctAnswer}</b>. {feedback.explanation}
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="card rounded-3xl bg-white p-8 text-center">
          <Trophy className="mx-auto h-8 w-8 text-teal" aria-hidden />
          <p className="font-bangla mt-2 font-bold text-navy">সব প্রশ্ন শেষ!</p>
        </div>
      )}
    </div>
  );
}
