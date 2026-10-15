import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";

// Phase 3 — email preference storage ONLY.
// GET  → { preferences: { welcome, weeklyReport, streakNudge, wordOfDay } }.
// POST { weeklyReport?, streakNudge?, wordOfDay? } → { preferences }.
// Booleans are validated; missing fields keep their current value.
// NO email is sent in Phase 3 (Resend is Phase 4) — these toggles only
// store what the user wants, and the settings UI says so honestly.

const DEFAULTS = {
  welcome: true,
  weeklyReport: true,
  streakNudge: true,
  wordOfDay: false,
};

export async function GET() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }
  const row = await prisma.emailPreference.findUnique({
    where: { userId: session.user.id },
  });
  return NextResponse.json({
    preferences: row
      ? {
          welcome: row.welcome,
          weeklyReport: row.weeklyReport,
          streakNudge: row.streakNudge,
          wordOfDay: row.wordOfDay,
        }
      : DEFAULTS,
  });
}

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!checkRateLimit(`email-prefs:${session.user.id}`, 20, 60_000)) {
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
  const updates: { weeklyReport?: boolean; streakNudge?: boolean; wordOfDay?: boolean } = {};
  for (const key of ["weeklyReport", "streakNudge", "wordOfDay"] as const) {
    if (body[key] !== undefined) {
      if (typeof body[key] !== "boolean") {
        return NextResponse.json({ error: `invalid_${key}` }, { status: 400 });
      }
      updates[key] = body[key];
    }
  }

  const row = await prisma.emailPreference.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...updates },
    update: updates,
  });
  return NextResponse.json({
    preferences: {
      welcome: row.welcome,
      weeklyReport: row.weeklyReport,
      streakNudge: row.streakNudge,
      wordOfDay: row.wordOfDay,
    },
  });
}
