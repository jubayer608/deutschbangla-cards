import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { canViewProfile, toPublicProfile } from "@/lib/profile";

// Phase 1 — public profile lookup (privacy-respecting).
// GET /api/profile/[username] → { profile } | { private: true } | { error }.

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const session = await auth().catch(() => null);
  const viewerId = session?.user?.id ?? null;
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      progress: true,
      badges: true,
      settings: true,
    },
  });
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const privacy = user.settings?.privacy ?? "public";
  const allowed = await canViewProfile(prisma, user.id, viewerId, privacy);
  if (!allowed) return NextResponse.json({ private: true });

  return NextResponse.json({
    profile: toPublicProfile(
      {
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        progress: user.progress,
        badges: user.badges,
        settings: user.settings,
      },
      viewerId,
    ),
  });
}
