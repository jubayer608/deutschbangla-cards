import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import { validateSubmissionPayload } from "@/lib/submissions";

// Phase 5 — Community Submissions.
//
// GET  /api/submissions?mine=1
//   → auth: the caller's own submissions (newest first, any status).
// GET  /api/submissions?status=approved (or no params)
//   → public: approved submissions (newest first, cap 50) with the
//   submitter's public name/username only — never email.
// POST /api/submissions { type, payload }
//   → auth + rate-limited (10/hour/user): creates a `pending`
//   submission. Payload is validated per type (see lib/submissions.ts).

function toPublic(row: {
  id: string;
  type: string;
  payload: unknown;
  status: string;
  moderatorNote: string | null;
  createdAt: Date;
  user: { name: string | null; username: string | null };
}) {
  return {
    id: row.id,
    type: row.type,
    payload: row.payload,
    status: row.status,
    moderatorNote: row.moderatorNote,
    createdAt: row.createdAt.toISOString(),
    author: { name: row.user.name, username: row.user.username },
  };
}

export async function GET(req: Request) {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }
  const url = new URL(req.url);
  const mine = url.searchParams.get("mine") === "1";

  if (mine) {
    const session = await auth().catch(() => null);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const rows = await prisma.submission.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, username: true } } },
    });
    return NextResponse.json({ submissions: rows.map(toPublic) });
  }

  const status = url.searchParams.get("status") ?? "approved";
  if (status !== "approved") {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }
  const rows = await prisma.submission.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { name: true, username: true } } },
  });
  return NextResponse.json({ submissions: rows.map(toPublic) });
}

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  if (!checkRateLimit(`submissions:${userId}`, 10, 3600_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const validated = validateSubmissionPayload(body?.type, body?.payload);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const row = await prisma.submission.create({
    data: {
      userId,
      type: validated.type,
      payload: validated.payload as never,
      status: "pending",
    },
    include: { user: { select: { name: true, username: true } } },
  });
  return NextResponse.json({ submission: toPublic(row) }, { status: 201 });
}
