"use client";

import { useState } from "react";
import { Loader2, UserMinus, UserPlus } from "lucide-react";

// Phase 2 — follow / unfollow button for other users' profile pages.
// Toggles via POST /api/follow. Reports the new follower count through
// onCountChange so the parent's chips stay in sync without a reload.

export default function FollowButton({
  targetId,
  initialFollowing,
  onCountChange,
}: {
  targetId: string;
  initialFollowing: boolean;
  onCountChange?: (count: number) => void;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId }),
      });
      const data = (await res.json()) as {
        following?: boolean;
        followersCount?: number;
        error?: string;
      };
      if (res.ok && typeof data.following === "boolean") {
        setFollowing(data.following);
        if (typeof data.followersCount === "number") {
          onCountChange?.(data.followersCount);
        }
      }
    } catch {
      /* keep previous state on network failure */
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={following}
      className={`font-bangla inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold transition active:scale-95 disabled:opacity-60 ${
        following
          ? "bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25"
          : "bg-white text-navy hover:bg-cream"
      }`}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : following ? (
        <UserMinus className="h-4 w-4" aria-hidden />
      ) : (
        <UserPlus className="h-4 w-4" aria-hidden />
      )}
      {following ? "ফলো করছো" : "ফলো করো"}
    </button>
  );
}
