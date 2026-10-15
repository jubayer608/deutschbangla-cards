import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { toPublicProfile } from "@/lib/profile";

// Phase 1 — the signed-in user's own full profile (incl. settings).
// GET /api/profile/me → { profile, settings } | { error }.

export async function GET() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      progress: true,
      badges: true,
      settings: true,
    },
  });
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const profile = toPublicProfile(
    {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      progress: user.progress,
      badges: user.badges,
      settings: user.settings,
    },
    session.user.id,
  );

  return NextResponse.json({
    profile,
    settings: user.settings
      ? {
          dailyGoalXp: user.settings.dailyGoalXp,
          reminderTime: user.settings.reminderTime,
          difficulty: user.settings.difficulty,
          privacy: user.settings.privacy,
        }
      : null,
  });
}
