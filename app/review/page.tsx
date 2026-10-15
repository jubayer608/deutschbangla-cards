import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { getReviewQueue } from "@/lib/review";
import Mascot from "@/components/Mascot";
import ReviewSession from "@/components/ReviewSession";
import { BookOpen, Flame, Repeat } from "lucide-react";

export const metadata = {
  title: "Review — SM-2 রিভিশন",
  description: "ভুলে যাওয়ার ঠিক আগে শব্দগুলো আবার দেখো — SM-2 spaced repetition।",
};

// Phase 5 — SM-2 spaced repetition (auth required).
// The server builds the session queue (overdue + up to 20 new words);
// the client component walks through it one card at a time and POSTs
// each answer to /api/review.
export default async function ReviewPage() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/review");
  }
  const userId = session.user.id;
  const prisma = getPrisma();

  const data = prisma ? await getReviewQueue(prisma, userId) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-bangla text-sm font-semibold text-teal">SM-2 · ঠিক সময়ে রিভিশন</p>
          <h1 className="section-heading inline-flex items-center gap-2 text-3xl">
            <Repeat className="h-7 w-7 text-teal" aria-hidden /> Review
          </h1>
          <p className="font-bangla mt-1 text-sm text-mist">
            ভুলে যাওয়ার ঠিক আগে শব্দটা আবার দেখো — এটাই SM-2-এর জাদু।
          </p>
        </div>
        <Mascot
          mood={!data || data.queue.length === 0 ? "celebrate" : "thinking"}
          size={64}
          animate
          className="shrink-0"
        />
      </div>

      {!data ? (
        <div className="card rounded-3xl bg-white p-8 text-center">
          <p className="font-bangla font-bold text-navy">Review এখনো সেটআপ হয়নি</p>
          <p className="font-bangla mt-1 text-sm text-mist">
            ডেটাবেস কানেকশন পাওয়া যাচ্ছে না — একটু পরে আবার চেষ্টা করো।
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="card rounded-3xl bg-white p-4 text-center">
              <p className="font-bangla flex items-center justify-center gap-1 text-xs font-semibold text-mist">
                <Repeat className="h-3.5 w-3.5 text-teal" aria-hidden /> আজকের কিউ
              </p>
              <p className="text-2xl font-extrabold text-navy">{data.queue.length}</p>
            </div>
            <div className="card rounded-3xl bg-white p-4 text-center">
              <p className="font-bangla flex items-center justify-center gap-1 text-xs font-semibold text-mist">
                <Flame className="h-3.5 w-3.5 text-sun" aria-hidden /> আজ রিভিউ করেছো
              </p>
              <p className="text-2xl font-extrabold text-navy">{data.reviewedToday}</p>
            </div>
            <div className="card rounded-3xl bg-white p-4 text-center">
              <p className="font-bangla flex items-center justify-center gap-1 text-xs font-semibold text-mist">
                <BookOpen className="h-3.5 w-3.5 text-teal" aria-hidden /> মোট রিভিউ করা
              </p>
              <p className="text-2xl font-extrabold text-navy">{data.totalReviewed}</p>
            </div>
          </div>

          <ReviewSession
            queue={data.queue}
            dueCount={data.dueCount}
            newCount={data.newCount}
          />
        </>
      )}
    </div>
  );
}
