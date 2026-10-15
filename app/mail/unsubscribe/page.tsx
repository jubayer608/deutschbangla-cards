import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/mail";

// Phase 4 — one-click unsubscribe (link from an email, no login needed).
// GET /mail/unsubscribe?user=<id>&kind=<kind>&token=<hmac>
// The HMAC token (see lib/mail.ts) makes the link unforgeable. A valid
// token turns the matching EmailPreference toggle OFF (kind=all turns all
// four OFF). Invalid / missing params → an error state, nothing changed.

export const metadata = {
  title: "আনসাবস্ক্রাইব",
  description: "Ulluk ইমেইল থেকে আনসাবস্ক্রাইব করো।",
};

const KIND_LABELS: Record<string, string> = {
  welcome: "স্বাগতম ইমেইল",
  weekly: "সাপ্তাহিক রিপোর্ট",
  streak: "স্ট্রিক রিমাইন্ডার",
  wordofday: "আজকের শব্দ",
  all: "সব ধরনের ইমেইল",
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const userId = typeof params.user === "string" ? params.user : "";
  const kind = typeof params.kind === "string" ? params.kind : "";
  const token = typeof params.token === "string" ? params.token : "";

  const valid =
    userId.length > 0 &&
    kind in KIND_LABELS &&
    verifyUnsubscribeToken(userId, kind, token);

  if (!valid) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white p-6 text-center ring-1 ring-slate-200">
        <h1 className="font-bangla text-xl font-extrabold text-navy">
          লিংকটি সঠিক নয়
        </h1>
        <p className="font-bangla mt-2 text-sm text-mist">
          আনসাবস্ক্রাইব লিংকটি ভুল বা মেয়াদোত্তীর্ণ। ইমেইল সেটিংস থেকে
          সরাসরি বন্ধ করতে পারো।
        </p>
        <Link
          href="/profile/settings"
          className="font-bangla mt-5 inline-block rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white"
        >
          সেটিংসে যাও
        </Link>
      </div>
    );
  }

  const prisma = getPrisma();
  if (!prisma) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white p-6 text-center ring-1 ring-slate-200">
        <h1 className="font-bangla text-xl font-extrabold text-navy">
          এখন করা যাচ্ছে না
        </h1>
        <p className="font-bangla mt-2 text-sm text-mist">
          ডাটাবেস সংযোগ পাওয়া যাচ্ছে না। পরে আবার চেষ্টা করো।
        </p>
      </div>
    );
  }

  const off: Record<string, boolean> = {};
  if (kind === "all") {
    off.welcome = false;
    off.weeklyReport = false;
    off.streakNudge = false;
    off.wordOfDay = false;
  } else if (kind === "welcome") {
    off.welcome = false;
  } else if (kind === "weekly") {
    off.weeklyReport = false;
  } else if (kind === "streak") {
    off.streakNudge = false;
  } else if (kind === "wordofday") {
    off.wordOfDay = false;
  }
  await prisma.emailPreference.upsert({
    where: { userId },
    create: { userId, ...off },
    update: off,
  });

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-6 text-center ring-1 ring-slate-200">
      <h1 className="font-bangla text-xl font-extrabold text-navy">
        আনসাবস্ক্রাইব হয়ে গেছে
      </h1>
      <p className="font-bangla mt-2 text-sm text-mist">
        <strong>{KIND_LABELS[kind]}</strong> আর পাঠানো হবে না। চাইলে যেকোনো
        সময় সেটিংস থেকে আবার চালু করতে পারো।
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link
          href="/profile/settings"
          className="font-bangla inline-block rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white"
        >
          সেটিংসে যাও
        </Link>
        <Link
          href="/"
          className="font-bangla inline-block rounded-full bg-cream px-5 py-2.5 text-sm font-bold text-navy ring-1 ring-slate-200"
        >
          হোমে ফিরে যাও
        </Link>
      </div>
    </div>
  );
}
