import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";

// Phase 3 — Web Push subscription management.
// POST   { subscription: { endpoint, keys: { p256dh, auth } } } → subscribe.
// DELETE { endpoint } → unsubscribe (deletes the row).
// Both scoped to the signed-in user. The endpoint is globally unique:
// re-subscribing the same browser endpoint reassigns it to the current
// user (e.g. after switching accounts on the same device).

function parseSubscription(body: unknown): {
  endpoint: string;
  keys: { p256dh: string; auth: string };
} | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const sub = (body as Record<string, unknown>).subscription;
  if (!sub || typeof sub !== "object" || Array.isArray(sub)) return null;
  const s = sub as Record<string, unknown>;
  const endpoint = s.endpoint;
  const keys = s.keys;
  if (typeof endpoint !== "string" || !endpoint.startsWith("https://")) return null;
  if (endpoint.length > 2048) return null;
  if (!keys || typeof keys !== "object" || Array.isArray(keys)) return null;
  const k = keys as Record<string, unknown>;
  if (typeof k.p256dh !== "string" || typeof k.auth !== "string") return null;
  if (!k.p256dh || !k.auth || k.p256dh.length > 512 || k.auth.length > 512) {
    return null;
  }
  return { endpoint, keys: { p256dh: k.p256dh, auth: k.auth } };
}

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!checkRateLimit(`push-sub:${session.user.id}`, 10, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const sub = parseSubscription(body);
  if (!sub) {
    return NextResponse.json({ error: "invalid_subscription" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: { userId: session.user.id, keys: sub.keys },
    create: { userId: session.user.id, endpoint: sub.endpoint, keys: sub.keys },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
  if (!endpoint) {
    return NextResponse.json({ error: "endpoint_required" }, { status: 400 });
  }

  // deleteMany with userId in the filter: only the caller's own rows go.
  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: session.user.id },
  });
  return NextResponse.json({ ok: true });
}
