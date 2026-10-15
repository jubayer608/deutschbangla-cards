import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import {
  DUEL_QUESTION_COUNT,
  finishDuelIfComplete,
  isParticipant,
  parseQuestions,
  parseScores,
} from "@/lib/duel";

// Phase 5 — submit one answer.
// POST /api/duel/[code]/answer { questionIndex, answerIndex }
//   → { correct, correctAnswer, explanation, score, finished }.
// - Auth + participant only. Duel must be `playing`.
// - One answer per question per player (re-answering → 409).
// - answerIndex must be a valid option index for that question.
// - Scoring is server-side (answers live only in the DB).
// - After storing, if BOTH players answered all questions, the duel
//   finishes (status `finished`) and XP bonuses are applied
//   (finishDuelIfComplete — atomic, best-effort fallback).

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  if (!checkRateLimit(`duel-answer:${userId}`, 60, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const questionIndex = typeof body?.questionIndex === "number" ? body.questionIndex : -1;
  const answerIndex = typeof body?.answerIndex === "number" ? body.answerIndex : -1;
  if (!Number.isInteger(questionIndex) || !Number.isInteger(answerIndex)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const duel = await prisma.duel.findUnique({ where: { code: code.toUpperCase() } });
  if (!duel || !isParticipant(duel, userId)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (duel.status !== "playing") {
    return NextResponse.json({ error: "duel_not_playing" }, { status: 409 });
  }

  const questions = parseQuestions(duel.questions);
  if (questionIndex < 0 || questionIndex >= DUEL_QUESTION_COUNT || questionIndex >= questions.length) {
    return NextResponse.json({ error: "invalid_question" }, { status: 400 });
  }
  const question = questions[questionIndex];
  if (answerIndex < 0 || answerIndex >= question.options.length) {
    return NextResponse.json({ error: "invalid_answer" }, { status: 400 });
  }

  const scores = parseScores(duel.scores);
  const mine = scores[userId];
  if (!mine) {
    return NextResponse.json({ error: "not_a_player" }, { status: 403 });
  }
  if (mine.answers[questionIndex] !== null) {
    return NextResponse.json({ error: "already_answered" }, { status: 409 });
  }

  const correct = question.options[answerIndex] === question.answer;
  const nextAnswers = [...mine.answers];
  nextAnswers[questionIndex] = answerIndex;
  const nextScore = mine.score + (correct ? 1 : 0);
  const allAnswered = nextAnswers.every((a) => a !== null);
  const nextScores = {
    ...scores,
    [userId]: {
      answers: nextAnswers,
      score: nextScore,
      finishedAt: allAnswered ? new Date().toISOString() : mine.finishedAt,
    },
  };

  await prisma.duel.update({
    where: { id: duel.id },
    data: { scores: nextScores as never },
  });

  // If both players are done, finish the duel + apply XP bonuses.
  const finished = await finishDuelIfComplete(prisma, duel.id);

  return NextResponse.json({
    correct,
    correctAnswer: question.answer,
    explanation: question.explanation,
    score: nextScore,
    finished,
  });
}
