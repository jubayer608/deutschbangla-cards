// Global Community Chat — shared helpers (server + client safe).
//
// Architecture: POLLING, not WebSockets. Vercel serverless functions
// cannot hold persistent WebSocket connections, and this feature ships
// with no new third-party keys and no new deps (same rule as Quiz Duel).
// The client polls GET /api/chat?after=<lastId> every 3s for new
// messages only. True push realtime via Pusher/Ably would be the future
// upgrade path — it would need a realtime-service key + SDK.
//
// Moderation story for v1: rate limits (1 msg / 3s per user, 20/min per
// user) + admin/own delete. No profanity filter — Bangla/German word
// lists are unreliable and would false-positive real German words.
//
// Presence ("X jon online"): HEARTBEAT presence, not WebSocket presence.
// While a chat UI is open and the tab is visible, the client POSTs to
// /api/chat/presence every 30s; GET /api/chat counts ChatPresence rows
// seen within the last 90s. The 90s window tolerates one missed beat
// (30s cadence + network/serverless cold-start slack). Presence is
// best-effort everywhere: if the table/rows are unavailable, the APIs
// return onlineCount: null and the UI hides the counter entirely —
// NEVER a fake or hardcoded number, and never "users who posted
// recently" passed off as online.

export const CHAT_MAX_LENGTH = 500;
export const CHAT_POLL_MS = 3000;
export const CHAT_PAGE_SIZE = 50;

// Presence heartbeat: client posts every 30s; a user counts as online
// if seen within the last 90s. Presence writes are throttled to at
// most one DB write per user per 20s (server-side, in the presence route).
export const CHAT_HEARTBEAT_MS = 30_000;
export const CHAT_ONLINE_WINDOW_MS = 90_000;
export const CHAT_PRESENCE_WRITE_THROTTLE_MS = 20_000;

// Per-user send timestamps (in-memory, per serverless instance,
// approximate — same tradeoff as lib/ratelimit.ts).
const lastSentAt = new Map<string, number>();

// True when the user may send now; records the send. Enforces the
// "1 message per 3 seconds per user" gap. The 20/min cap lives in
// lib/ratelimit.ts (checkRateLimit) on the POST route.
export function chatGapOk(userId: string): boolean {
  const now = Date.now();
  const prev = lastSentAt.get(userId) ?? 0;
  if (now - prev < 3000) return false;
  lastSentAt.set(userId, now);
  return true;
}

// Strip any HTML/tags — message content is stored + rendered as PLAIN
// TEXT only. Never render chat content with dangerouslySetInnerHTML
// (React escapes plain strings by default — keep it that way).
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

export interface ChatSender {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
}

export interface ChatMessageItem {
  id: string;
  content: string;
  createdAt: string;
  sender: ChatSender;
}

export function shapeChatMessage(row: {
  id: string;
  content: string;
  createdAt: Date;
  user: { id: string; username: string | null; name: string | null; image: string | null };
}): ChatMessageItem {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    sender: {
      id: row.user.id,
      username: row.user.username,
      name: row.user.name,
      image: row.user.image,
    },
  };
}
