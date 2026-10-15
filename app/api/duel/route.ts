import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import { buildQuestions, QUIZ_MODES, QUIZ_DIFFS } from "@/lib/quiz-questions";
import {
  generateDuelCode,
  newScores,
  parseScores,
  toPlayerInfo,
} from "@/lib/duel";

// Phase 5 — Quiz Duel.
// POST { category, difficulty } → { duel: { code, ... } }.
//   Creates a duel with 10 questions FROZEN at creation (identical for
//   both players). Status starts `waiting` until an opponent joins.
// GET → { duels: [...] } — the signed-in user's duels (created + joined),
//   newest first, with opponent info + both scores (for the lobby list).

const CATEGORIES = new Set(QUIZ_MODES.map((m) => m.id));
const DIFFICULTIES = new Set(QUIZ_DIFFS.map((d) => d.id));

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const creatorId = session.user.id;
  if (!checkRateLimit(`duel-create:${creatorId}`, 10, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const category = typeof body?.category === "string" ? body.category : "";
  const difficulty = typeof body?.difficulty === "string" ? body.difficulty : "";
  if (!CATEGORIES.has(category as never) || !DIFFICULTIES.has(difficulty as never)) {
    return NextResponse.json({ error: "invalid_category_or_difficulty" }, { status: 400 });
  }

  const questions = buildQuestions(
    category as "vocab" | "grammar" | "mixed",
    difficulty as "easy" | "medium" | "hard" | "mixed",
  );
  if (questions.length === 0) {
    return NextResponse.json({ error: "no_questions" }, { status: 500 });
  }

  // Invite code must be unique — retry a few times on collision.
  let duel = null;
  for (let attempt = 0; attempt < 5 && !duel; attempt++) {
    const code = generateDuelCode();
    try {
      duel = await prisma.duel.create({
        data: {
          code,
          creatorId,
          status: "waiting",
          category,
          difficulty,
          questions: questions as never,
          scores: newScores(creatorId) as never,
        },
      });
    } catch {
      // Unique-code collision (or transient error) — retry with a new code.
      duel = null;
    }
  }
  if (!duel) {
    return NextResponse.json({ error: "could_not_create_duel" }, { status: 500 });
  }
  return NextResponse.json({
    duel: {
      id: duel.id,
      code: duel.code,
      status: duel.status,
      category: duel.category,
      difficulty: duel.difficulty,
      createdAt: duel.createdAt.toISOString(),
    },
  });
}

export async function GET() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const duels = await prisma.duel.findMany({
    where: { OR: [{ creatorId: userId }, { opponentId: userId }] },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      creator: { select: { id: true, name: true, username: true, image: true } },
      opponent: { select: { id: true, name: true, username: true, image: true } },
    },
  });

  return NextResponse.json({
    duels: duels.map((d) => ({
      id: d.id,
      code: d.code,
      status: d.status,
      category: d.category,
      difficulty: d.difficulty,
      createdAt: d.createdAt.toISOString(),
      finishedAt: d.finishedAt?.toISOString() ?? null,
      creator: toPlayerInfo(d.creator),
      opponent: d.opponent ? toPlayerInfo(d.opponent) : null,
      scores: parseScores(d.scores),
      isCreator: d.creatorId === userId,
    })),
  });
}
