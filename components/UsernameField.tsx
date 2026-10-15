"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

// Phase 1 — username claim/change field (used by /profile setup + settings).
// Live availability check (debounced) + save via POST /api/username.

export default function UsernameField({
  initial = "",
  mode = "setup",
}: {
  initial?: string;
  mode?: "setup" | "settings";
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalized = value.trim().toLowerCase();
  const changed = normalized !== initial.toLowerCase();

  useEffect(() => {
    if (!changed || normalized.length < 3) {
      setStatus("idle");
      setMessage("");
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
      setStatus("invalid");
      setMessage("৩–২০ অক্ষর, শুধু a–z, 0–9, _ ব্যবহার করা যাবে।");
      return;
    }
    setStatus("checking");
    setMessage("");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/username/check?name=${encodeURIComponent(normalized)}`);
        const data = (await res.json()) as { available?: boolean; error?: string };
        if (data.available) {
          setStatus("available");
          setMessage("এই username পাওয়া যাবে।");
        } else {
          setStatus("taken");
          setMessage(data.error ?? "এই username ইতিমধ্যে নেওয়া হয়ে গেছে।");
        }
      } catch {
        setStatus("idle");
      }
    }, 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [normalized, changed]);

  async function save() {
    setSaving(true);
    setSaved(false);
    setMessage("");
    try {
      const res = await fetch("/api/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: normalized }),
      });
      const data = (await res.json()) as { username?: string; error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "সেভ করা যায়নি। আবার চেষ্টা করো।");
        return;
      }
      if (mode === "setup") {
        router.push(`/profile/${data.username}`);
        router.refresh();
      } else {
        setSaved(true);
      }
    } catch {
      setMessage("সেভ করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="username-field" className="font-bangla text-sm font-extrabold text-navy">
        Username
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-mist">
            @
          </span>
          <input
            id="username-field"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="tomar_nam"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-2xl bg-white py-3 pl-8 pr-4 text-sm font-bold text-navy ring-1 ring-slate-200 outline-none transition placeholder:font-normal placeholder:text-mist focus:ring-2 focus:ring-teal"
          />
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!changed || status !== "available" || saving}
          className="btn btn-primary shrink-0 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : "সেভ করো"}
        </button>
      </div>
      {message && (
        <p
          className={`font-bangla flex items-center gap-1.5 text-xs font-bold ${
            status === "available" ? "text-teal" : "text-rose-600"
          }`}
        >
          {status === "available" && <Check className="h-3.5 w-3.5" aria-hidden />}
          {message}
        </p>
      )}
      {saved && (
        <p className="font-bangla flex items-center gap-1.5 text-xs font-bold text-teal">
          <Check className="h-3.5 w-3.5" aria-hidden /> Username সেভ হয়েছে!
        </p>
      )}
      {mode === "setup" && (
        <p className="font-bangla text-xs text-mist">
          প্রোফাইল লিংক হবে: deutschbangla-cards.vercel.app/profile/<span className="font-bold text-navy">{normalized || "tomar_nam"}</span>
        </p>
      )}
    </div>
  );
}
