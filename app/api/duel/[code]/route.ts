import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import {
  isParticipant,
  parseQuestions,
  parseScores,
  publicQuestions,
  duelWinner,
  toPlayerInfo,
} from "@/lib/duel";

// Phase 5 — full duel state for participants (powers the duel room).
// GET /api/duel/[code] → { duel } | { error }.
// - Auth required, participants only (outsiders get 404 — the duel is
//   invite-only, so its existence is not leaked).
// - Questions are returned WITHOUT `answer` (anti-cheat); correctness
//   comes back from the answer endpoint.

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

  const duel = await prisma.duel.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      creator: { select: { id: true, name: true, username: true, image: true } },
      opponent: { select: { id: true, name: true, username: true, image: true } },
    },
  });
  if (!duel || !isParticipant(duel, userId)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const scores = parseScores(duel.scores);
  const questions = parseQuestions(duel.questions);
  return NextResponse.json({
    duel: {
      id: duel.id,
      code: duel.code,
      status: duel.status,
      category: duel.category,
      difficulty: duel.difficulty,
      createdAt: duel.createdAt.toISOString(),
      finishedAt: duel.finishedAt?.toISOString() ?? null,
      creator: toPlayerInfo(duel.creator),
      opponent: duel.opponent ? toPlayerInfo(duel.opponent) : null,
      scores,
      questions: publicQuestions(questions),
      // Full per-question answers for the finished breakdown. The room
      // only shows these after the duel is finished; for a playing duel
      // the client uses its own answers + the answer endpoint's reply.
      answers: duel.status === "finished" ? questions.map((q) => q.answer) : null,
      winnerId: duelWinner(duel, scores),
      myId: userId,
    },
  });
}
