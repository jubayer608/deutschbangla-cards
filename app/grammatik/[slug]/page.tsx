"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getTopic } from "@/data/grammar";
import { ArrowLeft, BookOpen, Lightbulb, PenLine } from "lucide-react";
import SpeakButton from "@/components/SpeakButton";
import EmptyState from "@/components/EmptyState";

export default function GrammarDetailPage() {
  const params = useParams();
  const slug = String(params.slug);
  const topic = useMemo(() => getTopic(slug), [slug]);

  if (!topic) {
    return <EmptyState Icon={BookOpen} title="বিষয় পাওয়া যায়নি" message="এই বিষয়ে কোনো ব্যাকরণ নোট নেই।" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/grammatik"
          className="font-bangla inline-flex items-center gap-1.5 text-sm font-bold text-teal transition hover:gap-2.5"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> সব ব্যাকরণ
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-navy">{topic.title}</h1>
        <p className="font-bangla text-slate-500">{topic.titleBangla}</p>
        <p className="font-bangla mt-3 rounded-3xl bg-cream p-4 text-slate-700 ring-1 ring-teal/20">
          {topic.intro}
        </p>
      </div>

      {topic.sections.map((s, i) => (
        <motion.section
          key={i}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="card rounded-3xl p-5"
        >
          <h2 className="font-extrabold text-navy">{s.heading}</h2>
          <p className="font-bangla mt-2 whitespace-pre-line text-slate-700">{s.text}</p>
          {s.table && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-64 border-collapse text-sm">
                <thead>
                  <tr>
                    {s.table.headers.map((h, hi) => (
                      <th key={hi} className="border border-teal/30 bg-cream px-3 py-2 text-left font-bold text-navy">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((row, ri) => (
                    <tr key={ri} className={ri % 2 ? "bg-cream/40" : ""}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="border border-slate-200 px-3 py-2 text-slate-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {s.examples && (
            <ul className="mt-3 flex flex-col gap-1.5">
              {s.examples.map((e, ei) => (
                <li key={ei} className="rounded-xl bg-cream/60 px-3 py-2 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-navy">{e.german}</span>
                    <SpeakButton text={e.german} className="h-7 w-7" />
                  </div>
                  <span className="font-bangla block text-slate-600">{e.bangla}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.section>
      ))}

      {topic.tips.length > 0 && (
        <section className="rounded-3xl bg-sun/15 p-5 ring-1 ring-sun/40">
          <h2 className="font-bangla inline-flex items-center gap-2 text-lg font-extrabold text-navy">
            <Lightbulb className="h-5 w-5" aria-hidden /> মনে রেখো
          </h2>
          <ul className="font-bangla mt-2 flex flex-col gap-1.5 text-navy">
            {topic.tips.map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <span>•</span> {t}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/quiz"
        className="btn btn-primary rounded-3xl p-5 text-center shadow-xl transition active:scale-[0.98]"
      >
        <p className="inline-flex items-center justify-center gap-2 text-lg font-extrabold">
          <PenLine className="h-5 w-5" aria-hidden /> Teste dich im Quiz
        </p>
        <p className="font-bangla text-sm text-white/80">ব্যাকরণ মোডে নিজেকে যাচাই করো</p>
      </Link>
    </div>
  );
}
