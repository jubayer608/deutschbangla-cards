"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";

// Phase 5 — join a duel by invite code (lobby). POST /api/duel/join.
export default function DuelJoinForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function join() {
    const normalized = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(normalized)) {
      setMessage("৬ অক্ষরের কোড লিখো।");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/duel/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalized }),
      });
      const data = (await res.json()) as { duel?: { code?: string }; error?: string };
      if (!res.ok || !data.duel?.code) {
        setMessage(data.error ?? "যোগ দেওয়া যায়নি। আবার চেষ্টা করো।");
        return;
      }
      router.push(`/duel/${data.duel.code}`);
      router.refresh();
    } catch {
      setMessage("যোগ দেওয়া যায়নি। আবার চেষ্টা করো।");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="duel-code" className="font-bangla text-sm font-extrabold text-navy">
        ইনভাইট কোড
      </label>
      <div className="flex gap-2">
        <input
          id="duel-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="KQ7X2P"
          maxLength={6}
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-2xl bg-white px-4 py-3 text-center text-lg font-extrabold uppercase tracking-[0.3em] text-navy ring-1 ring-slate-200 outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-mist focus:ring-2 focus:ring-teal"
        />
        <button
          type="button"
          onClick={join}
          disabled={saving}
          className="btn btn-primary inline-flex shrink-0 items-center gap-2 rounded-2xl px-5 py-3 text-sm disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <LogIn className="h-4 w-4" aria-hidden />
          )}
          যোগ দাও
        </button>
      </div>
      {message && <p className="font-bangla text-sm font-bold text-rose-600">{message}</p>}
      <p className="font-bangla text-xs text-mist">
        কোডটি যে বানিয়েছে, তার কাছে পাবে — অথবা তোমার নিজের ডুয়েলের লিংক শেয়ার করো।
      </p>
    </div>
  );
}
