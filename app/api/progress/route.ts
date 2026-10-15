import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { ensureBadges } from "@/lib/badges";

// Phase 0 — read the signed-in user's DB progress (merged state).
// Returns { progress: null } when the user has never synced.
export async function GET() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const row = await prisma.userProgress.findUnique({
    where: { userId: session.user.id },
  });
  if (!row) return NextResponse.json({ progress: null });

  // Phase 1 — badge unlocks are evaluated on read too, so a user who
  // earned a badge (e.g. via a local streak) gets it without re-syncing.
  await ensureBadges(prisma, session.user.id, {
    streak: row.streak,
    knownWords: row.knownWords,
    quizBestScores: row.quizBestScores,
  }).catch(() => {
    /* badges must never break the read flow */
  });

  return NextResponse.json({
    progress: {
      xp: row.xp,
      level: row.level,
      streak: row.streak,
      reviewed: row.reviewed,
      knownWords: row.knownWords,
      lessonsDone: row.lessonsDone,
      quizBest: row.quizBest,
      quizBestScores: row.quizBestScores,
      activity: row.activity,
      lastStudyDate: row.lastStudyDate?.toISOString() ?? null,
    },
  });
}
