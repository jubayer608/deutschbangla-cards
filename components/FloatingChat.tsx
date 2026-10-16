"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessagesSquare, X } from "lucide-react";
import ChatRoom from "@/components/ChatRoom";

// Floating Community Chat widget — a second entry point to the SAME
// global room as /chat. It reuses ChatRoom (no duplicated chat logic):
// same 3s polling, optimistic send, rate-limit handling, delete,
// heartbeat presence, and online counter.
//
// Stacking (matches BotChat): the bot bubble stays bottom-right; the
// chat bubble sits ABOVE it — 10rem + safe-area mobile / lg:bottom-24
// desktop vs the bot's 6rem + safe-area mobile / lg:bottom-6. The panel
// uses the same positioning as the bot panel; when both panels are
// open the chat panel renders on top (it mounts later in the DOM).
// The ChatRoom only mounts when the panel opens, so there is no
// polling or heartbeat while closed.
//
// Guests never see the chat UI: ChatRoom renders a small sign-in
// prompt when the API returns 401.
export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <>
      {/* Floating chat button — stacked ABOVE the bot bubble */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Community Chat বন্ধ করো" : "Community Chat খোলো"}
        aria-expanded={open}
        className="fixed bottom-[calc(10rem+env(safe-area-inset-bottom))] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white shadow-xl shadow-navy/30 ring-2 ring-white transition hover:-translate-y-0.5 active:scale-95 lg:bottom-24 lg:right-6"
      >
        {open ? (
          <X className="h-6 w-6" aria-hidden />
        ) : (
          <MessagesSquare className="h-6 w-6" aria-hidden />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-label="Community Chat"
            className="fixed bottom-[calc(10rem+env(safe-area-inset-bottom))] left-4 right-4 z-50 flex max-h-[70vh] min-h-[380px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-navy/30 ring-1 ring-navy/10 sm:left-auto sm:w-[380px] lg:bottom-24 lg:right-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-navy px-4 py-3 text-white">
              <MessagesSquare className="h-6 w-6 shrink-0 text-teal" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-heading text-base font-extrabold leading-tight">
                  Community Chat
                </p>
                <p className="font-bangla text-xs font-semibold text-white/70">
                  Shobai eksathe
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="চ্যাট বন্ধ করো"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Same room as /chat — mounts only while open */}
            <ChatRoom variant="widget" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
