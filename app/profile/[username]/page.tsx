import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { canViewProfile, toPublicProfile } from "@/lib/profile";
import Mascot from "@/components/Mascot";
import CopyLinkButton from "@/components/CopyLinkButton";
import ProfileFollow from "@/components/ProfileFollow";
import {
  BookOpen,
  CalendarDays,
  Flame,
  GraduationCap,
  Layers,
  Lock,
  Pencil,
  Settings as SettingsIcon,
  Snowflake,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";

const BADGE_ICONS: Record<string, LucideIcon> = {
  flame: Flame,
  layers: Layers,
  graduation: GraduationCap,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const prisma = getPrisma();
  const fallback: Metadata = {
    title: `@${username} | Ulluk প্রোফাইল`,
    description: "Ulluk-এ একজন জার্মান শিক্ষার্থীর প্রোফাইল।",
  };
  if (!prisma) return fallback;
  try {
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      include: { progress: true },
    });
    if (!user) return fallback;
    return {
      title: `${user.name ?? username} (@${username}) | Ulluk প্রোফাইল`,
      description: `Level ${user.progress?.level ?? 1} · ${user.progress?.xp ?? 0} XP · ${user.progress?.streak ?? 0} দিনের স্ট্রিক — বাংলায় জার্মান শিখছে।`,
    };
  } catch {
    return fallback;
  }
}

