import { ImageResponse } from "next/og";
import { headers } from "next/headers";

// Phase 1 — shareable profile card (OG image, 1200×630).
// NOTE: with `cacheComponents` enabled, OG routes run in the edge runtime,
// so this file cannot use Prisma directly. It reads the public profile via
// the app's own /api/profile/[username] endpoint (host from the request
// headers, so it works in dev and production) and falls back to a generic
// branded card when the user or DB is unavailable. No external fonts.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ProfileOgImage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  let name: string | null = null;
  let level = 1;
  let xp = 0;
  let streak = 0;

  try {
    const host = (await headers()).get("host") ?? "deutschbangla-cards.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const res = await fetch(`${protocol}://${host}/api/profile/${encodeURIComponent(username)}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        profile?: { name?: string | null; level?: number; xp?: number; streak?: number };
      };
      if (data.profile) {
        name = data.profile.name ?? null;
        level = data.profile.level ?? 1;
        xp = data.profile.xp ?? 0;
        streak = data.profile.streak ?? 0;
      }
    }
  } catch {
    /* fall through to generic card */
  }

  const displayName = name ?? `@${username}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B1F3B",
          color: "#FFFFFF",
          padding: "56px 64px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            {(displayName || "U").slice(0, 1).toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1 }}>{displayName}</div>
            <div style={{ fontSize: 28, color: "#94A3B8" }}>@{username}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {[
            { label: "Level", value: String(level) },
            { label: "XP", value: String(xp) },
            { label: "Streak", value: `${streak} দিন` },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                flexDirection: "column",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 20,
                padding: "18px 28px",
              }}
            >
              <div style={{ fontSize: 40, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 22, color: "#94A3B8" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            ULLUK <span style={{ color: "#10B981" }}>· Learn German. Stay Weird.</span>
          </div>
          <div style={{ fontSize: 22, color: "#94A3B8" }}>বাংলায় জার্মান শেখো</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
