import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { isParticipant, parseScores, duelWinner } from "@/lib/duel";

// Phase 5 — lightweight poll endpoint for the duel room.
// GET /api/duel/[code]/state → { status, scores, winnerId, finishedAt }.
// No questions (the room already has them) — cheap to poll every 2s.
// Same auth + participants-only rule as the full state endpoint.

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const duel = await prisma.duel.findUnique({ where: { code: code.toUpperCase() } });
  if (!duel || !isParticipant(duel, userId)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const scores = parseScores(duel.scores);
  return NextResponse.json({
    status: duel.status,
    scores,
    winnerId: duelWinner(duel, scores),
    finishedAt: duel.finishedAt?.toISOString() ?? null,
    opponentId: duel.opponentId,
  });
}
