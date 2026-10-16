import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/submissions";

// Global Community Chat — delete a message.
// DELETE /api/chat/[id]
// Allowed when the message belongs to the session user, OR the session
// user's email is in ADMIN_EMAILS (same pattern as community
// moderation). If ADMIN_EMAILS is unset, only own messages are deletable.

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const existing = await prisma.chatMessage.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const isOwner = existing.userId === session.user.id;
  const isAdmin = isAdminEmail(session.user.email);
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await prisma.chatMessage.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
