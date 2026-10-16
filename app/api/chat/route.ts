import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";
import { isAdminEmail } from "@/lib/submissions";
import {
  CHAT_MAX_LENGTH,
  CHAT_ONLINE_WINDOW_MS,
  CHAT_PAGE_SIZE,
  chatGapOk,
  shapeChatMessage,
  stripHtml,
} from "@/lib/chat";

// Global Community Chat — ONE shared room for every logged-in user.
//
// Polling, NOT WebSockets: Vercel serverless functions cannot hold
// persistent WebSocket connections, and this ships with no new keys/deps.
// The client polls GET /api/chat?after=<lastId> every 3s for new
// messages only. True push realtime via Pusher/Ably is the future
// upgrade path (would need a realtime-service key + SDK).
//
// GET  /api/chat?after=<messageId>&limit=50
//   → { messages: [...oldest-first...], viewerIsAdmin, viewerId,
//       onlineCount }.
//   Without `after`: the latest 50 messages. With `after`: messages
//   created after that message (cap 50). Auth required.
//   onlineCount = ChatPresence rows seen within the last 90s (heartbeat
//   presence); null when presence is unavailable (table missing etc.) —
//   the UI hides the counter then, never shows a fake number.
// POST /api/chat { content }
//   → { message }. Content 1–500 chars, plain text only (HTML stripped
//   server-side). Rate limits: 1 msg / 3s per user + 20/min per user.
//   No profanity filter in v1 (Bangla/German lists false-positive real
//   German words) — rate limits + admin/own delete are the moderation.

export async function GET(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!checkRateLimit(`chat-get:ip:${clientIp(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const url = new URL(req.url);
  const after = url.searchParams.get("after");
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") ?? "", 10) || CHAT_PAGE_SIZE, 1),
    CHAT_PAGE_SIZE,
  );

  type ChatRow = {
    id: string;
    content: string;
    createdAt: Date;
    user: { id: string; username: string | null; name: string | null; image: string | null };
  };
  let rows: ChatRow[] = [];
  if (after) {
    // Only messages strictly newer than the anchor. Unknown anchor id →
    // empty result (never fall back to the whole history).
    const anchor = await prisma.chatMessage
      .findUnique({ where: { id: after }, select: { createdAt: true } })
      .catch(() => null);
    if (anchor) {
      rows = await prisma.chatMessage
        .findMany({
          where: { createdAt: { gt: anchor.createdAt } },
          orderBy: { createdAt: "asc" },
          take: limit,
          include: {
            user: { select: { id: true, username: true, name: true, image: true } },
          },
        })
        .catch(() => []);
    }
  } else {
    rows = await prisma.chatMessage
      .findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          user: { select: { id: true, username: true, name: true, image: true } },
        },
      })
      .then((rs) => rs.reverse())
      .catch(() => []);
  }

  return NextResponse.json({
    messages: rows.map(shapeChatMessage),
    viewerIsAdmin: isAdminEmail(session.user.email),
    viewerId: session.user.id,
    onlineCount: await onlineCount(prisma),
  });
}

// Heartbeat presence count: users seen within the last 90s. Wrapped in
// try/catch — if the ChatPresence table doesn't exist yet (migration
// not run) or the query fails, return null so the UI hides the counter
// instead of crashing or showing a fake number.
async function onlineCount(
  prisma: NonNullable<ReturnType<typeof getPrisma>>,
): Promise<number | null> {
  try {
    return await prisma.chatPresence.count({
      where: { lastSeenAt: { gte: new Date(Date.now() - CHAT_ONLINE_WINDOW_MS) } },
    });
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  // 20/min per user (shared in-memory limiter, per-instance approx).
  if (!checkRateLimit(`chat-post:${userId}`, 20, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  // 1 message per 3 seconds per user (gap rule).
  if (!chatGapOk(userId)) {
    return NextResponse.json({ error: "too_fast" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const raw = typeof body?.content === "string" ? body.content : "";
  // Plain text only: strip any HTML/tags server-side, never trust the client.
  const content = stripHtml(raw).trim().slice(0, CHAT_MAX_LENGTH);
  if (content.length < 1) {
    return NextResponse.json({ error: "invalid_content" }, { status: 400 });
  }

  const created = await prisma.chatMessage.create({
    data: { userId, content },
    include: { user: { select: { id: true, username: true, name: true, image: true } } },
  });
  return NextResponse.json({ message: shapeChatMessage(created) }, { status: 201 });
}
