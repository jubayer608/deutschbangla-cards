import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { getNotificationCenter } from "@/lib/notifications";

// Phase 3 — list the signed-in user's notifications, newest first.
// GET /api/notifications?limit= → { notifications, unreadCount }.
// The first entry is the computed weekly summary (synthetic: true —
// NOT a DB row), followed by real Notification rows. Scoped to the
// signed-in user only.

export async function GET(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const url = new URL(req.url);
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") ?? "20", 10) || 20, 1),
    50,
  );

  const { notifications, unreadCount } = await getNotificationCenter(
    prisma,
    session.user.id,
    limit,
  );
  return NextResponse.json({ notifications, unreadCount });
}
