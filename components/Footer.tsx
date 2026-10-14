"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
    <footer className="relative mt-10 overflow-hidden border-t border-emerald-100 bg-gradient-to-b from-emerald-50/60 via-white to-amber-50/40">
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
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
              <span className="bg-brand-gradient flex h-10 w-10 items-center justify-center rounded-2xl text-xl shadow-md shadow-emerald-200">
                🇩🇪
              </span>
              <span className="text-lg font-extrabold tracking-tight text-emerald-950">
                DeutschBangla <span className="text-brand-gradient">Cards</span>
              </span>
            </Link>
            <p className="font-bangla mt-3 text-sm leading-relaxed text-slate-500">
              Bangla-speaker-দের জন্য A1 German শেখার সবকিছু — flashcards, পাঠ, ব্যাকরণ আর কুইজ, এক
              জায়গায়।
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              🔥 প্রতিদিন একটু একটু করে
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
            <h3 className="font-bangla text-sm font-extrabold uppercase tracking-widest text-emerald-800">
              শেখো
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {learnLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-bangla group text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
                  >
                    {l.label}
                    <span className="ml-1.5 text-xs font-medium text-slate-300 transition group-hover:text-emerald-400">
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
            <h3 className="font-bangla text-sm font-extrabold uppercase tracking-widest text-emerald-800">
              রিসোর্স
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {resourceLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-bangla group text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
                  >
                    {l.label}
                    <span className="ml-1.5 text-xs font-medium text-slate-300 transition group-hover:text-emerald-400">
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
            <h3 className="font-bangla text-sm font-extrabold uppercase tracking-widest text-emerald-800">
              📅 আজকের শব্দ
            </h3>
            {word ? (
              <Link
                href="/wortschatz"
                className="group mt-3 block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100 transition hover:shadow-md hover:ring-emerald-200"
              >
                <p className="text-lg font-extrabold text-emerald-900">{word.german}</p>
                <p className="font-bangla text-sm font-semibold text-slate-500">{word.bangla}</p>
                <p className="font-bangla mt-2 text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                  শব্দভাণ্ডারে দেখো →
                </p>
              </Link>
            ) : (
              <div className="mt-3 h-24 animate-pulse rounded-2xl bg-emerald-50" />
            )}
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-emerald-100 pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs font-semibold text-slate-400">
            © 2026 DeutschBangla Cards 🇩🇪🇧🇩
          </p>
          <p className="font-bangla text-xs font-semibold text-slate-400">
            Made for Bangla speakers learning German — Viel Erfolg! ✨
          </p>
        </div>
      </div>
    </footer>
  );
}
