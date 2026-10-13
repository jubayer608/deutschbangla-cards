export interface PhraseItem {
  german: string;
  bangla: string;
}

export interface PhraseGroup {
  id: string;
  situation: string;
  situationBangla: string;
  items: PhraseItem[];
}

export const phraseGroups: PhraseGroup[] = [
  {
    id: "kennenlernen",
    situation: "Begrüßung & Kennenlernen",
    situationBangla: "পরিচয়",
    items: [
      { german: "Wie heißt du?", bangla: "তোমার নাম কী?" },
      { german: "Ich heiße Jubayer.", bangla: "আমার নাম জুবায়ের।" },
      { german: "Woher kommst du?", bangla: "তুমি কোথা থেকে এসেছো?" },
      { german: "Ich komme aus Bangladesch.", bangla: "আমি বাংলাদেশ থেকে এসেছি।" },
      { german: "Wie alt bist du?", bangla: "তোমার বয়স কত?" },
      { german: "Wo wohnst du?", bangla: "তুমি কোথায় থাকো?" },
      { german: "Ich wohne in Dhaka.", bangla: "আমি ঢাকায় থাকি।" },
      { german: "Freut mich, dich kennenzulernen!", bangla: "তোমার সাথে পরিচিত হয়ে আনন্দিত হলাম!" },
    ],
  },
  {
    id: "restaurant",
    situation: "Im Restaurant",
    situationBangla: "রেস্টুরেন্টে",
    items: [
      { german: "Einen Tisch für zwei, bitte.", bangla: "দুজনের জন্য একটি টেবিল, অনুগ্রহ করে।" },
      { german: "Die Speisekarte, bitte.", bangla: "মেনুটি, অনুগ্রহ করে।" },
      { german: "Was empfehlen Sie?", bangla: "আপনি কী সুপারিশ করবেন?" },
      { german: "Ich nehme das Hähnchen.", bangla: "আমি মুরগির মাংস নেব।" },
      { german: "Ein Glas Wasser, bitte.", bangla: "এক গ্লাস পানি, অনুগ্রহ করে।" },
      { german: "Das schmeckt sehr gut!", bangla: "এটা খুব সুস্বাদু!" },
      { german: "Die Rechnung, bitte.", bangla: "বিলটি, অনুগ্রহ করে।" },
      { german: "Kann ich mit Karte zahlen?", bangla: "আমি কি কার্ডে পেমেন্ট করতে পারি?" },
    ],
  },
  {
    id: "einkaufen",
    situation: "Beim Einkaufen",
    situationBangla: "কেনাকাটায়",
    items: [
      { german: "Wie viel kostet das?", bangla: "এটার দাম কত?" },
      { german: "Das ist zu teuer.", bangla: "এটা খুব দামি।" },
      { german: "Haben Sie das billiger?", bangla: "এর চেয়ে সস্তা কিছু আছে?" },
      { german: "Ich schaue nur, danke.", bangla: "আমি শুধু দেখছি, ধন্যবাদ।" },
      { german: "Wo ist die Kasse?", bangla: "ক্যাশ কাউন্টার কোথায়?" },
      { german: "Kann ich das umtauschen?", bangla: "আমি কি এটা বদলে নিতে পারি?" },
      { german: "Haben Sie das in einer anderen Größe?", bangla: "অন্য সাইজে আছে?" },
      { german: "Ich nehme es.", bangla: "আমি এটা নিচ্ছি।" },
    ],
  },
  {
    id: "arzt",
    situation: "Beim Arzt",
    situationBangla: "ডাক্তারের কাছে",
    items: [
      { german: "Ich bin krank.", bangla: "আমি অসুস্থ।" },
      { german: "Mein Kopf tut weh.", bangla: "আমার মাথা ব্যথা করছে।" },
      { german: "Ich habe Fieber.", bangla: "আমার জ্বর আছে।" },
      { german: "Mir ist schlecht.", bangla: "আমার বমি বমি লাগছে।" },
      { german: "Ich brauche einen Termin.", bangla: "আমার একটি অ্যাপয়েন্টমেন্ট দরকার।" },
      { german: "Wo tut es weh?", bangla: "কোথায় ব্যথা?" },
      { german: "Nehmen Sie diese Tabletten.", bangla: "এই ট্যাবলেটগুলো খান।" },
    ],
  },
  {
    id: "weg",
    situation: "Nach dem Weg fragen",
    situationBangla: "রাস্তা জিজ্ঞেস করা",
    items: [
      { german: "Entschuldigung, wo ist der Bahnhof?", bangla: "ক্ষমা করবেন, স্টেশন কোথায়?" },
      { german: "Wie komme ich zum Zentrum?", bangla: "আমি কেন্দ্রে কীভাবে যাব?" },
      { german: "Ist es weit von hier?", bangla: "এখান থেকে কি দূরে?" },
      { german: "Gehen Sie geradeaus.", bangla: "সোজা যান।" },
      { german: "Dann links abbiegen.", bangla: "তারপর বামে ঘুরুন।" },
      { german: "Es ist gleich um die Ecke.", bangla: "এটা ঠিক মোড়ের কাছেই।" },
      { german: "Vielen Dank für Ihre Hilfe!", bangla: "আপনার সাহায্যের জন্য অনেক ধন্যবাদ!" },
    ],
  },
  {
    id: "bahnhof",
    situation: "Am Bahnhof",
    situationBangla: "স্টেশনে",
    items: [
      { german: "Ein Ticket nach Berlin, bitte.", bangla: "বার্লিনের একটি টিকিট, অনুগ্রহ করে।" },
      { german: "Einfach oder hin und zurück?", bangla: "একমুখী না যাওয়া-আসা?" },
      { german: "Von welchem Gleis fährt der Zug ab?", bangla: "ট্রেন কোন প্ল্যাটফর্ম থেকে ছাড়বে?" },
      { german: "Der Zug hat Verspätung.", bangla: "ট্রেন দেরিতে আসছে।" },
      { german: "Wann kommt der nächste Zug?", bangla: "পরের ট্রেন কখন আসবে?" },
      { german: "Wo muss ich umsteigen?", bangla: "আমাকে কোথায় বদল করতে হবে?" },
      { german: "Gute Reise!", bangla: "শুভ যাত্রা!" },
    ],
  },
  {
    id: "telefon",
    situation: "Telefonieren",
    situationBangla: "ফোনে কথা বলা",
    items: [
      { german: "Hallo, hier spricht Jubayer.", bangla: "হ্যালো, জুবায়ের বলছি।" },
      { german: "Kann ich bitte mit Anna sprechen?", bangla: "আমি কি আন্নার সাথে কথা বলতে পারি?" },
      { german: "Einen Moment, bitte.", bangla: "এক মুহূর্ত, অনুগ্রহ করে।" },
      { german: "Könnten Sie das bitte wiederholen?", bangla: "আপনি কি এটা আবার বলবেন?" },
      { german: "Sprechen Sie bitte langsamer.", bangla: "অনুগ্রহ করে আস্তে বলুন।" },
      { german: "Ich rufe später zurück.", bangla: "আমি পরে ফোন করব।" },
      { german: "Auf Wiederhören!", bangla: "পরে কথা হবে!" },
    ],
  },
  {
    id: "schule",
    situation: "In der Schule",
    situationBangla: "স্কুলে",
    items: [
      { german: "Ich verstehe das nicht.", bangla: "আমি এটা বুঝিনি।" },
      { german: "Können Sie das erklären?", bangla: "আপনি কি এটা বুঝিয়ে দেবেন?" },
      { german: "Wie sagt man das auf Deutsch?", bangla: "এটা জার্মান ভাষায় কী বলে?" },
      { german: "Was bedeutet dieses Wort?", bangla: "এই শব্দের অর্থ কী?" },
      { german: "Darf ich eine Frage stellen?", bangla: "আমি কি একটি প্রশ্ন করতে পারি?" },
      { german: "Die Hausaufgaben sind fertig.", bangla: "বাড়ির কাজ শেষ।" },
      { german: "Bis morgen in der Schule!", bangla: "আগামীকাল স্কুলে দেখা হবে!" },
    ],
  },
  {
    id: "smalltalk",
    situation: "Small Talk",
    situationBangla: "হালকা আলাপ",
    items: [
      { german: "Wie war dein Wochenende?", bangla: "তোমার সপ্তাহান্ত কেমন কাটল?" },
      { german: "Was machst du beruflich?", bangla: "তুমি পেশায় কী করো?" },
      { german: "Ich arbeite als Entwickler.", bangla: "আমি ডেভেলপার হিসেবে কাজ করি।" },
      { german: "Was sind deine Hobbys?", bangla: "তোমার শখ কী?" },
      { german: "Ich spiele gern Fußball.", bangla: "আমি ফুটবল খেলতে পছন্দ করি।" },
      { german: "Schönes Wetter heute, oder?", bangla: "আজ সুন্দর আবহাওয়া, তাই না?" },
      { german: "Das freut mich zu hören!", bangla: "এটা শুনে আনন্দিত হলাম!" },
    ],
  },
  {
    id: "abschied",
    situation: "Verabschiedung",
    situationBangla: "বিদায়",
    items: [
      { german: "Tschüss, bis später!", bangla: "বিদায়, পরে দেখা হবে!" },
      { german: "Mach's gut!", bangla: "ভালো থেকো!" },
      { german: "Bis morgen!", bangla: "আগামীকাল দেখা হবে!" },
      { german: "Schönes Wochenende!", bangla: "সুন্দর সপ্তাহান্ত কাটাও!" },
      { german: "Pass auf dich auf!", bangla: "নিজের খেয়াল রেখো!" },
      { german: "Es war schön, dich zu sehen!", bangla: "তোমাকে দেখে ভালো লাগল!" },
      { german: "Wir sehen uns bald!", bangla: "শীঘ্রই দেখা হবে!" },
    ],
  },
];
