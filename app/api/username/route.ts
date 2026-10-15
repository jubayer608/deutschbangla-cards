import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { normalizeUsername, validateUsername } from "@/lib/username";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";

// Phase 1 — claim or change the signed-in user's username.
// POST { username } → { username } | { error }.
// Format: ^[a-z0-9_]{3,20}$ (lowercased + trimmed). Unique per user.

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!checkRateLimit(`username:${clientIp(req)}`, 5, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const error = validateUsername(body?.username);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const username = normalizeUsername(body!.username as string);

  const taken = await prisma.user.findFirst({
    where: { username, id: { not: session.user.id } },
    select: { id: true },
  });
  if (taken) {
    return NextResponse.json({ error: "এই username ইতিমধ্যে নেওয়া হয়ে গেছে।" }, { status: 409 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { username },
  });
  return NextResponse.json({ username });
}
