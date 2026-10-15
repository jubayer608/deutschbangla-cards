import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import Mascot from "@/components/Mascot";
import { BadgeCheck, ShieldX } from "lucide-react";

export const metadata = {
  title: "সার্টিফিকেট যাচাই",
  description: "Ulluk A1 সার্টিফিকেট যাচাইকরণ কোড দিয়ে যাচাই করো।",
};

// Phase 5 — public certificate verification (NO auth).
// Shows only: holder name + issued date + criteria summary.
// Never shows email, userId, or any other user data.
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string | string[] }>;
}) {
  const { code } = await searchParams;
  const codeStr = Array.isArray(code) ? code[0] : code;
  const prisma = getPrisma();
  const cert =
    prisma && codeStr
      ? await prisma.certificate.findUnique({ where: { code: codeStr.toUpperCase().trim() } })
      : null;
  const criteria = (cert?.criteria as { lessonsDone?: number; knownWords?: number; level?: number }) ?? {};
  const issued = cert
    ? cert.issuedAt.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <Mascot mood={cert ? "celebrate" : "sleepy"} size={96} animate />
      {cert ? (
        <>
          <p className="font-bangla inline-flex items-center gap-2 rounded-full bg-teal/10 px-4 py-1.5 text-sm font-extrabold text-teal">
            <BadgeCheck className="h-4 w-4" aria-hidden /> সার্টিফিকেটটি বৈধ
          </p>
          <h1 className="text-2xl font-extrabold text-navy">{cert.name}</h1>
          <p className="font-bangla max-w-md text-sm text-mist">
            Ulluk থেকে German A1 কোর্স সম্পন্ন করেছে — {criteria.lessonsDone ?? 0}-টি লেসন,{" "}
            {criteria.knownWords ?? 0}-টি শব্দ। ইস্যু: {issued} · কোড: {cert.code}
          </p>
        </>
      ) : (
        <>
          <p className="font-bangla inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-sm font-extrabold text-rose-800">
            <ShieldX className="h-4 w-4" aria-hidden /> সার্টিফিকেট পাওয়া যায়নি
          </p>
          <h1 className="text-2xl font-extrabold text-navy">এই কোডে কোনো সার্টিফিকেট নেই</h1>
          <p className="font-bangla max-w-md text-sm text-mist">
            কোডটি ঠিক আছে কিনা মিলিয়ে দেখো (যেমন: ULLUK-XXXX-XXXX)।
          </p>
        </>
      )}
      <Link
        href="/"
        className="font-bangla rounded-full bg-navy px-5 py-2.5 text-sm font-extrabold text-white shadow transition active:scale-95"
      >
        হোমে ফিরে যাও
      </Link>
    </div>
  );
}
