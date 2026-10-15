import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/submissions";

// Phase 5 — moderate a community submission (ADMIN ONLY).
// POST /api/submissions/[id]/moderate { action: "approve" | "reject", note? }
// Allowed only when the session user's email is in ADMIN_EMAILS.
// If ADMIN_EMAILS is unset, nobody can moderate (403 always).
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "forbidden_not_admin" }, { status: 403 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const action = body?.action;
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }
  const note =
    typeof body?.note === "string" && body.note.trim().length > 0
      ? body.note.trim().slice(0, 500)
      : null;

  const existing = await prisma.submission.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const updated = await prisma.submission.update({
    where: { id },
    data: { status: action === "approve" ? "approved" : "rejected", moderatorNote: note },
  });
  return NextResponse.json({
    submission: {
      id: updated.id,
      type: updated.type,
      status: updated.status,
      moderatorNote: updated.moderatorNote,
    },
  });
}
