"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getFullProgress, writeFullProgress, adoptServerStreak, type ProgressState } from "@/lib/progress";

// Phase 0 — first-login migration trigger.
// Once per browser session after sign-in: POST the localStorage snapshot
// to /api/sync-progress (server merges max-wins/union into the DB), then
// write the merged state back to localStorage so the browser prefers DB
// state from then on. Renders nothing.
const SYNCED_KEY = "dbc-synced-v1";

interface MergedProgress extends ProgressState {
  level: number;
  lastStudyDate: string | null;
}

export default function ProgressSync() {
  const { status } = useSession();
  const syncing = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || syncing.current) return;
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SYNCED_KEY)) return;
    } catch {
      return;
    }
    syncing.current = true;

    const local = getFullProgress();
    // The streak belongs to the user's timezone — send their local
    // "today" so the server's streak-freeze gap math uses their day.
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate(),
    ).padStart(2, "0")}`;
    const quizBestScores: Record<string, number> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("dbc-quizbest-score-")) {
          const v = Number(localStorage.getItem(key));
          if (Number.isFinite(v)) quizBestScores[key.replace("dbc-quizbest-score-", "")] = v;
        }
      }
    } catch {
      /* storage unavailable — sync proceeds without per-mode scores */
    }

    fetch("/api/sync-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...local, quizBestScores, today }),
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json().catch(() => null)) as {
          progress?: MergedProgress & {
            quizBestScores?: Record<string, number>;
            freezeUsed?: boolean;
          };
        } | null;
        if (data?.progress) {
          const p = data.progress;
          writeFullProgress(
            {
              streak: p.streak,
              reviewed: p.reviewed,
              xp: p.xp,
              knownWords: p.knownWords ?? [],
              lessonsDone: p.lessonsDone ?? [],
              quizBest: (p.quizBest as Record<string, number>) ?? {},
              activity: (p.activity as Record<string, number>) ?? {},
            },
            p.quizBestScores as Record<string, number> | undefined,
          );
          // Phase 5 — a freeze saved this streak: keep the local run
          // alive (lastVisit=today) instead of restarting at 1.
          if (p.freezeUsed) adoptServerStreak(p.streak);
        }
        try {
          sessionStorage.setItem(SYNCED_KEY, "1");
        } catch {
          /* storage unavailable */
        }
      })
      .catch(() => {
        // Sync failed (e.g. DB not configured): local progress keeps
        // working untouched; the next page load retries.
      })
      .finally(() => {
        syncing.current = false;
      });
  }, [status]);

  return null;
}
