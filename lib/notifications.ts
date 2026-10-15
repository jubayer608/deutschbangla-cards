// Phase 3 — in-app notification helpers.
//
// Notification rows live in the existing `Notification` table.
// - `follow`: someone followed you. Deduped: one unread row per actor→target.
// - `badge`: you unlocked a badge. Deduped: one unread row per badge key.
// - `weekly_summary`: NEVER a DB row — computed on read from the user's
//   real last-7-days activity (same data as the profile heatmap) and
//   returned as a synthetic, clearly-labelled entry.
// Creation helpers are best-effort (never throw): a notification must
// never break the follow / badge flow that triggered it.

import type { PrismaClient } from "@prisma/client";
import { lastNDayKeys, parseActivity } from "./profile";
import { sendPushToUser } from "./push";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: Date;
  /** True for the computed weekly summary (not a DB row). */
  synthetic: boolean;
  actorName: string | null;
  actorUsername: string | null;
  actorImage: string | null;
}

export interface WeeklySummary {
  weekXp: number;
  activeDays: number;
  streak: number;
  title: string;
  body: string;
}

/** Computed weekly summary from real activity data. Never a DB row. */
export async function getWeeklySummary(
  prisma: PrismaClient,
  userId: string,
): Promise<WeeklySummary> {
  const progress = await prisma.userProgress.findUnique({
    where: { userId },
    select: { activity: true, streak: true },
  });
  const activity = parseActivity(progress?.activity);
  const keys = lastNDayKeys(7);
  const weekXp = keys.reduce((sum, k) => sum + (activity[k] ?? 0), 0);
  const activeDays = keys.filter((k) => (activity[k] ?? 0) > 0).length;
  const streak = progress?.streak ?? 0;
  if (weekXp > 0) {
    return {
      weekXp,
      activeDays,
      streak,
      title: "এই সপ্তাহের সারাংশ",
      body: `এই সপ্তাহে তুমি ${weekXp} XP করেছো, ${activeDays}/৭ দিন সক্রিয় ছিলে। স্ট্রিক: ${streak} দিন।`,
    };
  }
  return {
    weekXp: 0,
    activeDays: 0,
    streak,
    title: "এই সপ্তাহের সারাংশ",
    body: "এই সপ্তাহে এখনো কোনো XP নেই — আজ একটা পাঠ শেষ করে শুরু করো!",
  };
}

/** Create a `follow` notification + push. Skips self-follows and dupes. */
export async function notifyFollow(
  prisma: PrismaClient,
  actorId: string,
  targetId: string,
): Promise<void> {
  try {
    if (actorId === targetId) return;
    const dedupKey = `follow:${actorId}`;
    const existing = await prisma.notification.findFirst({
      where: { userId: targetId, dedupKey, read: false },
      select: { id: true },
    });
    if (existing) return;

    const actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: { username: true, name: true },
    });
    const handle = actor?.username
      ? `@${actor.username}`
      : (actor?.name ?? "কেউ একজন");
    const link = actor?.username ? `/profile/${actor.username}` : "/leaderboard";
    const body = `${handle} তোমাকে ফলো করলো।`;
    await prisma.notification.create({
      data: {
        userId: targetId,
        type: "follow",
        title: "নতুন ফলোয়ার",
        body,
        actorId,
        link,
        dedupKey,
      },
    });
    await sendPushToUser(prisma, targetId, {
      title: "নতুন ফলোয়ার",
      body,
      url: link,
    });
  } catch {
    // Notifications must never break the follow flow.
  }
}

/** Create a `badge` notification + push. One unread row per badge key. */
export async function notifyBadgeUnlock(
  prisma: PrismaClient,
  userId: string,
  badgeKey: string,
  titleBangla: string,
): Promise<void> {
  try {
    const dedupKey = `badge:${badgeKey}`;
    const existing = await prisma.notification.findFirst({
      where: { userId, dedupKey, read: false },
      select: { id: true },
    });
    if (existing) return;
    const body = `${titleBangla} ব্যাজ পেয়েছো — অভিনন্দন!`;
    await prisma.notification.create({
      data: {
        userId,
        type: "badge",
        title: "নতুন ব্যাজ আনলকড!",
        body,
        link: "/profile",
        dedupKey,
      },
    });
    await sendPushToUser(prisma, userId, {
      title: "নতুন ব্যাজ আনলকড!",
      body,
      url: "/profile",
    });
  } catch {
    // Notifications must never break the badge flow.
  }
}

/** Full notification-center payload: synthetic weekly summary + real rows. */
export async function getNotificationCenter(
  prisma: PrismaClient,
  userId: string,
  limit: number,
): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
  const [{ items, unreadCount }, summary] = await Promise.all([
    getNotifications(prisma, userId, limit),
    getWeeklySummary(prisma, userId),
  ]);
  const synthetic: NotificationItem = {
    id: "weekly-summary",
    type: "weekly_summary",
    title: summary.title,
    body: summary.body,
    link: "/fortschritt",
    read: true,
    createdAt: new Date(),
    synthetic: true,
    actorName: null,
    actorUsername: null,
    actorImage: null,
  };
  return { notifications: [synthetic, ...items], unreadCount };
}
export async function getNotifications(
  prisma: PrismaClient,
  userId: string,
  limit: number,
): Promise<{ items: NotificationItem[]; unreadCount: number }> {
  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  const actorIds = Array.from(
    new Set(rows.map((r) => r.actorId).filter((a): a is string => !!a)),
  );
  const actors = actorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, name: true, username: true, image: true },
      })
    : [];
  const byId = new Map(actors.map((a) => [a.id, a]));

  const items: NotificationItem[] = rows.map((r) => {
    const actor = r.actorId ? byId.get(r.actorId) : undefined;
    return {
      id: r.id,
      type: r.type,
      title: r.title,
      body: r.body,
      link: r.link,
      read: r.read,
      createdAt: r.createdAt,
      synthetic: false,
      actorName: actor?.name ?? null,
      actorUsername: actor?.username ?? null,
      actorImage: actor?.image ?? null,
    };
  });
  return { items, unreadCount };
}
