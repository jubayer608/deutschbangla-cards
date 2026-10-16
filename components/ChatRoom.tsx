"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { CHAT_HEARTBEAT_MS, CHAT_MAX_LENGTH, CHAT_POLL_MS, type ChatMessageItem } from "@/lib/chat";

// Global Community Chat — client room.
//
// Polling, NOT WebSockets: fetches only messages newer than the last
// known id every 3s (see lib/chat.ts for why). Polling pauses while the
// tab is hidden (visibilitychange) to save requests, and resumes on
// visible. Own messages are appended optimistically and reconciled
// against the server echo on the next poll.
//
// Presence: while this room is mounted and the tab is visible, a
// heartbeat POSTs to /api/chat/presence every 30s; the server counts
// rows seen within the last 90s as "online" and returns onlineCount
// with every poll. When onlineCount is null (presence unavailable) the
// counter is hidden entirely — never a fake number.
//
// Variants: "page" (full /chat page) and "widget" (floating panel).
// The widget reuses this exact component — no duplicated chat logic.
// In widget mode the list stretches to fill the panel instead of
// using its own max-height card.
//
// Message content is rendered as PLAIN TEXT (React escapes by default).
// Never use dangerouslySetInnerHTML here.

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

function senderLabel(m: ChatMessageItem): string {
  return m.sender.username ? `@${m.sender.username}` : (m.sender.name ?? "Ulluk user");
}

