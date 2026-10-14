"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  resources,
  resourceCategories,
  type ResourceCategory,
} from "@/data/resources";
import { ArrowUpRight, Globe, Lightbulb, Search, SearchX, Sparkles } from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 26 },
  },
};

export default function ResourcesPage() {
  const [activeCat, setActiveCat] = useState<ResourceCategory | "alle">("alle");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      const catOk = activeCat === "alle" || r.category === activeCat;
      const qOk =
        q === "" ||
        r.name.toLowerCase().includes(q) ||
        r.bangla.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [activeCat, query]);

  const catInfo = (id: ResourceCategory) =>
    resourceCategories.find((c) => c.id === id)!;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5"
    >
      {/* Header */}
      <motion.div variants={item}>
        <p className="font-bangla inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
          আরও শিখতে চাও? <Globe className="h-4 w-4" aria-hidden />
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-emerald-950">
          Ressourcen
        </h1>
        <p className="font-bangla mt-2 text-sm leading-relaxed text-slate-500">
          বাছাই করা ফ্রি রিসোর্স — ভিডিও, কোর্স, অ্যাপ, অভিধান। এগুলো বাইরের
          ওয়েবসাইট, নতুন ট্যাবে খুলবে।
        </p>
      </motion.div>

      {/* Search */}
      <motion.div variants={item}>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="খুঁজো… (যেমন: অভিধান, ভিডিও)"
            className="font-bangla w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-sm font-semibold text-emerald-950 shadow-sm ring-1 ring-emerald-100 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </motion.div>

      {/* Category pills */}
      <motion.div variants={item} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button
          onClick={() => setActiveCat("alle")}
          className={`font-bangla inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition active:scale-95 ${
            activeCat === "alle"
              ? "bg-brand-gradient text-white shadow-md shadow-emerald-200"
              : "bg-white text-emerald-800 ring-1 ring-emerald-100"
          }`}
        >
          <Sparkles className="h-4 w-4" aria-hidden /> সবগুলো
        </button>
        {resourceCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={`font-bangla inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition active:scale-95 ${
              activeCat === c.id
                ? "bg-brand-gradient text-white shadow-md shadow-emerald-200"
                : "bg-white text-emerald-800 ring-1 ring-emerald-100"
            }`}
          >
            <c.Icon className="h-4 w-4" aria-hidden /> {c.bangla}
          </button>
        ))}
      </motion.div>

      {/* Cards */}
      <motion.div layout className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((r) => {
            const c = catInfo(r.category);
            return (
              <motion.a
                layout
                key={r.id}
                variants={item}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.96 }}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-emerald-100 transition hover:shadow-lg hover:ring-emerald-200 active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-100">
                  <r.Icon className="h-6 w-6 text-emerald-600" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-extrabold text-emerald-950">
                      {r.name}
                    </span>
                    <span className="font-bangla inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                      <c.Icon className="h-3 w-3" aria-hidden /> {c.bangla}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                      {r.level}
                    </span>
                  </span>
                  <span className="font-bangla mt-1.5 block text-sm leading-relaxed text-slate-500">
                    {r.bangla}
                  </span>
                  <span className="font-bangla mt-2 inline-flex items-center gap-1 text-sm font-bold text-emerald-600 transition group-hover:gap-2 group-hover:text-emerald-700">
                    Visit <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </span>
                </span>
              </motion.a>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-emerald-100">
          <SearchX className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
          <p className="font-bangla mt-2 font-bold text-emerald-900">
            কিছু পাওয়া গেল না
          </p>
          <p className="font-bangla text-sm text-slate-500">
            অন্য কিছু লিখে খুঁজে দেখো
          </p>
        </div>
      )}

      {/* Note */}
      <motion.div
        variants={item}
        className="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-100"
      >
        <p className="font-bangla flex items-start gap-2 text-sm leading-relaxed text-amber-800">
          <Lightbulb className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          <span>
            <strong>নোট:</strong> এগুলো সব বাইরের ফ্রি রিসোর্স — Ulluk-এর সাথে প্রতিদিন ১৫–২০ মিনিট এগুলো ব্যবহার করলে A1 অনেক দ্রুত
            শেষ হবে।
          </span>
        </p>
      </motion.div>
    </motion.div>
  );
}
