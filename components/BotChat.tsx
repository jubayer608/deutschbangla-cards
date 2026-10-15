"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Send, X } from "lucide-react";
import Mascot from "@/components/Mascot";

import Link from "next/link";

type BotSource = { title: string; href: string };
type ChatMsg = { role: "user" | "bot"; text: string; sources?: BotSource[] };

const SUGGESTIONS = [
  "ß-এর উচ্চারণ কী?",
  "der/die/das কখন কোনটা?",
  "A1-এ কয়টা শব্দ শিখবো?",
];

export default function BotChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [messages, loading, reduce]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open ]);

  async function send(preset?: string) {
    const q = (preset ?? input).trim();
    if (!q || loading) return;
    const prev = messages;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          history: prev.slice(-6).map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = await res.json();
      const answer =
        typeof data?.answer === "string" && data.answer.length > 0
          ? data.answer
          : typeof data?.reply === "string" && data.reply.length > 0
            ? data.reply
            : "দুঃখিত, উত্তর পাওয়া যায়নি — আবার চেষ্টা করো।";
      const sources: BotSource[] = Array.isArray(data?.sources)
        ? data.sources.filter(
            (s: unknown): s is BotSource =>
              !!s &&
              typeof s === "object" &&
              typeof (s as BotSource).title === "string" &&
              typeof (s as BotSource).href === "string",
          )
        : [];
      setMessages((m) => [
        ...m,
        { role: "bot", text: answer, sources },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "নেটওয়ার্কে সমস্যা হলো — আবার চেষ্টা করো।" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating owl button — sits ABOVE the mobile bottom nav, bottom-right on desktop */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Ulluk Bot বন্ধ করো" : "Ulluk Bot খোলো"}
        aria-expanded={open}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-sun shadow-xl shadow-navy/30 ring-2 ring-white transition hover:-translate-y-0.5 active:scale-95 lg:bottom-6 lg:right-6"
      >
        {open ? (
          <X className="h-6 w-6 text-navy" aria-hidden />
        ) : (
          <Mascot mood="study" size={36} animate={false} />
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
            aria-label="Ulluk Bot চ্যাট"
            className="fixed bottom-40 left-4 right-4 z-50 flex max-h-[70vh] min-h-[380px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-navy/30 ring-1 ring-navy/10 sm:left-auto sm:w-[380px] lg:bottom-24 lg:right-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-navy px-4 py-3 text-white">
              <Mascot mood="study" size={40} animate={false} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-heading text-base font-extrabold leading-tight">
                  Ulluk Bot
                </p>
                <p className="font-bangla text-xs font-semibold text-white/70">
                  জার্মান প্রশ্ন করো
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="চ্যাট বন্ধ করো"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
            >
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <Mascot mood="happy" size={72} animate={false} />
                  <p className="font-bangla text-sm font-bold text-navy">
                    জার্মান নিয়ে যেকোনো প্রশ্ন করো!
                  </p>
                  <p className="font-bangla text-xs leading-relaxed text-slate-500">
                    ব্যাকরণ, শব্দ, উচ্চারণ — যেকোনো কিছু। নিচের একটায় ট্যাপ করেও
                    শুরু করতে পারো।
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="font-bangla rounded-full bg-teal/10 px-3 py-1.5 text-xs font-bold text-teal ring-1 ring-teal/20 transition hover:bg-teal/20"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <p className="font-bangla max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-teal px-3.5 py-2.5 text-sm font-semibold text-white">
                      {m.text}
                    </p>
                  </div>
                ) : (
                  <div key={i} className="flex items-end gap-2">
                    <Mascot
                      mood="study"
                      size={32}
                      animate={false}
                      className="shrink-0"
                    />
                    <div className="flex max-w-[85%] flex-col gap-1.5">
                      <p className="font-bangla whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-cream px-3.5 py-2.5 text-sm font-semibold text-navy ring-1 ring-navy/5">
                        {m.text}
                      </p>
                      {m.sources && m.sources.length > 0 && (
                        <span className="font-bangla flex flex-wrap gap-1.5">
                          {m.sources.map((s) => (
                            <Link
                              key={s.href + s.title}
                              href={s.href}
                              onClick={() => setOpen(false)}
                              className="rounded-full bg-teal/10 px-2.5 py-1 text-[11px] font-bold text-teal ring-1 ring-teal/20 transition hover:bg-teal/20"
                            >
                              {s.title}
                            </Link>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                )
              )}

              {loading && (
                <div className="flex items-end gap-2">
                  <Mascot
                    mood="thinking"
                    size={32}
                    animate={false}
                    className="shrink-0"
                  />
                  <div
                    className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-cream px-4 py-3 ring-1 ring-navy/5"
                    aria-label="Ulluk ভাবছে…"
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={
                          reduce
                            ? "h-2 w-2 rounded-full bg-navy/40"
                            : "h-2 w-2 animate-bounce rounded-full bg-navy/40"
                        }
                        style={reduce ? undefined : { animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2 border-t border-navy/5 px-3 py-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder="জার্মান প্রশ্ন লিখো…"
                aria-label="জার্মান প্রশ্ন লিখো"
                className="font-bangla min-w-0 flex-1 rounded-full bg-cream px-4 py-2.5 text-sm font-semibold text-navy ring-1 ring-navy/10 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal"
              />
              <button
                type="submit"
                disabled={loading || input.trim().length === 0}
                aria-label="প্রশ্ন পাঠাও"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal text-white transition hover:bg-teal/90 disabled:opacity-40"
              >
                <Send className="h-4.5 w-4.5" aria-hidden />
              </button>
            </form>
            <p className="font-bangla px-4 pb-3 text-center text-[11px] leading-snug text-slate-400">
              Ulluk AI দিয়ে উত্তর দেয় — মাঝে মাঝে ভুল হতে পারে, লেসনে মিলিয়ে নিও।
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
