import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { parseScores, duelWinner } from "@/lib/duel";
import { QUIZ_MODES } from "@/lib/quiz-questions";
import Mascot from "@/components/Mascot";
import DuelCreateForm from "@/components/DuelCreateForm";
import DuelJoinForm from "@/components/DuelJoinForm";
import type { Duel, User } from "@prisma/client";
import { Swords, Trophy, Users } from "lucide-react";

type DuelWithPlayers = Duel & {
  creator: Pick<User, "id" | "name" | "username" | "image">;
  opponent: Pick<User, "id" | "name" | "username" | "image"> | null;
};

export const metadata = {
  title: "Quiz Duel",
  description: "বন্ধুর সাথে ১ বনাম ১ জার্মান কুইজ ডুয়েল — একই ১০ প্রশ্ন, লাইভ স্কোর।",
};

const STATUS_BN: Record<string, string> = {
  waiting: "প্রতিপক্ষের অপেক্ষায়",
  playing: "চলছে",
  finished: "শেষ",
};

// Phase 5 — Quiz Duel lobby (auth required).
// Create a duel (category + difficulty) → shareable link/code.
// Join by code. List of MY duels (created + joined) with status + score.
export default async function DuelLobbyPage() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/duel");
  }
  const userId = session.user.id;
  const prisma = getPrisma();

  let myDuels: DuelWithPlayers[] | null = null;
  if (prisma) {
    myDuels = await prisma.duel.findMany({
      where: { OR: [{ creatorId: userId }, { opponentId: userId }] },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        creator: { select: { id: true, name: true, username: true, image: true } },
        opponent: { select: { id: true, name: true, username: true, image: true } },
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-bangla text-sm font-semibold text-teal">১ বনাম ১ · লাইভ</p>
          <h1 className="section-heading inline-flex items-center gap-2 text-3xl">
            <Swords className="h-7 w-7 text-teal" aria-hidden /> Quiz Duel
          </h1>
          <p className="font-bangla mt-1 text-sm text-mist">
            বন্ধুর সাথে একই ১০ প্রশ্নে লড়াই — জিতলে +৫০ XP বোনাস!
          </p>
        </div>
        <Mascot mood="gaming" size={64} animate className="shrink-0" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="card rounded-3xl bg-white p-5">
          <h2 className="font-bangla flex items-center gap-2 text-base font-extrabold text-navy">
            <Swords className="h-5 w-5 text-teal" aria-hidden /> নতুন ডুয়েল বানাও
          </h2>
          <p className="font-bangla mt-1 text-xs text-mist">
            বিষয় আর কাঠিন্য বাছো — লিংক/কোড শেয়ার করলেই বন্ধু যোগ দিতে পারবে।
          </p>
          <div className="mt-4">
            <DuelCreateForm />
          </div>
        </section>

        <section className="card rounded-3xl bg-white p-5">
          <h2 className="font-bangla flex items-center gap-2 text-base font-extrabold text-navy">
            <Users className="h-5 w-5 text-teal" aria-hidden /> কোড দিয়ে যোগ দাও
          </h2>
          <p className="font-bangla mt-1 text-xs text-mist">
            বন্ধুর পাঠানো ৬ অক্ষরের কোড লিখো — ডুয়েল সাথে সাথে শুরু হবে।
          </p>
          <div className="mt-4">
            <DuelJoinForm />
          </div>
        </section>
      </div>

      <section>
        <h2 className="font-bangla flex items-center gap-2 text-base font-extrabold text-navy">
          <Trophy className="h-5 w-5 text-teal" aria-hidden /> আমার ডুয়েল
        </h2>
        {!myDuels || myDuels.length === 0 ? (
          <div className="card mt-3 flex flex-col items-center gap-2 rounded-3xl bg-white p-8 text-center">
            <Mascot mood="thinking" size={64} />
            <p className="font-bangla font-bold text-navy">এখনো কোনো ডুয়েল নেই</p>
            <p className="font-bangla text-sm text-mist">
              উপরে একটা ডুয়েল বানাও বা বন্ধুর কোড দিয়ে যোগ দাও!
            </p>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {myDuels.map((d) => {
              const scores = parseScores(d.scores);
              const winnerId = duelWinner(d, scores);
              const other = d.creatorId === userId ? d.opponent : d.creator;
              const myScore = scores[userId]?.score ?? 0;
              const otherScore = other ? (scores[other.id]?.score ?? 0) : null;
              const modeBn = QUIZ_MODES.find((m) => m.id === d.category)?.bn ?? d.category;
              const resultLabel =
                d.status === "finished"
                  ? winnerId === null
                    ? "ড্র!"
                    : winnerId === userId
                      ? "জিতেছো!"
                      : "হেরেছো"
                  : STATUS_BN[d.status] ?? d.status;
              return (
                <Link
                  key={d.id}
                  href={`/duel/${d.code}`}
                  className="card flex items-center gap-3 rounded-3xl bg-white p-4 transition hover:ring-2 hover:ring-teal/40"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-white">
                    <Swords className="h-6 w-6" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-bangla block truncate text-sm font-extrabold text-navy">
                      {other
                        ? `vs ${other.name ?? other.username ?? "প্রতিপক্ষ"}`
                        : "প্রতিপক্ষের অপেক্ষায়…"}
                    </span>
                    <span className="font-bangla block text-xs text-mist">
                      {modeBn} · কোড {d.code} · {resultLabel}
                    </span>
                  </span>
                  {otherScore !== null && (
                    <span className="shrink-0 text-lg font-extrabold text-navy">
                      {myScore} <span className="text-sm text-mist">: {otherScore}</span>
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
