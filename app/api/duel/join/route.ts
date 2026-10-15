import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import { addOpponentScore, parseScores } from "@/lib/duel";

// Phase 5 — join a duel by invite code.
// POST { code } → { duel } | { error }.
// - Auth required; cannot join your own duel; the duel must be `waiting`
//   (a duel with an opponent already is full, finished duels are closed).
// - Joining flips status to `playing` and initializes the opponent's
//   score entry. Code is normalized (trim + uppercase).

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  if (!checkRateLimit(`duel-join:${userId}`, 20, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const rawCode = typeof body?.code === "string" ? body.code : "";
  const code = rawCode.trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) {
    return NextResponse.json({ error: "এই কোডটি সঠিক নয়।" }, { status: 400 });
  }

  const duel = await prisma.duel.findUnique({ where: { code } });
  if (!duel) {
    return NextResponse.json({ error: "এই কোডের কোনো ডুয়েল পাওয়া যায়নি।" }, { status: 404 });
  }
  if (duel.creatorId === userId) {
    return NextResponse.json({ error: "নিজের ডুয়েলে যোগ দেওয়া যাবে না।" }, { status: 400 });
  }
  if (duel.status !== "waiting" || duel.opponentId) {
    return NextResponse.json(
      { error: "এই ডুয়েলটি আর যোগ দেওয়ার মতো নেই।" },
      { status: 409 },
    );
  }

  const updatedCount = await prisma.duel.updateMany({
    where: { id: duel.id, status: "waiting", opponentId: null },
    data: {
      opponentId: userId,
      status: "playing",
      scores: addOpponentScore(parseScores(duel.scores), userId) as never,
    },
  });
  if (updatedCount.count === 0) {
    // Lost a race (someone else joined first) — re-read for the message.
    return NextResponse.json(
      { error: "এই ডুয়েলটি আর যোগ দেওয়ার মতো নেই।" },
      { status: 409 },
    );
  }
  const updated = await prisma.duel.findUnique({ where: { id: duel.id } });
  if (!updated) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    duel: {
      id: updated.id,
      code: updated.code,
      status: updated.status,
      category: updated.category,
      difficulty: updated.difficulty,
    },
  });
}
