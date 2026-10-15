// Phase 1 — shared profile logic (used by pages + API routes).
//
// Stats are computed ONLY from real stored data:
// - words learned = knownWords.length
// - lessons done = lessonsDone.length
// - quiz score = best single quiz round / 10 (the quiz always runs 10
//   questions), labelled honestly as "best score", never "accuracy"
// - active days = number of days present in the activity map (no
//   minute-level study-time data exists, so we never invent minutes)
// - heatmap = last 7 days of activity XP

import { BADGE_CATALOG, type BadgeDef } from "./badges";
import type { PrismaClient } from "@prisma/client";

export interface ProfileStats {
  wordsLearned: number;
  lessonsDone: number;
  /** Best single quiz round as a percentage (score/10), or null if no quiz yet. */
  quizBestPercent: number | null;
  /** Number of distinct days with activity. */
  activeDays: number;
  /** Total XP. */
  xp: number;
  heatmap: { date: string; xp: number }[];
}

export interface ProfileBadge {
  def: BadgeDef;
  unlocked: boolean;
  unlockedAt: Date | null;
  /** Unlocked within the last 24h (drives the celebration banner). */
  isNew: boolean;
}

export interface PublicProfile {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  level: number;
  xp: number;
  streak: number;
  stats: ProfileStats;
  badges: ProfileBadge[];
  isOwner: boolean;
  privacy: string;
}

const DAY_MS = 86_400_000;

/** "YYYY-MM-DD" key for a Date, using the server's local calendar day. */
export function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** The last `n` day keys, oldest → newest (same convention as the heatmap). */
export function lastNDayKeys(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.now() - (n - 1 - i) * DAY_MS);
    return dayKey(d);
  });
}

/** Parse a `Record<string, number>` Json field defensively. */
export function parseActivity(v: unknown): Record<string, number> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: Record<string, number> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof val === "number" && Number.isFinite(val)) out[k] = Math.floor(val);
  }
  return out;
}

function parseQuizBestScores(v: unknown): Record<string, number> {
  return parseActivity(v);
}

export function computeStats(
  progress: {
    xp: number;
    knownWords: unknown;
    lessonsDone: unknown;
    quizBestScores: unknown;
    activity: unknown;
  } | null,
): ProfileStats {
  if (!progress) {
    return {
      wordsLearned: 0,
      lessonsDone: 0,
      quizBestPercent: null,
      activeDays: 0,
      xp: 0,
      heatmap: Array.from({ length: 7 }, (_, i) => {
        const d = new Date(Date.now() - (6 - i) * DAY_MS);
        return { date: dayKey(d), xp: 0 };
      }),
    };
  }
  const knownWords = Array.isArray(progress.knownWords) ? progress.knownWords : [];
  const lessonsDone = Array.isArray(progress.lessonsDone) ? progress.lessonsDone : [];
  const scores = parseQuizBestScores(progress.quizBestScores);
  const best = Object.values(scores).reduce((m, v) => Math.max(m, v), 0);
  const activity = parseActivity(progress.activity);
  const heatmap = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * DAY_MS);
    const key = dayKey(d);
    return { date: key, xp: activity[key] ?? 0 };
  });
  return {
    wordsLearned: knownWords.length,
    lessonsDone: lessonsDone.length,
    quizBestPercent: best > 0 ? Math.min(100, Math.round((best / 10) * 100)) : null,
    activeDays: Object.keys(activity).length,
    xp: progress.xp,
    heatmap,
  };
}

export type ProfileRow = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  progress: {
    xp: number;
    level: number;
    streak: number;
    knownWords: unknown;
    lessonsDone: unknown;
    quizBestScores: unknown;
    activity: unknown;
  } | null;
  badges: { key: string; unlockedAt: Date }[];
  settings: { privacy: string } | null;
};

/** Privacy gate: may `viewerId` see `owner`'s profile? */
export async function canViewProfile(
  prisma: PrismaClient,
  ownerId: string,
  viewerId: string | null,
  privacy: string,
): Promise<boolean> {
  if (viewerId === ownerId) return true;
  if (privacy === "public") return true;
  if (privacy === "friends" && viewerId) {
    const f = await prisma.follow.findFirst({
      where: { followerId: viewerId, followingId: ownerId },
    });
    return f !== null;
  }
  return false; // private, or friends + not following
}

export function toPublicProfile(row: ProfileRow, viewerId: string | null): PublicProfile {
  const stats = computeStats(row.progress);
  const unlocked = new Map(row.badges.map((b) => [b.key, b.unlockedAt]));
  const now = Date.now();
  const badges: ProfileBadge[] = BADGE_CATALOG.map((def) => {
    const at = unlocked.get(def.key) ?? null;
    return {
      def,
      unlocked: at !== null,
      unlockedAt: at,
      isNew: at !== null && now - at.getTime() < 24 * 3600 * 1000,
    };
  });
  return {
    id: row.id,
    name: row.name,
    username: row.username ?? "",
    image: row.image,
    level: row.progress?.level ?? 1,
    xp: row.progress?.xp ?? 0,
    streak: row.progress?.streak ?? 0,
    stats,
    badges,
    isOwner: viewerId === row.id,
    privacy: row.settings?.privacy ?? "public",
  };
}
