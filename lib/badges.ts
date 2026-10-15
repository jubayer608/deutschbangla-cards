// Phase 1 — badge catalog + unlock evaluation.
//
// Badge rules (all checkable from data that already exists):
// - streak-7 "7-Day Streak": current streak >= 7
// - words-100 "100 Words": knownWords.length >= 100
// - grammar-master "Grammar Master": best grammar-quiz score >= 8/10
//   (quizBestScores keys are "<mode>-<diff>", e.g. "grammar-easy"; the quiz
//   always runs 10 questions, so a stored best score of 8+ means 8+/10).
// Unlocks are evaluated server-side in /api/progress + /api/sync-progress
// and persisted as Badge rows (unique per user+key).

import type { PrismaClient } from "@prisma/client";
import { notifyBadgeUnlock } from "./notifications";

export interface BadgeDef {
  key: string;
  title: string;
  titleBangla: string;
  description: string;
  /** Lucide icon name, resolved in the UI (no icon component in this file). */
  icon: "flame" | "layers" | "graduation";
}

export const BADGE_CATALOG: BadgeDef[] = [
  {
    key: "streak-7",
    title: "7-Day Streak",
    titleBangla: "৭ দিনের স্ট্রিক",
    description: "টানা ৭ দিন পড়াশোনা করো।",
    icon: "flame",
  },
  {
    key: "words-100",
    title: "100 Words",
    titleBangla: "১০০ শব্দ",
    description: "১০০টি শব্দ শিখে ফেলো।",
    icon: "layers",
  },
  {
    key: "grammar-master",
    title: "Grammar Master",
    titleBangla: "ব্যাকরণ মাস্টার",
    description: "ব্যাকরণ কুইজে ১০-এর মধ্যে অন্তত ৮ পাও।",
    icon: "graduation",
  },
];

export interface ProgressLike {
  streak: number;
  knownWords: string[];
  quizBestScores: Record<string, number>;
}

/** Which badge keys the given progress has earned. Pure function. */
export function evaluateBadges(p: ProgressLike): string[] {
  const earned: string[] = [];
  if (p.streak >= 7) earned.push("streak-7");
  if (p.knownWords.length >= 100) earned.push("words-100");
  const grammarBest = Object.entries(p.quizBestScores)
    .filter(([k]) => k.startsWith("grammar-"))
    .reduce((max, [, v]) => Math.max(max, v), 0);
  if (grammarBest >= 8) earned.push("grammar-master");
  return earned;
}

function parseQuizBestScores(v: unknown): Record<string, number> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: Record<string, number> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof val === "number" && Number.isFinite(val)) out[k] = Math.floor(val);
  }
  return out;
}

/**
 * Insert Badge rows for newly earned badges (skip existing). Returns the
 * keys that were newly inserted. Accepts a Prisma client (or null → no-op)
 * and a UserProgress-shaped row.
 */
export async function ensureBadges(
  prisma: PrismaClient | null,
  userId: string,
  progressRow: {
    streak: number;
    knownWords: unknown;
    quizBestScores: unknown;
  } | null,
): Promise<string[]> {
  if (!prisma || !progressRow) return [];
  const knownWords = Array.isArray(progressRow.knownWords)
    ? (progressRow.knownWords as string[])
    : [];
  const earned = evaluateBadges({
    streak: progressRow.streak,
    knownWords,
    quizBestScores: parseQuizBestScores(progressRow.quizBestScores),
  });
  if (earned.length === 0) return [];
  const existing = await prisma.badge.findMany({
    where: { userId, key: { in: earned } },
    select: { key: true },
  });
  const have = new Set(existing.map((b) => b.key));
  const fresh = earned.filter((k) => !have.has(k));
  if (fresh.length === 0) return [];
  await prisma.badge.createMany({
    data: fresh.map((key) => ({ userId, key })),
    skipDuplicates: true,
  });
  // Phase 3 — one notification (+ push) per newly unlocked badge.
  // Best-effort: notification failures must never break badge unlocking.
  for (const key of fresh) {
    const def = BADGE_CATALOG.find((d) => d.key === key);
    await notifyBadgeUnlock(prisma, userId, key, def?.titleBangla ?? key).catch(
      () => {},
    );
  }
  return fresh;
}
