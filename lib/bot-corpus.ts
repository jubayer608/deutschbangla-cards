// Phase 5 — Helping Bot (RAG) corpus.
//
// Server-only. Imports the site's OWN curriculum data (lessons, words,
// grammar topics, Redemittel phrases) and builds a keyword-searchable
// index of content chunks at module load. The bot answers ONLY from
// these chunks (+ the system prompt); every chunk carries a title and
// a href so the API can return clickable sources.
//
// Dependency-free: plain keyword matching over a normalized haystack.
// Corpus is capped per chunk (320 chars) so the prompt stays small.

import { lessons } from "@/data/lessons";
import { words } from "@/data/words";
import { grammarTopics } from "@/data/grammar";
import { phraseGroups } from "@/data/phrases";

export interface BotChunk {
  title: string;
  href: string;
  text: string;
  haystack: string;
}

export interface BotSource {
  title: string;
  href: string;
}

const STOPWORDS = new Set([
  // German — NOTE: articles (der/die/das/den/dem/des/ein/…) are
  // deliberately NOT stopwords: "der/die/das কখন কোনটা?" is the #1
  // German-learner question, and filtering them left zero tokens.
  "und", "ist", "von", "mit", "für", "fürs", "im", "in",
  "zu", "zum", "zur", "am", "an", "auf", "als", "auch", "ich", "du",
  "er", "sie", "es", "wir", "ihr", "mein", "meine", "was", "wie",
  "wann", "wo", "warum", "wer", "nicht", "kein", "keine", "oder",
  "aber", "bitte", "danke", "hallo", "haben", "sein", "the",
  // Bangla
  "কী", "কি", "আর", "এবং", "এর", "এই", "তা", "তুমি", "আমি", "আমার",
  "টা", "টি", "থেকে", "দিয়ে", "করে", "করো", "বলো", "চাই", "হলে",
  "হয়", "হবে", "একটা", "কখন", "কোথায়", "কেন", "কেমন", "কীভাবে",
  "কিভাবে", "মানে", "সম্পর্কে", "কোনটা", "কোনটি", "জন্য",
]);

let CHUNKS: BotChunk[] | null = null;

function buildChunks(): BotChunk[] {
  if (CHUNKS) return CHUNKS;
  const list: BotChunk[] = [];
  const push = (title: string, href: string, text: string) => {
    const t = text.replace(/\s+/g, " ").trim();
    if (t.length > 10) {
      list.push({
        title,
        href,
        text: t.slice(0, 320),
        haystack: t.toLowerCase(),
      });
    }
  };

  // Lessons (href: /lektionen/[id] — numeric id param)
  for (const l of lessons) {
    const href = `/lektionen/${l.id}`;
    for (const g of l.grammar) {
      push(`${l.title} — ${g.title}`, href, `${l.title} — ${g.title}: ${g.explanation}`);
      for (const ex of g.examples ?? []) {
        push(`${l.title} — ${g.title}`, href, `উদাহরণ (${g.title}): ${ex.german} = ${ex.bangla}`);
      }
      for (const row of g.table?.rows ?? []) {
        push(`${l.title} — ${g.title}`, href, `${g.title}: ${row.join(" | ")}`);
      }
    }
    for (const s of l.saetze) {
      push(`${l.title} — বাক্য`, href, `বাক্য: ${s.german} = ${s.bangla}`);
    }
    for (const e of l.uebungen) {
      push(`${l.title} — অনুশীলন`, href, `অনুশীলন: ${e.prompt} → ${e.answer}। ${e.explanation}`);
    }
  }

  // Grammar topics (href: /grammatik/[slug])
  for (const t of grammarTopics) {
    const href = `/grammatik/${t.slug}`;
    push(t.title, href, `${t.title} (${t.titleBangla}): ${t.intro}`);
    for (const s of t.sections) {
      push(`${t.title} — ${s.heading}`, href, `${t.title} — ${s.heading}: ${s.text}`);
      for (const ex of s.examples ?? []) {
        push(`${t.title} — ${s.heading}`, href, `উদাহরণ (${s.heading}): ${ex.german} = ${ex.bangla}`);
      }
      for (const row of s.table?.rows ?? []) {
        push(`${t.title} — ${s.heading}`, href, `${s.heading}: ${row.join(" | ")}`);
      }
    }
    for (const tip of t.tips) {
      push(`${t.title} — টিপস`, href, `টিপস (${t.title}): ${tip}`);
    }
  }

  // Vocabulary (href: /wortschatz)
  for (const w of words) {
    push(`শব্দ: ${w.german}`, "/wortschatz",
      `শব্দ: ${w.german} (${w.pos}) = ${w.bangla}। উদাহরণ: ${w.example} = ${w.exampleBangla}`);
  }

  // Redemittel phrases (shown on /wortschatz)
  for (const g of phraseGroups) {
    for (const it of g.items) {
      push(`Redemittel: ${g.situationBangla}`, "/wortschatz",
        `Redemittel (${g.situationBangla}): ${it.german} = ${it.bangla}`);
    }
  }

  CHUNKS = list;
  return list;
}

/** Number of indexed chunks (for diagnostics / reporting). */
export function corpusSize(): number {
  return buildChunks().length;
}

function tokensOf(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(
      (t) =>
        !STOPWORDS.has(t) &&
        (t.length >= 2 || ["ä", "ö", "ü", "ß"].includes(t)),
    );
}

export interface GroundedResult {
  /** Prompt-ready context lines (top chunks). */
  context: string[];
  /** Deduped clickable sources for the top chunks (max 3). */
  sources: BotSource[];
}

/**
 * Return the best-matching curriculum chunks for the question.
 * Score: occurrences (capped at 3 per token) × weight (2 for long
 * tokens, 1 for short). Counting occurrences (not just "contains")
 * ranks chunks that actually discuss the topic above passing mentions.
 */
export function ground(query: string, limit = 5): GroundedResult {
  const qTokens = tokensOf(query);
  if (qTokens.length === 0) return { context: [], sources: [] };
  const scored = buildChunks()
    .map((c) => {
      let score = 0;
      for (const tok of qTokens) {
        let count = 0;
        let i = 0;
        while (count < 3) {
          const j = c.haystack.indexOf(tok, i);
          if (j === -1) break;
          count += 1;
          i = j + tok.length;
        }
        score += count * (tok.length >= 4 ? 2 : 1);
      }
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const context = scored.map((x) => x.c.text);
  const sources: BotSource[] = [];
  const seen = new Set<string>();
  for (const { c } of scored) {
    if (!seen.has(c.href)) {
      seen.add(c.href);
      sources.push({ title: c.title, href: c.href });
    }
    if (sources.length >= 3) break;
  }
  return { context, sources };
}
