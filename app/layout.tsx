import type { Metadata, Viewport } from "next";
import BotChatLoader from "@/components/BotChatLoader";
import { Geist, Geist_Mono, Noto_Sans_Bengali, Nunito, Poppins } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgressSync from "@/components/ProgressSync";
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

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://deutschbangla-cards.vercel.app"),
  title: {
    default: "Ulluk | বাংলায় জার্মান শেখো",
    template: "%s | Ulluk",
  },
  description:
    "Bangla-speaker-দের জন্য A1 German: 12টি পাঠ, 192টি শব্দ, ব্যাকরণ, কুইজ, রিসোর্স আর ব্লগ — flashcards দিয়ে মজায় শেখো।",
  keywords: [
    "Ulluk",
    "German শেখো",
    "A1 German",
    "German for Bangla speakers",
    "Deutsch lernen",
    "German vocabulary",
    "German grammar Bangla",
    "বাংলায় জার্মান",
  ],
  openGraph: {
    title: "Ulluk | বাংলায় জার্মান শেখো",
    description:
      "Bangla-speaker-দের জন্য A1 German: পাঠ, শব্দভাণ্ডার, ব্যাকরণ, কুইজ আর ব্লগ — মজায় শেখো।",
    url: "https://deutschbangla-cards.vercel.app",
    siteName: "Ulluk",
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ulluk | বাংলায় জার্মান শেখো",
    description:
      "Bangla-speaker-দের জন্য A1 German: পাঠ, শব্দভাণ্ডার, ব্যাকরণ, কুইজ আর ব্লগ।",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1F3B",
};

import { Suspense } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Phase 0 — auth is fully configured only when all env vars are set.
  // Reading process.env here does NOT make the layout dynamic; the
  // session itself still loads client-side via SessionProvider.
  const authConfigured = Boolean(
    process.env.DATABASE_URL &&
      process.env.AUTH_SECRET &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET,
  );
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} ${bengali.variable} ${poppins.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="font-body flex min-h-full flex-col bg-gradient-to-b from-cream via-white to-cream">
        <SessionProvider>
          <Suspense fallback={null}>
            <Navbar authConfigured={authConfigured} />
          </Suspense>
          <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-28 lg:pb-10">
            <Suspense fallback={null}>{children}</Suspense>
          </main>
          <Footer />
          <ProgressSync />
          <BotChatLoader />
        </SessionProvider>
      </body>
    </html>
  );
}
