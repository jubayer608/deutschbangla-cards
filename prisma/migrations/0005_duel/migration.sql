-- Phase 5 (Quiz Duel) — Duel table for 1v1 duels.
-- Apply with: npx prisma migrate deploy   (or: npx prisma db push)
-- Generated with: prisma migrate diff --from-schema-datamodel <0004 schema> --to-schema-datamodel <new schema> --script

-- CreateTable
CREATE TABLE "Duel" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "opponentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "scores" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Duel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Duel_code_key" ON "Duel"("code");

-- CreateIndex
CREATE INDEX "Duel_creatorId_idx" ON "Duel"("creatorId");

-- CreateIndex
CREATE INDEX "Duel_opponentId_idx" ON "Duel"("opponentId");

-- CreateIndex
CREATE INDEX "Duel_status_idx" ON "Duel"("status");

-- AddForeignKey
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

