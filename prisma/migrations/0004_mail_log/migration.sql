-- Phase 4 (Mail via Resend) — MailLog table for send idempotency + audit.
-- Apply with: npx prisma migrate deploy   (or: npx prisma db push)
-- Generated with: prisma migrate diff --from-schema-datamodel <0003 schema> --to-schema-datamodel <new schema>

-- CreateTable
CREATE TABLE "MailLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "dedupKey" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" JSONB,

    CONSTRAINT "MailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MailLog_userId_kind_idx" ON "MailLog"("userId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "MailLog_userId_kind_dedupKey_key" ON "MailLog"("userId", "kind", "dedupKey");

-- AddForeignKey
ALTER TABLE "MailLog" ADD CONSTRAINT "MailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

