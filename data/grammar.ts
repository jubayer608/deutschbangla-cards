import type { Difficulty } from "./words";

export interface GrammarQuizQ {
  q: string;
  qBangla?: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: Difficulty;
}

export interface GrammarSection {
  heading: string;
  text: string;
  table?: { headers: string[]; rows: string[][] };
  examples?: { german: string; bangla: string }[];
}

export interface GrammarTopic {
  slug: string;
  title: string;
  titleBangla: string;
  intro: string;
  sections: GrammarSection[];
  tips: string[];
  quiz: GrammarQuizQ[];
}

export const grammarTopics: GrammarTopic[] = [
  {
    slug: "artikel",
    title: "Der, die, das",
    titleBangla: "ডের, ডি, ডাস — আর্টিকেল",
    intro:
      "জার্মান ভাষায় প্রতিটি বিশেষ্যের (Nomen) একটি ব্যাকরণগত লিঙ্গ (Genus) আছে: maskulin (der), feminin (die) বা neutrum (das)। দুঃখের বিষয়, লিঙ্গ বেশিরভাগ সময় যুক্তি দিয়ে বোঝা যায় না — মুখস্থ করতে হয়। তবে কিছু শেষাংশ (-ung, -chen …) দেখে আন্দাজ করা যায়।",
    sections: [
      {
        heading: "Bestimmter & unbestimmter Artikel",
        text: "নির্দিষ্ট (the) বোঝাতে der/die/das, অনির্দিষ্ট (a/an) বোঝাতে ein/eine/ein। Plural-এ অনির্দিষ্ট আর্টিকেল নেই।",
        table: {
          headers: ["", "maskulin", "feminin", "neutrum", "Plural"],
          rows: [
            ["bestimmt", "der", "die", "das", "die"],
            ["unbestimmt", "ein", "eine", "ein", "—"],
          ],
        },
        examples: [
          { german: "der Mann, die Frau, das Kind", bangla: "পুরুষটি, মহিলাটি, শিশুটি" },
          { german: "ein Mann, eine Frau, ein Kind", bangla: "একজন পুরুষ, একজন মহিলা, একটি শিশু" },
        ],
      },
      {
        heading: "Endungen verraten das Genus",
        text: "শব্দের শেষাংশ দেখে লিঙ্গ আন্দাজ করার কৌশল:",
        table: {
          headers: ["Endung", "Artikel", "Beispiele"],
          rows: [
            ["-ung", "die", "die Wohnung, die Zeitung"],
            ["-heit / -keit", "die", "die Krankheit, die Möglichkeit"],
            ["-schaft", "die", "die Freundschaft"],
            ["-tion", "die", "die Nation"],
            ["-chen / -lein", "das", "das Mädchen, das Brötchen"],
            ["-ment", "das", "das Medikament"],
            ["-ismus", "der", "der Tourismus"],
            ["-er (Berufe)", "der", "der Lehrer, der Fahrer"],
          ],
        },
      },
      {
        heading: "Tipp: Genus immer mitlernen",
        text: "নতুন শব্দ শেখার সময় সবসময় Artikel সহ শেখো — “Tisch” নয়, “der Tisch”। ভুল লিঙ্গ শিখলে পরে Akkusativ/Dativ-এ সমস্যা হবে।",
        examples: [{ german: "der Tisch, die Lampe, das Buch", bangla: "টেবিলটি, বাতিটি, বইটি" }],
      },
    ],
    tips: [
      "নতুন প্রতিটি Nomen Artikel সহ মুখস্থ করো: der Tisch, die Tür, das Fenster।",
      "-ung, -heit, -keit, -schaft → প্রায় সবসময় die।",
      "-chen, -lein → সবসময় das (das Mädchen মেয়ে হলেও das!)।",
      "অভিধানে m/f/n চিহ্ন দেখে লিঙ্গ যাচাই করো।",
    ],
    quiz: [
      {
        q: "Welcher Artikel passt zu „Tisch“ (maskulin)?",
        options: ["der", "die", "das", "den"],
        answer: "der",
        explanation: "der Tisch — maskulin → der।",
        difficulty: "easy",
      },
      {
        q: "___ Mädchen",
        options: ["Der", "Die", "Das", "Den"],
        answer: "Das",
        explanation: "-chen → das: das Mädchen।",
        difficulty: "easy",
      },
      {
        q: "Welches Wort ist feminin?",
        options: ["der Baum", "die Wohnung", "das Auto", "der Stuhl"],
        answer: "die Wohnung",
        explanation: "-ung → die: die Wohnung।",
        difficulty: "medium",
      },
      {
        q: "___ Zeitung liegt auf dem Tisch.",
        options: ["Der", "Die", "Das", "Den"],
        answer: "Die",
        explanation: "die Zeitung feminin → Die।",
        difficulty: "medium",
      },
      {
        q: "Welcher Artikel ist korrekt? „___ Brötchen“",
        options: ["der", "die", "das", "dem"],
        answer: "das",
        explanation: "-chen → immer das: das Brötchen।",
        difficulty: "hard",
      },
      {
        q: "Welches Paar ist FALSCH?",
        options: ["der Lehrer", "die Freundschaft", "das Mädchen", "die Tourismus"],
        answer: "die Tourismus",
        explanation: "-ismus → der: সঠিক রূপ der Tourismus।",
        difficulty: "hard",
      },
    ],
  },
  {
    slug: "pluralbildung",
    title: "Pluralbildung",
    titleBangla: "বহুবচন গঠন",
    intro:
      "জার্মানে বহুবচন (Plural) তৈরির ৫টি প্রধান নিয়ম আছে — দুর্ভাগ্যবশত কোন শব্দে কোন নিয়ম লাগবে তা মুখস্থ করতে হয়। সুখবর: Plural-এ আর্টিকেল সবসময় die।",
    sections: [
      {
        heading: "Die 5 Plural-Typen",
        text: "সবচেয়ে সাধারণ ৫টি বহুবচন গঠন:",
        table: {
          headers: ["Typ", "Beispiel", "Bangla"],
          rows: [
            ["-e", "der Tag → die Tage", "দিনগুলো"],
            ["-e + Umlaut", "der Sohn → die Söhne", "ছেলেগুলো"],
            ["-er + Umlaut", "das Kind → die Kinder", "শিশুরা"],
            ["-(e)n", "die Frau → die Frauen", "মহিলারা"],
            ["-s", "das Auto → die Autos", "গাড়িগুলো"],
          ],
        },
      },
      {
        heading: "Umlaut-Regel",
        text: "a → ä, o → ö, u → ü। -er বহুবচনে প্রায় সবসময় Umlaut হয়: Mann → Männer, Haus → Häuser, Buch → Bücher।",
        examples: [
          { german: "der Mann → die Männer", bangla: "লোকটি → লোকগুলো" },
          { german: "das Haus → die Häuser", bangla: "বাড়িটি → বাড়িগুলো" },
        ],
      },
      {
        heading: "Sonderfälle",
        text: "কিছু শব্দে শুধু Umlaut যোগ হয়, কিছু অপরিবর্তিত থাকে — এগুলো আলাদা করে মুখস্থ করো।",
        examples: [
          { german: "der Vater → die Väter", bangla: "বাবা → বাবারা" },
          { german: "die Mutter → die Mütter", bangla: "মা → মায়েরা" },
          { german: "das Fenster → die Fenster", bangla: "জানালা → জানালাগুলো" },
          { german: "der Lehrer → die Lehrer", bangla: "শিক্ষক → শিক্ষকরা" },
        ],
      },
    ],
    tips: [
      "Plural সবসময় Artikel সহ শেখো: der Apfel, die Äpfel।",
      "-er বহুবচন মানেই প্রায় নিশ্চিত Umlaut।",
      "বিদেশি শব্দে (Computer, Hotel) সাধারণত -s যোগ হয়।",
      "Plural-এ আর্টিকেল সবসময় die — লিঙ্গ আর গুরুত্বপূর্ণ নয়।",
    ],
    quiz: [
      {
        q: "Was ist der Plural von „der Tag“?",
        options: ["die Tage", "die Täge", "die Tager", "die Tagen"],
        answer: "die Tage",
        explanation: "der Tag → die Tage (-e, Umlaut ছাড়া)।",
        difficulty: "easy",
      },
      {
        q: "Welcher Artikel steht IMMER vor dem Plural?",
        options: ["der", "die", "das", "den"],
        answer: "die",
        explanation: "Plural-এ আর্টিকেল সবসময় die।",
        difficulty: "easy",
      },
      {
        q: "Was ist der Plural von „das Kind“?",
        options: ["die Kinde", "die Kinder", "die Kindes", "die Kinds"],
        answer: "die Kinder",
        explanation: "das Kind → die Kinder (-er)।",
        difficulty: "medium",
      },
      {
        q: "Was ist der Plural von „der Mann“?",
        options: ["die Manne", "die Männer", "die Mannen", "die Manns"],
        answer: "die Männer",
        explanation: "der Mann → die Männer (-er + Umlaut a→ä)।",
        difficulty: "medium",
      },
      {
        q: "Was ist der Plural von „der Vater“?",
        options: ["die Väter", "die Vaters", "die Vater", "die Vätern"],
        answer: "die Väter",
        explanation: "der Vater → die Väter (শুধু Umlaut)।",
        difficulty: "hard",
      },
      {
        q: "Welcher Plural ist FALSCH?",
        options: ["die Autos", "die Hotels", "die Frauen", "die Apfeln"],
        answer: "die Apfeln",
        explanation: "সঠিক: der Apfel → die Äpfel। “die Apfeln” ভুল।",
        difficulty: "hard",
      },
    ],
  },
  {
    slug: "personalpronomen",
    title: "Personalpronomen",
    titleBangla: "ব্যক্তিবাচক সর্বনাম",
    intro:
      "ich, du, er … — জার্মান সর্বনাম বাংলা/ইংরেজির মতোই, তবে একটি বিশেষত্ব আছে: Sie (বড় হাতের S) মানে ভদ্রতাসূচক “আপনি”।",
    sections: [
      {
        heading: "Übersicht",
        text: "৯টি রূপ — sie তিনবার আসে, অর্থ ভিন্ন:",
        table: {
          headers: ["Deutsch", "Bangla", "Beispiel"],
          rows: [
            ["ich", "আমি", "Ich lerne Deutsch."],
            ["du", "তুমি", "Du sprichst gut."],
            ["er", "সে (ছেলে)", "Er wohnt in Berlin."],
            ["sie", "সে (মেয়ে)", "Sie arbeitet hier."],
            ["es", "এটা/সেটা", "Es regnet."],
            ["wir", "আমরা", "Wir kommen morgen."],
            ["ihr", "তোমরা", "Ihr seid nett."],
            ["sie", "তারা", "Sie lernen Deutsch."],
            ["Sie", "আপনি (ভদ্র)", "Wie heißen Sie?"],
          ],
        },
      },
      {
        heading: "du oder Sie?",
        text: "বন্ধু, পরিবার, সমবয়সী ও শিশুদের সাথে du। অপরিচিত, বয়স্ক, অফিসে/দোকানে Sie। সন্দেহ হলে Sie ব্যবহার করো — ভদ্রতা কখনো ভুল নয়।",
        examples: [
          { german: "Wie heißt du? (Freund)", bangla: "তোমার নাম কী?" },
          { german: "Wie heißen Sie? (formal)", bangla: "আপনার নাম কী?" },
        ],
      },
      {
        heading: "sie / sie / Sie",
        text: "ছোট হাতের sie = সে (মেয়ে) বা তারা; বড় হাতের Sie = আপনি। উচ্চারণ একই — প্রসঙ্গ ও Verb-এর রূপ দেখে বুঝতে হয়।",
        examples: [
          { german: "Sie lernt Deutsch.", bangla: "সে (মেয়ে) জার্মান শেখে।" },
          { german: "Lernen Sie Deutsch?", bangla: "আপনি কি জার্মান শেখেন?" },
        ],
      },
    ],
    tips: [
      "Sie (আপনি) সবসময় বড় হাতের S দিয়ে — বাক্যের মাঝখানেও।",
      "Verb-এর রূপ দেখে বুঝো: sie lernt (সে) বনাম sie lernen (তারা)।",
      "es শুধু বস্তু/প্রাণীর জন্য, মানুষের জন্য নয়।",
      "বন্ধুদের দলকে সম্বোধনে ihr ব্যবহার করো: Wo seid ihr?",
    ],
    quiz: [
      {
        q: "Was bedeutet „ich“?",
        options: ["তুমি", "আমি", "সে", "আমরা"],
        answer: "আমি",
        explanation: "ich = আমি।",
        difficulty: "easy",
      },
      {
        q: "Welche Form ist höflich?",
        options: ["du", "ihr", "Sie", "er"],
        answer: "Sie",
        explanation: "Sie (বড় হাতের S) = ভদ্রতাসূচক “আপনি”।",
        difficulty: "easy",
      },
      {
        q: "___ lernt Deutsch. (sie – weiblich, singular)",
        options: ["Sie", "sie", "Es", "Ihr"],
        answer: "sie",
        explanation: "সে (মেয়ে) = ছোট হাতের sie: sie lernt।",
        difficulty: "medium",
      },
      {
        q: "Wie heißen ___? (höflich)",
        options: ["du", "er", "Sie", "ihr"],
        answer: "Sie",
        explanation: "ভদ্র প্রশ্ন: Wie heißen Sie?",
        difficulty: "medium",
      },
      {
        q: "In „Sie trinken Tee“ bedeutet „Sie“:",
        options: ["সে (মেয়ে)", "তারা / আপনি", "এটা", "আমি"],
        answer: "তারা / আপনি",
        explanation: "trinken (বহুবচন Verb) → sie = তারা অথবা Sie = আপনি; “সে (মেয়ে)” হলে trinkt হতো।",
        difficulty: "hard",
      },
      {
        q: "Welcher Satz ist FALSCH?",
        options: [
          "Ich lerne Deutsch.",
          "Du lernst Deutsch.",
          "Er lernen Deutsch.",
          "Wir lernen Deutsch.",
        ],
        answer: "Er lernen Deutsch.",
        explanation: "er → lernt: Er lernt Deutsch।",
        difficulty: "hard",
      },
    ],
  },
  {
    slug: "verbkonjugation",
    title: "Verbkonjugation im Präsens",
    titleBangla: "বর্তমান কালে ক্রিয়ার রূপ",
    intro:
      "জার্মান Verb-এর মূল রূপ (Infinitiv) -en দিয়ে শেষ হয়: machen, lernen, wohnen। Subject অনুযায়ী শেষাংশ বদলায় — এই নিয়ম শিখলেই ৯০% Verb পারবে।",
    sections: [
      {
        heading: "Regelmäßige Verben",
        text: "Stamm (machen → mach-) + Endung:",
        table: {
          headers: ["Person", "Endung", "machen"],
          rows: [
            ["ich", "-e", "ich mache"],
            ["du", "-st", "du machst"],
            ["er/sie/es", "-t", "er macht"],
            ["wir", "-en", "wir machen"],
            ["ihr", "-t", "ihr macht"],
            ["sie/Sie", "-en", "sie machen"],
          ],
        },
      },
      {
        heading: "sein & haben (unregelmäßig)",
        text: "সবচেয়ে গুরুত্বপূর্ণ দুটি Verb সম্পূর্ণ মুখস্থ করতে হবে:",
        table: {
          headers: ["Person", "sein", "haben"],
          rows: [
            ["ich", "bin", "habe"],
            ["du", "bist", "hast"],
            ["er/sie/es", "ist", "hat"],
            ["wir", "sind", "haben"],
            ["ihr", "seid", "habt"],
            ["sie/Sie", "sind", "haben"],
          ],
        },
      },
      {
        heading: "werden",
        text: "werden = হওয়া। A1-এ মূল অর্থ শেখো:",
        table: {
          headers: ["Person", "werden"],
          rows: [
            ["ich", "werde"],
            ["du", "wirst"],
            ["er/sie/es", "wird"],
            ["wir", "werden"],
            ["ihr", "werdet"],
            ["sie/Sie", "werden"],
          ],
        },
        examples: [{ german: "Ich werde Lehrer.", bangla: "আমি শিক্ষক হবো।" }],
      },
    ],
    tips: [
      "প্রথমে Endung-গুলো মুখস্থ করো: -e, -st, -t, -en, -t, -en।",
      "sein/haben/werden — এই তিনটি সম্পূর্ণ মুখস্থ, কোনো শর্টকাট নেই।",
      "Verb-এর Stamm খুঁজতে -en বাদ দাও: lern-en → lern-।",
      "du-র -st আর er-এর -t গুলিয়ে ফেলো না: du machst, er macht।",
    ],
    quiz: [
      {
        q: "Ich ___ Deutsch. (lernen)",
        options: ["lerne", "lernst", "lernt", "lernen"],
        answer: "lerne",
        explanation: "ich + -e: ich lerne।",
        difficulty: "easy",
      },
      {
        q: "Er ___ in Berlin. (wohnen)",
        options: ["wohne", "wohnst", "wohnt", "wohnen"],
        answer: "wohnt",
        explanation: "er + -t: er wohnt।",
        difficulty: "easy",
      },
      {
        q: "Du ___ ein Student. (sein)",
        options: ["bist", "bin", "ist", "seid"],
        answer: "bist",
        explanation: "du bist (sein অনিয়মিত)।",
        difficulty: "medium",
      },
      {
        q: "Wir ___ Hunger. (haben)",
        options: ["habe", "hast", "haben", "habt"],
        answer: "haben",
        explanation: "wir haben।",
        difficulty: "medium",
      },
      {
        q: "___ ihr morgen Zeit? (haben)",
        options: ["Habt", "Hast", "Haben", "Hat"],
        answer: "Habt",
        explanation: "ihr habt: Habt ihr …?",
        difficulty: "hard",
      },
      {
        q: "Welcher Satz ist FALSCH?",
        options: ["Ich werde müde.", "Er wird Arzt.", "Du wirst krank.", "Wir wird Lehrer."],
        answer: "Wir wird Lehrer.",
        explanation: "wir werden: Wir werden Lehrer।",
        difficulty: "hard",
      },
    ],
  },
  {
    slug: "satzbau",
    title: "Satzbau",
    titleBangla: "বাক্য গঠন",
    intro:
      "জার্মান বাক্যের সোনালি নিয়ম: সাধারণ বাক্যে Verb সবসময় ২য় স্থানে (Verbzweitstellung)। হ্যাঁ/না প্রশ্নে Verb ১ম স্থানে।",
    sections: [
      {
        heading: "Aussagesatz: Verb an 2. Stelle",
        text: "Subject যেখানেই থাকুক, conjugated Verb ২য় position-এ:",
        examples: [
          { german: "Ich lerne Deutsch.", bangla: "আমি জার্মান শিখি।" },
          { german: "Heute lerne ich Deutsch.", bangla: "আজ আমি জার্মান শিখি।" },
          { german: "Am Montag habe ich keine Zeit.", bangla: "সোমবার আমার সময় নেই।" },
        ],
      },
      {
        heading: "Ja/Nein-Fragen: Verb an 1. Stelle",
        text: "হ্যাঁ/না প্রশ্নে Verb প্রথমে, শেষে প্রশ্নবোধক চিহ্ন:",
        examples: [
          { german: "Lernst du Deutsch?", bangla: "তুমি কি জার্মান শেখো?" },
          { german: "Wohnst du in Dhaka?", bangla: "তুমি কি ঢাকায় থাকো?" },
          { german: "Ja, ich lerne Deutsch.", bangla: "হ্যাঁ, আমি জার্মান শিখি।" },
        ],
      },
      {
        heading: "W-Fragen",
        text: "প্রশ্নবোধক শব্দ প্রথমে, তারপর Verb:",
        table: {
          headers: ["Fragewort", "Bedeutung", "Beispiel"],
          rows: [
            ["wer", "কে", "Wer bist du?"],
            ["was", "কী", "Was machst du?"],
            ["wo", "কোথায়", "Wo wohnst du?"],
            ["woher", "কোথা থেকে", "Woher kommst du?"],
            ["wohin", "কোন দিকে", "Wohin gehst du?"],
            ["wann", "কখন", "Wann kommst du?"],
            ["wie", "কেমন/কীভাবে", "Wie geht es dir?"],
            ["warum", "কেন", "Warum lernst du Deutsch?"],
          ],
        },
      },
    ],
    tips: [
      "Verb-এর position গুনতে শেখো: Heute(1) lerne(2) ich Deutsch।",
      "W-Frage-তে: Fragewort(1) + Verb(2) + Subject।",
      "und/aber/oder-এর পর নতুন করে গণনা শুরু হয়।",
      "সময়/স্থান আগে আনলেও Verb ২য় স্থানেই থাকে।",
    ],
    quiz: [
      {
        q: "Wo steht das Verb im Aussagesatz?",
        options: ["1. Stelle", "2. Stelle", "3. Stelle", "am Ende"],
        answer: "2. Stelle",
        explanation: "Verbzweitstellung: Verb ২য় স্থানে।",
        difficulty: "easy",
      },
      {
        q: "Welcher Satz ist eine Ja/Nein-Frage?",
        options: ["Du lernst Deutsch.", "Lernst du Deutsch?", "Was lernst du?", "Ich lerne Deutsch."],
        answer: "Lernst du Deutsch?",
        explanation: "Verb প্রথমে + ? = হ্যাঁ/না প্রশ্ন।",
        difficulty: "easy",
      },
      {
        q: "___ wohnst du? (wo)",
        options: ["Wo", "Wer", "Wann", "Was"],
        answer: "Wo",
        explanation: "কোথায় = wo।",
        difficulty: "medium",
      },
      {
        q: "Welcher Satz ist korrekt?",
        options: [
          "Heute ich lerne Deutsch.",
          "Heute lerne ich Deutsch.",
          "Ich heute lerne Deutsch.",
          "Heute Deutsch ich lerne.",
        ],
        answer: "Heute lerne ich Deutsch.",
        explanation: "Heute(1) lerne(2) ich — Verb ২য় স্থানে।",
        difficulty: "medium",
      },
      {
        q: "___ kommst du? — „Aus Bangladesch.“",
        options: ["Wo", "Woher", "Wohin", "Wann"],
        answer: "Woher",
        explanation: "কোথা থেকে = woher।",
        difficulty: "hard",
      },
      {
        q: "Stelle um (Zeit zuerst): „Ich gehe heute ins Kino.“",
        options: [
          "Heute ich gehe ins Kino.",
          "Heute gehe ich ins Kino.",
          "Ich heute gehe ins Kino.",
          "Gehe ich heute ins Kino.",
        ],
        answer: "Heute gehe ich ins Kino.",
        explanation: "Heute(1) gehe(2) ich ins Kino।",
        difficulty: "hard",
      },
    ],
  },
  {
    slug: "negation",
    title: "Negation: nicht & kein",
    titleBangla: "না-বোধক: nicht ও kein",
    intro: "জার্মানে “না” বলার দুটি শব্দ: kein (বিশেষ্যের আগে) ও nicht (বাকি সব জায়গায়)।",
    sections: [
      {
        heading: "kein vor Nomen",
        text: "অনির্দিষ্ট বিশেষ্যকে না বলতে kein — এটি ein-এর মতো রূপ বদলায়:",
        table: {
          headers: ["", "maskulin", "feminin", "neutrum"],
          rows: [
            ["Nominativ", "kein", "keine", "kein"],
            ["Akkusativ", "keinen", "keine", "kein"],
          ],
        },
        examples: [
          { german: "Ich habe kein Auto.", bangla: "আমার গাড়ি নেই।" },
          { german: "Das ist keine Frage.", bangla: "এটা কোনো প্রশ্ন নয়।" },
          { german: "Er trinkt keinen Kaffee.", bangla: "সে কফি খায় না।" },
        ],
      },
      {
        heading: "nicht vor Verb & Adjektiv",
        text: "Verb, Adjektiv বা পুরো বাক্যকে না বলতে nicht:",
        examples: [
          { german: "Ich komme nicht.", bangla: "আমি আসছি না।" },
          { german: "Das ist nicht teuer.", bangla: "এটা দামি নয়।" },
          { german: "Ich lerne heute nicht.", bangla: "আমি আজ পড়ছি না।" },
        ],
      },
      {
        heading: "Position von nicht",
        text: "nicht সাধারণত বাক্যের শেষের দিকে বসে, কিন্তু নির্দিষ্ট শব্দের আগে বসে শুধু সেটাকেই না করে:",
        examples: [
          { german: "Ich arbeite nicht heute, sondern morgen.", bangla: "আমি আজ নয়, আগামীকাল কাজ করবো।" },
          { german: "Das ist nicht mein Buch.", bangla: "এটা আমার বই নয়।" },
        ],
      },
    ],
    tips: [
      "Nomen-এর আগে → kein; বাকি সব → nicht।",
      "kein ein-এর মতো বদলায়: keinen Mann, keine Frau।",
      "নির্দিষ্ট Nomen (der/die/das) না করতে nicht: nicht der Mann।",
      "“আর না” = nicht mehr; “এখনো না” = noch nicht।",
    ],
    quiz: [
      {
        q: "Ich habe ___ Auto.",
        options: ["kein", "keine", "keinen", "nicht"],
        answer: "kein",
        explanation: "das Auto neutrum → kein Auto।",
        difficulty: "easy",
      },
      {
        q: "Das ist ___ teuer.",
        options: ["kein", "keine", "nicht", "keinen"],
        answer: "nicht",
        explanation: "Adjektiv-এর আগে nicht।",
        difficulty: "easy",
      },
      {
        q: "Er trinkt ___ Kaffee.",
        options: ["nicht", "kein", "keinen", "keine"],
        answer: "keinen",
        explanation: "der Kaffee → Akkusativ: keinen Kaffee।",
        difficulty: "medium",
      },
      {
        q: "Welcher Satz ist korrekt?",
        options: [
          "Ich habe nicht Auto.",
          "Ich habe kein Auto.",
          "Ich kein habe Auto.",
          "Ich habe einen kein Auto.",
        ],
        answer: "Ich habe kein Auto.",
        explanation: "অনির্দিষ্ট Nomen → kein।",
        difficulty: "medium",
      },
      {
        q: "Das ist ___ mein Buch.",
        options: ["kein", "keine", "nicht", "keinen"],
        answer: "nicht",
        explanation: "নির্দিষ্ট Nomen (mein Buch) → nicht।",
        difficulty: "hard",
      },
      {
        q: "Ich spreche ___ Deutsch. („noch nicht“)",
        options: ["kein", "keine", "noch nicht", "nicht kein"],
        answer: "noch nicht",
        explanation: "“এখনো না” = noch nicht: Ich spreche noch nicht Deutsch।",
        difficulty: "hard",
      },
    ],
  },
  {
    slug: "akkusativ-dativ",
    title: "Akkusativ & Dativ",
    titleBangla: "কর্মকারক ও সম্প্রদান কারক",
    intro:
      "A1-এ প্রথমে Akkusativ (কাকে? কী?) শেখো; Dativ (কোথায়? কাকে দিলাম?) Wechselpräpositionen-এর সাথে আসে।",
    sections: [
      {
        heading: "Akkusativ: Wen? Was?",
        text: "Direct object Akkusativ-এ। শুধু maskulin বদলায়:",
        table: {
          headers: ["", "der", "die", "das", "Pl."],
          rows: [
            ["Nominativ", "der", "die", "das", "die"],
            ["Akkusativ", "den", "die", "das", "die"],
          ],
        },
        examples: [
          { german: "Ich sehe den Mann.", bangla: "আমি লোকটাকে দেখছি।" },
          { german: "Sie kauft die Milch.", bangla: "সে দুধটা কিনছে।" },
        ],
      },
      {
        heading: "Personalpronomen im Akkusativ",
        text: "সর্বনামের Akkusativ রূপ মুখস্থ করো:",
        table: {
          headers: ["Nominativ", "Akkusativ", "Beispiel"],
          rows: [
            ["ich", "mich", "Er sieht mich."],
            ["du", "dich", "Ich rufe dich an."],
            ["er", "ihn", "Sie kennt ihn."],
            ["sie", "sie", "Ich liebe sie."],
            ["es", "es", "Wir kaufen es."],
            ["wir", "uns", "Er besucht uns."],
            ["ihr", "euch", "Ich sehe euch."],
            ["sie/Sie", "sie/Sie", "Ich verstehe Sie."],
          ],
        },
      },
      {
        heading: "Wechselpräpositionen: in/auf",
        text: "in, auf, an, unter, neben … — Wohin? (দিকে) → Akkusativ; Wo? (কোথায়) → Dativ:",
        examples: [
          { german: "Ich gehe in die Küche. (Wohin?)", bangla: "আমি রান্নাঘরে যাচ্ছি।" },
          { german: "Ich bin in der Küche. (Wo?)", bangla: "আমি রান্নাঘরে আছি।" },
          { german: "Leg das Buch auf den Tisch! (Wohin?)", bangla: "বইটা টেবিলে রাখো!" },
        ],
      },
    ],
    tips: [
      "Wen/Was প্রশ্নের উত্তর = Akkusativ।",
      "শুধু der → den বদলায় — এটাই ৮০% কাজ।",
      "Wohin? → Akkusativ, Wo? → Dativ (Wechselpräpositionen)।",
      "mich/dich গুলিয়ে ফেলো না: Ich wasche mich (আমি নিজেকে ধুই)।",
    ],
    quiz: [
      {
        q: "Ich sehe ___ Mann.",
        options: ["der", "den", "dem", "die"],
        answer: "den",
        explanation: "Akkusativ maskulin: den Mann।",
        difficulty: "easy",
      },
      {
        q: "„___ siehst du?“ (Wen?/Wer?)",
        options: ["Wer", "Wen", "Wem", "Was"],
        answer: "Wen",
        explanation: "Wen? = কাকে? (Akkusativ)।",
        difficulty: "easy",
      },
      {
        q: "Ich rufe ___ an. (du)",
        options: ["dir", "dich", "du", "dein"],
        answer: "dich",
        explanation: "anrufen + Akkusativ: dich।",
        difficulty: "medium",
      },
      {
        q: "Ich gehe in ___ Küche. (Wohin?)",
        options: ["der", "die", "den", "dem"],
        answer: "die",
        explanation: "Wohin? → Akkusativ: in die Küche।",
        difficulty: "medium",
      },
      {
        q: "Ich bin in ___ Küche. (Wo?)",
        options: ["die", "der", "den", "dem"],
        answer: "der",
        explanation: "Wo? → Dativ: in der Küche।",
        difficulty: "hard",
      },
      {
        q: "Leg das Buch auf ___ Tisch! (Wohin?)",
        options: ["der", "den", "dem", "die"],
        answer: "den",
        explanation: "Wohin? (গতি) → Akkusativ: auf den Tisch।",
        difficulty: "hard",
      },
    ],
  },
  {
    slug: "possessivartikel",
    title: "Possessivartikel",
    titleBangla: "সম্বন্ধসূচক আর্টিকেল",
    intro: "mein, dein, sein … = আমার, তোমার, তার … — এগুলো ein-এর মতো রূপ বদলায়।",
    sections: [
      {
        heading: "Tabelle (Nominativ)",
        text: "ভিত্তি রূপ + -e (feminin/Plural):",
        table: {
          headers: ["Person", "der/das", "die/Pl."],
          rows: [
            ["ich", "mein", "meine"],
            ["du", "dein", "deine"],
            ["er/es", "sein", "seine"],
            ["sie", "ihr", "ihre"],
            ["wir", "unser", "unsere"],
            ["ihr", "euer", "eure"],
            ["sie/Sie", "ihr", "ihre"],
          ],
        },
      },
      {
        heading: "Akkusativ",
        text: "Akkusativ-এ শুধু maskulin-এ -en যোগ হয় (ein-এর মতো):",
        examples: [
          { german: "Ich sehe meinen Vater.", bangla: "আমি আমার বাবাকে দেখছি।" },
          { german: "Sie liebt ihre Mutter.", bangla: "সে তার মাকে ভালোবাসে।" },
        ],
      },
      {
        heading: "sein oder ihr?",
        text: "er/es → sein (তার — ছেলে/এটা); sie (মেয়ে) → ihr (তার)। ভুল সবচেয়ে বেশি এখানেই হয়!",
        examples: [
          { german: "Er liebt seine Frau.", bangla: "সে (ছেলে) তার স্ত্রীকে ভালোবাসে।" },
          { german: "Sie liebt ihren Mann.", bangla: "সে (মেয়ে) তার স্বামীকে ভালোবাসে।" },
        ],
      },
    ],
    tips: [
      "mein/meine: der/das → mein; die/Plural → meine।",
      "er/es → sein, sie (মেয়ে) → ihr — মনোযোগ দাও!",
      "Akkusativ maskulin: meinen/deinen/seinen …।",
      "euer → eure (একটি e বাদ যায়): eure Familie।",
    ],
    quiz: [
      {
        q: "___ Buch (ich)",
        options: ["mein", "meine", "meinen", "meiner"],
        answer: "mein",
        explanation: "das Buch neutrum → mein Buch।",
        difficulty: "easy",
      },
      {
        q: "___ Mutter (ich)",
        options: ["mein", "meine", "meinen", "meiner"],
        answer: "meine",
        explanation: "die Mutter feminin → meine Mutter।",
        difficulty: "easy",
      },
      {
        q: "Das ist ___ Vater. (er)",
        options: ["sein", "seine", "seinen", "ihr"],
        answer: "sein",
        explanation: "er → sein; der Vater → sein Vater।",
        difficulty: "medium",
      },
      {
        q: "Wo ist ___ Tasche? (du)",
        options: ["dein", "deine", "deinen", "deiner"],
        answer: "deine",
        explanation: "die Tasche → deine Tasche।",
        difficulty: "medium",
      },
      {
        q: "Ich besuche ___ Großeltern. (wir)",
        options: ["unser", "unsere", "unseren", "unserem"],
        answer: "unsere",
        explanation: "die Großeltern (Pl.) → unsere Großeltern।",
        difficulty: "hard",
      },
      {
        q: "Sie (weiblich) liebt ___ Mann. (Akkusativ)",
        options: ["ihr", "ihre", "ihren", "ihrem"],
        answer: "ihren",
        explanation: "sie → ihr; Akkusativ maskulin: ihren Mann।",
        difficulty: "hard",
      },
    ],
  },
  {
    slug: "modalverben",
    title: "Modalverben",
    titleBangla: "মোডাল ক্রিয়া",
    intro:
      "können, müssen, wollen, dürfen, sollen, mögen — এই ৬টি Verb অন্য Verb-এর সাথে বসে ইচ্ছা, সামর্থ্য, বাধ্যবাধকতা বা অনুমতি প্রকাশ করে।",
    sections: [
      {
        heading: "Konjugation",
        text: "ich/er/es রূপে Umlaut থাকে না! (möchten হলো mögen-এর বিশেষ রূপ, “ভদ্রভাবে চাই” অর্থে)",
        table: {
          headers: ["", "können", "müssen", "wollen", "dürfen", "sollen"],
          rows: [
            ["ich", "kann", "muss", "will", "darf", "soll"],
            ["du", "kannst", "musst", "willst", "darfst", "sollst"],
            ["er/sie/es", "kann", "muss", "will", "darf", "soll"],
            ["wir", "können", "müssen", "wollen", "dürfen", "sollen"],
            ["ihr", "könnt", "müsst", "wollt", "dürft", "sollt"],
            ["sie/Sie", "können", "müssen", "wollen", "dürfen", "sollen"],
          ],
        },
      },
      {
        heading: "Bedeutungen",
        text: "প্রতিটির অর্থ আলাদা — গুলিয়ে ফেলো না:",
        table: {
          headers: ["Modalverb", "Bedeutung", "Beispiel"],
          rows: [
            ["können", "পারা / সামর্থ্য", "Ich kann schwimmen."],
            ["müssen", "বাধ্য (নিজের প্রয়োজন)", "Ich muss arbeiten."],
            ["wollen", "চাওয়া (দৃঢ়)", "Ich will nach Hause."],
            ["dürfen", "অনুমতি", "Darf ich herein?"],
            ["sollen", "উচিত / নির্দেশ", "Du sollst ruhig sein."],
            ["möchten", "ভদ্রভাবে চাওয়া", "Ich möchte einen Tee."],
          ],
        },
      },
      {
        heading: "Satzbau",
        text: "Modalverb conjugated হয়ে ২য় স্থানে, মূল Verb Infinitiv-এ বাক্যের শেষে:",
        examples: [
          { german: "Ich muss heute früh aufstehen.", bangla: "আমাকে আজ তাড়াতাড়ি উঠতে হবে।" },
          { german: "Kannst du mir helfen?", bangla: "তুমি কি আমাকে সাহায্য করতে পারবে?" },
          { german: "Wir wollen Deutsch lernen.", bangla: "আমরা জার্মান শিখতে চাই।" },
        ],
      },
    ],
    tips: [
      "ich kann, er kann — Umlaut ছাড়া! (können → kann)",
      "Modalverb-এর পরে মূল Verb সবসময় Infinitiv, বাক্যের শেষে।",
      "müssen = ভেতর থেকে বাধ্য; sollen = বাইরে থেকে নির্দেশ।",
      "ভদ্রভাবে চাইতে möchten ব্যবহার করো: Ich möchte zahlen।",
    ],
    quiz: [
      {
        q: "Ich ___ schwimmen. (können)",
        options: ["kann", "könne", "kannst", "können"],
        answer: "kann",
        explanation: "ich kann।",
        difficulty: "easy",
      },
      {
        q: "Was bedeutet „müssen“?",
        options: ["পারা", "চাওয়া", "বাধ্য হওয়া", "অনুমতি পাওয়া"],
        answer: "বাধ্য হওয়া",
        explanation: "müssen = করতে বাধ্য।",
        difficulty: "easy",
      },
      {
        q: "Du ___ mir helfen. (können)",
        options: ["kann", "kannst", "könnt", "können"],
        answer: "kannst",
        explanation: "du kannst।",
        difficulty: "medium",
      },
      {
        q: "Welcher Satz ist korrekt?",
        options: [
          "Ich will nach Hause gehen.",
          "Ich nach Hause will gehen.",
          "Ich will gehen nach Hause.",
          "Gehen ich will nach Hause.",
        ],
        answer: "Ich will nach Hause gehen.",
        explanation: "Modalverb ২য় স্থানে, Infinitiv শেষে।",
        difficulty: "medium",
      },
      {
        q: "___ ich herein? (Erlaubnis)",
        options: ["Kann", "Darf", "Muss", "Will"],
        answer: "Darf",
        explanation: "অনুমতি চাইতে dürfen: Darf ich …?",
        difficulty: "hard",
      },
      {
        q: "Er ___ heute Überstunden machen. (müssen)",
        options: ["muss", "müsst", "musst", "müssen"],
        answer: "muss",
        explanation: "er muss — Umlaut ছাড়া।",
        difficulty: "hard",
      },
    ],
  },
  {
    slug: "trennbare-verben",
    title: "Trennbare Verben",
    titleBangla: "বিচ্ছিন্ন ক্রিয়া",
    intro:
      "anrufen, aufstehen, einkaufen — এই Verb-গুলোর prefix মূল অংশ থেকে আলাদা হয়ে বাক্যের শেষে চলে যায়।",
    sections: [
      {
        heading: "Häufige trennbare Verben",
        text: "সবচেয়ে দরকারি ৮টি:",
        table: {
          headers: ["Infinitiv", "Bedeutung", "Präsens (ich)"],
          rows: [
            ["anrufen", "ফোন করা", "ich rufe an"],
            ["aufstehen", "ঘুম থেকে ওঠা", "ich stehe auf"],
            ["einkaufen", "বাজার করা", "ich kaufe ein"],
            ["fernsehen", "টিভি দেখা", "ich sehe fern"],
            ["mitkommen", "সাথে আসা", "ich komme mit"],
            ["ausgehen", "বাইরে যাওয়া", "ich gehe aus"],
            ["vorstellen", "পরিচয় করিয়ে দেওয়া", "ich stelle vor"],
            ["zumachen", "বন্ধ করা", "ich mache zu"],
          ],
        },
      },
      {
        heading: "Die Regel",
        text: "Conjugated Verb ২য় স্থানে, prefix বাক্যের একদম শেষে — মাঝে যত শব্দই থাকুক:",
        examples: [
          { german: "Ich stehe um 7 Uhr auf.", bangla: "আমি ৭টায় ঘুম থেকে উঠি।" },
          { german: "Rufst du mich morgen an?", bangla: "তুমি কি আগামীকাল আমাকে ফোন করবে?" },
        ],
      },
      {
        heading: "Mit Modalverb",
        text: "Modalverb থাকলে trennbares Verb Infinitiv-এ একসাথে বাক্যের শেষে বসে:",
        examples: [
          { german: "Ich muss früh aufstehen.", bangla: "আমাকে তাড়াতাড়ি উঠতে হবে।" },
          { german: "Kannst du mich anrufen?", bangla: "তুমি কি আমাকে ফোন করতে পারবে?" },
        ],
      },
    ],
    tips: [
      "Prefix চিনতে শেখো: an-, auf-, aus-, ein-, mit-, vor-, zu-, ab-, fern-।",
      "সব an-/auf- দিয়ে শুরু Verb-ই trennbar নয় (যেমন verstehen!) — অভিধানে দেখো।",
      "Prefix সবসময় বাক্যের শেষ শব্দ।",
      "Modalverb + trennbar = একসাথে শেষে: aufstehen।",
    ],
    quiz: [
      {
        q: "Ich stehe früh ___. (aufstehen)",
        options: ["auf", "an", "aus", "ein"],
        answer: "auf",
        explanation: "aufstehen → stehe … auf।",
        difficulty: "easy",
      },
      {
        q: "Was bedeutet „anrufen“?",
        options: ["ডাকা", "ফোন করা", "ওঠা", "যাওয়া"],
        answer: "ফোন করা",
        explanation: "anrufen = ফোন করা।",
        difficulty: "easy",
      },
      {
        q: "Welcher Satz ist korrekt?",
        options: [
          "Ich rufe dich an morgen.",
          "Ich rufe dich morgen an.",
          "Ich anrufe dich morgen.",
          "Ich dich rufe morgen an.",
        ],
        answer: "Ich rufe dich morgen an.",
        explanation: "prefix “an” শেষে।",
        difficulty: "medium",
      },
      {
        q: "___ du mit? (mitkommen)",
        options: ["Kommst", "Kommt", "Komme", "Kommen"],
        answer: "Kommst",
        explanation: "Kommst du mit?",
        difficulty: "medium",
      },
      {
        q: "Ich muss dich morgen ___. (anrufen)",
        options: ["anrufen", "rufe an", "anrufe", "an rufen"],
        answer: "anrufen",
        explanation: "Modalverb + Infinitiv একসাথে শেষে: anrufen।",
        difficulty: "hard",
      },
      {
        q: "Welches Verb ist NICHT trennbar?",
        options: ["aufstehen", "verstehen", "mitkommen", "ausgehen"],
        answer: "verstehen",
        explanation: "verstehen (বোঝা) untrennbar — ver- prefix কখনো আলাদা হয় না।",
        difficulty: "hard",
      },
    ],
  },
  {
    slug: "adjektive-gegenteile",
    title: "Adjektive & Gegenteile",
    titleBangla: "বিশেষণ ও বিপরীতার্থক শব্দ",
    intro:
      "A1-এর সবচেয়ে দরকারি বিশেষণ-জোড়া (Gegenteile) — এগুলো দিয়ে মানুষ, জিনিস ও আবহাওয়া বর্ণনা করতে পারবে।",
    sections: [
      {
        heading: "Die wichtigsten Gegenteile",
        text: "১৪টি জোড়া মুখস্থ করো:",
        table: {
          headers: ["Adjektiv", "Gegenteil", "Bangla"],
          rows: [
            ["groß", "klein", "বড় ↔ ছোট"],
            ["lang", "kurz", "লম্বা ↔ খাটো"],
            ["neu", "alt", "নতুন ↔ পুরনো"],
            ["jung", "alt", "তরুণ ↔ বৃদ্ধ"],
            ["schnell", "langsam", "দ্রুত ↔ ধীর"],
            ["billig", "teuer", "সস্তা ↔ দামি"],
            ["gut", "schlecht", "ভালো ↔ খারাপ"],
            ["schön", "hässlich", "সুন্দর ↔ কুৎসিত"],
            ["warm", "kalt", "গরম ↔ ঠান্ডা"],
            ["hell", "dunkel", "আলোকিত ↔ অন্ধকার"],
            ["leicht", "schwer", "হালকা/সহজ ↔ ভারী/কঠিন"],
            ["voll", "leer", "পূর্ণ ↔ খালি"],
            ["richtig", "falsch", "সঠিক ↔ ভুল"],
            ["freundlich", "unfreundlich", "বন্ধুসুলভ ↔ অসৌজন্যমূলক"],
          ],
        },
      },
      {
        heading: "sehr & zu",
        text: "মাত্রা বোঝাতে: sehr (খুব) ও zu (বেশি/অতিরিক্ত):",
        examples: [
          { german: "Das Wetter ist sehr schön.", bangla: "আবহাওয়া খুব সুন্দর।" },
          { german: "Der Kaffee ist zu heiß.", bangla: "কফিটা বেশি গরম।" },
        ],
      },
      {
        heading: "Adjektiv als Prädikat",
        text: "sein-এর পরে Adjektiv-এর কোনো Endung হয় না:",
        examples: [
          { german: "Das Haus ist groß.", bangla: "বাড়িটা বড়।" },
          { german: "Die Aufgabe ist leicht.", bangla: "কাজটা সহজ।" },
        ],
      },
    ],
    tips: [
      "Gegenteil জোড়ায় শেখো — মনে রাখা সহজ হয়।",
      "alt-এর দুই অর্থ: পুরনো (জিনিস) ও বৃদ্ধ (মানুষ)।",
      "sein-এর পরে Adjektiv অপরিবর্তিত থাকে।",
      "Nomen-এর আগে Adjektiv-এর Endung লাগে (A2) — A1-এ Prädikat-এ অনুশীলন করো।",
    ],
    quiz: [
      {
        q: "Was ist das Gegenteil von „groß“?",
        options: ["klein", "lang", "neu", "gut"],
        answer: "klein",
        explanation: "groß ↔ klein।",
        difficulty: "easy",
      },
      {
        q: "Was ist das Gegenteil von „billig“?",
        options: ["gut", "teuer", "schnell", "neu"],
        answer: "teuer",
        explanation: "billig ↔ teuer।",
        difficulty: "easy",
      },
      {
        q: "Das Gegenteil von „schnell“ ist …",
        options: ["langsam", "kurz", "klein", "leicht"],
        answer: "langsam",
        explanation: "schnell ↔ langsam।",
        difficulty: "medium",
      },
      {
        q: "Der Kaffee ist ___ heiß. (zu viel)",
        options: ["sehr", "zu", "viel", "so"],
        answer: "zu",
        explanation: "zu heiß = বেশি গরম (অতিরিক্ত)।",
        difficulty: "medium",
      },
      {
        q: "Welches Paar ist FALSCH?",
        options: ["hell ↔ dunkel", "voll ↔ leer", "neu ↔ jung", "richtig ↔ falsch"],
        answer: "neu ↔ jung",
        explanation: "neu ↔ alt; jung ↔ alt।",
        difficulty: "hard",
      },
      {
        q: "Welcher Satz ist korrekt?",
        options: [
          "Das Haus ist großes.",
          "Das Haus ist groß.",
          "Das Haus ist großen.",
          "Das Haus ist große.",
        ],
        answer: "Das Haus ist groß.",
        explanation: "Prädikat-এ Adjektiv-এর Endung নেই।",
        difficulty: "hard",
      },
    ],
  },
  {
    slug: "praepositionen",
    title: "Präpositionen",
    titleBangla: "অব্যয় (Preposition)",
    intro:
      "A1-এ দুই ধরনের Präposition: সময়ের (temporal) ও স্থানের (lokal)। প্রতিটির পরে নির্দিষ্ট Kasus বসে — সেটা মনে রাখাই মূল কাজ।",
    sections: [
      {
        heading: "Temporal: Wann?",
        text: "সময় বোঝাতে:",
        table: {
          headers: ["Präposition", "Verwendung", "Beispiel"],
          rows: [
            ["um", "+ Uhrzeit", "um 8 Uhr"],
            ["am", "+ Wochentag / Tageszeit", "am Montag, am Abend"],
            ["im", "+ Monat / Jahreszeit", "im Mai, im Sommer"],
            ["von … bis", "সময়সীমা", "von 9 bis 17 Uhr"],
            ["ab", "থেকে (শুরু)", "ab morgen"],
            ["vor / nach", "আগে / পরে", "vor dem Essen"],
          ],
        },
      },
      {
        heading: "Lokal: Wo(hin)?",
        text: "স্থান বোঝাতে:",
        table: {
          headers: ["Präposition", "Verwendung", "Beispiel"],
          rows: [
            ["in", "+ Stadt/Land/Raum", "in Berlin, in der Küche"],
            ["auf", "+ Fläche", "auf dem Tisch"],
            ["bei", "কারো কাছে/বাসায়", "bei meiner Mutter"],
            ["nach", "+ Stadt (Wohin?)", "nach Dhaka"],
            ["zu", "+ Person/Ort", "zum Arzt, zur Arbeit"],
            ["aus", "কোথা থেকে (উৎপত্তি)", "aus Bangladesch"],
            ["mit", "+ Verkehrsmittel", "mit dem Bus"],
          ],
        },
      },
      {
        heading: "Verschmelzungen",
        text: "Präposition + Artikel প্রায়ই একসাথে লেখা হয়:",
        examples: [
          { german: "in + dem = im (im Sommer)", bangla: "গ্রীষ্মে" },
          { german: "zu + dem = zum (zum Arzt)", bangla: "ডাক্তারের কাছে" },
          { german: "zu + der = zur (zur Arbeit)", bangla: "কাজে" },
          { german: "an + dem = am (am Montag)", bangla: "সোমবারে" },
        ],
      },
    ],
    tips: [
      "um = ঘড়ির সময়; am = দিন; im = মাস/ঋতু — এই ত্রয়ী মুখস্থ করো।",
      "nach + শহর (Artikel ছাড়া); zu + ব্যক্তি/স্থান।",
      "Verschmelzung (im, am, zum) প্রাকৃতিক শোনায় — ব্যবহার করো।",
      "bei/mit/von/zu/aus/nach-এর পরে সবসময় Dativ।",
    ],
    quiz: [
      {
        q: "___ 8 Uhr stehe ich auf.",
        options: ["Am", "Um", "Im", "An"],
        answer: "Um",
        explanation: "ঘড়ির সময়ের আগে um।",
        difficulty: "easy",
      },
      {
        q: "___ Montag habe ich frei.",
        options: ["Um", "Am", "Im", "In"],
        answer: "Am",
        explanation: "দিনের আগে am।",
        difficulty: "easy",
      },
      {
        q: "Im ___ schwimme ich oft. (Jahreszeit)",
        options: ["Sommer", "Montag", "Morgen", "Uhr"],
        answer: "Sommer",
        explanation: "ঋতুর আগে im: im Sommer।",
        difficulty: "medium",
      },
      {
        q: "Ich fahre ___ dem Bus.",
        options: ["mit", "bei", "nach", "zu"],
        answer: "mit",
        explanation: "যানবাহন: mit dem Bus।",
        difficulty: "medium",
      },
      {
        q: "Ich komme ___ Bangladesch.",
        options: ["nach", "aus", "bei", "zu"],
        answer: "aus",
        explanation: "উৎপত্তি/কোথা থেকে: aus Bangladesch।",
        difficulty: "hard",
      },
      {
        q: "zu + dem = ?",
        options: ["zur", "zum", "am", "im"],
        answer: "zum",
        explanation: "zu + dem = zum।",
        difficulty: "hard",
      },
    ],
  },
  {
    slug: "uhrzeit-datum",
    title: "Uhrzeit & Datum",
    titleBangla: "সময় ও তারিখ",
    intro: "ঘড়ির সময় বলা ও তারিখ লেখা — প্রতিদিনের জার্মান জীবনে অপরিহার্য।",
    sections: [
      {
        heading: "Die Uhrzeit",
        text: "দুটি পদ্ধতি: offiziell (13:30 = dreizehn Uhr dreißig) ও umgangssprachlich (halb zwei)। দৈনন্দিনে দ্বিতীয়টি বেশি:",
        table: {
          headers: ["Deutsch", "Zeit", "Bangla"],
          rows: [
            ["Es ist drei Uhr.", "3:00", "তিনটা"],
            ["Es ist fünf nach drei.", "3:05", "তিনটা পাঁচ"],
            ["Es ist Viertel nach drei.", "3:15", "সোয়া তিনটা"],
            ["Es ist halb vier.", "3:30", "সাড়ে তিনটা"],
            ["Es ist Viertel vor vier.", "3:45", "পৌনে চারটা"],
            ["Es ist fünf vor vier.", "3:55", "চারটা বাজতে পাঁচ মিনিট"],
          ],
        },
      },
      {
        heading: "Wochentage & Monate",
        text: "৭ দিন ও ১২ মাস:",
        table: {
          headers: ["Wochentage", "Monate"],
          rows: [
            ["Montag", "Januar"],
            ["Dienstag", "Februar"],
            ["Mittwoch", "März"],
            ["Donnerstag", "April"],
            ["Freitag", "Mai"],
            ["Samstag", "Juni"],
            ["Sonntag", "Juli"],
            ["—", "August"],
            ["—", "September"],
            ["—", "Oktober"],
            ["—", "November"],
            ["—", "Dezember"],
          ],
        },
      },
      {
        heading: "Das Datum",
        text: "তারিখ: am + ক্রমবাচক সংখ্যা + মাস। 1. = der erste, 2. = der zweite, 3. = der dritte; বাকিগুলোতে -te (১৯ পর্যন্ত), তারপর -ste।",
        examples: [
          { german: "Heute ist der 14. Oktober.", bangla: "আজ ১৪ই অক্টোবর।" },
          { german: "Mein Geburtstag ist am 2. Januar.", bangla: "আমার জন্মদিন ২রা জানুয়ারি।" },
          { german: "Der Termin ist am dritten Mai.", bangla: "অ্যাপয়েন্টমেন্ট ৩রা মে।" },
        ],
      },
    ],
    tips: [
      "halb vier = ৩:৩০ (চারটার অর্ধেক) — এটাই সবচেয়ে বেশি গুলিয়ে যায়!",
      "Viertel nach = সোয়া, Viertel vor = পৌনে।",
      "তারিখে সবসময় am: am 3. Mai।",
      "জন্মদিন: Mein Geburtstag ist am 2. Januar।",
    ],
    quiz: [
      {
        q: "Was bedeutet „halb vier“?",
        options: ["4:00", "3:30", "4:30", "3:00"],
        answer: "3:30",
        explanation: "halb vier = চারটার অর্ধেক = 3:30।",
        difficulty: "easy",
      },
      {
        q: "Wie viel Uhr ist „Viertel nach zwei“?",
        options: ["2:15", "1:45", "2:45", "3:15"],
        answer: "2:15",
        explanation: "Viertel nach = ১৫ মিনিট পর।",
        difficulty: "easy",
      },
      {
        q: "Mein Geburtstag ist ___ 2. Januar.",
        options: ["am", "um", "im", "an"],
        answer: "am",
        explanation: "তারিখের আগে am।",
        difficulty: "medium",
      },
      {
        q: "Welcher Wochentag kommt nach Freitag?",
        options: ["Donnerstag", "Samstag", "Sonntag", "Montag"],
        answer: "Samstag",
        explanation: "Freitag → Samstag।",
        difficulty: "medium",
      },
      {
        q: "„Viertel vor vier“ = ?",
        options: ["4:15", "3:45", "4:45", "3:15"],
        answer: "3:45",
        explanation: "Viertel vor = ১৫ মিনিট আগে: 3:45।",
        difficulty: "hard",
      },
      {
        q: "Der ___ Mai. (3. → Ordnungszahl, Dativ)",
        options: ["dritte", "dritten", "dritter", "drittem"],
        answer: "dritten",
        explanation: "am dritten Mai — Dativ-এ -n: dritten।",
        difficulty: "hard",
      },
    ],
  },
];

export function getTopic(slug: string): GrammarTopic | undefined {
  return grammarTopics.find(t => t.slug === slug);
}
