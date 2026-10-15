// Phase 4 — Bangla email templates (HTML + plain text) for Resend.
//
// All copy in Bangla (familiar tone). No emojis in the HTML design —
// email clients render them inconsistently; the layout uses Ulluk brand
// colours (navy #0B1F3B, teal #10B981) + plain text styling instead.
// Every template ends with a footer carrying an unsubscribe link.

import { siteUrl, unsubscribeToken, type MailKind } from "./mail";

export interface MailTemplate {
  subject: string;
  html: string;
  text: string;
}

const NAVY = "#0B1F3B";
const TEAL = "#10B981";
const MIST = "#64748B";

/** Shared HTML shell: navy header, white body, footer with unsubscribe. */
function layout(opts: {
  title: string;
  preheader: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
  unsubscribeUrl: string | null;
}): string {
  const cta = opts.ctaLabel && opts.ctaHref
    ? `<p style="margin:28px 0 0;"><a href="${opts.ctaHref}" style="display:inline-block;background:${TEAL};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 24px;border-radius:999px;">${opts.ctaLabel}</a></p>`
    : "";
  const unsub = opts.unsubscribeUrl
    ? `<p style="margin:16px 0 0;font-size:12px;color:${MIST};">এই ধরনের ইমেইল আর পেতে না চাইলে <a href="${opts.unsubscribeUrl}" style="color:${MIST};text-decoration:underline;">এখানে ক্লিক করে আনসাবস্ক্রাইব করো</a>।</p>`
    : `<p style="margin:16px 0 0;font-size:12px;color:${MIST};">ইমেইল সেটিংস বদলাতে চাইলে <a href="${siteUrl()}/profile/settings" style="color:${MIST};text-decoration:underline;">সেটিংস পেজে</a> যাও।</p>`;
  return `<!doctype html>
<html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${opts.title}</title></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#0F172A;">
<div style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="background:${NAVY};padding:24px 28px;">
<span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">ULLUK</span>
<span style="font-size:13px;color:#94A3B8;"> &nbsp;·&nbsp; বাংলায় জার্মান শেখো</span>
</td></tr>
<tr><td style="padding:28px;">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.35;color:${NAVY};">${opts.title}</h1>
${opts.bodyHtml}
${cta}
</td></tr>
<tr><td style="padding:20px 28px;border-top:1px solid #E2E8F0;">
<p style="margin:0;font-size:12px;color:${MIST};">Ulluk — Learn German. Stay Weird.</p>
${unsub}
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">${text}</p>`;
}

function statRow(label: string, value: string): string {
  return `<tr><td style="padding:8px 0;font-size:14px;color:${MIST};">${label}</td><td style="padding:8px 0;font-size:15px;font-weight:700;color:${NAVY};text-align:right;">${value}</td></tr>`;
}

/** Unsubscribe URL for a user+kind, or null when AUTH_SECRET is unset. */
function unsubUrl(userId: string, kind: MailKind | "all"): string | null {
  const token = unsubscribeToken(userId, kind);
  if (!token) return null;
  return `${siteUrl()}/mail/unsubscribe?user=${encodeURIComponent(userId)}&kind=${kind}&token=${token}`;
}

function textFooter(unsubscribeUrl: string | null): string {
  if (unsubscribeUrl) {
    return `\n\n---\nUlluk — Learn German. Stay Weird.\nএই ধরনের ইমেইল আর পেতে না চাইলে আনসাবস্ক্রাইব করো: ${unsubscribeUrl}`;
  }
  return `\n\n---\nUlluk — Learn German. Stay Weird.\nইমেইল সেটিংস: ${siteUrl()}/profile/settings`;
}

// ── 1. Welcome (once ever, on first progress sync) ────────────────────────

