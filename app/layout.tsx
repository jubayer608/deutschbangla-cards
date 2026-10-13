import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import Navbar from "@/components/Navbar";
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
  title: "DeutschBangla Cards | German Flashcards for Bangla Speakers",
  description:
    "Learn A1-level German vocabulary with flashcards and quizzes — meanings and examples in Bangla. Built with Next.js.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bengali.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-gradient-to-b from-indigo-50 via-white to-amber-50">
        <Navbar />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
        <footer className="pb-6 text-center text-xs text-slate-400">
          DeutschBangla Cards 🇩🇪🇧🇩 — Viel Erfolg beim Lernen!
        </footer>
      </body>
    </html>
  );
}
