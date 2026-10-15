// Phase 5 — A1 Certificate (pure logic).
//
// Eligibility (read from the user's real UserProgress row):
// - All 12 lessons completed (lessonsDone has 12 entries — there are
//   exactly 12 lessons in data/lessons.ts, ids 1–12).
// - 100+ words known (knownWords has 100+ entries).
// - At least one quiz completed (quizBestScores or quizBest non-empty
//   — either is written by a quiz round; see lib/progress.ts).
//
// Issuing is idempotent: one certificate per user, ever. The code
// (ULLUK-XXXX-XXXX) is the public verification handle — the verify
// page shows only name + issued date + criteria, never email/userId.

import { randomInt } from "node:crypto";

export const CERT_TOTAL_LESSONS = 12;
export const CERT_MIN_KNOWN_WORDS = 100;

export interface CertificateMissing {
  key: "lessons" | "words" | "quiz";
  label: string;
  current: number;
  required: number;
}

export interface CertificateEligibility {
  eligible: boolean;
  missing: CertificateMissing[];
}

function toStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function toNumberArray(v: unknown): number[] {
  return Array.isArray(v) ? v.filter((x): x is number => typeof x === "number") : [];
}

function recordSize(v: unknown): number {
  if (!v || typeof v !== "object" || Array.isArray(v)) return 0;
  return Object.keys(v as Record<string, unknown>).length;
}

export function checkCertificateEligibility(progress: {
  lessonsDone: unknown;
  knownWords: unknown;
  quizBest: unknown;
  quizBestScores: unknown;
}): CertificateEligibility {
  const lessons = toNumberArray(progress.lessonsDone).length;
  const words = toStringArray(progress.knownWords).length;
  const quizDone = recordSize(progress.quizBestScores) > 0 || recordSize(progress.quizBest) > 0;
  const missing: CertificateMissing[] = [];
  if (lessons < CERT_TOTAL_LESSONS) {
    missing.push({
      key: "lessons",
      label: "১২-টি লেসন শেষ করো",
      current: lessons,
      required: CERT_TOTAL_LESSONS,
    });
  }
  if (words < CERT_MIN_KNOWN_WORDS) {
    missing.push({
      key: "words",
      label: "১০০-টি শব্দ শেখো",
      current: words,
      required: CERT_MIN_KNOWN_WORDS,
    });
  }
  if (!quizDone) {
    missing.push({
      key: "quiz",
      label: "অন্তত ১-টি কুইজ শেষ করো",
      current: 0,
      required: 1,
    });
  }
  return { eligible: missing.length === 0, missing };
}

/** Public verification code, e.g. "ULLUK-KQ7X-2P9M" (no ambiguous 0/O, 1/I). */
export function generateCertificateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const group = () =>
    Array.from({ length: 4 }, () => alphabet[randomInt(0, alphabet.length)]).join("");
  return `ULLUK-${group()}-${group()}`;
}
