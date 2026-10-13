export type Difficulty = "easy" | "medium" | "hard";

export interface Category {
  id: string;
  german: string;
  bangla: string;
}

export type Pos =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "phrase"
  | "pronoun"
  | "preposition"
  | "number";

export interface VocabWord {
  id: string;
  german: string;
  pos: Pos;
  bangla: string;
  example: string;
  exampleBangla: string;
  category: string;
}

export const categories: Category[] = [
  { id: "begruessung", german: "Begrüßung", bangla: "অভিবাদন" },
  { id: "zahlen-zeit", german: "Zahlen & Zeit", bangla: "সংখ্যা ও সময়" },
  { id: "familie", german: "Familie", bangla: "পরিবার" },
  { id: "essen-trinken", german: "Essen & Trinken", bangla: "খাবার ও পানীয়" },
  { id: "wohnen", german: "Wohnen", bangla: "বাসস্থান" },
  { id: "berufe", german: "Berufe", bangla: "পেশা" },
  { id: "alltag", german: "Alltag", bangla: "দৈনন্দিন জীবন" },
  { id: "einkaufen", german: "Einkaufen", bangla: "কেনাকাটা" },
  { id: "wetter", german: "Wetter", bangla: "আবহাওয়া" },
  { id: "koerper", german: "Körper & Gesundheit", bangla: "শরীর ও স্বাস্থ্য" },
  { id: "reisen", german: "Reisen & Verkehr", bangla: "ভ্রমণ ও যানবাহন" },
  { id: "freizeit", german: "Freizeit", bangla: "অবসর" },
  { id: "adjektive", german: "Adjektive", bangla: "বিশেষণ" },
  { id: "verben", german: "Verben", bangla: "ক্রিয়া" },
];

