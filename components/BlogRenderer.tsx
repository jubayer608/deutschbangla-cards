"use client";

import { Lightbulb } from "lucide-react";
import type { BlogBlock } from "@/data/blog";

/** Renders **bold** inline markers inside Bangla/German text. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-extrabold text-navy">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export default function BlogRenderer({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "heading":
            return (
              <h2
                key={i}
                className="font-heading mt-2 text-xl font-extrabold tracking-tight text-navy"
              >
                <RichText text={b.text} />
              </h2>
            );
          case "paragraph":
            return (
              <p
                key={i}
                className="font-bangla text-[15px] leading-relaxed text-slate-600"
              >
                <RichText text={b.text} />
              </p>
            );
          case "list":
            return (
              <ul key={i} className="flex flex-col gap-2.5">
                {b.items.map((it, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden />
                    <span className="font-bangla text-[15px] leading-relaxed text-slate-600">
                      <RichText text={it} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case "tip":
            return (
              <div
                key={i}
                className="rounded-3xl bg-teal/5 p-5 ring-1 ring-teal/20"
              >
                <p className="font-bangla inline-flex items-center gap-1.5 text-sm font-extrabold text-navy">
                  <Lightbulb className="h-4 w-4 text-sun" aria-hidden /> {b.title}
                </p>
                <p className="font-bangla mt-1.5 text-[15px] leading-relaxed text-navy/80">
                  <RichText text={b.text} />
                </p>
              </div>
            );
          case "table":
            return (
              <div
                key={i}
                className="overflow-x-auto rounded-2xl shadow-sm ring-1 ring-slate-200"
              >
                <table className="w-full min-w-[420px] border-collapse bg-white text-sm">
                  <thead>
                    <tr className="bg-navy">
                      {b.headers.map((h, j) => (
                        <th
                          key={j}
                          className="font-bangla px-4 py-3 text-left font-extrabold text-white"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, r) => (
                      <tr
                        key={r}
                        className={r % 2 === 0 ? "bg-white" : "bg-teal/5"}
                      >
                        {row.map((cell, c) => (
                          <td
                            key={c}
                            className="font-bangla border-t border-slate-100 px-4 py-2.5 text-slate-600"
                          >
                            <RichText text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
