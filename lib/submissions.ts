// Phase 5 — Community Submissions (validation + admin check).
//
// Types + payload shapes:
// - word: { german, bangla, article?, example?, category? }
// - phrase: { german, bangla, context? }
// - lesson_idea: { title, description }
//
// Moderation: only users whose email is in the ADMIN_EMAILS env var
// (comma-separated) may approve/reject. If ADMIN_EMAILS is unset,
// NOBODY can moderate — never hardcode an admin email.

import { categories } from "@/data/words";

export const SUBMISSION_TYPES = ["word", "phrase", "lesson_idea"] as const;
export type SubmissionType = (typeof SUBMISSION_TYPES)[number];

export const SUBMISSION_STATUSES = ["pending", "approved", "rejected"] as const;

const CATEGORY_IDS = new Set(categories.map((c) => c.id));

function cleanStr(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (s.length === 0 || s.length > max) return null;
  return s;
}

function optStr(v: unknown, max: number): string | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const s = cleanStr(v, max);
  return s ?? undefined;
}

export type ValidatedPayload =
  | { german: string; bangla: string; article?: string; example?: string; category?: string }
  | { german: string; bangla: string; context?: string }
  | { title: string; description: string };

export function validateSubmissionPayload(
  type: unknown,
  payload: unknown,
): { ok: true; type: SubmissionType; payload: ValidatedPayload } | { ok: false; error: string } {
  if (type !== "word" && type !== "phrase" && type !== "lesson_idea") {
    return { ok: false, error: "invalid_type" };
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "invalid_payload" };
  }
  const p = payload as Record<string, unknown>;

  if (type === "word") {
    const german = cleanStr(p.german, 100);
    const bangla = cleanStr(p.bangla, 200);
    if (!german || !bangla) return { ok: false, error: "german_and_bangla_required" };
    const article = optStr(p.article, 10);
    const example = optStr(p.example, 500);
    const categoryRaw = optStr(p.category, 64);
    if (categoryRaw !== undefined && !CATEGORY_IDS.has(categoryRaw)) {
      return { ok: false, error: "invalid_category" };
    }
    return {
      ok: true,
      type,
      payload: {
        german,
        bangla,
        ...(article ? { article } : {}),
        ...(example ? { example } : {}),
        ...(categoryRaw ? { category: categoryRaw } : {}),
      },
    };
  }

  if (type === "phrase") {
    const german = cleanStr(p.german, 200);
    const bangla = cleanStr(p.bangla, 300);
    if (!german || !bangla) return { ok: false, error: "german_and_bangla_required" };
    const context = optStr(p.context, 500);
    return { ok: true, type, payload: { german, bangla, ...(context ? { context } : {}) } };
  }

  // lesson_idea
  const title = cleanStr(p.title, 150);
  const description = cleanStr(p.description, 2000);
  if (!title || !description) return { ok: false, error: "title_and_description_required" };
  return { ok: true, type, payload: { title, description } };
}

/** Admin check: email must be listed in ADMIN_EMAILS (comma-separated). */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (list.length === 0) return false; // unset → nobody can moderate
  return list.includes(email.toLowerCase());
}
