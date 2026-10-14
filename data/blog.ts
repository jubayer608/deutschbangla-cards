export type BlogBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "tip"; title: string; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  cover: string;
  tags: string[];
  blocks: BlogBlock[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "a1-roadmap-3-maas",
    title: "৩ মাসে A1 German: Bangla-speaker-দের complete roadmap",
    excerpt:
      "শূন্য থেকে A1 — মাস ভিত্তিক প্ল্যান, কী কী শিখবে, কতটুকু সময় দেবে, আর কোন ভুলগুলো এড়িয়ে চলবে।",
    category: "রোডম্যাপ",
    date: "2026-10-10",
    cover: "from-emerald-500 to-teal-600",
    tags: ["A1", "Roadmap", "Beginner"],
    blocks: [
      {
        type: "paragraph",
        text: "German শেখা শুরু করতে চাও কিন্তু বুঝতে পারছ না কোথা থেকে শুরু করবে? এই রোডম্যাপটা **Bangla-speaker-দের জন্য** বানানো — প্রতিদিন ৩০–৪৫ মিনিট দিলে ৩ মাসে A1 শেষ করা সম্ভব।",
      },
      { type: "heading", text: "মাস ১: ভিত্তি (Woche 1–4)" },
      {
        type: "list",
        items: [
          "Alphabet আর উচ্চারণ — ä, ö, ü, ß, ch, sch, sp/st ঠিকমতো বলা",
          "Begrüßung: sich vorstellen — নাম, দেশ, পেশা, থাকার জায়গা বলা",
          "Zahlen 0–100, Uhrzeit, Tage/Wochen/Monate",
          "Artikel: der/die/das + Plural-এর বেসিক নিয়ম",
          "sein/haben + regular verb-এর Präsens conjugation",
          "প্রতিদিন ১০টা নতুন শব্দ (এই সাইটের Wortschatz দিয়ে!)",
        ],
      },
      { type: "heading", text: "মাস ২: বাক্য গঠন (Woche 5–8)" },
      {
        type: "list",
        items: [
          "Satzbau: Verb সবসময় 2nd position — Ich **lerne** Deutsch",
          "Akkusativ: wen/was প্রশ্ন — Ich habe **einen** Apfel",
          "Trennbare Verben: aufstehen, einkaufen, anrufen",
          "Modalverben: können, müssen, wollen",
          "Possessivartikel: mein/dein/sein…",
          "ছোট ছোট paragraph লেখা প্র্যাকটিস (৫–৬ বাক্য)",
        ],
      },
      { type: "heading", text: "মাস ৩: পরীক্ষা-প্রস্তুতি (Woche 9–12)" },
      {
        type: "list",
        items: [
          "Dativ-এর বেসিক: mit, bei, nach + dative pronouns",
          "Präpositionen: in, auf, an, vor, nach — সময় আর জায়গা",
          "Goethe A1 মডেল টেস্ট — সপ্তাহে ১টা full mock",
          "Sprechen: নিজের সম্পর্কে ১ মিনিট বলা, ছবি describe করা",
          "Hören: DW Langsam gesprochene Nachrichten প্রতিদিন ১০ মিনিট",
        ],
      },
      {
        type: "tip",
        title: "সবচেয়ে বড় টিপ",
        text: "Consistency > intensity। একদিন ৩ ঘণ্টা পড়ে ৬ দিন বাদ দেওয়ার চেয়ে প্রতিদিন ৩০ মিনিট অনেক ভালো। এই সাইটের streak feature-টা ঠিক এজন্যই বানানো!",
      },
      { type: "heading", text: "কোন ভুলগুলো এড়াবে?" },
      {
        type: "list",
        items: [
          "শুধু শব্দ মুখস্থ করে গ্রামার বাদ দেওয়া — A1-এ দুটোই লাগে",
          "Article ছাড়া noun শেখা — সবসময় **der/die/das সহ** শেখো",
          "বাংলা থেকে word-by-word translate করে বাক্য বানানো",
          "Sprechen প্র্যাকটিস একদম শেষে রাখা — প্রথম সপ্তাহ থেকেই জোরে জোরে বলো",
        ],
      },
    ],
  },
  {
    slug: "der-die-das-7-technique",
    title: "der/die/das মনে রাখার ৭টা প্রমাণিত টেকনিক",
    excerpt:
      "German শেখার সবচেয়ে বিরক্তিকর অংশ? Article! এই ৭টা টেকনিকে der/die/das আর ভুল হবে না।",
    category: "টিপস",
    date: "2026-10-08",
    cover: "from-amber-400 to-orange-500",
    tags: ["Artikel", "Grammatik", "Tipps"],
    blocks: [
      {
        type: "paragraph",
        text: "প্রতিটা German noun-এর একটা gender আছে — **der** (masculine), **die** (feminine), **das** (neuter)। বাংলায় এরকম কিছু নেই, তাই এটা আমাদের জন্য সবচেয়ে কঠিন। কিন্তু কিছু প্যাটার্ন জানলে ৮০% ক্ষেত্রে অনুমান করা যায়!",
      },
      { type: "heading", text: "১. Ending দেখে অনুমান করো" },
      {
        type: "table",
        headers: ["Ending", "Article", "উদাহরণ"],
        rows: [
          ["-ung, -heit, -keit, -schaft", "die", "die Zeitung, die Freiheit"],
          ["-chen, -lein", "das", "das Mädchen, das Brötchen"],
          ["-er (পেশা/যন্ত্র)", "der", "der Lehrer, der Computer"],
          ["-ismus, -ling", "der", "der Tourismus, der Schmetterling"],
          ["-tion, -sion", "die", "die Nation, die Diskussion"],
        ],
      },
      { type: "heading", text: "২. সবসময় article সহ শেখো" },
      {
        type: "paragraph",
        text: "'Apfel মানে আপেল' — এভাবে শিখো না। শেখো '**der** Apfel'। Flashcard-এর সামনে article সহ লেখো। এই সাইটের প্রতিটা শব্দেই article দেওয়া আছে ঠিক এই কারণে।",
      },
      { type: "heading", text: "৩. রঙ-কোডিং" },
      {
        type: "paragraph",
        text: "নোটখাতায় বা মনে মনে রঙ ঠিক করে নাও: **der = নীল**, **die = লাল**, **das = সবুজ**। শব্দ দেখলেই রঙটা মনে পড়বে।",
      },
      { type: "heading", text: "৪. গ্রুপ করে শেখো" },
      {
        type: "paragraph",
        text: "একই gender-এর শব্দ একসাথে শেখো: der Vater, der Bruder, der Onkel… — pattern মাথায় গেঁথে যাবে।",
      },
      { type: "heading", text: "৫. Plural-এর সাথে শেখো" },
      {
        type: "paragraph",
        text: "**der** Apfel → **die** Äpfel। Article + plural একসাথে শিখলে দুটোই মনে থাকে।",
      },
      { type: "heading", text: "৬. ভুল করো নির্ভয়ে" },
      {
        type: "paragraph",
        text: "Native speaker-রাও মাঝে মাঝে ভুল করে! ভুল বললে কেউ হাসবে না — বরং correction থেকে শেখা সবচেয়ে দ্রুত হয়।",
      },
      { type: "heading", text: "৭. প্রতিদিন ৫ মিনিটের article quiz" },
      {
        type: "paragraph",
        text: "এই সাইটের Quiz-এ article-ভিত্তিক প্রশ্ন আছে — প্রতিদিন এক রাউন্ড খেলো। ২ সপ্তাহে পার্থক্য টের পাবে।",
      },
      {
        type: "tip",
        title: "মনে রাখো",
        text: "100% নির্ভুল হওয়ার দরকার নেই — A1 পরীক্ষায় article ভুল হলেও বাকি সব ঠিক থাকলে পাস করা যায়। তবে যত ঠিক হবে, তত confident লাগবে!",
      },
    ],
  },
  {
    slug: "uccharon-guide-bangla",
    title: "Bangla-speaker-দের জন্য German উচ্চারণ গাইড",
    excerpt:
      "ä, ö, ü, ch, ß — বাংলায় নেই এমন সব আওয়াজ বাংলায় বুঝিয়ে দেওয়া সহজ গাইড।",
    category: "উচ্চারণ",
    date: "2026-10-05",
    cover: "from-teal-500 to-emerald-600",
    tags: ["Aussprache", "Beginner"],
    blocks: [
      {
        type: "paragraph",
        text: "German উচ্চারণ আসলে English-এর চেয়ে **অনেক বেশি নিয়মমাফিক** — বানান দেখলেই বোঝা যায় কীভাবে বলতে হবে। শুধু কয়েকটা আওয়াজ নতুন, সেগুলো একবার ঠিক করে নিলেই হলো।",
      },
      { type: "heading", text: "Umlaut: ä, ö, ü" },
      {
        type: "table",
        headers: ["বর্ণ", "কীভাবে বলবে", "উদাহরণ"],
        rows: [
          ["ä", "বাংলা 'এ্যা'-র মতো — মুখ একটু বেশি খুলে", "Mädchen (ম্যাডখেন)"],
          ["ö", "ঠোঁট গোল করে 'অ' + 'এ' মেশানো", "schön (শ্যোন)"],
          ["ü", "ঠোঁট গোল করে 'ই' বলো", "Tür (ট্যুর)"],
        ],
      },
      { type: "heading", text: "ch-এর দুই রকম আওয়াজ" },
      {
        type: "list",
        items: [
          "**ach-Laut** (a/o/u-এর পরে): গলার গভীর থেকে 'খ'-র মতো — Bach, Buch, Nacht",
          "**ich-Laut** (e/i/ä/ö/ü-এর পরে): নরম, 'শ'-এর কাছাকাছি — ich, Milch, Mädchen",
        ],
      },
      { type: "heading", text: "আরও কিছু নিয়ম" },
      {
        type: "table",
        headers: ["বানান", "উচ্চারণ", "উদাহরণ"],
        rows: [
          ["ß", "ডাবল s — 'স্স'", "Straße (শ্ট্রাসে)"],
          ["sch", "'শ'", "Schule (শুলে)"],
          ["sp / st (শব্দের শুরুতে)", "'শ্প' / 'শ্ট'", "Sport (শ্পোর্ট), Stadt (শ্টাট)"],
          ["w", "বাংলা 'ভ'-র মতো", "Wasser (ভাসার)"],
          ["v", "'ফ'", "Vater (ফাটার)"],
          ["z", "'ৎস'", "Zeit (ত্সাইট)"],
        ],
      },
      {
        type: "tip",
        title: "প্র্যাকটিস টেকনিক",
        text: "Easy German-এর YouTube ভিডিও দেখো আর সাথে সাথে জোরে জোরে repeat করো (shadowing)। প্রথমে অদ্ভুত লাগবে, ২ সপ্তাহে মুখের muscle তৈরি হয়ে যাবে!",
      },
    ],
  },
  {
    slug: "a1-porikkha-format",
    title: "A1 পরীক্ষায় (Goethe/ÖSD) যা যা আসে — format breakdown",
    excerpt:
      "Hören, Lesen, Schreiben, Sprechen — ৪টা মডিউলের পূর্ণাঙ্গ breakdown, সময়, নম্বর আর পাস মার্ক সহ।",
    category: "পরীক্ষা",
    date: "2026-10-02",
    cover: "from-emerald-600 to-green-700",
    tags: ["Prüfung", "Goethe", "A1"],
    blocks: [
      {
        type: "paragraph",
        text: "Goethe-Zertifikat A1 (Start Deutsch 1) বা ÖSD A1 — দুটোর format প্রায় একই। ৪টা মডিউল, মোট **১০০ নম্বর**, পাস করতে লাগে **৬০**। প্রতিটা মডিউল আলাদা আলাদা পাস করতে হয় না — মোট ৬০ পেলেই চলবে (তবে কোনোটায় শূন্য পাওয়া যাবে না)।",
      },
      { type: "heading", text: "১. Hören (শোনা) — ২৫ নম্বর, ~২০ মিনিট" },
      {
        type: "list",
        items: [
          "Teil 1: ছোট কথোপকথন শুনে সত্য/মিথ্যা",
          "Teil 2: ঘোষণা শুনে MCQ",
          "Teil 3: ফোন মেসেজ শুনে তথ্য মেলানো",
        ],
      },
      { type: "heading", text: "২. Lesen (পড়া) — ২৫ নম্বর, ~২৫ মিনিট" },
      {
        type: "list",
        items: [
          "Teil 1: নোটিশ/বিজ্ঞাপন পড়ে MCQ",
          "Teil 2: ছোট টেক্সট পড়ে সত্য/মিথ্যা",
          "Teil 3: ফর্ম/ইমেইল পড়ে তথ্য বের করা",
        ],
      },
      { type: "heading", text: "৩. Schreiben (লেখা) — ২৫ নম্বর, ~২০ মিনিট" },
      {
        type: "list",
        items: [
          "Teil 1: ফর্ম পূরণ (নাম, ঠিকানা, ফোন…)",
          "Teil 2: ছোট চিঠি/ইমেইল লেখা (~৩০ শব্দ) — যেমন বন্ধুকে দাওয়াত",
        ],
      },
      { type: "heading", text: "৪. Sprechen (বলা) — ২৫ নম্বর, ~১৫ মিনিট" },
      {
        type: "list",
        items: [
          "Teil 1: নিজের পরিচয় — নাম, দেশ, পেশা, শখ (প্রশ্নের উত্তর)",
          "Teil 2: কার্ডে থাকা বিষয়ে প্রশ্ন করা ও উত্তর দেওয়া (পার্টনারের সাথে)",
          "Teil 3: অনুরোধ করা / প্রস্তাবে সাড়া দেওয়া",
        ],
      },
      {
        type: "tip",
        title: "প্রস্তুতির সেরা উপায়",
        text: "Goethe-Institut-এর ওয়েবসাইটে ফ্রি মডেল টেস্ট আছে — পরীক্ষার ১ মাস আগে থেকে সপ্তাহে ১টা করে full mock দাও, সময় ধরে। এই সাইটের Resources পেজে লিংক পাবে।",
      },
    ],
  },
  {
    slug: "20-minute-daily-routine",
    title: "প্রতিদিন ২০ মিনিট: German শেখার sustainable routine",
    excerpt:
      "ব্যস্ত জীবনেও German শেখা যায় — ২০ মিনিটের বিজ্ঞানভিত্তিক ডেইলি রুটিন।",
    category: "রুটিন",
    date: "2026-09-28",
    cover: "from-amber-500 to-yellow-600",
    tags: ["Routine", "Motivation"],
    blocks: [
      {
        type: "paragraph",
        text: "অনেকেই 'সময় পাই না' বলে German শেখা ছেড়ে দেয়। সত্যি কথা: **প্রতিদিন ২০ মিনিট** ধারাবাহিকভাবে করলে ৩ মাসে A1 শেষ করা যায়। এই রুটিনটা research-backed — ছোট ছোট chunk, বেশি repetition।",
      },
      { type: "heading", text: "সকাল: ৫ মিনিট — Wortschatz" },
      {
        type: "paragraph",
        text: "ঘুম থেকে উঠে এই সাইটে **Wort des Tages** দেখো + ১০টা flashcard swipe করো। সকালে মস্তিষ্ক নতুন তথ্য ভালো ধরে।",
      },
      { type: "heading", text: "দুপুর/বিকেল: ৫ মিনিট — Quiz" },
      {
        type: "paragraph",
        text: "লাঞ্চ ব্রেকে এক রাউন্ড **Quiz** খেলো (Easy → Medium → Hard)। ভুলগুলোই আসল শিক্ষক — ভুল হলে সেই টপিকের Grammar পেজটা একবার পড়ে নাও।",
      },
      { type: "heading", text: "রাত: ১০ মিনিট — Input" },
      {
        type: "list",
        items: [
          "৫ মিনিট: Easy German-এর একটা ভিডিও (সাবটাইটেল সহ)",
          "৩ মিনিট: একটা Lektion-এর exercise (easy→hard ক্রমে)",
          "২ মিনিট: আজ যা শিখলে, জোরে জোরে ৩টা বাক্য বলো",
        ],
      },
      {
        type: "tip",
        title: "Streak-এর জাদু",
        text: "এই সাইটের streak counter-টা শুধু শো-অফ না — 'chain ভাঙব না' মানসিকতা (Seinfeld strategy) আসলেই কাজ করে। ২১ দিন টানা করো, তারপর এটা অভ্যাস হয়ে যাবে।",
      },
      { type: "heading", text: "সাপ্তাহিক বোনাস (শুক্র/শনি)" },
      {
        type: "list",
        items: [
          "১টা Lektion সম্পূর্ণ শেষ করো (exercise সহ)",
          "DW-এর একটা ছোট আর্টিকেল পড়ো",
          "পুরনো ভুলগুলো রিভিউ করো — Fortschritt পেজে দেখো কোথায় দুর্বল",
        ],
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function readingMinutes(post: BlogPost): number {
  const text = post.blocks
    .map((b) => {
      switch (b.type) {
        case "heading":
          return b.text;
        case "paragraph":
          return b.text;
        case "list":
          return b.items.join(" ");
        case "tip":
          return b.title + " " + b.text;
        case "table":
          return b.headers.join(" ") + " " + b.rows.flat().join(" ");
      }
    })
    .join(" ");
  const words = text.split(/\s+/).length;
  return Math.max(3, Math.round(words / 180));
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
