import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fortschritt — অগ্রগতি",
  description: "তোমার German শেখার অগ্রগতি: XP level, streak, weekly activity আর category-wise mastery।",
  openGraph: {
    title: "Fortschritt — অগ্রগতি",
    description: "তোমার German শেখার অগ্রগতি: XP level, streak, weekly activity আর category-wise mastery।",
  },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
