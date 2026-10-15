import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { ensureBadges } from "@/lib/badges";
import { sendWelcomeMail } from "@/lib/mailer";
import {
  applyStreakFreeze,
  grantMilestoneFreezes,
  latestActivityDayBeforeToday,
} from "@/lib/streak";

// Phase 0 — first-login migration: merge the browser's localStorage progress
// (see lib/progress.ts, `dbc-*` keys) into the DB. Called once per session
// by <ProgressSync /> right after sign-in.
//
// Merge semantics (never lose data):
// - xp / streak / reviewed / level: MAX of (DB, local)
// - knownWords / lessonsDone: UNION
// - quizBest / quizBestScores / activity: per-key MAX
//   (activity is per-day XP — MAX, not sum, so the same day's activity is
//   never double-counted across devices)
// - lastStudyDate: latest of the two
// The merged state is returned so the client can write it back to
// localStorage and prefer DB state from then on.

const LEVEL_XP = 200;
const levelFor = (xp: number) => Math.floor(Math.max(0, xp) / LEVEL_XP) + 1;

const clampInt = (v: unknown, max: number): number => {
  const n = typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : 0;
  return Math.min(Math.max(n, 0), max);
};

function mergeMaxRecord(
  a: Record<string, number>,
  b: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] = Math.max(out[k] ?? 0, clampInt(v, 1_000_000));
  }
  return out;
}

function mergeUnion<T>(a: T[], b: T[]): T[] {
  return Array.from(new Set([...a, ...b]));
}

function parseRecord(v: unknown): Record<string, number> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: Record<string, number> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof k === "string" && k.length <= 64) out[k] = clampInt(val, 1_000_000);
  }
  return out;
}

function parseStringArray(v: unknown, maxLen: number): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.length <= 128).slice(0, maxLen);
}

function parseNumberArray(v: unknown, maxLen: number): number[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is number => typeof x === "number" && Number.isFinite(x))
    .map((x) => Math.floor(x))
    .slice(0, maxLen);
}

