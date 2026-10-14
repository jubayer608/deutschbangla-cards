import { PrismaClient } from "@prisma/client";

// Phase 0: lazy Prisma singleton.
//
// - Returns null when DATABASE_URL is unset (local dev / pre-setup builds):
//   the app must degrade gracefully instead of crashing at import time.
// - In dev, the client is cached on globalThis so hot reloads don't leak
//   connections; in production the module is evaluated once per serverless
//   instance anyway.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}
