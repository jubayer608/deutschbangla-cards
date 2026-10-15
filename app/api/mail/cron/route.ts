// Phase 4 — mail cron endpoint (called by Vercel Cron, see vercel.json).
//
// GET /api/mail/cron?kind=weekly|streak|wordofday
// Protected by `Authorization: Bearer <CRON_SECRET>`. When CRON_SECRET is
// unset, cron is disabled (503) — the endpoint never runs unauthenticated.

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { isMailKind, safeEqual } from "@/lib/mail";
import { runMailCron } from "@/lib/mailer";

export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "cron_not_configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  if (!safeEqual(auth, `Bearer ${secret}`)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const kind = new URL(req.url).searchParams.get("kind") ?? "";
  if (!isMailKind(kind) || kind === "welcome") {
    return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const result = await runMailCron(prisma, kind);
  return NextResponse.json(result);
}