export default function ChatRoom({ variant = "page" }: { variant?: "page" | "widget" }) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [viewerIsAdmin, setViewerIsAdmin] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const lastIdRef = useRef<string | null>(null);
  const messagesRef = useRef<ChatMessageItem[]>([]);
  messagesRef.current = messages;
  // Set by poll success; the heartbeat only fires while authenticated.
  const authedRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    });
  }, []);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
  };

  // Fetch newer messages only (after=lastId). Merges without duplicates
  // and reconciles optimistic messages against the server echo.
  const poll = useCallback(async (initial = false) => {
    try {
      const url = lastIdRef.current
        ? `/api/chat?after=${encodeURIComponent(lastIdRef.current)}`
        : "/api/chat";
      const res = await fetch(url, { cache: "no-store" });
      if (res.status === 401) {
        // Guest (or expired session): the widget shows a sign-in prompt;
        // the /chat page normally redirects server-side, so this is the
        // expired-session fallback there. Never render the chat UI.
        authedRef.current = false;
        setNeedsAuth(true);
        if (initial) setLoading(false);
        return;
      }
      if (!res.ok) {
        if (initial) setLoadError(true);
        return;
      }
      const data = (await res.json()) as {
        messages: ChatMessageItem[];
        viewerIsAdmin: boolean;
        viewerId: string;
        onlineCount: number | null;
      };
      authedRef.current = true;
      setNeedsAuth(false);
      setViewerId(data.viewerId);
      setViewerIsAdmin(data.viewerIsAdmin);
      setOnlineCount(typeof data.onlineCount === "number" ? data.onlineCount : null);
      if (data.messages.length === 0) return;
      const incoming = data.messages;
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const fresh = incoming.filter((m) => !seen.has(m.id));
        if (fresh.length === 0) return prev;
        // Reconcile: drop optimistic (temp-*) entries the server has now
        // echoed back (same content + same sender + created within 30s).
        const withoutEchoed = prev.filter((m) => {
          if (!m.id.startsWith("temp-")) return true;
          return !fresh.some(
            (f) =>
              f.sender.id === m.sender.id &&
              f.content === m.content &&
              Math.abs(new Date(f.createdAt).getTime() - new Date(m.createdAt).getTime()) < 30_000,
          );
        });
        return [...withoutEchoed, ...fresh];
      });
      const newest = incoming[incoming.length - 1];
      if (newest) lastIdRef.current = newest.id;
      if (nearBottomRef.current || initial) scrollToBottom();
    } catch {
      if (initial) setLoadError(true);
    } finally {
      if (initial) setLoading(false);
    }
  }, [scrollToBottom]);

  // Initial load + 3s polling; pause while the tab is hidden.
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (id !== null) return;
      id = setInterval(() => void poll(), CHAT_POLL_MS);
    };
    const stop = () => {
      if (id !== null) clearInterval(id);
      id = null;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        void poll();
        start();
      }
    };
    void poll(true);
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [poll]);

  // Heartbeat presence: while this room is mounted and the tab is
  // visible, POST /api/chat/presence every 30s so the server counts
  // this user as online. Stops when unmounted/hidden; the server's 90s
  // window tolerates one missed beat. Skipped while unauthenticated
  // (guests never count as online). Runs in both page + widget modes
  // because both render this component.
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;
    const beat = () => {
      if (!authedRef.current || document.hidden) return;
      void fetch("/api/chat/presence", {
        method: "POST",
        cache: "no-store",
      }).catch(() => {});
    };
    const start = () => {
      if (id !== null) return;
      id = setInterval(beat, CHAT_HEARTBEAT_MS);
    };
    const stop = () => {
      if (id !== null) clearInterval(id);
      id = null;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        beat();
        start();
      }
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const send = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setSendError(null);
    // Optimistic append — shows immediately, reconciled on next poll.
    const temp: ChatMessageItem = {
      id: `temp-${Date.now()}`,
      content: content.slice(0, CHAT_MAX_LENGTH),
      createdAt: new Date().toISOString(),
      sender: {
        id: viewerId ?? "me",
        username: null,
        name: "Tumi",
        image: null,
      },
    };
    setMessages((prev) => [...prev, temp]);
    setDraft("");
    nearBottomRef.current = true;
    scrollToBottom();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.status === 429) {
        setSendError("Ektu aste, 3 sec por abar pathao।");
        setMessages((prev) => prev.filter((m) => m.id !== temp.id));
        return;
      }
      if (!res.ok) {
        setSendError("Pathano jayni — abar chesta koro।");
        setMessages((prev) => prev.filter((m) => m.id !== temp.id));
        return;
      }
      // Reconcile the optimistic entry with the real one immediately.
      const data = (await res.json()) as { message: ChatMessageItem };
      setMessages((prev) => prev.map((m) => (m.id === temp.id ? data.message : m)));
      lastIdRef.current = data.message.id;
    } catch {
      setSendError("Pathano jayni — abar chesta koro।");
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
    } finally {
      setSending(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Message-ta delete korba?")) return;
    const res = await fetch(`/api/chat/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  };

  if (loading) {
    if (variant === "widget") {
      return (
        <div className="flex min-h-0 flex-1 items-center justify-center p-8">
          <p className="font-bangla text-sm text-mist">Chat load hocche…</p>
        </div>
      );
    }
    return (
      <div className="card rounded-3xl bg-white p-8 text-center">
        <p className="font-bangla text-sm text-mist">Chat load hocche…</p>
      </div>
    );
  }
  if (needsAuth) {
    // Guest state: never render the chat UI. Small sign-in prompt with
    // a link (the /chat page redirects server-side; this covers the
    // widget + expired sessions).
    const prompt = (
      <div className="m-auto flex flex-col items-center gap-3 py-6 text-center">
        <p className="font-bangla font-bold text-navy">Community Chat-e jog dao</p>
        <p className="font-bangla text-sm text-mist">
          Chat korte hole age login korte hobe।
        </p>
        <Link
          href="/api/auth/signin?callbackUrl=/chat"
          className="font-bangla rounded-full bg-navy px-5 py-2.5 text-sm font-extrabold text-white shadow transition active:scale-95"
        >
          Login kore chat koro
        </Link>
      </div>
    );
    if (variant === "widget") {
      return <div className="flex min-h-0 flex-1 flex-col px-4">{prompt}</div>;
    }
    return <div className="card rounded-3xl bg-white p-8 text-center">{prompt}</div>;
  }
  if (loadError) {
    if (variant === "widget") {
      return (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 p-8 text-center">
          <p className="font-bangla font-bold text-navy">Chat load hoy ni</p>
          <p className="font-bangla text-sm text-mist">Abar chesta koro।</p>
        </div>
      );
    }
    return (
      <div className="card rounded-3xl bg-white p-8 text-center">
        <p className="font-bangla font-bold text-navy">Chat load hoy ni</p>
        <p className="font-bangla mt-1 text-sm text-mist">Page-ta refresh kore abar chesta koro।</p>
      </div>
    );
  }

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <div
      className={
        variant === "widget"
          ? "flex min-h-0 flex-1 flex-col gap-2 px-4 py-3"
          : "flex flex-col gap-3"
      }
    >
      <p className="font-bangla text-xs text-mist">
        {onlineCount !== null && (
          <>
            <span className="inline-flex items-center gap-1 font-bold text-teal">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" aria-hidden />
              {onlineCount} jon online
            </span>
            {" · "}
          </>
        )}
        {lastMessage
          ? `Shesh message: ${timeAgo(lastMessage.createdAt)}`
          : "Ekhono kono message nai"}
        {" · "}
        3 sec por por notun message ashe
      </p>

      <div
        ref={listRef}
        onScroll={onScroll}
        className={
          variant === "widget"
            ? "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-1"
            : "card flex max-h-[60vh] min-h-[320px] flex-col gap-3 overflow-y-auto rounded-3xl bg-white p-4"
        }
      >
        {messages.length === 0 ? (
          <div className="m-auto text-center">
            <p className="font-bangla font-bold text-navy">Ekhono kono message nai</p>
            <p className="font-bangla mt-1 text-sm text-mist">Prothom message-ta tumi pathao!</p>
          </div>
        ) : (
          messages.map((m) => {
            const own = m.sender.id === viewerId;
            const canDelete = own || viewerIsAdmin;
            return (
              <div key={m.id} className={`flex gap-2 ${own ? "flex-row-reverse" : ""}`}>
                {m.sender.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.sender.image}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/15 text-sm font-extrabold text-teal">
                    {(m.sender.name ?? m.sender.username ?? "?").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className={`max-w-[75%] ${own ? "items-end text-right" : ""}`}>
                  <p className="font-bangla text-xs text-mist">
                    {m.sender.username ? (
                      <Link
                        href={`/profile/${m.sender.username}`}
                        className="font-bold text-teal hover:underline"
                      >
                        {senderLabel(m)}
                      </Link>
                    ) : (
                      senderLabel(m)
                    )}{" "}
                    · {timeAgo(m.createdAt)}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => void remove(m.id)}
                        aria-label="Message delete koro"
                        className="ml-1 inline-flex min-h-11 min-w-11 items-center justify-center align-middle text-mist hover:text-rose-500"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden />
                      </button>
                    )}
                  </p>
                  <p
                    className={`mt-1 inline-block rounded-2xl px-3 py-2 text-left text-sm break-words whitespace-pre-wrap ${
                      own ? "bg-navy text-white" : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {m.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {sendError && <p className="font-bangla text-sm text-rose-500">{sendError}</p>}

      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <div className="flex-1">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={CHAT_MAX_LENGTH}
            placeholder="Message likho…"
            aria-label="Chat message"
            className="font-bangla w-full rounded-full bg-white px-4 py-3 text-base text-slate-800 shadow ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-teal"
          />
          <p className="font-bangla mt-1 text-right text-xs text-mist">
            {draft.length}/{CHAT_MAX_LENGTH}
          </p>
        </div>
        <button
          type="submit"
          disabled={sending || draft.trim().length === 0}
          className="font-bangla inline-flex shrink-0 items-center gap-1 rounded-full bg-navy px-4 py-3 text-sm font-extrabold text-white shadow transition active:scale-95 disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden /> {sending ? "Jacche…" : "Pathao"}
        </button>
      </form>
    </div>
  );
}
