import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
});

export const metadata: Metadata = {
  title: "DeutschBangla Cards | বাংলায় A1 German শেখো",
  description:
    "Bangla-speaker-দের জন্য A1 German: 12টি পাঠ, 192টি শব্দ, ব্যাকরণ, কুইজ, রিসোর্স আর ব্লগ — flashcards দিয়ে মজায় শেখো।",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} ${bengali.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-gradient-to-b from-emerald-50 via-white to-amber-50">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-28 lg:pb-10">
          <Suspense fallback={null}>{children}</Suspense>
        </main>
        <Footer />
      </body>
    </html>
  );
}
