export interface Progress {
  streak: number;
  reviewed: number;
}

const STREAK_KEY = "dbc-streak";
const REVIEWED_KEY = "dbc-reviewed";

interface StreakData {
  count: number;
  lastVisit: string;
}

function dayKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function readStreak(): StreakData | null {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? (JSON.parse(raw) as StreakData) : null;
  } catch {
    return null;
  }
}

export function getProgress(): Progress {
  if (typeof window === "undefined") return { streak: 0, reviewed: 0 };
  const streak = readStreak()?.count ?? 0;
  const reviewed = Number(localStorage.getItem(REVIEWED_KEY) ?? 0) || 0;
  return { streak, reviewed };
}

/**
 * Record that the user reviewed a word (flipped a card or answered a quiz
 * question). Bumps the daily streak when this is the first activity of a new
 * day, and increments the total reviewed counter.
 */
export function recordReview(): Progress {
  if (typeof window === "undefined") return { streak: 0, reviewed: 0 };
  const today = dayKey();
  const yesterday = dayKey(new Date(Date.now() - 86_400_000));

  const prev = readStreak();
  let streak: number;
  if (prev?.lastVisit === today) {
    streak = prev.count;
  } else if (prev?.lastVisit === yesterday) {
    streak = prev.count + 1;
  } else {
    streak = 1;
  }
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify({ count: streak, lastVisit: today }));
  } catch {
    /* storage unavailable */
  }

  let reviewed = 0;
  try {
    reviewed = (Number(localStorage.getItem(REVIEWED_KEY)) || 0) + 1;
    localStorage.setItem(REVIEWED_KEY, String(reviewed));
  } catch {
    /* storage unavailable */
  }

  return { streak, reviewed };
}