export function welcomeTemplate(opts: {
  name: string | null;
  userId: string;
}): MailTemplate {
  const name = opts.name ?? "বন্ধু";
  const unsub = unsubUrl(opts.userId, "all");
  const subject = "Ulluk-এ স্বাগতম!";
  const bodyHtml =
    p(`হ্যালো ${name}, Ulluk-এ স্বাগতম!`) +
    p(
      "তুমি এখন বাংলায় জার্মান শিখতে পারবে — শব্দ, পাঠ, কুইজ, ব্যাজ আর লিডারবোর্ড নিয়ে। তোমার আগের প্রগ্রেস (যদি থাকে) ইতিমধ্যে তোমার অ্যাকাউন্টে চলে এসেছে।",
    ) +
    p(
      "শুরু করতে একটা ছোট পাঠ শেষ করো বা কুইজ খেলো। প্রতিদিন একটু একটু করে পড়লেই স্ট্রিক গড়ে উঠবে।",
    );
  return {
    subject,
    html: layout({
      title: "Ulluk-এ স্বাগতম!",
      preheader: "বাংলায় জার্মান শেখা শুরু করো — তোমার প্রগ্রেস সেভ হয়ে গেছে।",
      bodyHtml,
      ctaLabel: "পড়াশোনা শুরু করো",
      ctaHref: `${siteUrl()}/lektionen`,
      unsubscribeUrl: unsub,
    }),
    text: `হ্যালো ${name}, Ulluk-এ স্বাগতম!\n\nতুমি এখন বাংলায় জার্মান শিখতে পারবে — শব্দ, পাঠ, কুইজ, ব্যাজ আর লিডারবোর্ড নিয়ে। তোমার আগের প্রগ্রেস (যদি থাকে) ইতিমধ্যে তোমার অ্যাকাউন্টে চলে এসেছে।\n\nশুরু করতে: ${siteUrl()}/lektionen${textFooter(unsub)}`,
  };
}

// ── 2. Weekly report (cron, Mondays) ──────────────────────────────────────

export function weeklyTemplate(opts: {
  name: string | null;
  userId: string;
  weekXp: number;
  activeDays: number;
  streak: number;
  lessonsDoneTotal: number;
  nextBadgeBangla: string | null;
  nextBadgeProgress: string | null;
}): MailTemplate {
  const unsub = unsubUrl(opts.userId, "weekly");
  const subject = `এই সপ্তাহে তুমি ${opts.weekXp} XP করেছো!`;
  const badgeLine =
    opts.nextBadgeBangla && opts.nextBadgeProgress
      ? p(`পরের ব্যাজ: <strong>${opts.nextBadgeBangla}</strong> — ${opts.nextBadgeProgress}`)
      : p("পরের ব্যাজের দিকে এগিয়ে যাও — প্রতিদিন একটু করে পড়লেই হবে।");
  const bodyHtml =
    p(`হ্যালো ${opts.name ?? "বন্ধু"}, গত সপ্তাহের তোমার রিপোর্ট:`) +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E2E8F0;border-bottom:1px solid #E2E8F0;margin:4px 0 16px;">` +
    statRow("এই সপ্তাহের XP", `${opts.weekXp} XP`) +
    statRow("সক্রিয় দিন", `${opts.activeDays} / ৭ দিন`) +
    statRow("বর্তমান স্ট্রিক", `${opts.streak} দিন`) +
    statRow("মোট শেষ করা পাঠ", `${opts.lessonsDoneTotal}টি`) +
    `</table>` +
    badgeLine;
  return {
    subject,
    html: layout({
      title: "তোমার সাপ্তাহিক রিপোর্ট",
      preheader: `এই সপ্তাহে ${opts.weekXp} XP, স্ট্রিক ${opts.streak} দিন।`,
      bodyHtml,
      ctaLabel: "এই সপ্তাহটা আরও ভালো করো",
      ctaHref: `${siteUrl()}/fortschritt`,
      unsubscribeUrl: unsub,
    }),
    text: `হ্যালো ${opts.name ?? "বন্ধু"}, গত সপ্তাহের তোমার রিপোর্ট:\n\n- এই সপ্তাহের XP: ${opts.weekXp} XP\n- সক্রিয় দিন: ${opts.activeDays} / ৭ দিন\n- বর্তমান স্ট্রিক: ${opts.streak} দিন\n- মোট শেষ করা পাঠ: ${opts.lessonsDoneTotal}টি\n${opts.nextBadgeBangla ? `- পরের ব্যাজ: ${opts.nextBadgeBangla} — ${opts.nextBadgeProgress ?? ""}\n` : ""}\nএই সপ্তাহটা আরও ভালো করো: ${siteUrl()}/fortschritt${textFooter(unsub)}`,
  };
}

