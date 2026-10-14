"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getTopic } from "@/data/grammar";
import EmptyState from "@/components/EmptyState";

export default function GrammarDetailPage() {
  const params = useParams();
  const slug = String(params.slug);
  const topic = useMemo(() => getTopic(slug), [slug]);

  if (!topic) {
    return <EmptyState icon="📖" title="বিষয় পাওয়া যায়নি" message="এই বিষয়ে কোনো ব্যাকরণ নোট নেই।" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/grammatik" className="font-bangla text-sm font-bold text-emerald-600">
          ← সব ব্যাকরণ
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-emerald-950">{topic.title}</h1>
        <p className="font-bangla text-slate-500">{topic.titleBangla}</p>
        <p className="font-bangla mt-3 rounded-3xl bg-emerald-50 p-4 text-slate-700 ring-1 ring-emerald-100">
          {topic.intro}
        </p>
      </div>

      {topic.sections.map((s, i) => (
        <motion.section
          key={i}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-emerald-100"
        >
          <h2 className="font-extrabold text-emerald-900">{s.heading}</h2>
          <p className="font-bangla mt-2 whitespace-pre-line text-slate-700">{s.text}</p>
          {s.table && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-64 border-collapse text-sm">
                <thead>
                  <tr>
                    {s.table.headers.map((h, hi) => (
                      <th key={hi} className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-left font-bold text-emerald-900">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((row, ri) => (
                    <tr key={ri} className={ri % 2 ? "bg-emerald-50/40" : ""}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="border border-emerald-100 px-3 py-2 text-slate-700">
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
                <li key={ei} className="rounded-xl bg-emerald-50/60 px-3 py-2 text-sm">
                  <span className="font-bold text-emerald-900">{e.german}</span>
                  <span className="font-bangla block text-slate-600">{e.bangla}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.section>
      ))}

      {topic.tips.length > 0 && (
        <section className="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-200">
          <h2 className="font-bangla text-lg font-extrabold text-amber-900">💡 মনে রেখো</h2>
          <ul className="font-bangla mt-2 flex flex-col gap-1.5 text-amber-900">
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
        className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-center text-white shadow-xl shadow-emerald-200 transition active:scale-[0.98]"
      >
        <p className="text-lg font-extrabold">✍️ Teste dich im Quiz</p>
        <p className="font-bangla text-sm text-emerald-200">ব্যাকরণ মোডে নিজেকে যাচাই করো</p>
      </Link>
    </div>
  );
}
