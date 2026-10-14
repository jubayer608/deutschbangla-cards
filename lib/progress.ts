export interface Progress {
  streak: number;
  reviewed: number;
}

const STREAK_KEY = "dbc-streak";
const REVIEWED_KEY = "dbc-reviewed";
const XP_KEY = "dbc-xp";
const KNOWN_KEY = "dbc-known";
const LESSONS_KEY = "dbc-lessons";
const QUIZBEST_KEY = "dbc-quizbest";
const ACTIVITY_KEY = "dbc-activity";

interface StreakData {
  count: number;
  lastVisit: string;
}

export const XP = {
  QUIZ_EASY: 10,
  QUIZ_MEDIUM: 15,
  QUIZ_HARD: 20,
  EXERCISE_EASY: 5,
  EXERCISE_MEDIUM: 8,
  EXERCISE_HARD: 12,
  LESSON_COMPLETE: 50,
  WORD_KNOWN: 2,
} as const;

export interface ProgressState {
  streak: number;
  reviewed: number;
  xp: number;
  knownWords: string[];
  lessonsDone: number[];
  quizBest: Record<string, number>;
  /** "YYYY-MM-DD" -> xp earned that day */
  activity: Record<string, number>;
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

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

function readNum(key: string): number {
  try {
    return Number(localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
}

function emptyState(): ProgressState {
  return {
    streak: 0,
    reviewed: 0,
    xp: 0,
    knownWords: [],
    lessonsDone: [],
    quizBest: {},
    activity: {},
  };
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

/** Full progress snapshot. Returns zeros when called during SSR. */
export function getFullProgress(): ProgressState {
  if (typeof window === "undefined") return emptyState();
  const { streak, reviewed } = getProgress();
  return {
    streak,
    reviewed,
    xp: readNum(XP_KEY),
    knownWords: readJSON<string[]>(KNOWN_KEY, []),
    lessonsDone: readJSON<number[]>(LESSONS_KEY, []),
    quizBest: readJSON<Record<string, number>>(QUIZBEST_KEY, {}),
    activity: readJSON<Record<string, number>>(ACTIVITY_KEY, {}),
  };
}

/** Add xp to the total and to today's activity entry. Returns the new state. */
function applyXP(state: ProgressState, n: number): ProgressState {
  const activity = { ...state.activity };
  const today = dayKey();
  activity[today] = (activity[today] ?? 0) + n;
  const next: ProgressState = { ...state, xp: state.xp + n, activity };
  writeJSON(XP_KEY, next.xp);
  writeJSON(ACTIVITY_KEY, next.activity);
  return next;
}

/** Add xp (and count it toward today's activity). Returns the new state. */
export function addXP(n: number): ProgressState {
  if (typeof window === "undefined") return emptyState();
  return applyXP(getFullProgress(), n);
}

/**
 * Mark a word as known/unknown. Marking known awards XP.WORD_KNOWN once per
 * word. Returns the new state.
 */
export function markWord(id: string, known: boolean): ProgressState {
  if (typeof window === "undefined") return emptyState();
  let state = getFullProgress();
  if (known) {
    if (!state.knownWords.includes(id)) {
      state = { ...state, knownWords: [...state.knownWords, id] };
      state = applyXP(state, XP.WORD_KNOWN);
    }
  } else {
    state = { ...state, knownWords: state.knownWords.filter((w) => w !== id) };
  }
  writeJSON(KNOWN_KEY, state.knownWords);
  return state;
}

/**
 * Record a lesson completion. Awards XP.LESSON_COMPLETE only the first time
 * a lesson is completed. Returns the new state.
 */
export function completeLesson(id: number): ProgressState {
  if (typeof window === "undefined") return emptyState();
  let state = getFullProgress();
  if (!state.lessonsDone.includes(id)) {
    state = { ...state, lessonsDone: [...state.lessonsDone, id] };
    state = applyXP(state, XP.LESSON_COMPLETE);
  }
  writeJSON(LESSONS_KEY, state.lessonsDone);
  return state;
}

/**
 * Record a quiz round. Keeps the best total per mode and awards
 * `score * 10` xp once per call. Returns the new state.
 */
export function recordQuiz(mode: string, score: number, total: number): ProgressState {
  if (typeof window === "undefined") return emptyState();
  let state = getFullProgress();
  const quizBest = { ...state.quizBest };
  if (total > (quizBest[mode] ?? 0)) {
    quizBest[mode] = total;
  }
  state = { ...state, quizBest };
  state = applyXP(state, score * 10);
  writeJSON(QUIZBEST_KEY, state.quizBest);
  return state;
}

/** XP value for a difficulty level of a quiz or exercise. */
export function xpForDifficulty(d: "easy" | "medium" | "hard", kind: "quiz" | "exercise"): number {
  if (kind === "quiz") {
    return d === "easy" ? XP.QUIZ_EASY : d === "medium" ? XP.QUIZ_MEDIUM : XP.QUIZ_HARD;
  }
  return d === "easy" ? XP.EXERCISE_EASY : d === "medium" ? XP.EXERCISE_MEDIUM : XP.EXERCISE_HARD;
}

/**
 * Phase 0 — overwrite the whole local progress snapshot with the merged
 * DB state returned by /api/sync-progress (max-wins merge). Used once
 * after sign-in so the browser prefers DB state from then on. The
 * per-mode `dbc-quizbest-score-*` keys are written from `quizBestScores`
 * when provided.
 */
export function writeFullProgress(
  state: ProgressState,
  quizBestScores?: Record<string, number>,
): void {
  if (typeof window === "undefined") return;
  const prevStreak = readStreak();
  try {
    localStorage.setItem(
      STREAK_KEY,
      JSON.stringify({ count: state.streak, lastVisit: prevStreak?.lastVisit ?? dayKey() }),
    );
    localStorage.setItem(REVIEWED_KEY, String(state.reviewed));
  } catch {
    /* storage unavailable */
  }
  writeJSON(XP_KEY, state.xp);
  writeJSON(KNOWN_KEY, state.knownWords);
  writeJSON(LESSONS_KEY, state.lessonsDone);
  writeJSON(QUIZBEST_KEY, state.quizBest);
  writeJSON(ACTIVITY_KEY, state.activity);
  if (quizBestScores) {
    for (const [modeKey, score] of Object.entries(quizBestScores)) {
      try {
        localStorage.setItem(`dbc-quizbest-score-${modeKey}`, String(score));
      } catch {
        /* storage unavailable */
      }
    }
  }
}