// ── 3. Streak nudge (cron, daily evening) ─────────────────────────────────

export function streakTemplate(opts: {
  name: string | null;
  userId: string;
  streak: number;
}): MailTemplate {
  const unsub = unsubUrl(opts.userId, "streak");
  const subject = "তোমার স্ট্রিক হারাতে চলেছে!";
  const bodyHtml =
    p(`হ্যালো ${opts.name ?? "বন্ধু"},`) +
    p(
      `তোমার <strong>${opts.streak} দিনের স্ট্রিক</strong> আজ পড়াশোনা না করলে ভেঙে যাবে। একটা ছোট পাঠ বা এক রাউন্ড কুইজই যথেষ্ট — ৫ মিনিটও লাগবে না।`,
    ) +
    p("স্ট্রিক বাঁচাও, Ulluk-এর পেঁচাটা তোমার জন্য অপেক্ষা করছে।");
  return {
    subject,
    html: layout({
      title: "স্ট্রিক বাঁচাও!",
      preheader: `${opts.streak} দিনের স্ট্রিক — আজ একটু পড়লেই বেঁচে যাবে।`,
      bodyHtml,
      ctaLabel: "আজকের পাঠ শেষ করো",
      ctaHref: `${siteUrl()}/lektionen`,
      unsubscribeUrl: unsub,
    }),
    text: `হ্যালো ${opts.name ?? "বন্ধু"},\n\nতোমার ${opts.streak} দিনের স্ট্রিক আজ পড়াশোনা না করলে ভেঙে যাবে। একটা ছোট পাঠ বা এক রাউন্ড কুইজই যথেষ্ট — ৫ মিনিটও লাগবে না।\n\nস্ট্রিক বাঁচাও: ${siteUrl()}/lektionen${textFooter(unsub)}`,
  };
}

// ── 4. Word of the Day (cron, daily morning) ──────────────────────────────

export function wordOfDayTemplate(opts: {
  userId: string;
  german: string;
  bangla: string;
  categoryBangla: string;
  example: string;
  exampleBangla: string;
  dateLabel: string;
}): MailTemplate {
  const unsub = unsubUrl(opts.userId, "wordofday");
  const subject = `আজকের শব্দ: ${opts.german}`;
  const bodyHtml =
    p(`${opts.dateLabel} — আজকের জার্মান শব্দ:`) +
    `<p style="margin:8px 0 4px;font-size:32px;font-weight:800;color:${NAVY};">${opts.german}</p>` +
    `<p style="margin:0 0 4px;font-size:17px;font-weight:700;color:${TEAL};">${opts.bangla}</p>` +
    `<p style="margin:0 0 20px;font-size:13px;color:${MIST};">বিভাগ: ${opts.categoryBangla}</p>` +
    `<p style="margin:0 0 6px;font-size:15px;line-height:1.7;color:#334155;"><strong>উদাহরণ:</strong> ${opts.example}</p>` +
    p(`<strong>বাংলা:</strong> ${opts.exampleBangla}`);
  return {
    subject,
    html: layout({
      title: "আজকের শব্দ",
      preheader: `${opts.german} — ${opts.bangla}`,
      bodyHtml,
      ctaLabel: "আরও শব্দ শেখো",
      ctaHref: `${siteUrl()}/wortschatz`,
      unsubscribeUrl: unsub,
    }),
    text: `${opts.dateLabel} — আজকের জার্মান শব্দ:\n\n${opts.german}\n${opts.bangla}\nবিভাগ: ${opts.categoryBangla}\n\nউদাহরণ: ${opts.example}\nবাংলা: ${opts.exampleBangla}\n\nআরও শব্দ শেখো: ${siteUrl()}/wortschatz${textFooter(unsub)}`,
  };
}
