import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";
import {
  BOSS_LOSE_XP,
  BOSS_MAX_DURATION_MS,
  BOSS_MIN_DURATION_MS,
  BOSS_QUESTION_COUNT,
  BOSS_WIN_XP,
  bossCorrectAnswer,
  buildBossQuestions,
  hardestWords,
  pickBossWordIds,
  resolveBossBattle,
} from "@/lib/boss";

// Phase 5 — Boss-Word Battle (single-player, stateless — see lib/boss.ts).
//
// GET  /api/boss
//   → { seed, wordIds, questions: [{ wordId, german, options }], startedAt }.
//   Questions carry NO answers. Logged-in users fight their weakest
//   reviewed words; guests fight the statically hardest words.
// POST /api/boss { action: "answer", seed, wordIds, questionIndex, answerIndex }
//   → { correct } — never the correct answer.
// POST /api/boss { action: "finish", seed, wordIds, answers, startedAt }
//   → { outcome, correctCount, bossHp, playerHp, xp, breakdown }.
//   XP (logged-in only): win +30, loss +10. Requires a terminal outcome
//   + a sane battle duration (15s–30min) + rate limits.

const LEVEL_XP = 200;
const levelFor = (xp: number) => Math.floor(Math.max(0, xp) / LEVEL_XP) + 1;

export async function GET(req: Request) {
  const session = await auth().catch(() => null);
  const userId = session?.user?.id ?? null;
  const key = userId ? `boss-start:${userId}` : `boss-start:ip:${clientIp(req)}`;
  if (!checkRateLimit(key, 10, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let wordIds: string[];
  const prisma = getPrisma();
  if (userId && prisma) {
    const reviews = await prisma.wordReview
      .findMany({
        where: { userId },
        orderBy: [{ lapses: "desc" }, { easeFactor: "asc" }],
        take: 50,
      })
      .catch(() => []);
    wordIds = pickBossWordIds(reviews, BOSS_QUESTION_COUNT);
  } else {
    wordIds = hardestWords(BOSS_QUESTION_COUNT).map((w) => w.id);
  }

  const seed = randomInt(0, 2 ** 31);
  const questions = buildBossQuestions(seed, wordIds);
  return NextResponse.json({ seed, wordIds, questions, startedAt: Date.now() });
}

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  const userId = session?.user?.id ?? null;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const seed = typeof body.seed === "number" ? Math.floor(body.seed) : -1;
  const wordIds = Array.isArray(body.wordIds)
    ? body.wordIds.filter((w): w is string => typeof w === "string")
    : [];
  if (seed < 0 || wordIds.length === 0 || wordIds.length > BOSS_QUESTION_COUNT) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // ── One answer: { correct } only, never the correct answer ──────────
  if (body.action === "answer") {
    const rateKey = userId ? `boss-answer:${userId}` : `boss-answer:ip:${clientIp(req)}`;
    if (!checkRateLimit(rateKey, 60, 60_000)) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    const questionIndex = typeof body.questionIndex === "number" ? body.questionIndex : -1;
    const answerIndex = typeof body.answerIndex === "number" ? body.answerIndex : -1;
    const questions = buildBossQuestions(seed, wordIds);
    if (
      !Number.isInteger(questionIndex) ||
      !Number.isInteger(answerIndex) ||
      questionIndex < 0 ||
      questionIndex >= questions.length ||
      answerIndex < 0 ||
      answerIndex >= questions[questionIndex].options.length
    ) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    const correct =
      questions[questionIndex].options[answerIndex] === bossCorrectAnswer(questions[questionIndex]);
    return NextResponse.json({ correct });
  }

  // ── Finish: validate the whole transcript, then apply XP ───────────
  if (body.action === "finish") {
    const rateKey = userId ? `boss-finish:${userId}` : `boss-finish:ip:${clientIp(req)}`;
    if (!checkRateLimit(rateKey, 5, 60_000)) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    const startedAt = typeof body.startedAt === "number" ? body.startedAt : 0;
    const duration = Date.now() - startedAt;
    const resolution = resolveBossBattle(seed, wordIds, body.answers);
    if (!resolution.valid) {
      return NextResponse.json({ error: "invalid_transcript" }, { status: 400 });
    }
    if (resolution.outcome === "incomplete") {
      return NextResponse.json({ error: "battle_incomplete" }, { status: 400 });
    }
    // Duration sanity (anti-bot): a real 10-question battle takes a
    // while; an instant or ancient transcript earns no XP — but the
    // outcome is still reported so the UI can show the end screen.
    const durationOk = duration >= BOSS_MIN_DURATION_MS && duration <= BOSS_MAX_DURATION_MS;

    const questions = buildBossQuestions(seed, wordIds);
    const answers = body.answers as number[];
    const breakdown = questions.slice(0, answers.length).map((q, i) => ({
      wordId: q.wordId,
      german: q.german,
      picked: q.options[answers[i]],
      correctAnswer: bossCorrectAnswer(q),
      correct: q.options[answers[i]] === bossCorrectAnswer(q),
    }));

    let xp = 0;
    if (userId && durationOk) {
      xp = resolution.outcome === "win" ? BOSS_WIN_XP : BOSS_LOSE_XP;
      const prisma = getPrisma();
      if (prisma) {
        const source = resolution.outcome === "win" ? "boss_battle_win" : "boss_battle_play";
        await prisma
          .$transaction(async (tx) => {
            const row = await tx.userProgress.findUnique({ where: { userId } });
            const newXp = (row?.xp ?? 0) + xp;
            await tx.userProgress.upsert({
              where: { userId },
              create: {
                userId,
                xp: newXp,
                level: levelFor(newXp),
                streak: 0,
                knownWords: [],
                lessonsDone: [],
              },
              update: { xp: newXp, level: levelFor(newXp) },
            });
            await tx.xpEvent.create({ data: { userId, amount: xp, source } });
          })
          .catch(() => {
            xp = 0; // XP must never break the end screen
          });
      } else {
        xp = 0;
      }
    }

    return NextResponse.json({
      outcome: resolution.outcome,
      correctCount: resolution.correctCount,
      bossHp: resolution.bossHp,
      playerHp: resolution.playerHp,
      xp,
      breakdown,
    });
  }

  return NextResponse.json({ error: "invalid_action" }, { status: 400 });
}
