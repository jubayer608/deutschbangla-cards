import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { checkCertificateEligibility, CERT_TOTAL_LESSONS, CERT_MIN_KNOWN_WORDS } from "@/lib/certificate";
import CertificateCard from "@/components/CertificateCard";
import CertificateClaim from "@/components/CertificateClaim";
import Mascot from "@/components/Mascot";
import { Award, BookOpen, CheckCircle2, Circle, Library } from "lucide-react";

export const metadata = {
  title: "A1 Certificate",
  description: "A1 কোর্স শেষ করলে তোমার সার্টিফিকেট — যাচাইকরণ কোডসহ।",
};

// Phase 5 — A1 Certificate (auth required).
// States: has certificate → show it; eligible → claim button;
// otherwise → progress checklist of what's left.
export default async function CertificatePage() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/certificate");
  }
  const userId = session.user.id;
  const prisma = getPrisma();

  const [progress, existing] = prisma
    ? await Promise.all([
        prisma.userProgress.findUnique({ where: { userId } }),
        prisma.certificate.findFirst({ where: { userId } }),
      ])
    : [null, null];

  const lessonsDone = Array.isArray(progress?.lessonsDone) ? progress.lessonsDone.length : 0;
  const knownWords = Array.isArray(progress?.knownWords) ? progress.knownWords.length : 0;
  const quizDone =
    (progress?.quizBestScores ? Object.keys(progress.quizBestScores as object).length : 0) > 0 ||
    (progress?.quizBest ? Object.keys(progress.quizBest as object).length : 0) > 0;
  const { eligible } = checkCertificateEligibility({
    lessonsDone: progress?.lessonsDone ?? [],
    knownWords: progress?.knownWords ?? [],
    quizBest: progress?.quizBest ?? {},
    quizBestScores: progress?.quizBestScores ?? {},
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-bangla text-sm font-semibold text-teal">A1 · কোর্স সম্পন্ন</p>
        <h1 className="section-heading inline-flex items-center gap-2 text-3xl">
          <Award className="h-7 w-7 text-sun" aria-hidden /> A1 Certificate
        </h1>
        <p className="font-bangla mt-1 text-sm text-mist">
          ১২-টি লেসন + ১০০-টি শব্দ + ১-টি কুইজ শেষ করলেই সার্টিফিকেট তোমার।
        </p>
      </div>

      {!prisma ? (
        <div className="card rounded-3xl bg-white p-8 text-center">
          <Mascot mood="sleepy" size={72} />
          <p className="font-bangla mt-2 font-bold text-navy">Certificate এখনো সেটআপ হয়নি</p>
          <p className="font-bangla mt-1 text-sm text-mist">ডেটাবেস কানেকশন পাওয়া যাচ্ছে না।</p>
        </div>
      ) : existing ? (
        <CertificateCard
          cert={{
            code: existing.code,
            name: existing.name,
            issuedAt: existing.issuedAt.toISOString(),
            criteria: (existing.criteria as { lessonsDone?: number; knownWords?: number; xp?: number; level?: number }) ?? {},
          }}
        />
      ) : eligible ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
          <Mascot mood="celebrate" size={96} animate />
          <h2 className="font-bangla text-xl font-extrabold text-navy">অভিনন্দন! তুমি যোগ্য! 🎉</h2>
          <p className="font-bangla max-w-md text-sm text-mist">
            সব শর্ত পূরণ হয়েছে — এখন সার্টিফিকেট নিয়ে নাও। একবার ইস্যু হলে আর বদলাবে না।
          </p>
          <CertificateClaim />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="card flex items-center gap-3 rounded-3xl bg-white p-5">
            <BookOpen className="h-6 w-6 shrink-0 text-teal" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-bangla text-sm font-bold text-navy">
                লেসন: {lessonsDone} / {CERT_TOTAL_LESSONS}
              </p>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal"
                  style={{ width: `${Math.min(100, (lessonsDone / CERT_TOTAL_LESSONS) * 100)}%` }}
                />
              </div>
            </div>
            {lessonsDone >= CERT_TOTAL_LESSONS ? (
              <CheckCircle2 className="h-6 w-6 shrink-0 text-teal" aria-hidden />
            ) : (
              <Circle className="h-6 w-6 shrink-0 text-mist" aria-hidden />
            )}
          </div>
          <div className="card flex items-center gap-3 rounded-3xl bg-white p-5">
            <Library className="h-6 w-6 shrink-0 text-teal" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-bangla text-sm font-bold text-navy">
                শব্দ: {knownWords} / {CERT_MIN_KNOWN_WORDS}
              </p>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal"
                  style={{ width: `${Math.min(100, (knownWords / CERT_MIN_KNOWN_WORDS) * 100)}%` }}
                />
              </div>
            </div>
            {knownWords >= CERT_MIN_KNOWN_WORDS ? (
              <CheckCircle2 className="h-6 w-6 shrink-0 text-teal" aria-hidden />
            ) : (
              <Circle className="h-6 w-6 shrink-0 text-mist" aria-hidden />
            )}
          </div>
          <div className="card flex items-center gap-3 rounded-3xl bg-white p-5">
            <Award className="h-6 w-6 shrink-0 text-teal" aria-hidden />
            <p className="font-bangla flex-1 text-sm font-bold text-navy">
              কুইজ: {quizDone ? "শেষ হয়েছে" : "এখনো বাকি"}
            </p>
            {quizDone ? (
              <CheckCircle2 className="h-6 w-6 shrink-0 text-teal" aria-hidden />
            ) : (
              <Circle className="h-6 w-6 shrink-0 text-mist" aria-hidden />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
