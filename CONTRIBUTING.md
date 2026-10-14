# Contributing to DeutschBangla Cards

Thanks for your interest! DeutschBangla Cards is **open source (MIT)** and community-driven.
You can contribute in **Bangla or English** — both are welcome.

## Ways to contribute

- Report bugs via [Issues](https://github.com/jubayer608/deutschbangla-cards/issues)
- Suggest new features or learning ideas
- Add learning content: words, lessons, grammar topics, phrases, blog posts (with Bangla explanations!)
- Improve design, animations, or accessibility
- Fix typos in German or Bangla text

## Getting started

1. Fork the repository
2. Clone your fork and install dependencies:
   ```bash
   npm install
   npm run dev    # http://localhost:3000
   ```
3. Create a branch: `git checkout -b feat/my-change`
4. Make your changes — keep `npm run build` passing
5. Open a Pull Request with a clear description of what changed and why

## Content guidelines

- The site teaches **German A1 level to Bangla speakers** — every German word, sentence,
  and grammar rule needs a Bangla meaning or explanation.
- Follow the existing data shapes in `data/`:
  - `words.ts` → vocabulary (German, Bangla, article, plural, example)
  - `lessons.ts` → lessons with exercises ordered easy → hard
  - `grammar.ts` → grammar topics with Bangla explanations
  - `phrases.ts` → everyday Redemittel phrases
  - `blog.ts` → in-depth Bangla guides
- UI rule: **no emojis in components** — use `lucide-react` icons instead.
- Mobile-first, light mode, keep the emerald/teal/amber brand system.

## Code style

- TypeScript (strict), Tailwind CSS v4, Framer Motion for animation
- Small, reusable components in `components/`
- User progress lives in `localStorage` (`lib/progress.ts`) — don't break existing keys

## Questions?

Open an issue or discussion — happy learning! Viel Erfolg! 🎉
