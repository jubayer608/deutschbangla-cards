# 🇩🇪🇧🇩 DeutschBangla Cards

A German vocabulary flashcard & quiz app for **Bangla speakers** — built with Next.js.

Most German learning apps explain everything in English. DeutschBangla Cards gives you A1-level German words with **Bangla meanings** and **Bangla translations of example sentences**, so you can learn German in the language you think in.

## ✨ Features

- 🃏 **Flashcards** — tap a card to flip it and reveal the Bangla meaning + a German example sentence with its Bangla translation. Navigate with ← / →, or hit 🔀 Shuffle.
- ✍️ **Quiz** — 10 random multiple-choice questions per round (German word → pick the correct Bangla meaning from 4 options), with score tracking and a result screen.
- 🔥 **Daily streak** + 📚 **words-reviewed counter**, persisted in `localStorage` and shown on the home page.
- 📱 Mobile-friendly, clean UI — Tailwind CSS only, no UI library.

## 🗂️ Project structure

```
app/
  page.tsx        → flashcard home page (/)
  quiz/page.tsx   → multiple-choice quiz (/quiz)
  layout.tsx      → root layout, fonts, navbar
  globals.css     → Tailwind + card-flip animation
components/
  Flashcard.tsx   → 3D flip card
  Navbar.tsx      → top navigation
data/
  words.ts        → vocabulary list (~30 A1 words: German + article,
                    part of speech, Bangla meaning, example DE/BN)
lib/
  progress.ts     → streak + reviewed counter (localStorage)
```

## 🚀 Run it

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To build for production:

```bash
npm run build
npm start
```

## 🛠️ Tech

- [Next.js](https://nextjs.org) 16 (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- React 19

## 🌱 Ideas for later

- More word decks (A2, verbs with conjugations, themed sets)
- Spaced-repetition scheduling
- Audio pronunciation (TTS)
- Score history & weekly stats

Viel Erfolg beim Deutschlernen! 🎓
