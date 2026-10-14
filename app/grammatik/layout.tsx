import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grammatik — ব্যাকরণ",
  description: "A1 German ব্যাকরণ বাংলায়: Artikel, verb conjugation, Satzbau, Akkusativ/Dativ, Modalverben — table আর উদাহরণ সহ।",
  openGraph: {
    title: "Grammatik — ব্যাকরণ",
    description: "A1 German ব্যাকরণ বাংলায়: Artikel, verb conjugation, Satzbau, Akkusativ/Dativ, Modalverben — table আর উদাহরণ সহ।",
  },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
