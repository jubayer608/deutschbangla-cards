"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Flame, Sparkles } from "lucide-react";
import { words, type VocabWord } from "@/data/words";

function dayKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const learnLinks = [
  { href: "/lektionen", label: "পাঠ", german: "Lektionen" },
  { href: "/wortschatz", label: "শব্দভাণ্ডার", german: "Wortschatz" },
  { href: "/grammatik", label: "ব্যাকরণ", german: "Grammatik" },
  { href: "/quiz", label: "কুইজ", german: "Quiz" },
];

const resourceLinks = [
  { href: "/resources", label: "রিসোর্স", german: "Resources" },
  { href: "/blog", label: "ব্লগ", german: "Blog" },
  { href: "/fortschritt", label: "অগ্রগতি", german: "Fortschritt" },
];

export default function Footer() {
  const [word, setWord] = useState<VocabWord | null>(null);

  useEffect(() => {
    setWord(words[hashStr(dayKey()) % words.length]);
  }, []);

  return (
    <footer className="relative mt-10 overflow-hidden bg-navy text-cream">
      <div className="relative mx-auto max-w-5xl px-4 pb-28 pt-10 lg:pb-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
            className="sm:col-span-2 md:col-span-1"
          >
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="Ulluk" className="h-10 w-auto" />
            </Link>
            <p className="font-heading mt-3 text-sm font-bold text-white">
              Learn German. Stay Weird.
            </p>
            <p className="font-bangla text-sm font-semibold text-teal">বাংলায় জার্মান শেখো</p>
            <p className="font-bangla mt-3 text-sm leading-relaxed text-cream/70">
              Bangla-speaker-দের জন্য A1 German শেখার সবকিছু — flashcards, পাঠ, ব্যাকরণ আর কুইজ, এক
              জায়গায়।
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sun/15 px-3 py-1 text-xs font-bold text-sun">
              <Flame className="h-3.5 w-3.5" aria-hidden /> প্রতিদিন একটু একটু করে
            </p>
          </motion.div>

          {/* Lernen */}
          <motion.nav
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: 0.08 }}
            aria-label="Lernen"
          >
            <h3 className="font-bangla text-sm font-extrabold uppercase tracking-widest text-teal">
              শেখো
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {learnLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-bangla group text-sm font-semibold text-cream/70 transition hover:text-white"
                  >
                    {l.label}
                    <span className="ml-1.5 text-xs font-medium text-mist transition group-hover:text-teal">
                      {l.german}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* Ressourcen */}
          <motion.nav
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: 0.16 }}
            aria-label="Ressourcen"
          >
            <h3 className="font-bangla text-sm font-extrabold uppercase tracking-widest text-teal">
              রিসোর্স
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {resourceLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-bangla group text-sm font-semibold text-cream/70 transition hover:text-white"
                  >
                    {l.label}
                    <span className="ml-1.5 text-xs font-medium text-mist transition group-hover:text-teal">
                      {l.german}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* Wort des Tages teaser */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: 0.24 }}
          >
            <h3 className="font-bangla text-sm font-extrabold uppercase tracking-widest text-teal">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" aria-hidden /> আজকের শব্দ
              </span>
            </h3>
            {word ? (
              <Link
                href="/wortschatz"
                className="group mt-3 block rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 transition hover:bg-white/10 hover:ring-teal/40"
              >
                <p className="font-heading text-lg font-extrabold text-white">{word.german}</p>
                <p className="font-bangla text-sm font-semibold text-cream/70">{word.bangla}</p>
                <p className="font-bangla mt-2 inline-flex items-center gap-1 text-xs font-bold text-teal group-hover:text-white">
                  শব্দভাণ্ডারে দেখো <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </p>
              </Link>
            ) : (
              <div className="mt-3 h-24 animate-pulse rounded-2xl bg-white/5" />
            )}
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs font-semibold text-mist">
            © 2026 Ulluk
          </p>
          <p className="font-bangla text-xs font-semibold text-mist">
            <span className="inline-flex items-center gap-1">
              Made for Bangla speakers learning German — Viel Erfolg!
              <Sparkles className="h-3.5 w-3.5 text-sun" aria-hidden />
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
