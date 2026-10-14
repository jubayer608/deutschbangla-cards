import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz — নিজেকে যাচাই করো",
  description: "German শব্দভাণ্ডার ও ব্যাকরণ কুইজ — সহজ/মাঝারি/কঠিন level, XP আর ভুল রিভিউ মোড সহ।",
  openGraph: {
    title: "Quiz — নিজেকে যাচাই করো",
    description: "German শব্দভাণ্ডার ও ব্যাকরণ কুইজ — সহজ/মাঝারি/কঠিন level, XP আর ভুল রিভিউ মোড সহ।",
  },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