// Phase 1 — public profile page.
// Privacy: private → owner only; friends → owner + followers; public → all.
// Stats come only from real stored data; empty states stay honest.
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth().catch(() => null);
  const viewerId = session?.user?.id ?? null;
  const prisma = getPrisma();

  if (!prisma) {
    return (
      <div className="card flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center">
        <Mascot mood="sleepy" size={72} />
        <p className="font-bangla font-bold text-navy">প্রোফাইল এখনো সেটআপ হয়নি।</p>
        <p className="font-bangla text-sm text-mist">Database সংযোগ বাকি — SETUP.md দেখো।</p>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      progress: true,
      badges: true,
      settings: true,
      _count: { select: { followers: true, following: true } },
    },
  });
  if (!user) notFound();

  const privacy = user.settings?.privacy ?? "public";
  const allowed = await canViewProfile(prisma, user.id, viewerId, privacy);
  if (!allowed) {
    return (
      <div className="card flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center">
        <Mascot mood="sleepy" size={96} />
        <h1 className="font-bangla text-xl font-extrabold text-navy">এই প্রোফাইলটি প্রাইভেট</h1>
        <p className="font-bangla max-w-xs text-sm text-mist">
          @{username} তাদের প্রোফাইল শুধু নিজের জন্য রেখেছেন।
        </p>
      </div>
    );
  }

  const profile = toPublicProfile(
    {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      progress: user.progress,
      badges: user.badges,
      settings: user.settings,
    },
    viewerId,
  );

  const newBadges = profile.isOwner ? profile.badges.filter((b) => b.isNew) : [];
  const todayXp = profile.stats.heatmap[profile.stats.heatmap.length - 1]?.xp ?? 0;
  const dailyGoal = profile.isOwner ? (user.settings?.dailyGoalXp ?? 50) : null;
  const goalPct = dailyGoal ? Math.min(100, Math.round((todayXp / dailyGoal) * 100)) : 0;
  const maxHeat = Math.max(1, ...profile.stats.heatmap.map((h) => h.xp));

  // Phase 2 — does the viewer already follow this user?
  const isFollowing = viewerId && !profile.isOwner
    ? (await prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId: viewerId, followingId: user.id },
        },
        select: { id: true },
      })) !== null
    : false;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-navy p-5 text-white shadow-xl shadow-navy/10 sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal/20 blur-2xl"
        />
        <div className="relative flex flex-col gap-4">
          <div className="flex items-start gap-4">
            {profile.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.image}
                alt={profile.name ?? profile.username}
                className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-white/20"
              />
            ) : (
              <span
                aria-hidden
                className="font-bangla flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-teal text-3xl font-extrabold text-white ring-4 ring-white/20"
              >
                {(profile.name ?? profile.username).slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-extrabold leading-tight">
                {profile.name ?? profile.username}
              </h1>
              <p className="text-sm font-bold text-white/70">@{profile.username}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
                  <Trophy className="h-3.5 w-3.5 text-sun" aria-hidden /> Level {profile.level}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
                  <Sparkles className="h-3.5 w-3.5 text-teal" aria-hidden /> {profile.xp} XP
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
                  <Flame className="h-3.5 w-3.5 text-sun" aria-hidden /> {profile.streak} দিনের স্ট্রিক
                </span>
                {profile.isOwner && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
                    <Snowflake className="h-3.5 w-3.5 text-sky-300" aria-hidden /> {profile.streakFreezes} Streak Freeze
                  </span>
                )}
                {profile.privacy !== "public" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
                    <Lock className="h-3.5 w-3.5" aria-hidden />
                    {profile.privacy === "private" ? "প্রাইভেট" : "শুধু ফলোয়ার"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CopyLinkButton />
            <ProfileFollow
              targetId={user.id}
              targetUsername={profile.username}
              isOwner={profile.isOwner}
              signedIn={viewerId !== null}
              initialFollowing={isFollowing}
              initialFollowersCount={user._count.followers}
              initialFollowingCount={user._count.following}
            />
            {profile.isOwner && (
              <>
                <Link
                  href="/profile/settings"
                  className="font-bangla inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-navy transition hover:bg-cream active:scale-95"
                >
                  <SettingsIcon className="h-4 w-4" aria-hidden /> সেটিংস
                </Link>
                <Link
                  href="/fortschritt"
                  className="font-bangla inline-flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-sm font-bold text-white transition hover:bg-teal/90 active:scale-95"
                >
                  <Pencil className="h-4 w-4" aria-hidden /> পড়াশোনা চালিয়ে যাও
                </Link>
              </>
            )}
          </div>

          {profile.isOwner && dailyGoal !== null && (
            <div>
              <div className="font-bangla flex items-center justify-between text-xs font-bold text-white/80">
                <span>আজকের লক্ষ্য: {todayXp} / {dailyGoal} XP</span>
                <span>{goalPct}%</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal to-sun transition-all"
                  style={{ width: `${goalPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Celebration for newly unlocked badges (owner only) */}
      {newBadges.length > 0 && (
        <section className="flex items-center gap-4 rounded-3xl bg-sun/15 p-5 ring-1 ring-sun/40">
          <Mascot mood="celebrate" size={76} className="shrink-0" />
          <div>
            <h2 className="font-bangla text-lg font-extrabold text-navy">নতুন ব্যাজ আনলকড! 🎉</h2>
            <p className="font-bangla text-sm font-bold text-slate-600">
              {newBadges.map((b) => b.def.titleBangla).join(" · ")} — অভিনন্দন!
            </p>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card rounded-3xl bg-white p-4 text-center">
          <BookOpen className="mx-auto h-6 w-6 text-teal" aria-hidden />
          <p className="mt-1 text-2xl font-extrabold text-navy">{profile.stats.wordsLearned}</p>
          <p className="font-bangla text-xs font-bold text-mist">শেখা শব্দ</p>
        </div>
        <div className="card rounded-3xl bg-white p-4 text-center">
          <GraduationCap className="mx-auto h-6 w-6 text-teal" aria-hidden />
          <p className="mt-1 text-2xl font-extrabold text-navy">{profile.stats.lessonsDone}</p>
          <p className="font-bangla text-xs font-bold text-mist">শেষ করা পাঠ</p>
        </div>
        <div className="card rounded-3xl bg-white p-4 text-center">
          <Trophy className="mx-auto h-6 w-6 text-teal" aria-hidden />
          <p className="mt-1 text-2xl font-extrabold text-navy">
            {profile.stats.quizBestPercent !== null ? `${profile.stats.quizBestPercent}%` : "—"}
          </p>
          <p className="font-bangla text-xs font-bold text-mist">সেরা কুইজ স্কোর</p>
        </div>
        <div className="card rounded-3xl bg-white p-4 text-center">
          <CalendarDays className="mx-auto h-6 w-6 text-teal" aria-hidden />
          <p className="mt-1 text-2xl font-extrabold text-navy">{profile.stats.activeDays}</p>
          <p className="font-bangla text-xs font-bold text-mist">সক্রিয় দিন</p>
        </div>
      </section>

      {/* Weekly activity heatmap */}
      <section className="card rounded-3xl bg-white p-5">
        <h2 className="font-bangla text-base font-extrabold text-navy">এই সপ্তাহের অ্যাক্টিভিটি</h2>
        <p className="font-bangla mt-0.5 text-xs text-mist">প্রতিদিনের XP — গত ৭ দিন।</p>
        <div className="mt-4 flex h-24 items-end gap-2">
          {profile.stats.heatmap.map((day) => {
            const d = new Date(`${day.date}T12:00:00`);
            const label = d.toLocaleDateString("bn-BD", { weekday: "short" });
            const height = day.xp > 0 ? Math.max(12, Math.round((day.xp / maxHeat) * 100)) : 4;
            return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[11px] font-bold text-navy">{day.xp > 0 ? day.xp : ""}</span>
                <div
                  className={`w-full max-w-8 rounded-t-lg ${day.xp > 0 ? "bg-teal" : "bg-slate-100"}`}
                  style={{ height: `${height}px` }}
                  title={`${day.date}: ${day.xp} XP`}
                />
                <span className="font-bangla text-[11px] font-bold text-mist">{label}</span>
              </div>
            );
          })}
        </div>
        {profile.stats.activeDays === 0 && (
          <p className="font-bangla mt-3 text-center text-sm text-mist">
            এখনো কোনো অ্যাক্টিভিটি নেই — আজকে একটা পাঠ শেষ করে শুরু করো!
          </p>
        )}
      </section>

      {/* Badges */}
      <section className="card rounded-3xl bg-white p-5">
        <h2 className="font-bangla text-base font-extrabold text-navy">ব্যাজ</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {profile.badges.map((b) => {
            const Icon = BADGE_ICONS[b.def.icon] ?? Trophy;
            return (
              <div
                key={b.def.key}
                className={`rounded-2xl p-4 text-center ring-1 ${
                  b.unlocked ? "bg-sun/10 ring-sun/50" : "bg-cream ring-slate-200 opacity-70"
                }`}
              >
                <span
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                    b.unlocked ? "bg-sun text-navy" : "bg-slate-200 text-mist"
                  }`}
                >
                  <Icon className="h-7 w-7" aria-hidden />
                </span>
                <p className="font-bangla mt-2 text-sm font-extrabold text-navy">{b.def.titleBangla}</p>
                <p className="text-xs font-bold text-mist">{b.def.title}</p>
                <p className="font-bangla mt-1 text-xs text-slate-500">{b.def.description}</p>
                {b.unlocked && b.unlockedAt && (
                  <p className="font-bangla mt-1.5 text-[11px] font-bold text-teal">
                    আনলকড:{" "}
                    {b.unlockedAt.toLocaleDateString("bn-BD", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
