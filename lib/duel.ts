// Phase 5 — Quiz Duel (1v1, realtime-ish via POLLING).
//
// Realtime model: the duel room polls GET /api/duel/[code]/state every 2s
// while status is `waiting`/`playing` and stops when `finished`. True push
// realtime would need Pusher/Ably (extra keys + cost) — polling keeps
// Phase 5 key-free and works on plain Vercel serverless.
//
// XP bonus (applied on finish, inside the same transaction as finishing):
//   winner +50 XP, loser +10 XP (participation), tie +30 each.
// Applied directly to UserProgress (xp += bonus, level = floor(xp/200)+1)
// + XpEvent rows (source duel_win / duel_play). Safe with the Phase 0
// sync semantics (sync takes MAX of DB/local, so duel XP survives).
// Best-effort: if the XP update fails, the duel is still marked finished
// (fallback path in finishDuelIfComplete) — a duel is never left stuck.

import type { PrismaClient } from "@prisma/client";
import type { QuizQuestion } from "./quiz-questions";

export const DUEL_QUESTION_COUNT = 10;
export const DUEL_WIN_XP = 50;
export const DUEL_LOSE_XP = 10;
export const DUEL_TIE_XP = 30;

export type DuelStatus = "waiting" | "playing" | "finished";

export interface DuelPlayerScore {
  /** Chosen option index per question, null = unanswered. */
  answers: (number | null)[];
  score: number;
  finishedAt: string | null;
}

export type DuelScores = Record<string, DuelPlayerScore>;

