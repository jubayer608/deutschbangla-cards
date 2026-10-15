// Shared quiz question generator — used by BOTH the solo quiz page
// (app/quiz/page.tsx, client) and the duel APIs (server, Phase 5).
// Extracted verbatim from the quiz page so both modes ask the SAME kinds
// of questions from the SAME pools. Pure functions, no browser APIs,
// safe to import from server routes.
//
// Question shape (Q):
// - prompt / promptBangla: what the player sees
// - options: shuffled answer choices (includes the correct one)
// - answer: the correct option string
// - explanation: shown after answering

import { words, shuffle, type Difficulty, type VocabWord } from "@/data/words";
import { grammarTopics } from "@/data/grammar";

export type QuizMode = "vocab" | "grammar" | "mixed";
export type QuizDiffSetting = Difficulty | "mixed";

export interface QuizQuestion {
  difficulty: Difficulty;
  prompt: string;
  promptBangla: string;
  options: string[];
  answer: string;
  explanation: string;
}

const ARTICLES = ["der", "die", "das"];

function articleOf(w: VocabWord): string | null {
  if (w.pos !== "noun") return null;
  const first = w.german.split(" ")[0];
  return ARTICLES.includes(first) ? first : null;
}
function baseOf(w: VocabWord): string {
  const a = articleOf(w);
  return a ? w.german.slice(a.length + 1) : w.german;
}

function distinctBanglaOptions(word: VocabWord, n: number): string[] {
  const pool = shuffle(words.filter((w) => w.id !== word.id && w.bangla !== word.bangla));
  const opts = [word.bangla];
  for (const w of pool) {
    if (opts.length >= n) break;
    if (!opts.includes(w.bangla)) opts.push(w.bangla);
  }
  return shuffle(opts);
}
function distinctGermanOptions(word: VocabWord, n: number): string[] {
  const pool = shuffle(
    words.filter((w) => w.id !== word.id && w.german !== word.german && w.pos === word.pos),
  );
  const opts = [word.german];
  for (const w of pool) {
    if (opts.length >= n) break;
    if (!opts.includes(w.german)) opts.push(w.german);
  }
  // fall back to any pos if not enough
  if (opts.length < n) {
    for (const w of shuffle(words)) {
      if (opts.length >= n) break;
      if (w.id !== word.id && !opts.includes(w.german)) opts.push(w.german);
    }
  }
  return shuffle(opts);
}

function buildVocab(diff: QuizDiffSetting): QuizQuestion[] {
  const ds: Difficulty[] = diff === "mixed" ? ["easy", "medium", "hard"] : [diff];
  const per: Record<Difficulty, (ws: VocabWord[]) => QuizQuestion[]> = {
    easy: (ws) =>
      ws.map((w) => ({
        difficulty: "easy" as Difficulty,
        prompt: w.german,
        promptBangla: "এর বাংলা অর্থ কী?",
        options: distinctBanglaOptions(w, 4),
        answer: w.bangla,
        explanation: `${w.example} — ${w.exampleBangla}`,
      })),
    medium: (ws) =>
      ws.map((w) => {
        const art = articleOf(w);
        if (art) {
          return {
            difficulty: "medium" as Difficulty,
            prompt: `___ ${baseOf(w)}`,
            promptBangla: "সঠিক article বাছাই করো",
            options: shuffle([...ARTICLES]),
            answer: art,
            explanation: `সঠিক: ${w.german} — ${w.bangla}`,
          };
        }
        return {
          difficulty: "medium" as Difficulty,
          prompt: w.bangla,
          promptBangla: "এর জার্মান শব্দ কী?",
          options: distinctGermanOptions(w, 4),
          answer: w.german,
          explanation: `${w.example} — ${w.exampleBangla}`,
        };
      }),
    hard: (ws) =>
      ws.map((w) => {
        const base = baseOf(w);
        const re = new RegExp(base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        const blanked = w.example.replace(re, "___");
        if (blanked === w.example) {
          // fallback: medium-style
          return {
            difficulty: "medium" as Difficulty,
            prompt: w.bangla,
            promptBangla: "এর জার্মান শব্দ কী?",
            options: distinctGermanOptions(w, 4),
            answer: w.german,
            explanation: `${w.example} — ${w.exampleBangla}`,
          };
        }
        return {
          difficulty: "hard" as Difficulty,
          prompt: blanked,
          promptBangla: "শূন্যস্থানে সঠিক শব্দ বসাও",
          options: distinctGermanOptions(w, 4),
          answer: w.german,
          explanation: `${w.example} — ${w.exampleBangla}`,
        };
      }),
  };
  const out: QuizQuestion[] = [];
  for (const d of ds) out.push(...per[d](shuffle(words).slice(0, 4)));
  return shuffle(out);
}

function buildGrammar(diff: QuizDiffSetting): QuizQuestion[] {
  const pool = grammarTopics.flatMap((t) => t.quiz.map((q) => ({ ...q, topic: t.title })));
  const filtered = diff === "mixed" ? pool : pool.filter((q) => q.difficulty === diff);
  return shuffle(filtered)
    .slice(0, 10)
    .map((q) => ({
      difficulty: q.difficulty,
      prompt: q.q,
      promptBangla: q.qBangla ?? "সঠিক উত্তর বাছাই করো",
      options: shuffle([...q.options]),
      answer: q.answer,
      explanation: q.explanation,
    }));
}

/** Build a 10-question round — same shape as the solo quiz page. */
export function buildQuestions(mode: QuizMode, diff: QuizDiffSetting): QuizQuestion[] {
  if (mode === "vocab") return buildVocab(diff).slice(0, 10);
  if (mode === "grammar") return buildGrammar(diff).slice(0, 10);
  const v = buildVocab(diff).slice(0, 5);
  const g = buildGrammar(diff).slice(0, 5);
  const mixed = shuffle([...v, ...g]);
  return mixed.slice(0, 10);
}

export const QUIZ_MODES: { id: QuizMode; de: string; bn: string }[] = [
  { id: "vocab", de: "Wortschatz", bn: "শব্দভাণ্ডার" },
  { id: "grammar", de: "Grammatik", bn: "ব্যাকরণ" },
  { id: "mixed", de: "Gemischt", bn: "মিশ্র" },
];

export const QUIZ_DIFFS: { id: QuizDiffSetting; bn: string; de: string }[] = [
  { id: "easy", bn: "সহজ", de: "leicht" },
  { id: "medium", bn: "মাঝারি", de: "mittel" },
  { id: "hard", bn: "কঠিন", de: "schwer" },
  { id: "mixed", bn: "মিশ্র", de: "gemischt" },
];
