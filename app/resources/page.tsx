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
        <p className="font-bangla inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
          আরও শিখতে চাও? <Globe className="h-4 w-4" aria-hidden />
        </p>
        <h1 className="section-heading text-3xl">
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
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="খুঁজো… (যেমন: অভিধান, ভিডিও)"
            className="font-bangla w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-sm font-semibold text-navy shadow-sm ring-1 ring-slate-200 outline-none placeholder:text-mist focus:ring-2 focus:ring-teal/40"
          />
        </div>
      </motion.div>

      {/* Category pills */}
      <motion.div variants={item} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button
          onClick={() => setActiveCat("alle")}
          className={`font-bangla inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition active:scale-95 ${
            activeCat === "alle"
              ? "bg-brand-gradient text-white shadow-md shadow-navy/10"
              : "bg-white text-navy ring-1 ring-slate-200"
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
                ? "bg-brand-gradient text-white shadow-md shadow-navy/10"
                : "bg-white text-navy ring-1 ring-slate-200"
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
                className="card card-hover group flex items-start gap-4 rounded-3xl p-5 transition active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream ring-1 ring-teal/20">
                  <r.Icon className="h-6 w-6 text-teal" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-extrabold text-navy">
                      {r.name}
                    </span>
                    <span className="badge font-bangla inline-flex items-center gap-1 rounded-full bg-teal/10 px-2 py-0.5 text-[11px] text-teal">
                      <c.Icon className="h-3 w-3" aria-hidden /> {c.bangla}
                    </span>
                    <span className="badge rounded-full bg-sun/30 px-2 py-0.5 text-[11px] text-navy">
                      {r.level}
                    </span>
                  </span>
                  <span className="font-bangla mt-1.5 block text-sm leading-relaxed text-slate-500">
                    {r.bangla}
                  </span>
                  <span className="font-bangla mt-2 inline-flex items-center gap-1 text-sm font-bold text-teal transition group-hover:gap-2 group-hover:text-teal">
                    Visit <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </span>
                </span>
              </motion.a>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="card rounded-3xl p-8 text-center">
          <SearchX className="mx-auto h-10 w-10 text-mist" aria-hidden />
          <p className="font-bangla mt-2 font-bold text-navy">
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
        className="rounded-3xl bg-sun/15 p-5 ring-1 ring-sun/30"
      >
        <p className="font-bangla flex items-start gap-2 text-sm leading-relaxed text-navy">
          <Lightbulb className="h-4 w-4 shrink-0 text-navy" aria-hidden />
          <span>
            <strong>নোট:</strong> এগুলো সব বাইরের ফ্রি রিসোর্স — Ulluk-এর সাথে প্রতিদিন ১৫–২০ মিনিট এগুলো ব্যবহার করলে A1 অনেক দ্রুত
            শেষ হবে।
          </span>
        </p>
      </motion.div>
    </motion.div>
  );
}
