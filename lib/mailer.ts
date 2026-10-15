// Phase 4 — mail orchestration: welcome + cron sends (weekly / streak / word-of-day).
//
// Every send is best-effort and idempotent:
// - The MailLog slot is claimed BEFORE sending (unique on
//   (userId, kind, dedupKey), so cron retries/races never duplicate).
// - If the send fails, the slot is released so a later run can retry.
// - Nothing here ever throws: callers (sync, cron) must not break because
//   mail failed.
// Recipient rules: weekly/streak/wordofday honour the matching
// EmailPreference toggle (missing row = defaults: weekly + streak on,
// word-of-day off). Welcome sends once ever (MailLog dedup) regardless of
// toggles — the welcome mail's unsubscribe link opts out of ALL mail.
// All stats come from real UserProgress/activity; the word-of-day comes
// from the real vocab data (data/words.ts), deterministic by day-of-year.

import type { PrismaClient } from "@prisma/client";
import {
  claimMailSlot,
  releaseMailSlot,
  sendMail,
  type MailKind,
} from "./mail";
import {
  streakTemplate,
  weeklyTemplate,
  welcomeTemplate,
  wordOfDayTemplate,
} from "./mail-templates";
import { BADGE_CATALOG, evaluateBadges } from "./badges";
import { dayKey, lastNDayKeys, parseActivity } from "./profile";
import { categories, words } from "@/data/words";

const DAY_MS = 86_400_000;
/** Safety cap per cron run — keeps us inside serverless time limits. */
const MAX_RECIPIENTS_PER_RUN = 50;

interface Recipient {
  id: string;
  name: string | null;
  email: string;
}

async function getRecipients(
  prisma: PrismaClient,
  toggle: "weeklyReport" | "streakNudge" | "wordOfDay",
): Promise<Recipient[]> {
  const prefs = await prisma.emailPreference.findMany({
    where: { [toggle]: true },
    select: { userId: true },
    take: MAX_RECIPIENTS_PER_RUN,
  });
  if (prefs.length === 0) return [];
  const users = await prisma.user.findMany({
    where: { id: { in: prefs.map((p) => p.userId) }, email: { not: null } },
    select: { id: true, name: true, email: true },
  });
  return users
    .filter((u) => u.email)
    .map((u) => ({ id: u.id, name: u.name, email: u.email as string }));
}

/** "YYYY-Www" ISO week key for a date (UTC). */
function isoWeekKey(d: Date): string {
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const day = date.getUTCDay() || 7; // Mon=1 … Sun=7
  date.setUTCDate(date.getUTCDate() + 4 - day); // Thursday of this week
  const year = date.getUTCFullYear();
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((date.getTime() - jan1.getTime()) / DAY_MS + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** Deterministic word-of-day: day-of-year (UTC) modulo vocab size. */
export function wordOfDayFor(date: Date): (typeof words)[number] {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start) / DAY_MS);
  return words[dayOfYear % words.length];
}

async function sendOne(
  prisma: PrismaClient,
  userId: string,
  kind: MailKind,
  dedupKey: string,
  build: () => { subject: string; html: string; text: string },
  to: string,
  meta?: Record<string, unknown>,
): Promise<boolean> {
  const claimed = await claimMailSlot(prisma, userId, kind, dedupKey, meta);
  if (!claimed) return false;
  const tpl = build();
  const sent = await sendMail({ to, ...tpl });
  if (!sent) await releaseMailSlot(prisma, userId, kind, dedupKey);
  return sent;
}

// ── Welcome (called from POST /api/sync-progress after the upsert) ────────

export async function sendWelcomeMail(
  prisma: PrismaClient,
  userId: string,
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (!user?.email) return;
    await sendOne(
      prisma,
      userId,
      "welcome",
      "welcome",
      () => welcomeTemplate({ name: user.name, userId }),
      user.email,
    );
  } catch {
    // Mail must never break sync.
  }
}

// ── Cron sends ─────────────────────────────────────────────────────────────

export interface CronResult {
  kind: MailKind;
  checked: number;
  sent: number;
  skipped: number;
}

