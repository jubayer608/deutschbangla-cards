-- Phase 5 (Streak Freeze) — freeze balance + milestone tracker on UserProgress.
-- Apply with: npx prisma migrate deploy   (or: npx prisma db push)
-- Generated with: prisma migrate diff --from-schema-datamodel <0006 schema> --to-schema-datamodel <new schema> --script

-- AlterTable
ALTER TABLE "UserProgress" ADD COLUMN "streakFreezes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserProgress" ADD COLUMN "lastFreezeMilestone" INTEGER NOT NULL DEFAULT 0;
