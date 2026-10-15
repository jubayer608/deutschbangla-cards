// Phase 5 — Streak Freeze (pure logic, no DB access).
//
// Rules (documented here because they span client + server):
// - EARN: every time the streak hits a multiple of 7 (7, 14, 21, …),
//   the user earns +1 freeze, max 3 stored. `lastFreezeMilestone`
//   records the highest multiple-of-7 already paid out, so each
//   milestone grants exactly once — even when the streak jumps
//   (e.g. a sync that takes the streak from 5 straight to 15 pays
//   milestones 7 and 14 in one go, capped at 3 stored).
// - SPEND: when the user returns after exactly ONE missed day (gap of
//   exactly 2 days since their last activity day) and freezes > 0,
//   one freeze is auto-consumed and the streak is kept alive.
// - RESET: gaps of 3+ days (2+ missed days) always reset the streak,
//   no matter how many freezes are stored. A 2-day gap WITHOUT a
//   freeze also resets.
// - The gap is measured from the latest ACTIVITY day strictly before
//   today (activity = the per-day XP map, which only grows when the
//   user actually studies). `lastStudyDate` is NOT used for the gap:
//   it is a display field and can be stale. Days are UTC calendar days
//   (keys are "YYYY-MM-DD").
//
// Where this runs: POST /api/sync-progress (the single server writer
// of UserProgress streaks) applies it on every sync. The client
// (ProgressSync) adopts the server streak when a freeze was used, so
// the local streak counter continues instead of restarting at 1.

export const STREAK_FREEZE_MAX = 3;
export const STREAK_FREEZE_MILESTONE_EVERY = 7;

export interface StreakFreezeInput {
  /** Streak after the normal MAX merge (DB vs local). */
  streak: number;
  streakFreezes: number;
  lastFreezeMilestone: number;
  /** Latest activity day strictly before today ("YYYY-MM-DD"), or null. */
  lastActivityDay: string | null;
  /** Today ("YYYY-MM-DD", UTC). */
  today: string;
  /** True when the client already recorded activity today (fresh run). */
  studiedToday: boolean;
  /** The client's own streak value (the fresh run when studiedToday). */
  localStreak: number;
}

export interface StreakFreezeOutcome {
  streak: number;
  streakFreezes: number;
  lastFreezeMilestone: number;
  /** True when a freeze was consumed to save this streak. */
  freezeUsed: boolean;
  /** True when the run is broken and the streak restarted. */
  streakReset: boolean;
}

const DAY_MS = 86_400_000;

function parseDayKey(key: string | null): number | null {
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const t = Date.parse(`${key}T00:00:00.000Z`);
  return Number.isNaN(t) ? null : t;
}

/** Whole UTC days between two "YYYY-MM-DD" keys (b − a). */
export function dayGap(a: string, b: string): number {
  const ta = parseDayKey(a);
  const tb = parseDayKey(b);
  if (ta === null || tb === null) return 0;
  return Math.round((tb - ta) / DAY_MS);
}

/** The latest activity day strictly before `today`, or null. */
export function latestActivityDayBeforeToday(
  activity: Record<string, number>,
  today: string,
): string | null {
  const todayMs = parseDayKey(today);
  if (todayMs === null) return null;
  let best: string | null = null;
  let bestMs = -Infinity;
  for (const key of Object.keys(activity)) {
    const ms = parseDayKey(key);
    if (ms === null || ms >= todayMs) continue; // today + future don't count
    if (ms > bestMs) {
      bestMs = ms;
      best = key;
    }
  }
  return best;
}

/**
 * Milestone grants: +1 freeze per multiple-of-7 streak milestone not
 * yet paid out (tracked by `lastFreezeMilestone`), capped at
 * STREAK_FREEZE_MAX stored. Idempotent — safe to call repeatedly.
 */
export function grantMilestoneFreezes(
  streak: number,
  streakFreezes: number,
  lastFreezeMilestone: number,
): { streakFreezes: number; lastFreezeMilestone: number } {
  const milestone = Math.floor(Math.max(0, streak) / STREAK_FREEZE_MILESTONE_EVERY);
  if (milestone <= lastFreezeMilestone) return { streakFreezes, lastFreezeMilestone };
  const grant = Math.min(
    milestone - lastFreezeMilestone,
    Math.max(0, STREAK_FREEZE_MAX - streakFreezes),
  );
  return {
    streakFreezes: streakFreezes + grant,
    lastFreezeMilestone: milestone,
  };
}

export function applyStreakFreeze(input: StreakFreezeInput): StreakFreezeOutcome {
  let { streak, streakFreezes, lastFreezeMilestone } = input;
  let freezeUsed = false;
  let streakReset = false;

  const gap =
    input.lastActivityDay !== null ? dayGap(input.lastActivityDay, input.today) : 0;

  if (gap === 2) {
    if (streakFreezes > 0) {
      // Exactly one missed day + a freeze: the run survives.
      streakFreezes -= 1;
      freezeUsed = true;
    } else {
      streakReset = true;
    }
  } else if (gap > 2) {
    // Two or more missed days: no freeze can save the run.
    streakReset = true;
  }

  if (streakReset) {
    // The run restarts. If the client already studied today, its fresh
    // local streak IS the new run (the merged MAX would resurrect the
    // stale pre-gap streak, so the local value wins here); otherwise
    // the streak is 0 until the first study action of the new run.
    streak = input.studiedToday ? input.localStreak : 0;
    // Milestone tracking is per-run: a fresh run re-earns milestones.
    lastFreezeMilestone = 0;
  } else {
    // Milestone grants on the surviving streak.
    const grants = grantMilestoneFreezes(streak, streakFreezes, lastFreezeMilestone);
    streakFreezes = grants.streakFreezes;
    lastFreezeMilestone = grants.lastFreezeMilestone;
  }

  return { streak, streakFreezes, lastFreezeMilestone, freezeUsed, streakReset };
}
