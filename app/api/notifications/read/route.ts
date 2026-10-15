import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";

// Phase 3 — mark notifications as read.
// POST { id } → marks one (only if it belongs to the signed-in user).
// POST { all: true } → marks all of the user's unread notifications.
// → { unreadCount }.

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!checkRateLimit(`notif-read:${session.user.id}`, 60, 60_000)) {
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

  const userId = session.user.id;
  if (body.all === true) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  } else if (typeof body.id === "string" && body.id) {
    // updateMany with userId in the filter enforces ownership: another
    // user's notification id simply matches nothing.
    await prisma.notification.updateMany({
      where: { id: body.id, userId },
      data: { read: true },
    });
  } else {
    return NextResponse.json({ error: "id_or_all_required" }, { status: 400 });
  }

  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  });
  return NextResponse.json({ unreadCount });
}
