// Phase 5 — Boss-Word Battle (single-player, stateless).
//
// Game rules:
// - Boss HP 100, player HP 100. 10 rounds, one German word per round,
//   4 Bangla meaning options (1 correct + 3 distractors, same category
//   when possible).
// - Correct answer: boss −12 HP. Wrong answer: player −20 HP.
// - Win when boss HP ≤ 0. Lose when player HP ≤ 0, or when the 10
//   questions run out with the boss still alive ("boss escapes").
//
// Stateless anti-cheat model (no DB row, no schema change):
// - GET /api/boss picks 10 wordIds + a random seed and returns the
//   questions WITHOUT answers.
// - Every question is rebuilt deterministically from (seed, wordIds)
//   with a seeded RNG, so the server can validate any answer without
//   storing state — and the client never sees the correct answers
//   until the battle is over.
// - POST /api/boss/answer validates ONE answer and returns only
//   { correct } (never the correct answer — the end screen shows the
//   full breakdown after the battle is terminal).
// - POST /api/boss/finish re-validates the whole transcript, requires a
//   terminal outcome, and applies XP (logged-in only).
// - Honest limitation: without server state, a determined cheater could
//   probe answers via the answer endpoint. Mitigations: per-user rate
//   limits on both endpoints + finish requires the battle to have taken
//   15s–30min (startedAt sanity). The reward is small (+30/+10 XP),
//   so casual farming is pointless; the 1v1 duel (real stakes) keeps
//   its DB-backed scoring instead.

import { words, type VocabWord } from "@/data/words";

export const BOSS_HP = 100;
export const PLAYER_HP = 100;
export const BOSS_DAMAGE_ON_CORRECT = 12;
export const PLAYER_DAMAGE_ON_WRONG = 20;
export const BOSS_QUESTION_COUNT = 10;
export const BOSS_WIN_XP = 30;
export const BOSS_LOSE_XP = 10;
/** A battle must take at least this long to count for XP (anti-bot). */
export const BOSS_MIN_DURATION_MS = 15_000;
/** A battle older than this is stale and can't earn XP. */
export const BOSS_MAX_DURATION_MS = 30 * 60_000;

export interface BossQuestion {
  wordId: string;
  german: string;
  options: string[]; // Bangla meanings, shuffled
}

export type BossOutcome = "win" | "loss" | "incomplete";

export interface BossResolution {
  valid: boolean;
  correctCount: number;
  bossHp: number;
  playerHp: number;
  outcome: BossOutcome;
}

/** mulberry32 — tiny deterministic PRNG. */
export function seededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleSeeded<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const wordById = new Map(words.map((w) => [w.id, w]));

/**
 * Fallback boss words when the user has no review history: the
 * "hardest" words in the static data — longest German + bonus for
 * umlauts/ß and compounds. Fully deterministic (same list every time).
 */
export function hardestWords(count: number): VocabWord[] {
  const score = (w: VocabWord): number => {
    let s = w.german.length;
    if (/[äöüÄÖÜß]/.test(w.german)) s += 3;
    if (w.german.includes(" ")) s += 1;
    return s;
  };
  return [...words].sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id)).slice(0, count);
}

export interface BossReviewRow {
  wordId: string;
  lapses: number;
  easeFactor: number;
  nextReviewAt: Date;
}

/**
 * Boss words for a logged-in user: their most-lapsed / lowest-ease
 * reviewed words first (the words they struggle with most), filled
 * with the static hardest words if fewer than `count` qualify.
 */
export function pickBossWordIds(reviews: BossReviewRow[], count: number): string[] {
  const sorted = [...reviews].sort(
    (a, b) =>
      b.lapses - a.lapses ||
      a.easeFactor - b.easeFactor ||
      a.nextReviewAt.getTime() - b.nextReviewAt.getTime(),
  );
  const picked: string[] = [];
  for (const r of sorted) {
    if (picked.length >= count) break;
    if (!wordById.has(r.wordId)) continue; // stale row for a removed word
    if (!picked.includes(r.wordId)) picked.push(r.wordId);
  }
  if (picked.length < count) {
    for (const w of hardestWords(count * 2)) {
      if (picked.length >= count) break;
      if (!picked.includes(w.id)) picked.push(w.id);
    }
  }
  return picked.slice(0, count);
}

/**
 * Build one battle's questions deterministically from (seed, wordIds).
 * Distractors: same-category words with distinct Bangla meanings first,
 * filled from any category; options shuffled with a per-question seed.
 */
export function buildBossQuestions(seed: number, wordIds: string[]): BossQuestion[] {
  const out: BossQuestion[] = [];
  wordIds.forEach((wordId, i) => {
    const word = wordById.get(wordId);
    if (!word) return;
    const rng = seededRng(seed ^ Math.imul(i + 1, 7919));
    const sameCategory = shuffleSeeded(
      words.filter((w) => w.category === word.category && w.id !== word.id && w.bangla !== word.bangla),
      rng,
    );
    const anyCategory = shuffleSeeded(
      words.filter((w) => w.id !== word.id && w.bangla !== word.bangla && !sameCategory.includes(w)),
      rng,
    );
    const distractors: string[] = [];
    for (const w of [...sameCategory, ...anyCategory]) {
      if (distractors.length >= 3) break;
      if (!distractors.includes(w.bangla)) distractors.push(w.bangla);
    }
    const options = shuffleSeeded([word.bangla, ...distractors], seededRng(seed ^ Math.imul(i + 1, 104729) ^ 7));
    out.push({ wordId, german: word.german, options });
  });
  return out;
}

/** The correct Bangla meaning for a question (server-side only). */
export function bossCorrectAnswer(question: BossQuestion): string | null {
  return wordById.get(question.wordId)?.bangla ?? null;
}

/**
 * Validate a full battle transcript and compute the outcome.
 * `answers` = chosen option index per answered question, in order.
 * Returns valid=false when the transcript can't be a real battle
 * (bad indices, empty, more answers than questions).
 */
export function resolveBossBattle(
  seed: number,
  wordIds: string[],
  answers: unknown,
): BossResolution {
  const invalid: BossResolution = {
    valid: false,
    correctCount: 0,
    bossHp: BOSS_HP,
    playerHp: PLAYER_HP,
    outcome: "incomplete",
  };
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > wordIds.length) {
    return invalid;
  }
  const questions = buildBossQuestions(seed, wordIds);
  if (questions.length === 0 || answers.length > questions.length) return invalid;
  let correctCount = 0;
  for (let i = 0; i < answers.length; i++) {
    const a = answers[i];
    if (typeof a !== "number" || !Number.isInteger(a) || a < 0 || a >= questions[i].options.length) {
      return invalid;
    }
    if (questions[i].options[a] === bossCorrectAnswer(questions[i])) correctCount++;
  }
  const wrong = answers.length - correctCount;
  const bossHp = BOSS_HP - BOSS_DAMAGE_ON_CORRECT * correctCount;
  const playerHp = PLAYER_HP - PLAYER_DAMAGE_ON_WRONG * wrong;
  let outcome: BossOutcome = "incomplete";
  if (bossHp <= 0) outcome = "win";
  else if (playerHp <= 0) outcome = "loss";
  else if (answers.length >= questions.length) outcome = "loss"; // boss escapes
  return { valid: true, correctCount, bossHp, playerHp, outcome };
}
