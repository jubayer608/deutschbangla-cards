// Phase 5 — SM-2 review queue (shared by GET /api/review and the
// /review page). Builds one session's queue from the user's WordReview
// rows + the static word list (data/words.ts).
//
// Queue rules:
// - Overdue reviewed words first (nextReviewAt <= now, oldest first).
// - Then fill remaining slots with NEW words (no WordReview row yet) —
//   up to 20 per session, in curriculum order. Rows are NOT created for
//   new words here; a row appears only when the user answers it.
// - Total queue capped at 50.
// - reviewedToday counts rows whose updatedAt falls on the current UTC
//   day (approximation — good enough for a header stat).

import type { PrismaClient } from "@prisma/client";
import { words, type VocabWord } from "@/data/words";

export interface ReviewStateOut {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
  nextReviewAt: string; // ISO
  lastQuality: number | null;
}

export interface ReviewQueueItem {
  word: VocabWord;
  review: ReviewStateOut | null;
  isNew: boolean;
}

export interface ReviewQueue {
  queue: ReviewQueueItem[];
  dueCount: number; // overdue reviewed words (the real backlog)
  newCount: number; // words never reviewed
  totalReviewed: number; // words with at least one answer
  reviewedToday: number;
}

const NEW_WORDS_PER_SESSION = 20;
const MAX_QUEUE = 50;

export async function getReviewQueue(
  prisma: PrismaClient,
  userId: string,
): Promise<ReviewQueue> {
  const now = new Date();
  const startOfTodayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const rows = await prisma.wordReview.findMany({
    where: { userId },
    orderBy: { nextReviewAt: "asc" },
  });

  const reviewedIds = new Set(rows.map((r) => r.wordId));
  const toOut = (r: (typeof rows)[number]): ReviewStateOut => ({
    easeFactor: r.easeFactor,
    intervalDays: r.intervalDays,
    repetitions: r.repetitions,
    lapses: r.lapses,
    nextReviewAt: r.nextReviewAt.toISOString(),
    lastQuality: r.lastQuality,
  });

  const wordById = new Map(words.map((w) => [w.id, w]));
  const overdue = rows.filter((r) => r.nextReviewAt <= now);
  const reviewedToday = rows.filter((r) => r.updatedAt >= startOfTodayUtc).length;

  const queue: ReviewQueueItem[] = [];
  for (const r of overdue) {
    if (queue.length >= MAX_QUEUE) break;
    const word = wordById.get(r.wordId);
    if (!word) continue; // stale row for a removed word — skipped, harmless
    queue.push({ word, review: toOut(r), isNew: false });
  }

  // Fill remaining slots with new words (curriculum order).
  const newWords = words.filter((w) => !reviewedIds.has(w.id));
  let newAdded = 0;
  for (const word of newWords) {
    if (queue.length >= MAX_QUEUE) break;
    if (newAdded >= NEW_WORDS_PER_SESSION) break;
    queue.push({ word, review: null, isNew: true });
    newAdded += 1;
  }

  return {
    queue,
    dueCount: overdue.length,
    newCount: newWords.length,
    totalReviewed: rows.length,
    reviewedToday,
  };
}
