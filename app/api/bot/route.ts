import { NextRequest, NextResponse } from "next/server";
import { ground } from "@/lib/bot-corpus";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";

/**
 * Ulluk Helping Bot — POST /api/bot
 *
 * RAG: keyword-match the question against the site's own curriculum
 * (lessons / words / grammar / phrases via lib/bot-corpus.ts) and inject
 * the best snippets into the prompt, so the bot teaches from ULLUK's
 * content first. Returns { answer, sources }.
 *
 * Server-only route. The Gemini API key lives ONLY in
 * process.env.GEMINI_API_KEY (Vercel env var) — it is never sent to the
 * client, never logged, never committed. Provider error bodies are
 * never forwarded: any upstream failure becomes a generic Bangla reply.
 *
 * No auth (the bot helps guests too), but rate-limited per IP + a
 * per-instance daily cap so one user can't burn the free-tier quota.
 */

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

const SYSTEM_PROMPT = `তুমি Ulluk — ULLUK ওয়েবসাইটের বন্ধুত্বপূর্ণ পেঁচা টিউটর। ULLUK হলো বাংলা-ভাষীদের জন্য জার্মান A1 শেখার সাইট।

নিয়ম:
- উত্তর দাও বাংলায় (বাংলাদেশের বাংলা)। জার্মান শব্দ/উদাহরণ জার্মান ভাষায় লিখে বাংলা অনুবাদ দাও।
- উত্তর ছোট রাখো (সর্বোচ্চ ~১৫০ শব্দ), উষ্ণ ও উৎসাহদায়ক হও, সঠিক তথ্য দাও।
- ইমোজি ব্যবহার করো না।
- নিচের "সাইটের কনটেন্ট" স্নিপেটগুলো সাইটের নিজের পাঠ্যক্রম থেকে নেওয়া — এগুলোকে সাধারণ জ্ঞানের উপরে প্রাধান্য দাও। স্নিপেটে যা নেই, তা বানিয়ে বলো না।
- জার্মান শেখার বাইরের প্রশ্ন (গণিত, কোডিং, রাজনীতি, সাধারণ জ্ঞান ইত্যাদি) এলে ভদ্রভাবে বলো তুমি শুধু জার্মান শেখাতে সাহায্য করো, আর জার্মান শেখার দিকে ফিরিয়ে আনো।
- কিছু না জানলে সৎভাবে বলো, আর সংশ্লিষ্ট লেসন/কুইজ পেজ দেখতে বলো।`;

const NO_KEY_REPLY =
  "Ulluk Bot এখনো কানেক্ট করা হয়নি — একটু পরে আবার চেষ্টা করো। ততক্ষণে লেসন বা কুইজ থেকে শিখে নিতে পারো!";
const LIMITED_REPLY =
  "একটু বেশি প্রশ্ন হয়ে যাচ্ছে — ১ মিনিট পরে আবার চেষ্টা করো।";
const QUOTA_REPLY =
  "আজকের জন্য প্রশ্নের কোটা শেষের দিকে — একটু পরে আবার চেষ্টা করো।";
const ERROR_REPLY =
  "দুঃখিত, এখন উত্তর দিতে পারছি না — একটু পরে আবার চেষ্টা করো।";

// Per-IP: 10 requests / minute (shared lib/ratelimit.ts).
const PER_MINUTE_LIMIT = 10;
// Per-instance daily cap: ~200 Gemini calls / day (approximate — each
// serverless instance counts separately; good enough to protect the
// free-tier quota without a DB round-trip).
const DAILY_CAP = 200;
let dailyCount = 0;
let dailyDay = "";

function dailyCapHit(): boolean {
  const day = new Date().toISOString().slice(0, 10); // UTC date
  if (day !== dailyDay) {
    dailyDay = day;
    dailyCount = 0;
  }
  if (dailyCount >= DAILY_CAP) return true;
  dailyCount += 1;
  return false;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { message, history } = body as {
    message?: unknown;
    history?: unknown;
  };

  if (
    typeof message !== "string" ||
    message.trim().length === 0 ||
    message.trim().length > 500
  ) {
    return NextResponse.json(
      { error: "Message must be a string of 1–500 characters." },
      { status: 400 },
    );
  }

  // History: last 6 turns max, validated lightly. Client sends {role, text}
  // with role "user" | "bot"; Gemini wants "user" | "model".
  const cleanHistory: { role: "user" | "model"; text: string }[] = [];
  if (Array.isArray(history)) {
    for (const h of history.slice(-6)) {
      if (
        h &&
        typeof h === "object" &&
        typeof (h as { text?: unknown }).text === "string" &&
        ((h as { role?: unknown }).role === "user" ||
          (h as { role?: unknown }).role === "bot")
      ) {
        cleanHistory.push({
          role: (h as { role: string }).role === "bot" ? "model" : "user",
          text: ((h as { text: string }).text ?? "").slice(0, 500),
        });
      }
    }
  }

  const ip = clientIp(req);
  if (!checkRateLimit(`bot:${ip}`, PER_MINUTE_LIMIT, 60_000)) {
    return NextResponse.json({ answer: LIMITED_REPLY, sources: [], limited: true });
  }
  if (dailyCapHit()) {
    return NextResponse.json({ answer: QUOTA_REPLY, sources: [], limited: true });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Bot not connected yet — friendly reply, never a crash, never a scary error.
    return NextResponse.json({ answer: NO_KEY_REPLY, sources: [], configured: false });
  }

  const { context, sources } = ground(message.trim());
  const system = context.length
    ? `${SYSTEM_PROMPT}\n\nসাইটের কনটেন্ট (এই তথ্য থেকে উত্তর দাও):\n${context
        .map((c) => `- ${c}`)
        .join("\n")}`
    : SYSTEM_PROMPT;

  const contents = [
    ...cleanHistory.map((h) => ({
      role: h.role,
      parts: [{ text: h.text }],
    })),
    { role: "user" as const, parts: [{ text: message.trim() }] },
  ];

  let res: Response;
  try {
    res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
      }),
    });
  } catch {
    return NextResponse.json({ answer: ERROR_REPLY, sources: [], error: true });
  }

  if (!res.ok) {
    // Never forward the provider error body (it may leak details).
    // 400/401/403 = bad/invalid key → same friendly "unavailable" reply.
    if (res.status === 429) {
      return NextResponse.json({ answer: QUOTA_REPLY, sources: [], limited: true });
    }
    return NextResponse.json({ answer: ERROR_REPLY, sources: [], error: true });
  }

  const data = await res.json();
  const answer: string =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim() ?? "";

  if (!answer) {
    return NextResponse.json(
      {
        answer:
          "হুম, উত্তরটা ঠিকমতো আসেনি — প্রশ্নটা আরেকটু অন্যভাবে করো তো?",
        sources: [],
        error: true,
      },
      { status: 200 },
    );
  }

  return NextResponse.json({ answer, sources });
}
