"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock, Inbox, Send, Users, XCircle } from "lucide-react";
import { categories } from "@/data/words";
import type { SubmissionType } from "@/lib/submissions";

// Phase 5 — Community board (client).
// Tabs: Approved (public) | Notun pathao (submit form) | Amar submissions
// (auth). The form's fields change with the selected type; all labels
// are Bangla. Approved submissions render per type (word / phrase /
// lesson_idea) with the submitter's public name.

type Tab = "approved" | "submit" | "mine";

interface SubmissionOut {
  id: string;
  type: string;
  payload: Record<string, string | undefined>;
  status: string;
  moderatorNote: string | null;
  createdAt: string;
  author: { name: string | null; username: string | null };
}

const TYPE_LABELS: Record<SubmissionType, string> = {
  word: "Shobdo",
  phrase: "Bakko/Phrase",
  lesson_idea: "Lesson Idea",
};

const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
  pending: { cls: "bg-sun/20 text-navy", label: "Opekkha" },
  approved: { cls: "bg-teal/10 text-teal", label: "Onumodito" },
  rejected: { cls: "bg-rose-50 text-rose-800", label: "Prottakhan" },
};

function SubmissionCard({ s }: { s: SubmissionOut }) {
  const p = s.payload;
  const badge = STATUS_BADGE[s.status] ?? STATUS_BADGE.pending;
  return (
    <div className="card flex flex-col gap-2 rounded-3xl bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bangla rounded-full bg-teal/10 px-3 py-1 text-xs font-bold text-teal">
          {TYPE_LABELS[s.type as SubmissionType] ?? s.type}
        </span>
        <span className={`font-bangla rounded-full px-3 py-1 text-xs font-bold ${badge.cls}`}>
          {badge.label}
        </span>
      </div>
      {s.type === "word" && (
        <>
          <p className="text-xl font-extrabold text-navy">
            {p.article ? `${p.article} ` : ""}
            {p.german}
          </p>
          <p className="font-bangla text-sm font-bold text-slate-700">{p.bangla}</p>
          {p.example && <p className="text-sm italic text-mist">“{p.example}”</p>}
        </>
      )}
      {s.type === "phrase" && (
        <>
          <p className="text-xl font-extrabold text-navy">{p.german}</p>
          <p className="font-bangla text-sm font-bold text-slate-700">{p.bangla}</p>
          {p.context && <p className="font-bangla text-sm text-mist">{p.context}</p>}
        </>
      )}
      {s.type === "lesson_idea" && (
        <>
          <p className="text-xl font-extrabold text-navy">{p.title}</p>
          <p className="font-bangla text-sm text-slate-700">{p.description}</p>
        </>
      )}
      <p className="font-bangla mt-auto text-xs text-mist">
        — {s.author.name ?? s.author.username ?? "Ulluk Learner"}
        {s.author.username ? ` (@${s.author.username})` : ""}
      </p>
      {s.moderatorNote && (
        <p className="font-bangla rounded-xl bg-cream px-3 py-2 text-xs text-slate-600">
          Moderator: {s.moderatorNote}
        </p>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-navy outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

export default function CommunityBoard() {
  const [tab, setTab] = useState<Tab>("approved");
  const [approved, setApproved] = useState<SubmissionOut[]>([]);
  const [mine, setMine] = useState<SubmissionOut[] | null>(null);
  const [mineAuth, setMineAuth] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState<SubmissionType>("word");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const loadApproved = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions?status=approved");
      const data = (await res.json().catch(() => null)) as { submissions?: SubmissionOut[] } | null;
      setApproved(data?.submissions ?? []);
    } catch {
      setApproved([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMine = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions?mine=1");
      if (res.status === 401) {
        setMineAuth(false);
        setMine(null);
        return;
      }
      setMineAuth(true);
      const data = (await res.json().catch(() => null)) as { submissions?: SubmissionOut[] } | null;
      setMine(data?.submissions ?? []);
    } catch {
      setMine([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "approved") loadApproved();
    if (tab === "mine") loadMine();
  }, [tab, loadApproved, loadMine]);

  const set = (k: string, v: string) => setFields((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg(null);
    const payload: Record<string, string> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (v.trim()) payload[k] = v.trim();
    }
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (res.status === 401) {
        setSubmitMsg({ ok: false, text: "Pathate hole age login korte hobe." });
      } else if (!res.ok) {
        setSubmitMsg({
          ok: false,
          text: data?.error === "rate_limited" ? "Onkbar pathiyecho — ekto pore abar chesta koro." : "Sob required field puron koro.",
        });
      } else {
        setSubmitMsg({ ok: true, text: "Pathano hoyeche! Moderator dekhar por approved list-e asbe." });
        setFields({});
        setMine(null);
      }
    } catch {
      setSubmitMsg({ ok: false, text: "Pathano jayni — ekto pore abar chesta koro." });
    } finally {
      setSubmitting(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "approved", label: "Approved" },
    { key: "submit", label: "Notun pathao" },
    { key: "mine", label: "Amar submissions" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`font-bangla rounded-full px-5 py-2.5 text-sm font-extrabold transition active:scale-95 ${
              tab === t.key ? "bg-navy text-white shadow" : "bg-white text-navy ring-1 ring-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "approved" && (
        <>
          {loading ? (
            <p className="font-bangla text-center text-sm text-mist">Load hocche…</p>
          ) : approved.length === 0 ? (
            <div className="card flex flex-col items-center gap-2 rounded-3xl bg-white p-8 text-center">
              <Inbox className="h-10 w-10 text-mist" aria-hidden />
              <p className="font-bangla font-bold text-navy">Ekhono kono approved submission nei</p>
              <p className="font-bangla text-sm text-mist">Prothom-ta tumi pathate paro!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {approved.map((s) => (
                <SubmissionCard key={s.id} s={s} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "submit" && (
        <form onSubmit={submit} className="card flex flex-col gap-4 rounded-3xl bg-white p-5">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TYPE_LABELS) as SubmissionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  setFields({});
                  setSubmitMsg(null);
                }}
                className={`font-bangla rounded-full px-4 py-2 text-sm font-extrabold transition active:scale-95 ${
                  type === t ? "bg-teal text-white" : "bg-cream text-navy"
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {type === "word" && (
            <>
              <input className={inputCls} placeholder="German shobdo * (jemon: der Apfel)" value={fields.german ?? ""} onChange={(e) => set("german", e.target.value)} />
              <input className={inputCls} placeholder="Bangla ortho * (jemon: আপেল)" value={fields.bangla ?? ""} onChange={(e) => set("bangla", e.target.value)} />
              <input className={inputCls} placeholder="Article (optional, jemon: der)" value={fields.article ?? ""} onChange={(e) => set("article", e.target.value)} />
              <input className={inputCls} placeholder="Example bakko (optional)" value={fields.example ?? ""} onChange={(e) => set("example", e.target.value)} />
              <select className={inputCls} value={fields.category ?? ""} onChange={(e) => set("category", e.target.value)}>
                <option value="">Category (optional)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.german} — {c.bangla}
                  </option>
                ))}
              </select>
            </>
          )}
          {type === "phrase" && (
            <>
              <input className={inputCls} placeholder="German phrase * (jemon: Wie geht's?)" value={fields.german ?? ""} onChange={(e) => set("german", e.target.value)} />
              <input className={inputCls} placeholder="Bangla ortho * (jemon: কেমন আছো?)" value={fields.bangla ?? ""} onChange={(e) => set("bangla", e.target.value)} />
              <input className={inputCls} placeholder="Kothay bebohar hoy? (optional)" value={fields.context ?? ""} onChange={(e) => set("context", e.target.value)} />
            </>
          )}
          {type === "lesson_idea" && (
            <>
              <input className={inputCls} placeholder="Lesson-er title * (jemon: Restaurant-e order kora)" value={fields.title ?? ""} onChange={(e) => set("title", e.target.value)} />
              <textarea className={`${inputCls} min-h-28`} placeholder="Ki thakbe lesson-e? *" value={fields.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="font-bangla inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-base font-extrabold text-white shadow-lg shadow-navy/20 transition active:scale-95 disabled:opacity-60"
          >
            <Send className="h-4 w-4" aria-hidden /> {submitting ? "Pathano hocche…" : "Submit koro"}
          </button>
          {submitMsg && (
            <p
              className={`font-bangla flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${
                submitMsg.ok ? "bg-teal/10 text-navy" : "bg-rose-50 text-rose-800"
              }`}
            >
              {submitMsg.ok ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-teal" aria-hidden />
              ) : (
                <XCircle className="h-5 w-5 shrink-0 text-rose-500" aria-hidden />
              )}
              {submitMsg.text}
            </p>
          )}
          <p className="font-bangla flex items-center gap-1.5 text-xs text-mist">
            <Clock className="h-3.5 w-3.5" aria-hidden /> Submit-er por moderator review korbe — approved hole shobai dekhte pabe.
          </p>
        </form>
      )}

      {tab === "mine" && (
        <>
          {mineAuth === false ? (
            <div className="card rounded-3xl bg-white p-8 text-center">
              <Users className="mx-auto h-10 w-10 text-mist" aria-hidden />
              <p className="font-bangla mt-2 font-bold text-navy">Tomar submissions dekhte login koro</p>
              <a
                href="/api/auth/signin?callbackUrl=/community"
                className="font-bangla mt-3 inline-block rounded-full bg-navy px-5 py-2.5 text-sm font-extrabold text-white"
              >
                Login
              </a>
            </div>
          ) : loading ? (
            <p className="font-bangla text-center text-sm text-mist">Load hocche…</p>
          ) : !mine || mine.length === 0 ? (
            <div className="card flex flex-col items-center gap-2 rounded-3xl bg-white p-8 text-center">
              <Inbox className="h-10 w-10 text-mist" aria-hidden />
              <p className="font-bangla font-bold text-navy">Tumi ekhono kichu pathaoni</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {mine.map((s) => (
                <SubmissionCard key={s.id} s={s} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
