import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { normalizeUsername, validateUsername } from "@/lib/username";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";

// Phase 1 — username availability check for the setup/settings forms.
// GET /api/username/check?name=foo → { available: boolean, error?: string }

export async function GET(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!checkRateLimit(`username-check:${clientIp(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const name = new URL(req.url).searchParams.get("name") ?? "";
  const error = validateUsername(name);
  if (error) return NextResponse.json({ available: false, error });
  const username = normalizeUsername(name);

  const taken = await prisma.user.findFirst({
    where: { username, id: { not: session.user.id } },
    select: { id: true },
  });
  return NextResponse.json({ available: !taken });
}