function parseDate(v: unknown): Date | null {
  if (typeof v !== "string") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "YYYY-MM-DD" day key, or null when invalid. */
function parseDayKey(v: unknown): string | null {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00.000Z`))
    ? v
    : null;
}

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const userId = session.user.id;
  const local = {
    xp: clampInt(body.xp, 10_000_000),
    streak: clampInt(body.streak, 3650),
    reviewed: clampInt(body.reviewed, 10_000_000),
    knownWords: parseStringArray(body.knownWords, 5000),
    lessonsDone: parseNumberArray(body.lessonsDone, 1000),
    quizBest: parseRecord(body.quizBest),
    quizBestScores: parseRecord(body.quizBestScores),
    activity: parseRecord(body.activity),
    lastStudyDate: parseDate(body.lastStudyDate),
    // The client's local "today" (YYYY-MM-DD) — the streak belongs to
    // the user's timezone, so gap math uses their day, not the
    // server's. Falls back to the server's UTC day when absent.
    today: parseDayKey(body.today) ?? new Date().toISOString().slice(0, 10),
  };

  const existing = await prisma.userProgress.findUnique({ where: { userId } });
  const db = existing
    ? {
        xp: existing.xp,
        streak: existing.streak,
        reviewed: existing.reviewed,
        knownWords: Array.isArray(existing.knownWords) ? (existing.knownWords as string[]) : [],
        lessonsDone: Array.isArray(existing.lessonsDone) ? (existing.lessonsDone as number[]) : [],
        quizBest: (existing.quizBest as Record<string, number> | null) ?? {},
        quizBestScores: (existing.quizBestScores as Record<string, number> | null) ?? {},
        activity: (existing.activity as Record<string, number> | null) ?? {},
        lastStudyDate: existing.lastStudyDate,
      }
    : null;

  const merged = {
    xp: Math.max(db?.xp ?? 0, local.xp),
    streak: Math.max(db?.streak ?? 0, local.streak),
    reviewed: Math.max(db?.reviewed ?? 0, local.reviewed),
    knownWords: mergeUnion(db?.knownWords ?? [], local.knownWords),
    lessonsDone: mergeUnion(db?.lessonsDone ?? [], local.lessonsDone),
    quizBest: mergeMaxRecord(db?.quizBest ?? {}, local.quizBest),
    quizBestScores: mergeMaxRecord(db?.quizBestScores ?? {}, local.quizBestScores),
    activity: mergeMaxRecord(db?.activity ?? {}, local.activity),
    lastStudyDate:
      db?.lastStudyDate && local.lastStudyDate
        ? new Date(Math.max(db.lastStudyDate.getTime(), local.lastStudyDate.getTime()))
        : (db?.lastStudyDate ?? local.lastStudyDate ?? null),
  };

  // Phase 5 — Streak Freeze (see lib/streak.ts). The gap is measured
  // from the latest activity day strictly before the client's today.
  // Gap decisions run at most once per day: after a freeze is consumed
  // (or the streak resets), lastStudyDate is set to today, and a
  // second sync the same day skips the gap logic (only idempotent
  // milestone grants still run) — so one missed day can never eat
  // two freezes. First-ever syncs skip gap logic entirely (pure
  // migration); milestone grants still apply.
  let finalStreak = merged.streak;
  let finalFreezes = existing?.streakFreezes ?? 0;
  let finalMilestone = existing?.lastFreezeMilestone ?? 0;
  let freezeUsed = false;
  let finalLastStudyDate = merged.lastStudyDate;
  const lastStudyDayKey = existing?.lastStudyDate
    ? existing.lastStudyDate.toISOString().slice(0, 10)
    : null;
  const decisionMadeToday = lastStudyDayKey !== null && lastStudyDayKey >= local.today;
  if (existing && !decisionMadeToday) {
    const lastActivityDay = latestActivityDayBeforeToday(merged.activity, local.today);
    const freeze = applyStreakFreeze({
      streak: merged.streak,
      streakFreezes: finalFreezes,
      lastFreezeMilestone: finalMilestone,
      lastActivityDay,
      today: local.today,
      studiedToday: (merged.activity[local.today] ?? 0) > 0,
      localStreak: local.streak,
    });
    finalStreak = freeze.streak;
    finalFreezes = freeze.streakFreezes;
    finalMilestone = freeze.lastFreezeMilestone;
    freezeUsed = freeze.freezeUsed;
    if (freezeUsed || freeze.streakReset) {
      finalLastStudyDate = new Date(`${local.today}T00:00:00.000Z`);
    }
  } else {
    // First sync (migration) or a decision already made today:
    // milestone grants only — idempotent via lastFreezeMilestone.
    const grants = grantMilestoneFreezes(finalStreak, finalFreezes, finalMilestone);
    finalFreezes = grants.streakFreezes;
    finalMilestone = grants.lastFreezeMilestone;
  }

  const saved = await prisma.userProgress.upsert({
    where: { userId },
    create: {
      userId,
      xp: merged.xp,
      level: levelFor(merged.xp),
      streak: finalStreak,
      lastStudyDate: finalLastStudyDate,
      reviewed: merged.reviewed,
      knownWords: merged.knownWords,
      lessonsDone: merged.lessonsDone,
      quizBest: merged.quizBest,
      quizBestScores: merged.quizBestScores,
      activity: merged.activity,
      streakFreezes: finalFreezes,
      lastFreezeMilestone: finalMilestone,
    },
    update: {
      xp: merged.xp,
      level: levelFor(merged.xp),
      streak: finalStreak,
      lastStudyDate: finalLastStudyDate,
      reviewed: merged.reviewed,
      knownWords: merged.knownWords,
      lessonsDone: merged.lessonsDone,
      quizBest: merged.quizBest,
      quizBestScores: merged.quizBestScores,
      activity: merged.activity,
      streakFreezes: finalFreezes,
      lastFreezeMilestone: finalMilestone,
    },
  });

  // Phase 1 — evaluate badge unlocks against the merged state.
  await ensureBadges(prisma, userId, {
    streak: saved.streak,
    knownWords: saved.knownWords,
    quizBestScores: saved.quizBestScores,
  }).catch(() => {
    /* badges must never break the sync flow */
  });

  // Phase 4 — welcome mail (once ever, best-effort, never breaks sync).
  await sendWelcomeMail(prisma, userId).catch(() => {
    /* mail must never break the sync flow */
  });

  return NextResponse.json({
    progress: {
      xp: saved.xp,
      level: saved.level,
      streak: saved.streak,
      reviewed: saved.reviewed,
      knownWords: saved.knownWords,
      lessonsDone: saved.lessonsDone,
      quizBest: saved.quizBest,
      quizBestScores: saved.quizBestScores,
      activity: saved.activity,
      lastStudyDate: saved.lastStudyDate?.toISOString() ?? null,
      streakFreezes: saved.streakFreezes,
      freezeUsed,
    },
  });
}
