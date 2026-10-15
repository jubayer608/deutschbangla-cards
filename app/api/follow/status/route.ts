import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

// Phase 2 — follow status for one user (powers the profile Follow button).
// GET /api/follow/status?userId= → { following, followersCount, followingCount }.

export async function GET(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const viewerId = session.user.id;
  const userId = new URL(req.url).searchParams.get("userId") ?? "";
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!target) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [following, followersCount, followingCount] = await Promise.all([
    prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: viewerId, followingId: userId },
      },
      select: { id: true },
    }),
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);

  return NextResponse.json({
    following: following !== null,
    followersCount,
    followingCount,
  });
}
