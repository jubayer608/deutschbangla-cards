import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { isParticipant, parseQuestions, parseScores, publicQuestions } from "@/lib/duel";
import DuelRoom from "@/components/DuelRoom";

export const metadata = {
  title: "Quiz Duel",
  description: "১ বনাম ১ জার্মান কুইজ ডুয়েল — একই ১০ প্রশ্ন, লাইভ স্কোর।",
};

// Phase 5 — duel room (server wrapper: auth + participant gate + initial
// state). The interactive room (polling, answering) lives in DuelRoom.
export default async function DuelRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    redirect(`/api/auth/signin?callbackUrl=/duel/${code}`);
  }
  const userId = session.user.id;
  const prisma = getPrisma();
  if (!prisma) {
    return (
      <div className="card mx-auto max-w-md rounded-3xl bg-white p-8 text-center">
        <p className="font-bangla font-bold text-navy">ডুয়েল এখনো সেটআপ হয়নি।</p>
        <p className="font-bangla text-sm text-mist">Database সংযোগ বাকি — SETUP.md দেখো।</p>
      </div>
    );
  }

  const duel = await prisma.duel.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      creator: { select: { id: true, name: true, username: true, image: true } },
      opponent: { select: { id: true, name: true, username: true, image: true } },
    },
  });
  // Invite-only: outsiders get 404 (existence is not leaked).
  if (!duel || !isParticipant(duel, userId)) notFound();

  const questions = parseQuestions(duel.questions);
  const scores = parseScores(duel.scores);

  return (
    <DuelRoom
      initial={{
        code: duel.code,
        status: duel.status,
        category: duel.category,
        difficulty: duel.difficulty,
        creator: duel.creator,
        opponent: duel.opponent,
        scores,
        questions: publicQuestions(questions),
        myId: userId,
      }}
    />
  );
}
