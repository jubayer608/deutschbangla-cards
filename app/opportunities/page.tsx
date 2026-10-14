import type { Metadata } from "next";
import OpportunitiesClient from "@/components/opportunities/OpportunitiesClient";

export const metadata: Metadata = {
  title: "জার্মানিতে সুযোগ | Ausbildung, FSJ, Chancenkarte — Chancen durch Deutsch",
  description:
    "জার্মান শিখে বাংলাদেশ থেকে জার্মানিতে Ausbildung, FSJ/BFD, বিশ্ববিদ্যালয়, Chancenkarte আর নার্সিং — শূন্য থেকে জার্মানি পৌঁছানোর পূর্ণাঙ্গ রোডম্যাপ, খরচ ও আবেদন চেকলিস্ট।",
  keywords: [
    "জার্মানি",
    "জার্মান ভাষা",
    "Ausbildung",
    "FSJ",
    "BFD",
    "Chancenkarte",
    "জার্মানি ভিসা",
    "Bangladesh to Germany",
    "জার্মানিতে কাজ",
  ],
  alternates: {
    canonical: "https://deutschbangla-cards.vercel.app/opportunities",
  },
  openGraph: {
    title: "জার্মানিতে সুযোগ — Ausbildung থেকে Chancenkarte পর্যন্ত",
    description:
      "Ausbildung, FSJ/BFD, বিশ্ববিদ্যালয়, Chancenkarte, নার্সিং — শূন্য থেকে জার্মানি পৌঁছানোর পূর্ণাঙ্গ রোডম্যাপ।",
    type: "website",
    url: "https://deutschbangla-cards.vercel.app/opportunities",
  },
};

export default function OpportunitiesPage() {
  return <OpportunitiesClient />;
}
