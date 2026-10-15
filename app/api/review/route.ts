import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import { applySm2, SM2_DEFAULTS, clampQuality } from "@/lib/sm2";
import { getReviewQueue } from "@/lib/review";
import { words } from "@/data/words";

// Phase 5 — SM-2 spaced repetition.
// GET  → { queue, dueCount, newCount, totalReviewed, reviewedToday }
//   Queue = overdue reviewed words (oldest first) + up to 20 new words.
// POST { wordId, quality } → { wordId, state, nextReviewAt }
//   quality ∈ 0–5 (UI sends 1/3/4/5 via the Abar/Kothin/Bhalo/Shohoj
//   buttons). Server computes the new SM-2 state and upserts it.
//   Words with no row yet start from SM-2 defaults (no row is created
//   until the first answer).

export async function GET() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  if (!checkRateLimit(`review-get:${userId}`, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }
  return NextResponse.json(await getReviewQueue(prisma, userId));
}

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  // Reviews come fast (one POST per card) — 120/min per user is plenty
  // for a 50-card session while still slowing abuse.
  if (!checkRateLimit(`review:${userId}`, 120, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const wordId = typeof body?.wordId === "string" ? body.wordId : "";
  const quality = clampQuality(body?.quality);

  const word = words.find((w) => w.id === wordId);
  if (!word) {
    return NextResponse.json({ error: "word_not_found" }, { status: 404 });
  }

  const existing = await prisma.wordReview.findUnique({
    where: { userId_wordId: { userId, wordId } },
  });

  const result = applySm2(
    existing
      ? {
          easeFactor: existing.easeFactor,
          intervalDays: existing.intervalDays,
          repetitions: existing.repetitions,
          lapses: existing.lapses,
        }
      : SM2_DEFAULTS,
    quality,
  );

  const saved = await prisma.wordReview.upsert({
    where: { userId_wordId: { userId, wordId } },
    create: {
      userId,
      wordId,
      easeFactor: result.easeFactor,
      intervalDays: result.intervalDays,
      repetitions: result.repetitions,
      lapses: result.lapses,
      nextReviewAt: result.nextReviewAt,
      lastQuality: result.lastQuality,
    },
    update: {
      easeFactor: result.easeFactor,
      intervalDays: result.intervalDays,
      repetitions: result.repetitions,
      lapses: result.lapses,
      nextReviewAt: result.nextReviewAt,
      lastQuality: result.lastQuality,
    },
  });

  return NextResponse.json({
    wordId,
    state: {
      easeFactor: saved.easeFactor,
      intervalDays: saved.intervalDays,
      repetitions: saved.repetitions,
      lapses: saved.lapses,
      nextReviewAt: saved.nextReviewAt.toISOString(),
      lastQuality: saved.lastQuality,
    },
  });
}
