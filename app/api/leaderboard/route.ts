import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { getLeaderboard, type LeaderboardScope } from "@/lib/leaderboard";

// Phase 2 — leaderboard API.
// GET /api/leaderboard?scope=week|all&limit= → { scope, entries, yourRank, capped }.
//
// Caching: the *anonymous* board (no signed-in viewer) is cached for 60s
// via unstable_cache. Signed-in responses are viewer-specific (friends
// visibility + own rank), so they are always computed fresh — a shared
// cache would leak one user's "your rank" row to another.

const getCachedPublicBoard = unstable_cache(
  async (scope: LeaderboardScope, limit: number) => {
    const prisma = getPrisma();
    if (!prisma) return null;
    return getLeaderboard(prisma, scope, null, limit);
  },
  ["leaderboard-public"],
  { revalidate: 60 },
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const scope: LeaderboardScope =
    url.searchParams.get("scope") === "week" ? "week" : "all";
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") ?? "50", 10) || 50, 1),
    100,
  );

  const session = await auth().catch(() => null);
  const viewerId = session?.user?.id ?? null;

  if (!viewerId) {
    const board = await getCachedPublicBoard(scope, limit);
    if (!board) {
      return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
    }
    return NextResponse.json(board);
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }
  const board = await getLeaderboard(prisma, scope, viewerId, limit);
  return NextResponse.json(board);
}
