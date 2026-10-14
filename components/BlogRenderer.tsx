"use client";

import type { BlogBlock } from "@/data/blog";

/** Renders **bold** inline markers inside Bangla/German text. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-extrabold text-emerald-900">
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
                className="font-bangla mt-2 text-xl font-extrabold tracking-tight text-emerald-950"
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
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
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
                className="rounded-3xl bg-gradient-to-br from-amber-50 to-yellow-50 p-5 ring-1 ring-amber-200"
              >
                <p className="font-bangla text-sm font-extrabold text-amber-800">
                  💡 {b.title}
                </p>
                <p className="font-bangla mt-1.5 text-[15px] leading-relaxed text-amber-900/80">
                  <RichText text={b.text} />
                </p>
              </div>
            );
          case "table":
            return (
              <div
                key={i}
                className="overflow-x-auto rounded-2xl shadow-sm ring-1 ring-emerald-100"
              >
                <table className="w-full min-w-[420px] border-collapse bg-white text-sm">
                  <thead>
                    <tr className="bg-brand-gradient">
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
                        className={r % 2 === 0 ? "bg-white" : "bg-emerald-50/50"}
                      >
                        {row.map((cell, c) => (
                          <td
                            key={c}
                            className="font-bangla border-t border-emerald-50 px-4 py-2.5 text-slate-600"
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