export interface DuelPlayerInfo {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

/** Public question shape — `answer` NEVER leaves the server. */
export interface DuelPublicQuestion {
  difficulty: QuizQuestion["difficulty"];
  prompt: string;
  promptBangla: string;
  options: string[];
  explanation: string;
}

function emptyScore(): DuelPlayerScore {
  return {
    answers: Array.from({ length: DUEL_QUESTION_COUNT }, () => null),
    score: 0,
    finishedAt: null,
  };
}

export function newScores(creatorId: string): DuelScores {
  return { [creatorId]: emptyScore() };
}

export function addOpponentScore(scores: DuelScores, opponentId: string): DuelScores {
  return { ...scores, [opponentId]: emptyScore() };
}

export function parseScores(v: unknown): DuelScores {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: DuelScores = {};
  for (const [userId, raw] of Object.entries(v as Record<string, unknown>)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const r = raw as Record<string, unknown>;
    const answers = Array.isArray(r.answers)
      ? r.answers.map((a) => (typeof a === "number" ? a : null))
      : [];
    while (answers.length < DUEL_QUESTION_COUNT) answers.push(null);
    out[userId] = {
      answers: answers.slice(0, DUEL_QUESTION_COUNT),
      score: typeof r.score === "number" ? Math.floor(r.score) : 0,
      finishedAt: typeof r.finishedAt === "string" ? r.finishedAt : null,
    };
  }
  return out;
}

export function parseQuestions(v: unknown): QuizQuestion[] {
  if (!Array.isArray(v)) return [];
  return v.filter(
    (q): q is QuizQuestion =>
      !!q &&
      typeof q === "object" &&
      typeof (q as QuizQuestion).prompt === "string" &&
      Array.isArray((q as QuizQuestion).options) &&
      typeof (q as QuizQuestion).answer === "string",
  );
}

/** Strip `answer` before sending questions to clients (anti-cheat). */
export function publicQuestions(questions: QuizQuestion[]): DuelPublicQuestion[] {
  return questions.map((q) => ({
    difficulty: q.difficulty,
    prompt: q.prompt,
    promptBangla: q.promptBangla,
    options: q.options,
    explanation: q.explanation,
  }));
}

/** 6-char uppercase invite code, e.g. "KQ7X2P" (no ambiguous 0/O, 1/I). */
export function generateDuelCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

/** Player info shape shared by duel APIs (no email, no private data). */
export function toPlayerInfo(u: {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}): DuelPlayerInfo {
  return { id: u.id, name: u.name, username: u.username, image: u.image };
}

export function isParticipant(
  duel: { creatorId: string; opponentId: string | null },
  userId: string | null,
): boolean {
  return !!userId && (duel.creatorId === userId || duel.opponentId === userId);
}

/** Winner user id, or null on a tie / unfinished duel. */
export function duelWinner(
  duel: { status: string; creatorId: string; opponentId: string | null },
  scores: DuelScores,
): string | null {
  if (duel.status !== "finished" || !duel.opponentId) return null;
  const a = scores[duel.creatorId]?.score ?? 0;
  const b = scores[duel.opponentId]?.score ?? 0;
  if (a === b) return null;
  return a > b ? duel.creatorId : duel.opponentId;
}

const LEVEL_XP = 200;
const levelFor = (xp: number) => Math.floor(Math.max(0, xp) / LEVEL_XP) + 1;

/**
 * If BOTH players answered all questions, finish the duel + apply XP
 * bonuses, atomically. Returns true when this call finished the duel.
 * Idempotent: if the duel is already finished, returns false.
 * Best-effort: on any failure of the XP transaction, falls back to
 * marking the duel finished WITHOUT the XP bonus — the duel never
 * gets stuck in `playing`.
 */
export async function finishDuelIfComplete(
  prisma: PrismaClient,
  duelId: string,
): Promise<boolean> {
  try {
    const finished = await prisma.$transaction(async (tx) => {
      const duel = await tx.duel.findUnique({ where: { id: duelId } });
      if (!duel || duel.status === "finished" || !duel.opponentId) return false;
      const scores = parseScores(duel.scores);
      const creator = scores[duel.creatorId];
      const opponent = scores[duel.opponentId];
      if (!creator || !opponent) return false;
      const creatorDone = creator.answers.every((a) => a !== null);
      const opponentDone = opponent.answers.every((a) => a !== null);
      if (!creatorDone || !opponentDone) return false;

      // XP bonus: winner +50, loser +10, tie +30 each.
      const winnerId =
        creator.score === opponent.score
          ? null
          : creator.score > opponent.score
            ? duel.creatorId
            : duel.opponentId;
      const bonus: Record<string, { xp: number; source: string }> = {};
      if (winnerId === null) {
        bonus[duel.creatorId] = { xp: DUEL_TIE_XP, source: "duel_play" };
        bonus[duel.opponentId] = { xp: DUEL_TIE_XP, source: "duel_play" };
      } else {
        const loserId = winnerId === duel.creatorId ? duel.opponentId : duel.creatorId;
        bonus[winnerId] = { xp: DUEL_WIN_XP, source: "duel_win" };
        bonus[loserId] = { xp: DUEL_LOSE_XP, source: "duel_play" };
      }

      await tx.duel.update({
        where: { id: duelId },
        data: { status: "finished", finishedAt: new Date() },
      });
      for (const [userId, b] of Object.entries(bonus)) {
        const row = await tx.userProgress.findUnique({ where: { userId } });
        const newXp = (row?.xp ?? 0) + b.xp;
        await tx.userProgress.upsert({
          where: { userId },
          create: {
            userId,
            xp: newXp,
            level: levelFor(newXp),
            streak: 0,
            knownWords: [],
            lessonsDone: [],
          },
          update: { xp: newXp, level: levelFor(newXp) },
        });
        await tx.xpEvent.create({
          data: { userId, amount: b.xp, source: b.source },
        });
      }
      return true;
    });
    return finished;
  } catch {
    // Fallback: finish the duel WITHOUT the XP bonus. The duel must
    // never stay stuck in `playing` because an XP update failed.
    try {
      const res = await prisma.duel.updateMany({
        where: { id: duelId, status: "playing" },
        data: { status: "finished", finishedAt: new Date() },
      });
      return res.count > 0;
    } catch {
      return false;
    }
  }
}
