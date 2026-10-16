// Community Chat widget: client wrapper so the floating widget can be
// lazy-loaded with ssr:false (not allowed directly in a Server Component).
// Same pattern as BotChatLoader. The FloatingChat bundle is fetched only
// when this mounts, and the ChatRoom itself mounts only when the user
// opens the panel — no polling or heartbeat while closed.
"use client";

import dynamic from "next/dynamic";

const FloatingChat = dynamic(() => import("@/components/FloatingChat"), {
  ssr: false,
});

export default function FloatingChatLoader() {
  return <FloatingChat />;
}
