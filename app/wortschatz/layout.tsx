import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wortschatz — শব্দভাণ্ডার",
  description: "192টি A1 German শব্দ 14টি category-তে — swipe flashcard, search আর Redemittel phrases সহ বাংলা অর্থে শেখো।",
  openGraph: {
    title: "Wortschatz — শব্দভাণ্ডার",
    description: "192টি A1 German শব্দ 14টি category-তে — swipe flashcard, search আর Redemittel phrases সহ বাংলা অর্থে শেখো।",
  },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
