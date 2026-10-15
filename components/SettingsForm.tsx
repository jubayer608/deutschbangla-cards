"use client";

import { useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";

// Phase 1 — settings form (daily goal, reminder, difficulty, privacy).
// Saves via POST /api/settings.

interface InitialSettings {
  dailyGoalXp: number;
  reminderTime: string | null;
  difficulty: string;
  privacy: string;
}

const DIFFICULTIES = [
  { id: "easy", bn: "সহজ", de: "leicht" },
  { id: "medium", bn: "মাঝারি", de: "mittel" },
  { id: "hard", bn: "কঠিন", de: "schwer" },
  { id: "mixed", bn: "মিশ্র", de: "gemischt" },
];

const PRIVACIES = [
  { id: "public", bn: "সবার জন্য খোলা", desc: "যে কেউ তোমার প্রোফাইল দেখতে পারবে।" },
  { id: "friends", bn: "শুধু ফলোয়ার", desc: "শুধু যারা তোমাকে ফলো করে তারাই দেখতে পারবে।" },
  { id: "private", bn: "প্রাইভেট", desc: "শুধু তুমিই দেখতে পারবে।" },
];

export default function SettingsForm({ initial }: { initial: InitialSettings }) {
  const [goal, setGoal] = useState(initial.dailyGoalXp);
  const [reminder, setReminder] = useState(initial.reminderTime ?? "");
  const [difficulty, setDifficulty] = useState(initial.difficulty);
  const [privacy, setPrivacy] = useState(initial.privacy);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  async function save() {
    setSaving(true);
    setMessage("");
    setOk(false);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyGoalXp: goal,
          reminderTime: reminder === "" ? null : reminder,
          difficulty,
          privacy,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "সেভ করা যায়নি।");
        return;
      }
      setOk(true);
      setMessage("সেটিংস সেভ হয়েছে!");
    } catch {
      setMessage("সেভ করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="goal" className="font-bangla text-sm font-extrabold text-navy">
          দৈনিক লক্ষ্য (XP)
        </label>
        <input
          id="goal"
          type="number"
          min={1}
          max={1000}
          value={goal}
          onChange={(e) => setGoal(Number(e.target.value))}
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-navy ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-teal"
        />
        <p className="font-bangla text-xs text-mist">প্রতিদিন কত XP করতে চাও — প্রোফাইলে অগ্রগতি দেখাবে।</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="reminder" className="font-bangla text-sm font-extrabold text-navy">
          মনে করিয়ে দেওয়ার সময় (ঐচ্ছিক)
        </label>
        <input
          id="reminder"
          type="time"
          value={reminder}
          onChange={(e) => setReminder(e.target.value)}
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-navy ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-teal"
        />
        <p className="font-bangla text-xs text-mist">
          ভবিষ্যতে এই সময়ে রিমাইন্ডার আসবে (এখনো নোটিফিকেশন চালু হয়নি)।
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-bangla text-sm font-extrabold text-navy">পছন্দের কাঠিন্য</span>
        <div className="grid grid-cols-4 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDifficulty(d.id)}
              aria-pressed={difficulty === d.id}
              className={`rounded-2xl py-3 text-center ring-2 transition ${
                difficulty === d.id
                  ? "bg-navy text-white ring-navy"
                  : "bg-white ring-slate-200 hover:ring-teal/50"
              }`}
            >
              <span className="font-bangla block text-sm font-extrabold">{d.bn}</span>
              <span className="block text-xs opacity-70">{d.de}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-bangla text-sm font-extrabold text-navy">প্রোফাইল গোপনীয়তা</span>
        {PRIVACIES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPrivacy(p.id)}
            aria-pressed={privacy === p.id}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left ring-2 transition ${
              privacy === p.id ? "bg-teal/10 ring-teal" : "bg-white ring-slate-200 hover:ring-teal/50"
            }`}
          >
            <span
              aria-hidden
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-2 ${
                privacy === p.id ? "bg-teal ring-teal" : "bg-white ring-slate-300"
              }`}
            >
              {privacy === p.id && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </span>
            <span>
              <span className="font-bangla block text-sm font-extrabold text-navy">{p.bn}</span>
              <span className="font-bangla block text-xs text-mist">{p.desc}</span>
            </span>
          </button>
        ))}
      </div>

      {message && (
        <p className={`font-bangla text-sm font-bold ${ok ? "text-teal" : "text-rose-600"}`}>{message}</p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="btn btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        সেটিংস সেভ করো
      </button>
    </div>
  );
}
