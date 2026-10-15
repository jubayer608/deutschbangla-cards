// Phase 5 — SM-2 spaced repetition (SuperMemo-2).
//
// Pure functions, no DB / IO — unit-testable. The API route
// (app/api/review/route.ts) and the /review page use these via
// lib/review.ts. Algorithm reference: Wozniak, "Optimization of
// learning" (SuperMemo-2, 1987).
//
// Per-word state:
// - easeFactor   — how "easy" the word is (starts 2.5, min 1.3)
// - intervalDays — days until the next review (starts 0)
// - repetitions  — consecutive successful reviews (starts 0)
// - lapses       — times the word was forgotten (q < 3)
// - nextReviewAt — when the word is due again (new words: now)
// - lastQuality  — the last quality grade given (0–5)
//
// Quality grades come from 4 UI buttons:
//   Abar   (Again) → q = 1  (forgotten)
//   Kothin (Hard)  → q = 3
//   Bhalo  (Good)  → q = 4
//   Shohoj (Easy)  → q = 5
//
// DEVIATION from classic SM-2 (documented): for q = 5 the computed
// interval is multiplied by 1.3 (easy bonus), so words the user finds
// trivially easy come back a bit later. Everything else is textbook.

export interface Sm2State {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
}

export interface Sm2Result extends Sm2State {
  nextReviewAt: Date;
  lastQuality: number;
}

export const SM2_DEFAULTS: Sm2State = {
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
  lapses: 0,
};

/** SM-2 floor for the ease factor. */
export const MIN_EASE_FACTOR = 1.3;

/** Documented deviation: easy answers (q = 5) stretch the interval. */
export const EASY_INTERVAL_BONUS = 1.3;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Clamp any input to a valid SM-2 quality grade (integer 0–5). */
export function clampQuality(quality: unknown): number {
  const q = typeof quality === "number" && Number.isFinite(quality) ? Math.round(quality) : 3;
  return Math.min(5, Math.max(0, q));
}

/**
 * Apply one SM-2 review step.
 *
 * - q < 3 (forgotten): repetitions reset to 0, interval = 1 day
 *   (relearn tomorrow), lapses += 1. Ease factor is UNCHANGED —
 *   classic SM-2 only adjusts EF on successful recalls.
 * - q >= 3: repetitions += 1; the ease factor is updated FIRST
 *   (canonical SM-2 ordering), then the interval is computed from the
 *   NEW ease factor: 1 day (rep 1), 6 days (rep 2),
 *   round(prevInterval × EF) (rep 3+). q = 5 gets the ×1.3 easy bonus.
 */
export function applySm2(
  state: Sm2State,
  quality: number,
  now: Date = new Date(),
): Sm2Result {
  const q = clampQuality(quality);
  let { easeFactor, intervalDays, repetitions, lapses } = state;

  if (q < 3) {
    repetitions = 0;
    intervalDays = 1;
    lapses += 1;
  } else {
    easeFactor = Math.max(
      MIN_EASE_FACTOR,
      easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
    );
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    if (q === 5) {
      intervalDays = Math.max(1, Math.round(intervalDays * EASY_INTERVAL_BONUS));
    }
  }

  return {
    easeFactor,
    intervalDays,
    repetitions,
    lapses,
    nextReviewAt: new Date(now.getTime() + intervalDays * DAY_MS),
    lastQuality: q,
  };
}