export const words: VocabWord[] = [
  // ---------- Begrüßung (12) ----------
  { id: "begruessung-01", german: "Hallo", pos: "phrase", bangla: "হ্যালো", example: "Hallo, wie geht es dir?", exampleBangla: "হ্যালো, তুমি কেমন আছো?", category: "begruessung" },
  { id: "begruessung-02", german: "Guten Morgen", pos: "phrase", bangla: "শুভ সকাল", example: "Guten Morgen, Mama!", exampleBangla: "শুভ সকাল, মা!", category: "begruessung" },
  { id: "begruessung-03", german: "Guten Tag", pos: "phrase", bangla: "নমস্কার (দিনের বেলা)", example: "Guten Tag, Herr Schmidt!", exampleBangla: "নমস্কার, মিঃ শ্মিট!", category: "begruessung" },
  { id: "begruessung-04", german: "Guten Abend", pos: "phrase", bangla: "শুভ সন্ধ্যা", example: "Guten Abend, alle zusammen!", exampleBangla: "শুভ সন্ধ্যা, সবাই!", category: "begruessung" },
  { id: "begruessung-05", german: "Tschüss", pos: "phrase", bangla: "বিদায় (অনানুষ্ঠানিক)", example: "Tschüss, bis morgen!", exampleBangla: "বিদায়, আগামীকাল দেখা হবে!", category: "begruessung" },
  { id: "begruessung-06", german: "Auf Wiedersehen", pos: "phrase", bangla: "আবার দেখা হবে", example: "Auf Wiedersehen, Frau Müller!", exampleBangla: "আবার দেখা হবে, মিসেস মুলার!", category: "begruessung" },
  { id: "begruessung-07", german: "Danke", pos: "phrase", bangla: "ধন্যবাদ", example: "Danke für deine Hilfe!", exampleBangla: "তোমার সাহায্যের জন্য ধন্যবাদ!", category: "begruessung" },
  { id: "begruessung-08", german: "Bitte", pos: "phrase", bangla: "অনুগ্রহ করে", example: "Bitte, nimm Platz!", exampleBangla: "অনুগ্রহ করে বসো!", category: "begruessung" },
  { id: "begruessung-09", german: "Entschuldigung", pos: "phrase", bangla: "দুঃখিত / ক্ষমা করবেন", example: "Entschuldigung, ich bin zu spät.", exampleBangla: "দুঃখিত, আমার দেরি হয়ে গেছে।", category: "begruessung" },
  { id: "begruessung-10", german: "Willkommen", pos: "phrase", bangla: "স্বাগতম", example: "Willkommen in Deutschland!", exampleBangla: "জার্মানিতে স্বাগতম!", category: "begruessung" },
  { id: "begruessung-11", german: "Wie geht's?", pos: "phrase", bangla: "কেমন আছো?", example: "Hallo! Wie geht's?", exampleBangla: "হ্যালো! কেমন আছো?", category: "begruessung" },
  { id: "begruessung-12", german: "Freut mich", pos: "phrase", bangla: "আনন্দিত হলাম", example: "Freut mich, dich kennenzulernen!", exampleBangla: "তোমার সাথে পরিচিত হয়ে আনন্দিত হলাম!", category: "begruessung" },

  // ---------- Zahlen & Zeit (16) ----------
  { id: "zahlen-zeit-01", german: "null", pos: "number", bangla: "শূন্য", example: "Die Zahl ist null.", exampleBangla: "সংখ্যাটি শূন্য।", category: "zahlen-zeit" },
  { id: "zahlen-zeit-02", german: "eins", pos: "number", bangla: "এক", example: "Ich habe eins.", exampleBangla: "আমার কাছে একটি আছে।", category: "zahlen-zeit" },
  { id: "zahlen-zeit-03", german: "zwei", pos: "number", bangla: "দুই", example: "Ich habe zwei Äpfel.", exampleBangla: "আমার দুটি আপেল আছে।", category: "zahlen-zeit" },
  { id: "zahlen-zeit-04", german: "drei", pos: "number", bangla: "তিন", example: "Es ist drei Uhr.", exampleBangla: "এখন তিনটা বাজে।", category: "zahlen-zeit" },
  { id: "zahlen-zeit-05", german: "vier", pos: "number", bangla: "চার", example: "Wir sind vier Personen.", exampleBangla: "আমরা চারজন।", category: "zahlen-zeit" },
  { id: "zahlen-zeit-06", german: "fünf", pos: "number", bangla: "পাঁচ", example: "Fünf plus fünf ist zehn.", exampleBangla: "পাঁচ যোগ পাঁচ সমান দশ।", category: "zahlen-zeit" },
  { id: "zahlen-zeit-07", german: "sechs", pos: "number", bangla: "ছয়", example: "Ich komme um sechs.", exampleBangla: "আমি ছয়টায় আসছি।", category: "zahlen-zeit" },
  { id: "zahlen-zeit-08", german: "sieben", pos: "number", bangla: "সাত", example: "Sieben Tage sind eine Woche.", exampleBangla: "সাত দিনে এক সপ্তাহ।", category: "zahlen-zeit" },
  { id: "zahlen-zeit-09", german: "acht", pos: "number", bangla: "আট", example: "Ich stehe um acht auf.", exampleBangla: "আমি আটটায় উঠি।", category: "zahlen-zeit" },
  { id: "zahlen-zeit-10", german: "neun", pos: "number", bangla: "নয়", example: "Ich habe neun Bücher.", exampleBangla: "আমার নয়টি বই আছে।", category: "zahlen-zeit" },
  { id: "zahlen-zeit-11", german: "zehn", pos: "number", bangla: "দশ", example: "Zehn Finger habe ich.", exampleBangla: "আমার দশটি আঙুল আছে।", category: "zahlen-zeit" },
  { id: "zahlen-zeit-12", german: "zwanzig", pos: "number", bangla: "বিশ", example: "Zwanzig Euro, bitte.", exampleBangla: "বিশ ইউরো, অনুগ্রহ করে।", category: "zahlen-zeit" },
  { id: "zahlen-zeit-13", german: "hundert", pos: "number", bangla: "একশ", example: "Hundert Prozent!", exampleBangla: "একশ শতাংশ!", category: "zahlen-zeit" },
  { id: "zahlen-zeit-14", german: "der Tag", pos: "noun", bangla: "দিন", example: "Heute ist ein schöner Tag.", exampleBangla: "আজ একটি সুন্দর দিন।", category: "zahlen-zeit" },
  { id: "zahlen-zeit-15", german: "die Woche", pos: "noun", bangla: "সপ্তাহ", example: "Die Woche hat sieben Tage.", exampleBangla: "সপ্তাহে সাত দিন।", category: "zahlen-zeit" },
  { id: "zahlen-zeit-16", german: "die Uhr", pos: "noun", bangla: "ঘড়ি / টা (সময়)", example: "Wie viel Uhr ist es?", exampleBangla: "এখন কয়টা বাজে?", category: "zahlen-zeit" },

  // ---------- Familie (12) ----------
  { id: "familie-01", german: "der Vater", pos: "noun", bangla: "বাবা", example: "Mein Vater arbeitet.", exampleBangla: "আমার বাবা কাজ করেন।", category: "familie" },
  { id: "familie-02", german: "die Mutter", pos: "noun", bangla: "মা", example: "Meine Mutter kocht gut.", exampleBangla: "আমার মা ভালো রান্না করেন।", category: "familie" },
  { id: "familie-03", german: "der Bruder", pos: "noun", bangla: "ভাই", example: "Mein Bruder ist jung.", exampleBangla: "আমার ভাই তরুণ।", category: "familie" },
  { id: "familie-04", german: "die Schwester", pos: "noun", bangla: "বোন", example: "Meine Schwester lernt Deutsch.", exampleBangla: "আমার বোন জার্মান শিখছে।", category: "familie" },
  { id: "familie-05", german: "der Sohn", pos: "noun", bangla: "ছেলে", example: "Der Sohn spielt Fußball.", exampleBangla: "ছেলেটি ফুটবল খেলে।", category: "familie" },
  { id: "familie-06", german: "die Tochter", pos: "noun", bangla: "মেয়ে", example: "Die Tochter liest ein Buch.", exampleBangla: "মেয়েটি একটি বই পড়ছে।", category: "familie" },
  { id: "familie-07", german: "der Mann", pos: "noun", bangla: "পুরুষ / স্বামী", example: "Der Mann ist mein Vater.", exampleBangla: "লোকটি আমার বাবা।", category: "familie" },
  { id: "familie-08", german: "die Frau", pos: "noun", bangla: "মহিলা / স্ত্রী", example: "Die Frau ist meine Mutter.", exampleBangla: "মহিলাটি আমার মা।", category: "familie" },
  { id: "familie-09", german: "das Kind", pos: "noun", bangla: "শিশু", example: "Das Kind schläft.", exampleBangla: "শিশুটি ঘুমাচ্ছে।", category: "familie" },
  { id: "familie-10", german: "die Eltern", pos: "noun", bangla: "বাবা-মা", example: "Meine Eltern sind nett.", exampleBangla: "আমার বাবা-মা ভালো।", category: "familie" },
  { id: "familie-11", german: "der Freund", pos: "noun", bangla: "বন্ধু", example: "Mein Freund heißt Rahim.", exampleBangla: "আমার বন্ধুর নাম রহিম।", category: "familie" },
  { id: "familie-12", german: "die Familie", pos: "noun", bangla: "পরিবার", example: "Meine Familie ist groß.", exampleBangla: "আমার পরিবার বড়।", category: "familie" },

  // ---------- Essen & Trinken (16) ----------
  { id: "essen-trinken-01", german: "der Apfel", pos: "noun", bangla: "আপেল", example: "Der Apfel ist rot.", exampleBangla: "আপেলটি লাল।", category: "essen-trinken" },
  { id: "essen-trinken-02", german: "das Brot", pos: "noun", bangla: "রুটি / পাউরুটি", example: "Ich esse Brot.", exampleBangla: "আমি রুটি খাই।", category: "essen-trinken" },
  { id: "essen-trinken-03", german: "das Wasser", pos: "noun", bangla: "পানি", example: "Ich trinke Wasser.", exampleBangla: "আমি পানি পান করি।", category: "essen-trinken" },
  { id: "essen-trinken-04", german: "der Kaffee", pos: "noun", bangla: "কফি", example: "Der Kaffee ist heiß.", exampleBangla: "কফিটি গরম।", category: "essen-trinken" },
  { id: "essen-trinken-05", german: "der Tee", pos: "noun", bangla: "চা", example: "Ich mag Tee.", exampleBangla: "আমি চা পছন্দ করি।", category: "essen-trinken" },
  { id: "essen-trinken-06", german: "die Milch", pos: "noun", bangla: "দুধ", example: "Die Milch ist weiß.", exampleBangla: "দুধ সাদা।", category: "essen-trinken" },
  { id: "essen-trinken-07", german: "das Ei", pos: "noun", bangla: "ডিম", example: "Ich esse ein Ei.", exampleBangla: "আমি একটি ডিম খাই।", category: "essen-trinken" },
  { id: "essen-trinken-08", german: "der Käse", pos: "noun", bangla: "পনির", example: "Der Käse schmeckt gut.", exampleBangla: "পনিরটি সুস্বাদু।", category: "essen-trinken" },
  { id: "essen-trinken-09", german: "der Reis", pos: "noun", bangla: "ভাত / চাল", example: "Wir essen Reis.", exampleBangla: "আমরা ভাত খাই।", category: "essen-trinken" },
  { id: "essen-trinken-10", german: "das Fleisch", pos: "noun", bangla: "মাংস", example: "Das Fleisch ist teuer.", exampleBangla: "মাংসটি দামি।", category: "essen-trinken" },
  { id: "essen-trinken-11", german: "das Gemüse", pos: "noun", bangla: "সবজি", example: "Gemüse ist gesund.", exampleBangla: "সবজি স্বাস্থ্যকর।", category: "essen-trinken" },
  { id: "essen-trinken-12", german: "der Fisch", pos: "noun", bangla: "মাছ", example: "Ich esse gern Fisch.", exampleBangla: "আমি মাছ খেতে পছন্দ করি।", category: "essen-trinken" },
  { id: "essen-trinken-13", german: "der Zucker", pos: "noun", bangla: "চিনি", example: "Der Zucker ist süß.", exampleBangla: "চিনি মিষ্টি।", category: "essen-trinken" },
  { id: "essen-trinken-14", german: "das Salz", pos: "noun", bangla: "লবণ", example: "Das Salz ist weiß.", exampleBangla: "লবণ সাদা।", category: "essen-trinken" },
  { id: "essen-trinken-15", german: "lecker", pos: "adjective", bangla: "সুস্বাদু", example: "Das Essen ist lecker.", exampleBangla: "খাবারটি সুস্বাদু।", category: "essen-trinken" },
  { id: "essen-trinken-16", german: "trinken", pos: "verb", bangla: "পান করা", example: "Ich trinke Tee.", exampleBangla: "আমি চা পান করি।", category: "essen-trinken" },

  // ---------- Wohnen (12) ----------
  { id: "wohnen-01", german: "das Haus", pos: "noun", bangla: "বাড়ি", example: "Das Haus ist groß.", exampleBangla: "বাড়িটি বড়।", category: "wohnen" },
  { id: "wohnen-02", german: "die Wohnung", pos: "noun", bangla: "ফ্ল্যাট / বাসা", example: "Die Wohnung ist schön.", exampleBangla: "ফ্ল্যাটটি সুন্দর।", category: "wohnen" },
  { id: "wohnen-03", german: "das Zimmer", pos: "noun", bangla: "ঘর", example: "Mein Zimmer ist klein.", exampleBangla: "আমার ঘরটি ছোট।", category: "wohnen" },
  { id: "wohnen-04", german: "die Küche", pos: "noun", bangla: "রান্নাঘর", example: "Die Küche ist sauber.", exampleBangla: "রান্নাঘরটি পরিষ্কার।", category: "wohnen" },
  { id: "wohnen-05", german: "das Bad", pos: "noun", bangla: "বাথরুম", example: "Das Bad ist neu.", exampleBangla: "বাথরুমটি নতুন।", category: "wohnen" },
  { id: "wohnen-06", german: "das Bett", pos: "noun", bangla: "বিছানা", example: "Das Bett ist bequem.", exampleBangla: "বিছানাটি আরামদায়ক।", category: "wohnen" },
  { id: "wohnen-07", german: "der Tisch", pos: "noun", bangla: "টেবিল", example: "Der Tisch ist rund.", exampleBangla: "টেবিলটি গোল।", category: "wohnen" },
  { id: "wohnen-08", german: "der Stuhl", pos: "noun", bangla: "চেয়ার", example: "Der Stuhl ist aus Holz.", exampleBangla: "চেয়ারটি কাঠের।", category: "wohnen" },
  { id: "wohnen-09", german: "die Tür", pos: "noun", bangla: "দরজা", example: "Die Tür ist offen.", exampleBangla: "দরজাটি খোলা।", category: "wohnen" },
  { id: "wohnen-10", german: "das Fenster", pos: "noun", bangla: "জানালা", example: "Das Fenster ist groß.", exampleBangla: "জানালাটি বড়।", category: "wohnen" },
  { id: "wohnen-11", german: "die Lampe", pos: "noun", bangla: "বাতি", example: "Die Lampe ist hell.", exampleBangla: "বাতিটি উজ্জ্বল।", category: "wohnen" },
  { id: "wohnen-12", german: "wohnen", pos: "verb", bangla: "বাস করা", example: "Ich wohne in Dhaka.", exampleBangla: "আমি ঢাকায় থাকি।", category: "wohnen" },

  // ---------- Berufe (10) ----------
  { id: "berufe-01", german: "der Lehrer", pos: "noun", bangla: "শিক্ষক", example: "Der Lehrer unterrichtet.", exampleBangla: "শিক্ষক পড়ান।", category: "berufe" },
  { id: "berufe-02", german: "die Lehrerin", pos: "noun", bangla: "শিক্ষিকা", example: "Die Lehrerin ist nett.", exampleBangla: "শিক্ষিকা ভালো।", category: "berufe" },
  { id: "berufe-03", german: "der Arzt", pos: "noun", bangla: "ডাক্তার", example: "Der Arzt hilft mir.", exampleBangla: "ডাক্তার আমাকে সাহায্য করেন।", category: "berufe" },
  { id: "berufe-04", german: "der Ingenieur", pos: "noun", bangla: "প্রকৌশলী", example: "Der Ingenieur baut Brücken.", exampleBangla: "প্রকৌশলী সেতু বানান।", category: "berufe" },
  { id: "berufe-05", german: "der Student", pos: "noun", bangla: "ছাত্র (বিশ্ববিদ্যালয়)", example: "Der Student lernt viel.", exampleBangla: "ছাত্রটি অনেক পড়ে।", category: "berufe" },
  { id: "berufe-06", german: "der Fahrer", pos: "noun", bangla: "চালক", example: "Der Fahrer fährt den Bus.", exampleBangla: "চালক বাস চালান।", category: "berufe" },
  { id: "berufe-07", german: "der Koch", pos: "noun", bangla: "বাবুর্চি", example: "Der Koch kocht gut.", exampleBangla: "বাবুর্চি ভালো রান্না করেন।", category: "berufe" },
  { id: "berufe-08", german: "die Krankenschwester", pos: "noun", bangla: "নার্স", example: "Die Krankenschwester hilft dem Arzt.", exampleBangla: "নার্স ডাক্তারকে সাহায্য করেন।", category: "berufe" },
  { id: "berufe-09", german: "der Polizist", pos: "noun", bangla: "পুলিশ", example: "Der Polizist ist freundlich.", exampleBangla: "পুলিশ বন্ধুসুলভ।", category: "berufe" },
  { id: "berufe-10", german: "der Beruf", pos: "noun", bangla: "পেশা", example: "Mein Beruf ist Entwickler.", exampleBangla: "আমার পেশা ডেভেলপার।", category: "berufe" },

  // ---------- Alltag (14) ----------
  { id: "alltag-01", german: "aufstehen", pos: "verb", bangla: "ওঠা (ঘুম থেকে)", example: "Ich stehe um sechs auf.", exampleBangla: "আমি ছয়টায় উঠি।", category: "alltag" },
  { id: "alltag-02", german: "frühstücken", pos: "verb", bangla: "নাস্তা করা", example: "Wir frühstücken zusammen.", exampleBangla: "আমরা একসাথে নাস্তা করি।", category: "alltag" },
  { id: "alltag-03", german: "arbeiten", pos: "verb", bangla: "কাজ করা", example: "Ich arbeite in Dhaka.", exampleBangla: "আমি ঢাকায় কাজ করি।", category: "alltag" },
  { id: "alltag-04", german: "das Mittagessen", pos: "noun", bangla: "দুপুরের খাবার", example: "Das Mittagessen ist um eins.", exampleBangla: "দুপুরের খাবার একটায়।", category: "alltag" },
  { id: "alltag-05", german: "schlafen", pos: "verb", bangla: "ঘুমানো", example: "Ich schlafe acht Stunden.", exampleBangla: "আমি আট ঘণ্টা ঘুমাই।", category: "alltag" },
  { id: "alltag-06", german: "der Morgen", pos: "noun", bangla: "সকাল", example: "Am Morgen trinke ich Tee.", exampleBangla: "সকালে আমি চা পান করি।", category: "alltag" },
  { id: "alltag-07", german: "der Abend", pos: "noun", bangla: "সন্ধ্যা", example: "Am Abend lese ich.", exampleBangla: "সন্ধ্যায় আমি পড়ি।", category: "alltag" },
  { id: "alltag-08", german: "die Nacht", pos: "noun", bangla: "রাত", example: "Gute Nacht!", exampleBangla: "শুভ রাত্রি!", category: "alltag" },
  { id: "alltag-09", german: "heute", pos: "adverb", bangla: "আজ", example: "Heute ist Montag.", exampleBangla: "আজ সোমবার।", category: "alltag" },
  { id: "alltag-10", german: "morgen", pos: "adverb", bangla: "আগামীকাল", example: "Morgen komme ich.", exampleBangla: "আগামীকাল আমি আসব।", category: "alltag" },
  { id: "alltag-11", german: "gestern", pos: "adverb", bangla: "গতকাল", example: "Gestern war Sonntag.", exampleBangla: "গতকাল রবিবার ছিল।", category: "alltag" },
  { id: "alltag-12", german: "die Arbeit", pos: "noun", bangla: "কাজ", example: "Die Arbeit beginnt um zehn.", exampleBangla: "কাজ দশটায় শুরু হয়।", category: "alltag" },
  { id: "alltag-13", german: "müde", pos: "adjective", bangla: "ক্লান্ত", example: "Ich bin müde.", exampleBangla: "আমি ক্লান্ত।", category: "alltag" },
  { id: "alltag-14", german: "pünktlich", pos: "adjective", bangla: "সময়মতো", example: "Sei bitte pünktlich!", exampleBangla: "অনুগ্রহ করে সময়মতো এসো!", category: "alltag" },

  // ---------- Einkaufen (12) ----------
  { id: "einkaufen-01", german: "der Supermarkt", pos: "noun", bangla: "সুপারমার্কেট", example: "Der Supermarkt ist groß.", exampleBangla: "সুপারমার্কেটটি বড়।", category: "einkaufen" },
  { id: "einkaufen-02", german: "das Geld", pos: "noun", bangla: "টাকা", example: "Ich habe kein Geld.", exampleBangla: "আমার কাছে টাকা নেই।", category: "einkaufen" },
  { id: "einkaufen-03", german: "der Preis", pos: "noun", bangla: "দাম", example: "Der Preis ist gut.", exampleBangla: "দামটি ভালো।", category: "einkaufen" },
  { id: "einkaufen-04", german: "billig", pos: "adjective", bangla: "সস্তা", example: "Das ist billig.", exampleBangla: "এটা সস্তা।", category: "einkaufen" },
  { id: "einkaufen-05", german: "teuer", pos: "adjective", bangla: "দামি", example: "Das Auto ist teuer.", exampleBangla: "গাড়িটি দামি।", category: "einkaufen" },
  { id: "einkaufen-06", german: "kaufen", pos: "verb", bangla: "কেনা", example: "Ich kaufe Brot.", exampleBangla: "আমি রুটি কিনি।", category: "einkaufen" },
  { id: "einkaufen-07", german: "verkaufen", pos: "verb", bangla: "বিক্রি করা", example: "Er verkauft sein Auto.", exampleBangla: "সে তার গাড়ি বিক্রি করে।", category: "einkaufen" },
  { id: "einkaufen-08", german: "die Tasche", pos: "noun", bangla: "ব্যাগ", example: "Die Tasche ist schwer.", exampleBangla: "ব্যাগটি ভারী।", category: "einkaufen" },
  { id: "einkaufen-09", german: "die Kasse", pos: "noun", bangla: "ক্যাশ কাউন্টার", example: "Die Kasse ist dort.", exampleBangla: "ক্যাশ কাউন্টার ওখানে।", category: "einkaufen" },
  { id: "einkaufen-10", german: "der Kunde", pos: "noun", bangla: "গ্রাহক", example: "Der Kunde wartet.", exampleBangla: "গ্রাহক অপেক্ষা করছেন।", category: "einkaufen" },
  { id: "einkaufen-11", german: "geöffnet", pos: "adjective", bangla: "খোলা", example: "Das Geschäft ist geöffnet.", exampleBangla: "দোকানটি খোলা।", category: "einkaufen" },
  { id: "einkaufen-12", german: "geschlossen", pos: "adjective", bangla: "বন্ধ", example: "Heute ist geschlossen.", exampleBangla: "আজ বন্ধ।", category: "einkaufen" },

  // ---------- Wetter (10) ----------
  { id: "wetter-01", german: "die Sonne", pos: "noun", bangla: "সূর্য", example: "Die Sonne scheint.", exampleBangla: "সূর্য উঠেছে।", category: "wetter" },
  { id: "wetter-02", german: "der Regen", pos: "noun", bangla: "বৃষ্টি", example: "Der Regen ist stark.", exampleBangla: "বৃষ্টি জোরে হচ্ছে।", category: "wetter" },
  { id: "wetter-03", german: "der Schnee", pos: "noun", bangla: "তুষার", example: "Der Schnee ist weiß.", exampleBangla: "তুষার সাদা।", category: "wetter" },
  { id: "wetter-04", german: "der Wind", pos: "noun", bangla: "বাতাস", example: "Der Wind ist kalt.", exampleBangla: "বাতাস ঠান্ডা।", category: "wetter" },
  { id: "wetter-05", german: "die Wolke", pos: "noun", bangla: "মেঘ", example: "Die Wolke ist dunkel.", exampleBangla: "মেঘটি কালো।", category: "wetter" },
  { id: "wetter-06", german: "warm", pos: "adjective", bangla: "গরম", example: "Heute ist es warm.", exampleBangla: "আজ গরম।", category: "wetter" },
  { id: "wetter-07", german: "kalt", pos: "adjective", bangla: "ঠান্ডা", example: "Im Winter ist es kalt.", exampleBangla: "শীতকালে ঠান্ডা।", category: "wetter" },
  { id: "wetter-08", german: "sonnig", pos: "adjective", bangla: "রৌদ্রোজ্জ্বল", example: "Morgen wird es sonnig.", exampleBangla: "আগামীকাল রোদ উঠবে।", category: "wetter" },
  { id: "wetter-09", german: "regnerisch", pos: "adjective", bangla: "বৃষ্টিময়", example: "Es ist heute regnerisch.", exampleBangla: "আজ বৃষ্টির দিন।", category: "wetter" },
  { id: "wetter-10", german: "das Wetter", pos: "noun", bangla: "আবহাওয়া", example: "Das Wetter ist schön.", exampleBangla: "আবহাওয়া সুন্দর।", category: "wetter" },

  // ---------- Körper & Gesundheit (12) ----------
  { id: "koerper-01", german: "der Kopf", pos: "noun", bangla: "মাথা", example: "Mein Kopf tut weh.", exampleBangla: "আমার মাথা ব্যথা করছে।", category: "koerper" },
  { id: "koerper-02", german: "das Auge", pos: "noun", bangla: "চোখ", example: "Die Augen sind blau.", exampleBangla: "চোখগুলো নীল।", category: "koerper" },
  { id: "koerper-03", german: "die Nase", pos: "noun", bangla: "নাক", example: "Die Nase ist klein.", exampleBangla: "নাকটি ছোট।", category: "koerper" },
  { id: "koerper-04", german: "der Mund", pos: "noun", bangla: "মুখ", example: "Der Mund ist offen.", exampleBangla: "মুখ খোলা।", category: "koerper" },
  { id: "koerper-05", german: "die Hand", pos: "noun", bangla: "হাত", example: "Die Hand ist warm.", exampleBangla: "হাত গরম।", category: "koerper" },
  { id: "koerper-06", german: "der Fuß", pos: "noun", bangla: "পা", example: "Der Fuß tut weh.", exampleBangla: "পায়ে ব্যথা।", category: "koerper" },
  { id: "koerper-07", german: "das Herz", pos: "noun", bangla: "হৃদয়", example: "Das Herz schlägt.", exampleBangla: "হৃদয় ধুকধুক করছে।", category: "koerper" },
  { id: "koerper-08", german: "krank", pos: "adjective", bangla: "অসুস্থ", example: "Ich bin krank.", exampleBangla: "আমি অসুস্থ।", category: "koerper" },
  { id: "koerper-09", german: "gesund", pos: "adjective", bangla: "সুস্থ", example: "Bleib gesund!", exampleBangla: "সুস্থ থেকো!", category: "koerper" },
  { id: "koerper-10", german: "der Schmerz", pos: "noun", bangla: "ব্যথা", example: "Der Schmerz ist stark.", exampleBangla: "ব্যথা তীব্র।", category: "koerper" },
  { id: "koerper-11", german: "die Medizin", pos: "noun", bangla: "ওষুধ", example: "Die Medizin hilft.", exampleBangla: "ওষুধ সাহায্য করে।", category: "koerper" },
  { id: "koerper-12", german: "der Doktor", pos: "noun", bangla: "ডাক্তার", example: "Der Doktor kommt.", exampleBangla: "ডাক্তার আসছেন।", category: "koerper" },

  // ---------- Reisen & Verkehr (12) ----------
  { id: "reisen-01", german: "der Zug", pos: "noun", bangla: "ট্রেন", example: "Der Zug fährt ab.", exampleBangla: "ট্রেন ছাড়ছে।", category: "reisen" },
  { id: "reisen-02", german: "der Bus", pos: "noun", bangla: "বাস", example: "Der Bus ist voll.", exampleBangla: "বাস ভর্তি।", category: "reisen" },
  { id: "reisen-03", german: "das Auto", pos: "noun", bangla: "গাড়ি", example: "Das Auto ist neu.", exampleBangla: "গাড়িটি নতুন।", category: "reisen" },
  { id: "reisen-04", german: "das Flugzeug", pos: "noun", bangla: "বিমান", example: "Das Flugzeug fliegt.", exampleBangla: "বিমান উড়ছে।", category: "reisen" },
  { id: "reisen-05", german: "das Ticket", pos: "noun", bangla: "টিকিট", example: "Das Ticket kostet zehn Euro.", exampleBangla: "টিকিটের দাম দশ ইউরো।", category: "reisen" },
  { id: "reisen-06", german: "der Bahnhof", pos: "noun", bangla: "রেলস্টেশন", example: "Der Bahnhof ist nah.", exampleBangla: "স্টেশন কাছে।", category: "reisen" },
  { id: "reisen-07", german: "der Flughafen", pos: "noun", bangla: "বিমানবন্দর", example: "Der Flughafen ist groß.", exampleBangla: "বিমানবন্দরটি বড়।", category: "reisen" },
  { id: "reisen-08", german: "die Reise", pos: "noun", bangla: "ভ্রমণ", example: "Die Reise war schön.", exampleBangla: "ভ্রমণটি সুন্দর ছিল।", category: "reisen" },
  { id: "reisen-09", german: "fahren", pos: "verb", bangla: "যাওয়া (যানবাহনে)", example: "Ich fahre nach Berlin.", exampleBangla: "আমি বার্লিন যাচ্ছি।", category: "reisen" },
  { id: "reisen-10", german: "fliegen", pos: "verb", bangla: "ওড়া", example: "Wir fliegen nach Dhaka.", exampleBangla: "আমরা ঢাকায় উড়ে যাচ্ছি।", category: "reisen" },
  { id: "reisen-11", german: "die Straße", pos: "noun", bangla: "রাস্তা", example: "Die Straße ist lang.", exampleBangla: "রাস্তাটি লম্বা।", category: "reisen" },
  { id: "reisen-12", german: "die Karte", pos: "noun", bangla: "মানচিত্র / কার্ড", example: "Die Karte zeigt den Weg.", exampleBangla: "মানচিত্র পথ দেখায়।", category: "reisen" },

  // ---------- Freizeit (10) ----------
  { id: "freizeit-01", german: "das Hobby", pos: "noun", bangla: "শখ", example: "Mein Hobby ist Lesen.", exampleBangla: "আমার শখ পড়া।", category: "freizeit" },
  { id: "freizeit-02", german: "der Sport", pos: "noun", bangla: "খেলাধুলা", example: "Sport ist gesund.", exampleBangla: "খেলাধুলা স্বাস্থ্যকর।", category: "freizeit" },
  { id: "freizeit-03", german: "das Buch", pos: "noun", bangla: "বই", example: "Das Buch ist interessant.", exampleBangla: "বইটি মজার।", category: "freizeit" },
  { id: "freizeit-04", german: "der Film", pos: "noun", bangla: "সিনেমা", example: "Der Film ist lustig.", exampleBangla: "সিনেমাটি মজার।", category: "freizeit" },
  { id: "freizeit-05", german: "die Musik", pos: "noun", bangla: "গান / সঙ্গীত", example: "Ich höre gern Musik.", exampleBangla: "আমি গান শুনতে পছন্দ করি।", category: "freizeit" },
  { id: "freizeit-06", german: "spielen", pos: "verb", bangla: "খেলা", example: "Die Kinder spielen.", exampleBangla: "শিশুরা খেলছে।", category: "freizeit" },
  { id: "freizeit-07", german: "das Kino", pos: "noun", bangla: "সিনেমা হল", example: "Wir gehen ins Kino.", exampleBangla: "আমরা সিনেমা হলে যাচ্ছি।", category: "freizeit" },
  { id: "freizeit-08", german: "schwimmen", pos: "verb", bangla: "সাঁতার কাটা", example: "Ich schwimme gern.", exampleBangla: "আমি সাঁতার কাটতে পছন্দ করি।", category: "freizeit" },
  { id: "freizeit-09", german: "das Spiel", pos: "noun", bangla: "খেলা (গেম)", example: "Das Spiel beginnt.", exampleBangla: "খেলা শুরু হচ্ছে।", category: "freizeit" },
  { id: "freizeit-10", german: "der Park", pos: "noun", bangla: "পার্ক", example: "Der Park ist grün.", exampleBangla: "পার্কটি সবুজ।", category: "freizeit" },

  // ---------- Adjektive (14) ----------
  { id: "adjektive-01", german: "groß", pos: "adjective", bangla: "বড়", example: "Das Haus ist groß.", exampleBangla: "বাড়িটি বড়।", category: "adjektive" },
  { id: "adjektive-02", german: "klein", pos: "adjective", bangla: "ছোট", example: "Die Katze ist klein.", exampleBangla: "বিড়ালটি ছোট।", category: "adjektive" },
  { id: "adjektive-03", german: "neu", pos: "adjective", bangla: "নতুন", example: "Mein Handy ist neu.", exampleBangla: "আমার ফোন নতুন।", category: "adjektive" },
  { id: "adjektive-04", german: "alt", pos: "adjective", bangla: "পুরনো", example: "Das Auto ist alt.", exampleBangla: "গাড়িটি পুরনো।", category: "adjektive" },
  { id: "adjektive-05", german: "gut", pos: "adjective", bangla: "ভালো", example: "Das Essen schmeckt gut.", exampleBangla: "খাবারটি ভালো লাগছে।", category: "adjektive" },
  { id: "adjektive-06", german: "schlecht", pos: "adjective", bangla: "খারাপ", example: "Das Wetter ist schlecht.", exampleBangla: "আবহাওয়া খারাপ।", category: "adjektive" },
  { id: "adjektive-07", german: "schnell", pos: "adjective", bangla: "দ্রুত", example: "Der Zug ist schnell.", exampleBangla: "ট্রেনটি দ্রুত।", category: "adjektive" },
  { id: "adjektive-08", german: "langsam", pos: "adjective", bangla: "ধীর", example: "Die Schnecke ist langsam.", exampleBangla: "শামুক ধীর।", category: "adjektive" },
  { id: "adjektive-09", german: "schön", pos: "adjective", bangla: "সুন্দর", example: "Die Blume ist schön.", exampleBangla: "ফুলটি সুন্দর।", category: "adjektive" },
  { id: "adjektive-10", german: "hässlich", pos: "adjective", bangla: "কুৎসিত", example: "Das ist nicht hässlich.", exampleBangla: "এটা কুৎসিত নয়।", category: "adjektive" },
  { id: "adjektive-11", german: "jung", pos: "adjective", bangla: "তরুণ", example: "Er ist noch jung.", exampleBangla: "সে এখনো তরুণ।", category: "adjektive" },
  { id: "adjektive-12", german: "laut", pos: "adjective", bangla: "জোরে (শব্দ)", example: "Die Musik ist laut.", exampleBangla: "গান জোরে বাজছে।", category: "adjektive" },
  { id: "adjektive-13", german: "leise", pos: "adjective", bangla: "আস্তে", example: "Sprich bitte leise!", exampleBangla: "অনুগ্রহ করে আস্তে কথা বলো!", category: "adjektive" },
  { id: "adjektive-14", german: "richtig", pos: "adjective", bangla: "সঠিক", example: "Die Antwort ist richtig.", exampleBangla: "উত্তরটি সঠিক।", category: "adjektive" },

  // ---------- Verben (30) ----------
  { id: "verben-01", german: "sein", pos: "verb", bangla: "হওয়া", example: "Ich bin müde.", exampleBangla: "আমি ক্লান্ত।", category: "verben" },
  { id: "verben-02", german: "haben", pos: "verb", bangla: "থাকা (অধিকারে)", example: "Ich habe Zeit.", exampleBangla: "আমার সময় আছে।", category: "verben" },
  { id: "verben-03", german: "werden", pos: "verb", bangla: "হওয়া (পরিবর্তন)", example: "Es wird kalt.", exampleBangla: "ঠান্ডা হচ্ছে।", category: "verben" },
  { id: "verben-04", german: "gehen", pos: "verb", bangla: "যাওয়া", example: "Ich gehe nach Hause.", exampleBangla: "আমি বাড়ি যাচ্ছি।", category: "verben" },
  { id: "verben-05", german: "kommen", pos: "verb", bangla: "আসা", example: "Kommst du mit?", exampleBangla: "তুমি আসবে?", category: "verben" },
  { id: "verben-06", german: "machen", pos: "verb", bangla: "করা", example: "Ich mache Hausaufgaben.", exampleBangla: "আমি বাড়ির কাজ করছি।", category: "verben" },
  { id: "verben-07", german: "sprechen", pos: "verb", bangla: "কথা বলা", example: "Ich spreche Deutsch.", exampleBangla: "আমি জার্মান বলি।", category: "verben" },
  { id: "verben-08", german: "lesen", pos: "verb", bangla: "পড়া", example: "Ich lese ein Buch.", exampleBangla: "আমি একটি বই পড়ি।", category: "verben" },
  { id: "verben-09", german: "schreiben", pos: "verb", bangla: "লেখা", example: "Ich schreibe einen Brief.", exampleBangla: "আমি একটি চিঠি লিখি।", category: "verben" },
  { id: "verben-10", german: "sehen", pos: "verb", bangla: "দেখা", example: "Ich sehe dich.", exampleBangla: "আমি তোমাকে দেখি।", category: "verben" },
  { id: "verben-11", german: "geben", pos: "verb", bangla: "দেওয়া", example: "Gib mir bitte Wasser.", exampleBangla: "আমাকে পানি দাও।", category: "verben" },
  { id: "verben-12", german: "nehmen", pos: "verb", bangla: "নেওয়া", example: "Ich nehme den Bus.", exampleBangla: "আমি বাস নিই।", category: "verben" },
  { id: "verben-13", german: "finden", pos: "verb", bangla: "খুঁজে পাওয়া", example: "Ich finde den Schlüssel.", exampleBangla: "আমি চাবি খুঁজে পেয়েছি।", category: "verben" },
  { id: "verben-14", german: "bleiben", pos: "verb", bangla: "থাকা", example: "Bleib hier!", exampleBangla: "এখানে থাকো!", category: "verben" },
  { id: "verben-15", german: "heißen", pos: "verb", bangla: "নাম হওয়া", example: "Ich heiße Jubayer.", exampleBangla: "আমার নাম জুবায়ের।", category: "verben" },
  { id: "verben-16", german: "helfen", pos: "verb", bangla: "সাহায্য করা", example: "Kannst du mir helfen?", exampleBangla: "তুমি কি আমাকে সাহায্য করতে পারো?", category: "verben" },
  { id: "verben-17", german: "fragen", pos: "verb", bangla: "জিজ্ঞেস করা", example: "Ich frage den Lehrer.", exampleBangla: "আমি শিক্ষককে জিজ্ঞেস করি।", category: "verben" },
  { id: "verben-18", german: "antworten", pos: "verb", bangla: "উত্তর দেওয়া", example: "Er antwortet nicht.", exampleBangla: "সে উত্তর দেয় না।", category: "verben" },
  { id: "verben-19", german: "öffnen", pos: "verb", bangla: "খোলা", example: "Öffne bitte die Tür!", exampleBangla: "দরজা খোলো!", category: "verben" },
  { id: "verben-20", german: "schließen", pos: "verb", bangla: "বন্ধ করা", example: "Schließe das Fenster!", exampleBangla: "জানালা বন্ধ করো!", category: "verben" },
  { id: "verben-21", german: "waschen", pos: "verb", bangla: "ধোয়া", example: "Ich wasche meine Hände.", exampleBangla: "আমি হাত ধুই।", category: "verben" },
  { id: "verben-22", german: "putzen", pos: "verb", bangla: "পরিষ্কার করা", example: "Ich putze das Zimmer.", exampleBangla: "আমি ঘর পরিষ্কার করি।", category: "verben" },
  { id: "verben-23", german: "kochen", pos: "verb", bangla: "রান্না করা", example: "Mama kocht Reis.", exampleBangla: "মা ভাত রাঁধেন।", category: "verben" },
  { id: "verben-24", german: "backen", pos: "verb", bangla: "বেক করা", example: "Wir backen Brot.", exampleBangla: "আমরা রুটি বানাই।", category: "verben" },
  { id: "verben-25", german: "rennen", pos: "verb", bangla: "দৌড়ানো", example: "Das Kind rennt schnell.", exampleBangla: "শিশুটি দ্রুত দৌড়ায়।", category: "verben" },
  { id: "verben-26", german: "sitzen", pos: "verb", bangla: "বসা", example: "Ich sitze am Tisch.", exampleBangla: "আমি টেবিলে বসি।", category: "verben" },
  { id: "verben-27", german: "stehen", pos: "verb", bangla: "দাঁড়ানো", example: "Er steht vor der Tür.", exampleBangla: "সে দরজার সামনে দাঁড়িয়ে।", category: "verben" },
  { id: "verben-28", german: "liegen", pos: "verb", bangla: "শোয়া", example: "Die Katze liegt auf dem Bett.", exampleBangla: "বিড়ালটি বিছানায় শুয়ে।", category: "verben" },
  { id: "verben-29", german: "bringen", pos: "verb", bangla: "আনা", example: "Bring mir bitte Tee!", exampleBangla: "আমাকে চা এনে দাও!", category: "verben" },
  { id: "verben-30", german: "holen", pos: "verb", bangla: "নিয়ে আসা", example: "Ich hole dich ab.", exampleBangla: "আমি তোমাকে নিতে আসছি।", category: "verben" },
];

export function wordsByCategory(catId: string): VocabWord[] {
  return words.filter((w) => w.category === catId);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
