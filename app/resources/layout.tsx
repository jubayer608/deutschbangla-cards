import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources — রিসোর্স",
  description: "German শেখার সেরা free রিসোর্স: Easy German, DW Nicos Weg, Goethe-Institut, Anki, dictionary আর listening — এক জায়গায়।",
  openGraph: {
    title: "Resources — রিসোর্স",
    description: "German শেখার সেরা free রিসোর্স: Easy German, DW Nicos Weg, Goethe-Institut, Anki, dictionary আর listening — এক জায়গায়।",
  },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
