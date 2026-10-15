// Phase 4 — mail sending via Resend (transactional + cron mails).
//
// Best-effort by design: when RESEND_API_KEY is missing, sending is a
// no-op (logged, returns false) — mail must never break the flow that
// triggered it (sync, cron). Any Resend failure is swallowed the same way.
//
// MailLog slots (see lib/mailer.ts) give idempotency: a kind is claimed
// for its dedup window before sending, so cron retries/races never
// duplicate a send.

import { Resend } from "resend";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";

export type MailKind = "welcome" | "weekly" | "streak" | "wordofday";

let resend: Resend | null = null;

export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function siteUrl(): string {
  return (
    process.env.NEXTAUTH_URL ?? "https://deutschbangla-cards.vercel.app"
  );
}

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** Send one email. Returns true only when Resend accepted it. */
export async function sendMail(input: SendMailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[mail] RESEND_API_KEY not set — skipping send to", input.to);
    return false;
  }
  try {
    if (!resend) resend = new Resend(apiKey);
    // Production sending needs a verified domain in Resend + EMAIL_FROM
    // set to an address on it (see SETUP.md). Without EMAIL_FROM we use
    // Resend's test sender, which only delivers to the account owner.
    const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
    const { error } = await resend.emails.send({ from, ...input });
    if (error) {
      console.error("[mail] resend error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[mail] send failed:", e);
    return false;
  }
}

/**
 * Claim the (userId, kind, dedupKey) slot in MailLog. Returns true when
 * this caller owns the slot (i.e. this send may proceed). Returns false
 * when the slot already exists (already sent this window) or the DB
 * write failed — in both cases the caller must skip sending.
 */
export async function claimMailSlot(
  prisma: PrismaClient,
  userId: string,
  kind: MailKind,
  dedupKey: string,
  meta?: Record<string, unknown>,
): Promise<boolean> {
  try {
    await prisma.mailLog.create({
      data: {
        userId,
        kind,
        dedupKey,
        meta: (meta ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
    return true;
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return false; // slot already claimed → already sent this window
    }
    console.error("[mail] claimMailSlot failed:", e);
    return false;
  }
}

/**
 * Release a claimed slot (e.g. the send failed, so a later run may retry).
 * Best-effort, never throws.
 */
export async function releaseMailSlot(
  prisma: PrismaClient,
  userId: string,
  kind: MailKind,
  dedupKey: string,
): Promise<void> {
  try {
    await prisma.mailLog.deleteMany({ where: { userId, kind, dedupKey } });
  } catch {
    /* ignore */
  }
}

// ── Unsubscribe tokens ────────────────────────────────────────────────────
// HMAC-SHA256(AUTH_SECRET, `unsub:<userId>:<kind>`), hex. Unforgeable
// without AUTH_SECRET, so the unsubscribe link needs no login. When
// AUTH_SECRET is missing we cannot mint a token — callers must then fall
// back to linking to /profile/settings instead of an unsubscribe URL.

export function unsubscribeToken(userId: string, kind: MailKind | "all"): string | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret)
    .update(`unsub:${userId}:${kind}`)
    .digest("hex");
}

export function verifyUnsubscribeToken(
  userId: string,
  kind: string,
  token: string,
): boolean {
  if (kind !== "all" && !isMailKind(kind)) return false;
  const expected = unsubscribeToken(userId, kind as MailKind | "all");
  if (!expected || !token) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

export function isMailKind(v: string): v is MailKind {
  return v === "welcome" || v === "weekly" || v === "streak" || v === "wordofday";
}

/** Timing-safe string comparison (for the cron Bearer token). */
export function safeEqual(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}