async function runWeekly(prisma: PrismaClient): Promise<CronResult> {
  const recipients = await getRecipients(prisma, "weeklyReport");
  const dedupKey = isoWeekKey(new Date());
  let sent = 0;
  let skipped = 0;
  for (const r of recipients) {
    try {
      const progress = await prisma.userProgress.findUnique({
        where: { userId: r.id },
      });
      const activity = parseActivity(progress?.activity);
      const keys = lastNDayKeys(7);
      const weekXp = keys.reduce((sum, k) => sum + (activity[k] ?? 0), 0);
      const activeDays = keys.filter((k) => (activity[k] ?? 0) > 0).length;
      const streak = progress?.streak ?? 0;
      const lessonsDoneTotal = Array.isArray(progress?.lessonsDone)
        ? progress.lessonsDone.length
        : 0;
      // Next badge: the unearned badge with the most progress toward it.
      const earned = new Set(
        evaluateBadges({
          streak,
          knownWords: Array.isArray(progress?.knownWords)
            ? (progress.knownWords as string[])
            : [],
          quizBestScores: parseActivity(progress?.quizBestScores),
        }),
      );
      const badgeProgress: Record<string, { label: string; frac: number }> = {
        "streak-7": { label: `স্ট্রিক ${streak}/৭ দিন`, frac: Math.min(1, streak / 7) },
        "words-100": {
          label: `${Array.isArray(progress?.knownWords) ? progress.knownWords.length : 0}/১০০ শব্দ`,
          frac: Math.min(
            1,
            (Array.isArray(progress?.knownWords) ? progress.knownWords.length : 0) / 100,
          ),
        },
        "grammar-master": {
          label: `ব্যাকরণ কুইজে সেরা ${Math.max(
            0,
            ...Object.entries(parseActivity(progress?.quizBestScores))
              .filter(([k]) => k.startsWith("grammar-"))
              .map(([, v]) => v),
          )}/১০`,
          frac:
            Math.max(
              0,
              ...Object.entries(parseActivity(progress?.quizBestScores))
                .filter(([k]) => k.startsWith("grammar-"))
                .map(([, v]) => v),
            ) / 8,
        },
      };
      let nextBadge: { titleBangla: string; label: string; frac: number } | null = null;
      for (const def of BADGE_CATALOG) {
        if (earned.has(def.key)) continue;
        const bp = badgeProgress[def.key];
        if (!bp) continue;
        if (!nextBadge || bp.frac > nextBadge.frac) {
          nextBadge = { titleBangla: def.titleBangla, label: bp.label, frac: bp.frac };
        }
      }
      const ok = await sendOne(
        prisma,
        r.id,
        "weekly",
        dedupKey,
        () =>
          weeklyTemplate({
            name: r.name,
            userId: r.id,
            weekXp,
            activeDays,
            streak,
            lessonsDoneTotal,
            nextBadgeBangla: nextBadge?.titleBangla ?? null,
            nextBadgeProgress: nextBadge?.label ?? null,
          }),
        r.email,
        { weekXp, activeDays, streak },
      );
      if (ok) sent += 1;
      else skipped += 1;
    } catch {
      skipped += 1;
    }
  }
  return { kind: "weekly", checked: recipients.length, sent, skipped };
}

async function runStreak(prisma: PrismaClient): Promise<CronResult> {
  const recipients = await getRecipients(prisma, "streakNudge");
  const today = dayKey(new Date());
  let sent = 0;
  let skipped = 0;
  for (const r of recipients) {
    try {
      const progress = await prisma.userProgress.findUnique({
        where: { userId: r.id },
        select: { streak: true, lastStudyDate: true },
      });
      const streak = progress?.streak ?? 0;
      const last = progress?.lastStudyDate;
      // At risk: has a streak, studied within the last 3 days, but not today.
      // (Last-study "today" uses the same day-key convention as the heatmap.)
      const atRisk =
        streak >= 1 &&
        last !== null &&
        last !== undefined &&
        dayKey(last) !== today &&
        Date.now() - last.getTime() < 3 * DAY_MS;
      if (!atRisk) {
        skipped += 1;
        continue;
      }
      const ok = await sendOne(
        prisma,
        r.id,
        "streak",
        today,
        () => streakTemplate({ name: r.name, userId: r.id, streak }),
        r.email,
        { streak },
      );
      if (ok) sent += 1;
      else skipped += 1;
    } catch {
      skipped += 1;
    }
  }
  return { kind: "streak", checked: recipients.length, sent, skipped };
}

async function runWordOfDay(prisma: PrismaClient): Promise<CronResult> {
  const recipients = await getRecipients(prisma, "wordOfDay");
  const now = new Date();
  const dedupKey = dayKey(now);
  const word = wordOfDayFor(now);
  const categoryBangla =
    categories.find((c) => c.id === word.category)?.bangla ?? word.category;
  const dateLabel = now.toLocaleDateString("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  let sent = 0;
  let skipped = 0;
  for (const r of recipients) {
    try {
      const ok = await sendOne(
        prisma,
        r.id,
        "wordofday",
        dedupKey,
        () =>
          wordOfDayTemplate({
            userId: r.id,
            german: word.german,
            bangla: word.bangla,
            categoryBangla,
            example: word.example,
            exampleBangla: word.exampleBangla,
            dateLabel,
          }),
        r.email,
        { wordId: word.id },
      );
      if (ok) sent += 1;
      else skipped += 1;
    } catch {
      skipped += 1;
    }
  }
  return { kind: "wordofday", checked: recipients.length, sent, skipped };
}

export async function runMailCron(
  prisma: PrismaClient,
  kind: MailKind,
): Promise<CronResult> {
  switch (kind) {
    case "weekly":
      return runWeekly(prisma);
    case "streak":
      return runStreak(prisma);
    case "wordofday":
      return runWordOfDay(prisma);
    default:
      return { kind, checked: 0, sent: 0, skipped: 0 };
  }
}
