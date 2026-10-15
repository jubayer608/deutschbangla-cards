import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

// Phase 3 — lightweight unread count for the Navbar bell.
// GET /api/notifications/unread-count → { unreadCount }.

export async function GET() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }
  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });
  return NextResponse.json({ unreadCount });
}
