-- Phase 5 (SM-2 Spaced Repetition) — WordReview table for per-word review state.
-- Apply with: npx prisma migrate deploy   (or: npx prisma db push)
-- Generated with: prisma migrate diff --from-schema-datamodel <0005 schema> --to-schema-datamodel <new schema> --script

-- CreateTable
CREATE TABLE "WordReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "intervalDays" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastQuality" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WordReview_userId_wordId_key" ON "WordReview"("userId", "wordId");

-- CreateIndex
CREATE INDEX "WordReview_userId_idx" ON "WordReview"("userId");

-- CreateIndex
CREATE INDEX "WordReview_nextReviewAt_idx" ON "WordReview"("nextReviewAt");

-- AddForeignKey
ALTER TABLE "WordReview" ADD CONSTRAINT "WordReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
