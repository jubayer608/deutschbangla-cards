import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";

// Phase 1 — profile settings (daily goal, reminder, difficulty, privacy).
// POST { dailyGoalXp, reminderTime, difficulty, privacy } → { settings }.
// All inputs validated server-side; reminderTime is "HH:MM" or null.

const DIFFICULTIES = new Set(["easy", "medium", "hard", "mixed"]);
const PRIVACIES = new Set(["public", "friends", "private"]);

const clampInt = (v: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : fallback;
  return Math.min(Math.max(n, min), max);
};

function parseReminderTime(v: unknown): string | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v !== "string") return "__invalid__";
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : "__invalid__";
}

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!checkRateLimit(`settings:${clientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const difficulty = typeof body.difficulty === "string" ? body.difficulty : "mixed";
  const privacy = typeof body.privacy === "string" ? body.privacy : "public";
  const reminderTime = parseReminderTime(body.reminderTime);
  if (!DIFFICULTIES.has(difficulty)) {
    return NextResponse.json({ error: "invalid_difficulty" }, { status: 400 });
  }
  if (!PRIVACIES.has(privacy)) {
    return NextResponse.json({ error: "invalid_privacy" }, { status: 400 });
  }
  if (reminderTime === "__invalid__") {
    return NextResponse.json({ error: "invalid_reminder_time" }, { status: 400 });
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      dailyGoalXp: clampInt(body.dailyGoalXp, 1, 1000, 50),
      reminderTime,
      difficulty,
      privacy,
    },
    update: {
      dailyGoalXp: clampInt(body.dailyGoalXp, 1, 1000, 50),
      reminderTime,
      difficulty,
      privacy,
    },
  });

  return NextResponse.json({
    settings: {
      dailyGoalXp: settings.dailyGoalXp,
      reminderTime: settings.reminderTime,
      difficulty: settings.difficulty,
      privacy: settings.privacy,
    },
  });
}
