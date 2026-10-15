"use client";

import { useState } from "react";
import { Check, Loader2, Mail } from "lucide-react";

// Phase 3 — email preference toggles (storage only).
// Saves via POST /api/email-preferences. NO email is sent in Phase 3
// (Resend is Phase 4) — the note below says so honestly.

export interface EmailPrefs {
  weeklyReport: boolean;
  streakNudge: boolean;
  wordOfDay: boolean;
}

const OPTIONS: {
  key: keyof EmailPrefs;
  title: string;
  desc: string;
}[] = [
  {
    key: "weeklyReport",
    title: "সাপ্তাহিক রিপোর্ট",
    desc: "প্রতি সপ্তাহে তোমার XP আর অগ্রগতির সারাংশ।",
  },
  {
    key: "streakNudge",
    title: "স্ট্রিক রিমাইন্ডার",
    desc: "অনেকক্ষণ না পড়লে স্ট্রিক বাঁচানোর মনে করিয়ে দেওয়া।",
  },
  {
    key: "wordOfDay",
    title: "Wort des Tages",
    desc: "প্রতিদিন একটা নতুন জার্মান শব্দ।",
  },
];

export default function EmailPreferencesForm({
  initial,
}: {
  initial: EmailPrefs;
}) {
  const [prefs, setPrefs] = useState<EmailPrefs>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  function toggle(key: keyof EmailPrefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    setOk(false);
    try {
      const res = await fetch("/api/email-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "সেভ করা যায়নি।");
        return;
      }
      setOk(true);
      setMessage("ইমেইল পছন্দ সেভ হয়েছে!");
    } catch {
      setMessage("সেভ করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-bangla flex items-start gap-2 rounded-2xl bg-sun/10 px-3 py-2.5 text-xs font-bold text-navy ring-1 ring-sun/40">
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sun" aria-hidden />
        ইমেইল পাঠানো এখনো চালু হয়নি (Phase 4-এ আসবে) — এই সেটিংস তখন কাজ
        করবে।
      </p>
      {OPTIONS.map((opt) => {
        const on = prefs[opt.key];
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggle(opt.key)}
            aria-pressed={on}
            className="flex items-center justify-between gap-3 rounded-2xl px-1 py-1 text-left transition hover:bg-cream"
          >
            <span>
              <span className="font-bangla block text-sm font-extrabold text-navy">
                {opt.title}
              </span>
              <span className="font-bangla block text-xs text-mist">
                {opt.desc}
              </span>
            </span>
            <span
              aria-hidden
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                on ? "bg-teal" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  on ? "left-[22px]" : "left-0.5"
                }`}
              />
            </span>
          </button>
        );
      })}
      {message && (
        <p
          className={`font-bangla text-sm font-bold ${ok ? "text-teal" : "text-rose-600"}`}
        >
          {message}
        </p>
      )}
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="btn btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        ইমেইল পছন্দ সেভ করো
      </button>
    </div>
  );
}
