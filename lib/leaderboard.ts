// Phase 2 — leaderboard logic shared by the page + API route.
//
// Privacy rules (same model as Phase 1 profiles):
// - `public` profiles appear to everyone.
// - `friends` profiles appear only to their followers.
// - `private` profiles never appear.
// - A signed-in user always sees their OWN rank (highlighted "your rank" row),
//   even when their profile is private.
//
// Scoring:
// - All-time: UserProgress.xp.
// - Weekly: sum of the last 7 days of the `activity` map (same day-key
//   convention as lib/profile.ts). NOTE: activity keys are written in the
//   *client's* local day while the server reads its own local day, so near
//   midnight a day's XP can land in the adjacent bucket — same known
//   approximation as the Phase 1 heatmap.
//
// Candidate cap (documented approximation): weekly ranking is computed over
// the top 200 users by all-time XP. A brand-new user grinding hard this week
// but outside the all-time top 200 could be missed on the weekly board.
// Fine for a young site; revisit if the user base grows.

import type { PrismaClient } from "@prisma/client";
import { lastNDayKeys, parseActivity } from "./profile";

export type LeaderboardScope = "week" | "all";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  username: string;
  image: string | null;
  /** Scope score: weekly XP (week) or total XP (all). */
  score: number;
  allTimeXp: number;
  level: number;
  streak: number;
  followersCount: number;
  isOwn: boolean;
}

export interface LeaderboardResult {
  scope: LeaderboardScope;
  entries: LeaderboardEntry[];
  /** The viewer's own entry, even when it falls outside the returned board. */
  yourRank: LeaderboardEntry | null;
  /** True when the board hit the candidate cap (rank below may be a bound). */
  capped: boolean;
}

const CANDIDATE_CAP = 200;

function weeklyXp(activity: unknown): number {
  const map = parseActivity(activity);
  let sum = 0;
  for (const key of lastNDayKeys(7)) sum += map[key] ?? 0;
  return sum;
}

function scoreOf(
  scope: LeaderboardScope,
  progress: { xp: number; activity: unknown },
): number {
  return scope === "week" ? weeklyXp(progress.activity) : progress.xp;
}

export async function getLeaderboard(
  prisma: PrismaClient,
  scope: LeaderboardScope,
  viewerId: string | null,
  limit: number,
): Promise<LeaderboardResult> {
  const clampedLimit = Math.min(Math.max(Math.floor(limit) || 50, 1), 100);

  // The viewer's following set drives `friends` visibility.
  let followingIds = new Set<string>();
  if (viewerId) {
    const rows = await prisma.follow.findMany({
      where: { followerId: viewerId },
      select: { followingId: true },
    });
    followingIds = new Set(rows.map((r) => r.followingId));
  }

  const candidates = await prisma.user.findMany({
    where: {
      username: { not: null },
      progress: { isNot: null },
    },
    include: {
      progress: true,
      settings: true,
      _count: { select: { followers: true, following: true } },
    },
    orderBy: { progress: { xp: "desc" } },
    take: CANDIDATE_CAP,
  });
  const capped = candidates.length >= CANDIDATE_CAP;

  const visible = candidates.filter((u) => {
    if (u.id === viewerId) return true; // own row is always visible to self
    const privacy = u.settings?.privacy ?? "public";
    if (privacy === "public") return true;
    if (privacy === "friends") return followingIds.has(u.id);
    return false; // private
  });

  const scored = visible
    .map((u) => ({
      user: u,
      score: scoreOf(scope, u.progress!),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.user.progress!.xp - a.user.progress!.xp);

  const top = scored.slice(0, clampedLimit);
  const entries: LeaderboardEntry[] = top.map(({ user, score }, i) => ({
    rank: i + 1,
    userId: user.id,
    name: user.name,
    username: user.username!,
    image: user.image,
    score,
    allTimeXp: user.progress!.xp,
    level: user.progress!.level,
    streak: user.progress!.streak,
    followersCount: user._count.followers,
    isOwn: user.id === viewerId,
  }));

  // "Your rank": the viewer's entry if on the board, else computed against
  // the visible board (rank = #entries above + 1). Exact whenever the viewer
  // is inside the candidate pool; a lower bound only in the pathological
  // case where the viewer sits beyond the top-200 candidate cap.
  let yourRank: LeaderboardEntry | null =
    entries.find((e) => e.isOwn) ?? null;
  if (!yourRank && viewerId) {
    const me = await prisma.user.findUnique({
      where: { id: viewerId },
      include: {
        progress: true,
        settings: true,
        _count: { select: { followers: true, following: true } },
      },
    });
    if (me?.progress && me.username) {
      const myScore = scoreOf(scope, me.progress);
      if (myScore > 0) {
        const above = scored.filter((s) => s.score > myScore).length;
        yourRank = {
          rank: above + 1,
          userId: me.id,
          name: me.name,
          username: me.username,
          image: me.image,
          score: myScore,
          allTimeXp: me.progress.xp,
          level: me.progress.level,
          streak: me.progress.streak,
          followersCount: me._count.followers,
          isOwn: true,
        };
      }
    }
  }

  return { scope, entries, yourRank, capped };
}

/** Mascot mood for the signed-in user's own rank (no rank history needed). */
export function rankMood(rank: number | null): "celebrate" | "happy" | "study" | "thinking" {
  if (rank === null) return "thinking";
  if (rank <= 3) return "celebrate";
  if (rank <= 10) return "happy";
  return "study";
}
