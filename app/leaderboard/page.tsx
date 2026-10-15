import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { getLeaderboard, rankMood, type LeaderboardScope } from "@/lib/leaderboard";
import Mascot from "@/components/Mascot";
import { Flame, Sparkles, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "লিডারবোর্ড",
  description: "Ulluk-এর টপ জার্মান শিক্ষার্থীরা — এই সপ্তাহে আর সব সময়ের XP র‍্যাংকিং।",
};

// Phase 2 — leaderboard page. Two tabs: "This week" (last 7 days of
// activity XP) vs "All time" (total XP). Rows link to public profiles.
// The mascot reacts to the signed-in user's own rank.

const RANK_STYLES: Record<number, string> = {
  1: "bg-sun text-navy ring-sun/60",
  2: "bg-slate-300 text-navy ring-slate-300/60",
  3: "bg-amber-700 text-white ring-amber-700/60",
};

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      aria-label={`র‍্যাংক ${rank}`}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ring-2 ${
        RANK_STYLES[rank] ?? "bg-cream text-navy ring-slate-200"
      }`}
    >
      {rank}
    </span>
  );
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const { scope: scopeParam } = await searchParams;
  const scope: LeaderboardScope = scopeParam === "week" ? "week" : "all";
  const session = await auth().catch(() => null);
  const viewerId = session?.user?.id ?? null;
  const prisma = getPrisma();

  if (!prisma) {
    return (
      <div className="card flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center">
        <Mascot mood="sleepy" size={72} />
        <p className="font-bangla font-bold text-navy">লিডারবোর্ড এখনো সেটআপ হয়নি।</p>
        <p className="font-bangla text-sm text-mist">Database সংযোগ বাকি — SETUP.md দেখো।</p>
      </div>
    );
  }

  const board = await getLeaderboard(prisma, scope, viewerId, 50);
  const mood = rankMood(board.yourRank?.rank ?? null);
  const moodText =
    board.yourRank === null
      ? viewerId
        ? "তুমি এখনো র‍্যাংকে নেই — একটা কুইজ খেলে শুরু করো!"
        : "লগইন করলে তোমার র‍্যাংক এখানে দেখতে পাবা।"
      : board.yourRank.rank <= 3
        ? `দারুণ! তুমি এখন #${board.yourRank.rank} — টপ ৩-এ আছো!`
        : board.yourRank.rank <= 10
          ? `ভালো চলছে! তুমি এখন #${board.yourRank.rank} — টপ ১০-এ আছো।`
          : `তুমি এখন #${board.yourRank.rank} — আরেকটু পড়লেই উপরে উঠে যাবা!`;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-navy p-5 text-white shadow-xl shadow-navy/10 sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal/20 blur-2xl"
        />
        <div className="relative flex items-center gap-4">
          <Mascot mood={mood} size={84} className="shrink-0" />
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold leading-tight">
              <Trophy className="h-6 w-6 text-sun" aria-hidden /> লিডারবোর্ড
            </h1>
            <p className="font-bangla mt-1 text-sm text-white/75">{moodText}</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="লিডারবোর্ড সময়সীমা"
        className="flex gap-2"
      >
        {(
          [
            { scope: "week", label: "এই সপ্তাহ" },
            { scope: "all", label: "সব সময়" },
          ] as const
        ).map((t) => {
          const active = scope === t.scope;
          return (
            <Link
              key={t.scope}
              href={`/leaderboard?scope=${t.scope}`}
              role="tab"
              aria-selected={active}
              className={`font-bangla rounded-full px-5 py-2.5 text-sm font-bold transition active:scale-95 ${
                active
                  ? "bg-navy text-white shadow-md"
                  : "bg-white text-navy ring-1 ring-slate-200 hover:ring-teal/50"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Your rank (signed-in, has progress) */}
      {board.yourRank && !board.entries.some((e) => e.isOwn) && (
        <section className="flex items-center gap-3 rounded-3xl bg-teal/10 p-4 ring-2 ring-teal">
          <RankBadge rank={board.yourRank.rank} />
          <span className="font-bangla rounded-full bg-teal px-2.5 py-1 text-[11px] font-extrabold text-white">
            তুমি
          </span>
          <span className="font-bangla min-w-0 flex-1 truncate text-sm font-extrabold text-navy">
            {board.yourRank.name ?? `@${board.yourRank.username}`}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-extrabold text-navy">
            <Sparkles className="h-4 w-4 text-teal" aria-hidden />
            {board.yourRank.score} XP
          </span>
        </section>
      )}

      {/* Board */}
      {board.entries.length === 0 ? (
        <section className="card flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center">
          <Mascot mood="thinking" size={84} />
          <h2 className="font-bangla text-lg font-extrabold text-navy">
            এখনো কেউ র‍্যাংকে নেই
          </h2>
          <p className="font-bangla max-w-xs text-sm text-mist">
            {scope === "week"
              ? "এই সপ্তাহে এখনো কেউ XP করেনি — প্রথম হওয়ার সুযোগ তোমার!"
              : "এখনো কেউ XP করেনি — প্রথম হওয়ার সুযোগ তোমার!"}
          </p>
          <Link
            href="/quiz"
            className="font-bangla inline-flex items-center gap-1.5 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-navy/90 active:scale-95"
          >
            কুইজ খেলো
          </Link>
        </section>
      ) : (
        <ol className="card flex flex-col gap-1 rounded-3xl bg-white p-3">
          {board.entries.map((e) => (
            <li key={e.userId}>
              <Link
                href={`/profile/${e.username}`}
                className={`flex items-center gap-3 rounded-2xl px-2 py-2.5 transition active:scale-[0.99] ${
                  e.isOwn ? "bg-teal/10 ring-1 ring-teal" : "hover:bg-cream"
                }`}
              >
                <RankBadge rank={e.rank} />
                {e.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.image}
                    alt={e.name ?? e.username}
                    className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-teal/30"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="font-bangla flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal text-base font-extrabold text-white"
                  >
                    {(e.name ?? e.username).slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-extrabold text-navy">
                    {e.name ?? `@${e.username}`}
                  </span>
                  <span className="block truncate text-xs font-bold text-mist">
                    @{e.username} · Level {e.level}
                    {e.isOwn && " · তুমি"}
                  </span>
                </span>
                <span className="hidden items-center gap-1 text-xs font-bold text-navy sm:inline-flex">
                  <Flame className="h-3.5 w-3.5 text-sun" aria-hidden />
                  {e.streak}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-extrabold text-navy">
                  <Sparkles className="h-4 w-4 text-teal" aria-hidden />
                  {e.score} XP
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      <p className="font-bangla text-center text-xs text-mist">
        {scope === "week"
          ? "সাপ্তাহিক র‍্যাংকিং: গত ৭ দিনের XP।"
          : "সব সময়ের র‍্যাংকিং: মোট XP।"}{" "}
        শুধু পাবলিক প্রোফাইল দেখানো হয়।
      </p>
    </div>
  );
}
