import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Goethe A1 পরীক্ষা — Start Deutsch 1 | Ulluk",
  description:
    "Goethe-Zertifikat A1: Start Deutsch 1 পরীক্ষার ফরম্যাট — Hören, Lesen, Schreiben, Sprechen-এর সময়, নম্বর ও পাস মার্ক, পরীক্ষার দিনের প্রস্তুতি, ৪ সপ্তাহের প্ল্যান আর বৈধ বইয়ের তালিকা।",
  keywords: [
    "Goethe A1",
    "Goethe-Zertifikat A1",
    "Start Deutsch 1",
    "Goethe exam",
    "A1 exam format",
    "জার্মান A1 পরীক্ষা",
  ],
  alternates: {
    canonical: "https://deutschbangla-cards.vercel.app/goethe-a1",
  },
  openGraph: {
    title: "Goethe A1 পরীক্ষা — Start Deutsch 1 | Ulluk",
    description:
      "৪টা মডিউল, সময়, নম্বর, পাস মার্ক, পরীক্ষার দিনের করণীয়, ৪ সপ্তাহের প্রস্তুতি আর বৈধ বই — এক পেজে।",
    type: "website",
    url: "https://deutschbangla-cards.vercel.app/goethe-a1",
  },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
