/** Tasteful confetti bursts (indigo / violet / amber). Plain module — no "use client" needed. */

const COLORS = ["#6366f1", "#8b5cf6", "#f59e0b", "#ffffff"];

/** Two-burst celebration for small wins (quiz round finished, word mastered). */
export async function celebrate(): Promise<void> {
  if (typeof window === "undefined") return;
  const { default: confetti } = await import("canvas-confetti");
  const base = { colors: COLORS, disableForReducedMotion: true as const };

  confetti({
    ...base,
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
  });

  window.setTimeout(() => {
    confetti({ ...base, particleCount: 50, angle: 60, spread: 60, origin: { x: 0 } });
    confetti({ ...base, particleCount: 50, angle: 120, spread: 60, origin: { x: 1 } });
  }, 200);
}

/** Larger multi-burst celebration for big milestones (lesson complete, new best). */
export async function bigCelebration(): Promise<void> {
  if (typeof window === "undefined") return;
  const { default: confetti } = await import("canvas-confetti");
  const base = { colors: COLORS, disableForReducedMotion: true as const };

  confetti({
    ...base,
    particleCount: 120,
    spread: 100,
    origin: { y: 0.6 },
  });

  const end = Date.now() + 1200;
  const frame = () => {
    confetti({ ...base, particleCount: 4, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ ...base, particleCount: 4, angle: 120, spread: 55, origin: { x: 1 } });
    if (Date.now() < end) {
      window.requestAnimationFrame(frame);
    }
  };
  window.requestAnimationFrame(frame);
}
