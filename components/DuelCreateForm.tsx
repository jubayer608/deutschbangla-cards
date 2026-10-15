"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Swords } from "lucide-react";
import { QUIZ_MODES, QUIZ_DIFFS, type QuizMode, type QuizDiffSetting } from "@/lib/quiz-questions";

// Phase 5 — create a duel (lobby). POST /api/duel → redirect to the room.
export default function DuelCreateForm() {
  const router = useRouter();
  const [category, setCategory] = useState<QuizMode>("mixed");
  const [difficulty, setDifficulty] = useState<QuizDiffSetting>("mixed");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function create() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/duel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, difficulty }),
      });
      const data = (await res.json()) as { duel?: { code?: string }; error?: string };
      if (!res.ok || !data.duel?.code) {
        setMessage(data.error ?? "ডুয়েল বানানো যায়নি। আবার চেষ্টা করো।");
        return;
      }
      router.push(`/duel/${data.duel.code}`);
      router.refresh();
    } catch {
      setMessage("ডুয়েল বানানো যায়নি। আবার চেষ্টা করো।");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="font-bangla text-sm font-extrabold text-navy">বিষয়</span>
        <div className="grid grid-cols-3 gap-2">
          {QUIZ_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setCategory(m.id)}
              aria-pressed={category === m.id}
              className={`rounded-2xl py-3 text-center ring-2 transition ${
                category === m.id
                  ? "bg-navy text-white ring-navy"
                  : "bg-white ring-slate-200 hover:ring-teal/50"
              }`}
            >
              <span className="block text-sm font-extrabold">{m.de}</span>
              <span className="font-bangla block text-xs opacity-70">{m.bn}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-bangla text-sm font-extrabold text-navy">কাঠিন্য</span>
        <div className="grid grid-cols-4 gap-2">
          {QUIZ_DIFFS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDifficulty(d.id)}
              aria-pressed={difficulty === d.id}
              className={`rounded-2xl py-3 text-center ring-2 transition ${
                difficulty === d.id
                  ? "bg-teal text-white ring-teal"
                  : "bg-white ring-slate-200 hover:ring-teal/50"
              }`}
            >
              <span className="font-bangla block text-sm font-extrabold">{d.bn}</span>
              <span className="block text-xs opacity-70">{d.de}</span>
            </button>
          ))}
        </div>
      </div>

      {message && <p className="font-bangla text-sm font-bold text-rose-600">{message}</p>}

      <button
        type="button"
        onClick={create}
        disabled={saving}
        className="btn btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Swords className="h-4 w-4" aria-hidden />
        )}
        ডুয়েল বানাও
      </button>
    </div>
  );
}
