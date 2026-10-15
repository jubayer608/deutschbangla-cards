import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";

// Phase 2 — follow / unfollow toggle.
// POST { targetId } → { following: boolean, followersCount } | { error }.
// - Auth required; cannot follow yourself; target must exist.
// - Idempotent toggle: existing Follow row → delete (unfollow),
//   missing → create (follow). No notification is created here —
//   Phase 3 (notifications) owns that.

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const viewerId = session.user.id;
  if (!checkRateLimit(`follow:${viewerId}`, 20, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const targetId = typeof body?.targetId === "string" ? body.targetId : "";
  if (!targetId) {
    return NextResponse.json({ error: "targetId required" }, { status: 400 });
  }
  if (targetId === viewerId) {
    return NextResponse.json(
      { error: "নিজেকে ফলো করা যাবে না।" },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true },
  });
  if (!target) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: viewerId, followingId: targetId } },
  });

  let following: boolean;
  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    following = false;
  } else {
    await prisma.follow.create({
      data: { followerId: viewerId, followingId: targetId },
    });
    following = true;
  }

  const followersCount = await prisma.follow.count({
    where: { followingId: targetId },
  });
  return NextResponse.json({ following, followersCount });
}
