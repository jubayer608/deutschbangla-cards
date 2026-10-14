import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — German শেখার টিপস",
  description: "Bangla-speaker-দের জন্য German শেখার roadmap, der/die/das tricks, উচ্চারণ গাইড আর A1 পরীক্ষার প্রস্তুতি।",
  openGraph: {
    title: "Blog — German শেখার টিপস",
    description: "Bangla-speaker-দের জন্য German শেখার roadmap, der/die/das tricks, উচ্চারণ গাইড আর A1 পরীক্ষার প্রস্তুতি।",
  },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
