// Community Chat — ChatPresence table (heartbeat presence for the
// "X jon online" counter). One row per user, userId is the PK.
// Apply with: npx prisma migrate deploy   (or: npx prisma db push)
// Generated with: prisma migrate diff --from-schema-datamodel <0010 schema> --to-schema-datamodel <new schema> --script

-- CreateTable
CREATE TABLE "ChatPresence" (
    "userId" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatPresence_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "ChatPresence_lastSeenAt_idx" ON "ChatPresence"("lastSeenAt");

-- AddForeignKey
ALTER TABLE "ChatPresence" ADD CONSTRAINT "ChatPresence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
