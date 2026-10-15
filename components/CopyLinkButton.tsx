"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

// Phase 1 — copy the current page URL (shareable profile link).

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="font-bangla inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/25 transition hover:bg-white/25 active:scale-95"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" aria-hidden /> কপি হয়েছে!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" aria-hidden /> প্রোফাইল শেয়ার করো
        </>
      )}
    </button>
  );
}
