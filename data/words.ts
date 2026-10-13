export interface Word {
  id: number;
  /** German word, nouns include their article, e.g. "der Apfel" */
  german: string;
  /** Part of speech */
  pos: "noun" | "verb" | "adjective" | "adverb" | "phrase";
  /** Bangla meaning */
  bangla: string;
  /** Short German example sentence */
  example: string;
  /** Bangla translation of the example */
  exampleBangla: string;
}

export const words: Word[] = [
  {
    id: 1,
    german: "der Apfel",
    pos: "noun",
    bangla: "আপেল",
    example: "Der Apfel ist rot.",
    exampleBangla: "আপেলটি লাল।",
  },
  {
    id: 2,
    german: "das Wasser",
    pos: "noun",
    bangla: "পানি",
    example: "Ich trinke Wasser.",
    exampleBangla: "আমি পানি পান করি।",
  },
  {
    id: 3,
    german: "die Frau",
    pos: "noun",
    bangla: "মহিলা",
    example: "Die Frau liest ein Buch.",
    exampleBangla: "মহিলাটি একটি বই পড়ছেন।",
  },
  {
    id: 4,
    german: "der Mann",
    pos: "noun",
    bangla: "পুরুষ",
    example: "Der Mann arbeitet.",
    exampleBangla: "পুরুষটি কাজ করেন।",
  },
  {
    id: 5,
    german: "das Kind",
    pos: "noun",
    bangla: "শিশু",
    example: "Das Kind spielt.",
    exampleBangla: "শিশুটি খেলছে।",
  },
  {
    id: 6,
    german: "die Stadt",
    pos: "noun",
    bangla: "শহর",
    example: "Dhaka ist eine große Stadt.",
    exampleBangla: "ঢাকা একটি বড় শহর।",
  },
  {
    id: 7,
    german: "das Haus",
    pos: "noun",
    bangla: "বাড়ি",
    example: "Das Haus ist groß.",
    exampleBangla: "বাড়িটি বড়।",
  },
  {
    id: 8,
    german: "die Schule",
    pos: "noun",
    bangla: "স্কুল",
    example: "Die Schule beginnt um acht Uhr.",
    exampleBangla: "স্কুল সকাল আটটায় শুরু হয়।",
  },
  {
    id: 9,
    german: "der Tag",
    pos: "noun",
    bangla: "দিন",
    example: "Heute ist ein schöner Tag.",
    exampleBangla: "আজ একটি সুন্দর দিন।",
  },
  {
    id: 10,
    german: "die Zeit",
    pos: "noun",
    bangla: "সময়",
    example: "Ich habe keine Zeit.",
    exampleBangla: "আমার সময় নেই।",
  },
  {
    id: 11,
    german: "das Brot",
    pos: "noun",
    bangla: "রুটি / পাউরুটি",
    example: "Ich esse Brot.",
    exampleBangla: "আমি রুটি খাই।",
  },
  {
    id: 12,
    german: "der Kaffee",
    pos: "noun",
    bangla: "কফি",
    example: "Der Kaffee ist heiß.",
    exampleBangla: "কফিটি গরম।",
  },
  {
    id: 13,
    german: "die Familie",
    pos: "noun",
    bangla: "পরিবার",
    example: "Meine Familie ist groß.",
    exampleBangla: "আমার পরিবার বড়।",
  },
  {
    id: 14,
    german: "der Freund",
    pos: "noun",
    bangla: "বন্ধু",
    example: "Er ist mein Freund.",
    exampleBangla: "সে আমার বন্ধু।",
  },
  {
    id: 15,
    german: "das Buch",
    pos: "noun",
    bangla: "বই",
    example: "Das Buch ist interessant.",
    exampleBangla: "বইটি মজার।",
  },
  {
    id: 16,
    german: "sein",
    pos: "verb",
    bangla: "হওয়া",
    example: "Ich bin müde.",
    exampleBangla: "আমি ক্লান্ত।",
  },
  {
    id: 17,
    german: "haben",
    pos: "verb",
    bangla: "থাকা (অধিকারে)",
    example: "Ich habe ein Buch.",
    exampleBangla: "আমার একটি বই আছে।",
  },
  {
    id: 18,
    german: "gehen",
    pos: "verb",
    bangla: "যাওয়া",
    example: "Ich gehe zur Schule.",
    exampleBangla: "আমি স্কুলে যাই।",
  },
  {
    id: 19,
    german: "kommen",
    pos: "verb",
    bangla: "আসা",
    example: "Er kommt morgen.",
    exampleBangla: "সে আগামীকাল আসবে।",
  },
  {
    id: 20,
    german: "essen",
    pos: "verb",
    bangla: "খাওয়া",
    example: "Wir essen Reis.",
    exampleBangla: "আমরা ভাত খাই।",
  },
  {
    id: 21,
    german: "trinken",
    pos: "verb",
    bangla: "পান করা",
    example: "Sie trinkt Tee.",
    exampleBangla: "সে চা পান করে।",
  },
  {
    id: 22,
    german: "lernen",
    pos: "verb",
    bangla: "শেখা",
    example: "Ich lerne Deutsch.",
    exampleBangla: "আমি জার্মান শিখি।",
  },
  {
    id: 23,
    german: "sprechen",
    pos: "verb",
    bangla: "কথা বলা",
    example: "Er spricht Deutsch.",
    exampleBangla: "সে জার্মান বলে।",
  },
  {
    id: 24,
    german: "wohnen",
    pos: "verb",
    bangla: "বাস করা",
    example: "Ich wohne in Dhaka.",
    exampleBangla: "আমি ঢাকায় থাকি।",
  },
  {
    id: 25,
    german: "arbeiten",
    pos: "verb",
    bangla: "কাজ করা",
    example: "Sie arbeitet viel.",
    exampleBangla: "সে অনেক কাজ করে।",
  },
  {
    id: 26,
    german: "gut",
    pos: "adjective",
    bangla: "ভালো",
    example: "Das Essen ist gut.",
    exampleBangla: "খাবারটি ভালো।",
  },
  {
    id: 27,
    german: "groß",
    pos: "adjective",
    bangla: "বড়",
    example: "Das Haus ist groß.",
    exampleBangla: "বাড়িটি বড়।",
  },
  {
    id: 28,
    german: "klein",
    pos: "adjective",
    bangla: "ছোট",
    example: "Das Kind ist klein.",
    exampleBangla: "শিশুটি ছোট।",
  },
  {
    id: 29,
    german: "neu",
    pos: "adjective",
    bangla: "নতুন",
    example: "Ich habe ein neues Handy.",
    exampleBangla: "আমার একটি নতুন মোবাইল আছে।",
  },
  {
    id: 30,
    german: "heute",
    pos: "adverb",
    bangla: "আজ",
    example: "Heute ist Montag.",
    exampleBangla: "আজ সোমবার।",
  },
  {
    id: 31,
    german: "morgen",
    pos: "adverb",
    bangla: "আগামীকাল",
    example: "Bis morgen!",
    exampleBangla: "আগামীকাল দেখা হবে!",
  },
  {
    id: 32,
    german: "danke",
    pos: "phrase",
    bangla: "ধন্যবাদ",
    example: "Danke schön!",
    exampleBangla: "অনেক ধন্যবাদ!",
  },
];

/** Fisher–Yates shuffle, returns a new array */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
