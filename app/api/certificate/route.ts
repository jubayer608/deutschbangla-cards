import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import {
  checkCertificateEligibility,
  generateCertificateCode,
} from "@/lib/certificate";

// Phase 5 — A1 Certificate.
//
// GET  /api/certificate
//   → { eligible, missing, certificate: { code, name, issuedAt, criteria } | null }
// POST /api/certificate
//   → issues the certificate when eligible. Idempotent: returns the
//   existing certificate if one was already issued. Not eligible →
//   400 { eligible: false, missing }.

function toPublic(cert: {
  code: string;
  name: string;
  issuedAt: Date;
  criteria: unknown;
}) {
  return {
    code: cert.code,
    name: cert.name,
    issuedAt: cert.issuedAt.toISOString(),
    criteria: cert.criteria,
  };
}

export async function GET() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const [progress, existing] = await Promise.all([
    prisma.userProgress.findUnique({ where: { userId: session.user.id } }),
    prisma.certificate.findFirst({ where: { userId: session.user.id } }),
  ]);

  const { eligible, missing } = checkCertificateEligibility({
    lessonsDone: progress?.lessonsDone ?? [],
    knownWords: progress?.knownWords ?? [],
    quizBest: progress?.quizBest ?? {},
    quizBestScores: progress?.quizBestScores ?? {},
  });

  return NextResponse.json({
    eligible,
    missing,
    certificate: existing ? toPublic(existing) : null,
  });
}

export async function POST() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const existing = await prisma.certificate.findFirst({ where: { userId } });
  if (existing) {
    return NextResponse.json({ certificate: toPublic(existing), alreadyIssued: true });
  }

  const progress = await prisma.userProgress.findUnique({ where: { userId } });
  const { eligible, missing } = checkCertificateEligibility({
    lessonsDone: progress?.lessonsDone ?? [],
    knownWords: progress?.knownWords ?? [],
    quizBest: progress?.quizBest ?? {},
    quizBestScores: progress?.quizBestScores ?? {},
  });
  if (!eligible) {
    return NextResponse.json({ eligible: false, missing }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const name = user?.name ?? user?.username ?? "Ulluk Learner";
  const lessonsDone = Array.isArray(progress?.lessonsDone) ? progress.lessonsDone.length : 0;
  const knownWords = Array.isArray(progress?.knownWords) ? progress.knownWords.length : 0;
  const criteria = {
    lessonsDone,
    knownWords,
    quizCompleted: true,
    xp: progress?.xp ?? 0,
    level: progress?.level ?? 1,
  };

  // Code uniqueness: retry on the (rare) collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const cert = await prisma.certificate.create({
        data: { userId, code: generateCertificateCode(), name, criteria },
      });
      return NextResponse.json({ certificate: toPublic(cert), alreadyIssued: false });
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code !== "P2002") throw e; // unique violation → retry with a fresh code
    }
  }
  return NextResponse.json({ error: "issue_failed" }, { status: 500 });
}
