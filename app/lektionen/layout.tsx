import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lektionen — A1 পাঠ",
  description: "Alphabet থেকে Reisen পর্যন্ত 12টি structured A1 German পাঠ — প্রতিটিতে শব্দভাণ্ডার, ব্যাকরণ (বাংলায়) আর easy→hard অনুশীলন।",
  openGraph: {
    title: "Lektionen — A1 পাঠ",
    description: "Alphabet থেকে Reisen পর্যন্ত 12টি structured A1 German পাঠ — প্রতিটিতে শব্দভাণ্ডার, ব্যাকরণ (বাংলায়) আর easy→hard অনুশীলন।",
  },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
