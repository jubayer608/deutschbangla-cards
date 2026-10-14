# 🇩🇪🇧🇩 DeutschBangla Cards — v3

A complete **A1-level German learning site for Bangla speakers** — built with Next.js 16, TypeScript, Tailwind CSS v4 and Framer Motion.

Most German learning apps explain everything in English. DeutschBangla Cards teaches German **in Bangla**: every word, grammar rule, exercise, blog post and quiz explanation has a Bangla translation.

## 🎨 Design

Premium **emerald + amber** brand system (deep emerald primary, warm amber secondary, teal gradient partner) defined as CSS variables in `app/globals.css`. Sticky backdrop-blur navbar with animated active pills (desktop) and a polished mobile bottom nav; rich footer with link columns and a *Wort des Tages* teaser. Mobile-first, light mode.

## ✨ Features

- **📊 Dashboard** — greeting, animated streak flame, XP, continue-learning card, lesson grid with progress rings, *Wort des Tages* (deterministic daily word)
- **📖 Lektionen (12)** — full A1 curriculum: Lernziele in Bangla, vocabulary, grammar blocks with tables, example sentences, and interactive exercises ordered **easy → hard** (MCQ, fill-in-the-blank, translation, word-order)
- **🃏 Wortschatz (~192 words)** — 14 categories, search, animated grid, swipe-based study mode (swipe right = known, left = unknown), plus a **Redemittel** phrase collection for everyday situations
- **📐 Grammatik (13 topics)** — Artikel, Plural, Pronomen, Konjugation, Satzbau, Negation, Akkusativ/Dativ, Possessivartikel, Modalverben, trennbare Verben, Adjektive, Präpositionen, Uhrzeit & Datum — all with Bangla explanations and tables
- **✍️ Quiz** — modes (Wortschatz / Grammatik / Gemischt) × difficulty (**easy / medium / hard / mixed**), animated answer feedback (spring + shake), count-up score, confetti celebrations, best scores
- **🌐 Resources** — curated external learning resources (YouTube channels, courses, apps, dictionaries, listening) with category filters + search; official homepage-level links only
- **📝 Blog** — 5 in-depth Bangla guides (A1 roadmap, der/die/das techniques, pronunciation, exam format, daily routine); featured hero + card grid, reading progress bar, prev/next navigation
- **📈 Fortschritt** — XP + levels, streak, per-category mastery bars, weekly activity chart, lesson checklist
- **🏆 Gamification** — XP for everything (difficulty-weighted), daily streaks, per-word known/unknown tracking, all in `localStorage`

## 🛠 Tech

- Next.js 16 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS v4, Framer Motion (route transitions, gestures, springs, useScroll), canvas-confetti
- Noto Sans Bengali webfont for Bangla text; mobile-first responsive design

## 🗂 Project structure

```
app/
  page.tsx                → dashboard
  template.tsx            → AnimatePresence route transitions
  lektionen/page.tsx      → lesson list
  lektionen/[id]/page.tsx → lesson detail + interactive exercises
  wortschatz/page.tsx     → vocabulary + study mode + Redemittel
  grammatik/page.tsx      → grammar index
  grammatik/[slug]/page.tsx → grammar topic detail
  quiz/page.tsx           → quiz (mode × difficulty)
  resources/page.tsx      → curated external resources
  blog/page.tsx           → blog index (featured + grid)
  blog/[slug]/page.tsx    → blog post (progress bar, prev/next)
  layout.tsx              → fonts, Navbar, Footer
components/
  Flashcard.tsx           → tap-flip + swipe (framer-motion)
  Navbar.tsx              → sticky top bar + mobile bottom nav
  Footer.tsx              → rich footer + Wort des Tages teaser
  BlogRenderer.tsx        → renders structured blog blocks
  ProgressRing.tsx / CountUp.tsx / EmptyState.tsx
data/
  words.ts                → 192 A1 words, 14 categories
  lessons.ts              → 12 lessons (96 exercises)
  grammar.ts              → 13 topics (78 quiz questions)
  phrases.ts              → 73 everyday phrases, 10 situations
  resources.ts            → 8 curated external resources, 5 categories
  blog.ts                 → 5 Bangla blog posts (structured blocks)
lib/
  progress.ts             → streak, XP, known words, lessons, quiz bests (localStorage)
  confetti.ts             → canvas-confetti helpers
```

## 🚀 Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

Viel Erfolg beim Lernen! 🎉
