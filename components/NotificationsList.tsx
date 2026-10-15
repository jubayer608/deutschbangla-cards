"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Award,
  BarChart3,
  CheckCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { NotificationItem } from "@/lib/notifications";

// Phase 3 — notification center list (client: mark-read interactions).
// Clicking an item marks it read and follows its link (if any).
// The synthetic weekly summary is never "unread" and never sent to the API.

const TYPE_ICONS: Record<string, LucideIcon> = {
  follow: UserPlus,
  badge: Award,
  weekly_summary: BarChart3,
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "এইমাত্র";
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} দিন আগে`;
  return new Date(iso).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  initial: NotificationItem[];
}

export default function NotificationsList({ initial }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [markingAll, setMarkingAll] = useState(false);
  const unread = items.filter((i) => !i.read && !i.synthetic).length;

  async function markOne(item: NotificationItem) {
    if (item.synthetic || item.read) {
      if (item.link) router.push(item.link);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, read: true } : i)),
    );
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      router.refresh();
    } catch {
      // Optimistic update already applied; refresh will reconcile.
    }
    if (item.link) router.push(item.link);
  }

  async function markAll() {
    if (unread === 0) return;
    setMarkingAll(true);
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      router.refresh();
    } catch {
      // Optimistic update already applied.
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {unread > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={markAll}
            disabled={markingAll}
            className="font-bangla inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-navy ring-1 ring-slate-200 transition hover:bg-cream disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4 text-teal" aria-hidden />
            সব পড়া হয়েছে
          </button>
        </div>
      )}

      {items.map((item) => {
        const Icon = TYPE_ICONS[item.type] ?? Award;
        const clickable = Boolean(item.link) || (!item.read && !item.synthetic);
        return (
          <article
            key={item.id}
            onClick={() => void markOne(item)}
            className={`rounded-3xl p-4 ring-1 transition ${
              item.synthetic
                ? "bg-teal/5 ring-teal/30"
                : item.read
                  ? "bg-white ring-slate-200"
                  : "bg-white ring-teal/40"
            } ${clickable ? "cursor-pointer hover:ring-teal/70 active:scale-[0.99]" : ""}`}
          >
            <div className="flex items-start gap-3">
              {item.actorImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.actorImage}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-teal/30"
                />
              ) : (
                <span
                  aria-hidden
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    item.synthetic ? "bg-teal/15 text-teal" : "bg-sun/20 text-navy"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-bangla text-[15px] font-extrabold leading-tight text-navy">
                    {item.title}
                  </h2>
                  {item.synthetic && (
                    <span className="font-bangla shrink-0 rounded-full bg-teal/15 px-2 py-0.5 text-[11px] font-bold text-teal">
                      সাপ্তাহিক
                    </span>
                  )}
                  {!item.read && !item.synthetic && (
                    <span
                      aria-label="অপঠিত"
                      className="h-2 w-2 shrink-0 rounded-full bg-teal"
                    />
                  )}
                </div>
                {item.body && (
                  <p className="font-bangla mt-0.5 text-sm leading-snug text-slate-600">
                    {item.body}
                  </p>
                )}
                <p className="font-bangla mt-1 text-xs font-bold text-mist">
                  {timeAgo(
                    item.createdAt instanceof Date
                      ? item.createdAt.toISOString()
                      : String(item.createdAt),
                  )}
                </p>
              </div>
            </div>
            {item.link && item.actorUsername && (
              <Link
                href={item.link}
                onClick={(e) => e.stopPropagation()}
                className="font-bangla mt-2 inline-block text-xs font-bold text-teal hover:underline"
              >
                @{item.actorUsername}-এর প্রোফাইল দেখো →
              </Link>
            )}
          </article>
        );
      })}
    </div>
  );
}
