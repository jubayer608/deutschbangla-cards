// Phase 5 — Helping Bot: client wrapper so the chat widget can be
// lazy-loaded with ssr:false (not allowed directly in a Server Component).
// The BotChat bundle is fetched only when this mounts, and the panel
// itself mounts only when the user opens it.
"use client";

import dynamic from "next/dynamic";

const BotChat = dynamic(() => import("@/components/BotChat"), {
  ssr: false,
});

export default function BotChatLoader() {
  return <BotChat />;
}
