import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import { CHAT_PRESENCE_WRITE_THROTTLE_MS } from "@/lib/chat";

// Community Chat presence heartbeat — POST /api/chat/presence.
//
// Heartbeat presence, NOT WebSocket presence: the client posts here
// every 30s while a chat UI is open and the tab is visible. GET
// /api/chat counts ChatPresence rows seen within the last 90s as
// "online". True push presence via Pusher/Ably would be the future
// upgrade path (would need a realtime-service key + SDK).
//
// Defensive by design: if the ChatPresence table doesn't exist yet
// (migration not run) or any DB step fails, this still returns
// { ok: true, unavailable: true } — the client keeps working and the
// UI simply hides the online counter. Never 500s on presence.
export async function POST() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Heartbeat cadence is 1/30s per client; 10/min is generous headroom.
  if (!checkRateLimit(`chat-presence:${userId}`, 10, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ ok: true, unavailable: true });
  }

  try {
    const existing = await prisma.chatPresence.findUnique({
      where: { userId },
      select: { lastSeenAt: true },
    });
    // Throttle DB writes: skip if the row is fresher than 20s. The
    // heartbeat fires every 30s, so a write still lands ~every beat.
    if (
      existing &&
      Date.now() - existing.lastSeenAt.getTime() < CHAT_PRESENCE_WRITE_THROTTLE_MS
    ) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    await prisma.chatPresence.upsert({
      where: { userId },
      create: { userId },
      update: { lastSeenAt: new Date() },
    });

    // Best-effort cleanup of rows older than 1 day (the 90s recency
    // filter in GET already ignores them — this just keeps the table
    // small). Failure here must not fail the heartbeat.
    await prisma.chatPresence
      .deleteMany({
        where: { lastSeenAt: { lt: new Date(Date.now() - 24 * 3600_1000) } },
      })
      .catch(() => {});
  } catch {
    // Table missing or any DB error → degrade gracefully.
    return NextResponse.json({ ok: true, unavailable: true });
  }

  return NextResponse.json({ ok: true });
}
