import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrisma } from "./lib/prisma";

// Phase 0 — Auth.js (NextAuth v5) config. Google provider only.
// - Prisma adapter when DATABASE_URL is set; without a DB the adapter is
//   omitted (NextAuth falls back to JWT sessions) so the app still builds
//   and renders — sign-in simply can't complete until setup is done.
// - Session strategy "database" with the adapter (Auth.js default with an
//   adapter, stated explicitly so the choice is visible).
// - AUTH_SECRET / GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET come from env
//   (see .env.example + SETUP.md). Missing values fail at sign-in time,
//   never at build time.
const prisma = getPrisma();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: prisma ? PrismaAdapter(prisma) : undefined,
  providers: [Google],
  session: { strategy: "database" },
});
