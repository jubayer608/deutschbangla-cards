"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

// Phase 3 — Navbar notification bell with unread badge.
// Fetches /api/notifications/unread-count on mount, on route change,
// and every 60s. Hidden when signed out (or while session is loading).

export default function NotificationBell() {
  const { status } = useSession();
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    let alive = true;
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/notifications/unread-count", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = (await res.json()) as { unreadCount?: number };
          if (alive) setCount(data.unreadCount ?? 0);
        }
      } catch {
        // Bell stays quiet on failure — never blocks navigation.
      }
    };
    fetchCount();
    const timer = setInterval(fetchCount, 60_000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [status, pathname]);

  if (status !== "authenticated") return null;

  return (
    <Link
      href="/notifications"
      aria-label={
        count > 0 ? `নোটিফিকেশন (${count}টি অপঠিত)` : "নোটিফিকেশন"
      }
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-navy transition hover:bg-cream active:scale-95"
    >
      <Bell className="h-5 w-5" aria-hidden />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold leading-none text-white ring-2 ring-white"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
