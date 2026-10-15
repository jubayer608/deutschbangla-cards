"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import FollowButton from "./FollowButton";

// Phase 2 — follower/following chip + follow button for a profile page.
// Lives in the header action row. Client-side so the follower count
// updates instantly after a toggle.

export default function ProfileFollow({
  targetId,
  targetUsername,
  isOwner,
  signedIn,
  initialFollowing,
  initialFollowersCount,
  initialFollowingCount,
}: {
  targetId: string;
  targetUsername: string;
  isOwner: boolean;
  signedIn: boolean;
  initialFollowing: boolean;
  initialFollowersCount: number;
  initialFollowingCount: number;
}) {
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
        <Users className="h-3.5 w-3.5 text-teal" aria-hidden />
        {followersCount} ফলোয়ার · {initialFollowingCount} ফলো করছে
      </span>
      {!isOwner && signedIn && (
        <FollowButton
          targetId={targetId}
          initialFollowing={initialFollowing}
          onCountChange={setFollowersCount}
        />
      )}
      {!isOwner && !signedIn && (
        <a
          href={`/api/auth/signin?callbackUrl=/profile/${targetUsername}`}
          className="font-bangla inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-navy transition hover:bg-cream active:scale-95"
        >
          ফলো করতে লগইন করো
        </a>
      )}
    </span>
  );
}
