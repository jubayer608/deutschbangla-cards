// Phase 3 — Web Push sending (VAPID via `web-push`).
//
// Best-effort by design: if VAPID keys are missing, sending is a no-op.
// Any failure (network, bad subscription) is swallowed — push must never
// break the flow that triggered it (follow / badge unlock).
// Stale subscriptions (410 Gone / 404) are deleted so we don't retry them.

import webPush from "web-push";
import type { PrismaClient } from "@prisma/client";

export interface PushPayload {
  title: string;
  body: string;
  /** URL opened when the notification is clicked. */
  url?: string;
}

let vapidConfigured = false;

function ensureVapid(): boolean {
  if (vapidConfigured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  try {
    // Subject must be a URL or mailto: — the site URL, no invented contact.
    webPush.setVapidDetails(
      "https://deutschbangla-cards.vercel.app",
      publicKey,
      privateKey,
    );
    vapidConfigured = true;
    return true;
  } catch {
    return false;
  }
}

/** Race a promise against a timeout (push services must not hang us). */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("push timeout")), ms),
    ),
  ]);
}

interface StoredKeys {
  p256dh?: unknown;
  auth?: unknown;
}

function parseKeys(v: unknown): { p256dh: string; auth: string } | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const k = v as StoredKeys;
  if (typeof k.p256dh !== "string" || typeof k.auth !== "string") return null;
  if (!k.p256dh || !k.auth) return null;
  return { p256dh: k.p256dh, auth: k.auth };
}

/** Send a push to every subscribed device of one user. Never throws. */
export async function sendPushToUser(
  prisma: PrismaClient,
  userId: string,
  payload: PushPayload,
): Promise<void> {
  try {
    if (!ensureVapid()) return;
    const subs = await prisma.pushSubscription.findMany({
      where: { userId },
      select: { id: true, endpoint: true, keys: true },
    });
    if (subs.length === 0) return;
    await Promise.all(
      subs.map(async (sub) => {
        const keys = parseKeys(sub.keys);
        if (!keys) {
          // Malformed row — drop it rather than retrying forever.
          await prisma.pushSubscription
            .delete({ where: { id: sub.id } })
            .catch(() => {});
          return;
        }
        try {
          await withTimeout(
            webPush.sendNotification(
              { endpoint: sub.endpoint, keys },
              JSON.stringify({ ...payload, url: payload.url ?? "/notifications" }),
              { TTL: 24 * 3600 },
            ),
            5_000,
          );
        } catch (err) {
          const status = (err as { statusCode?: number })?.statusCode;
          if (status === 410 || status === 404) {
            await prisma.pushSubscription
              .delete({ where: { id: sub.id } })
              .catch(() => {});
          }
          // Other send failures: leave the subscription alone, stay silent.
        }
      }),
    );
  } catch {
    // Push must never break the main flow.
  }
}
