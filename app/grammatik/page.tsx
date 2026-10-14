"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { grammarTopics } from "@/data/grammar";

export default function GrammatikPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-bangla text-sm font-semibold text-emerald-500">বাংলা ব্যাখ্যাসহ</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-emerald-950">📖 Grammatik</h1>
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        className="flex flex-col gap-3"
      >
        {grammarTopics.map((t, i) => (
          <motion.div
            key={t.slug}
            variants={{
              hidden: { opacity: 0, x: 18 },
              show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
            }}
          >
            <Link
              href={`/grammatik/${t.slug}`}
              className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-emerald-100 transition hover:ring-emerald-300 active:scale-[0.98]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 text-sm font-extrabold text-white">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1">
                <span className="block font-extrabold text-emerald-950">{t.title}</span>
                <span className="font-bangla block text-sm text-slate-500">{t.titleBangla}</span>
              </span>
              <span className="text-xl text-slate-300">→</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
