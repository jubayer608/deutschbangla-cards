"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PenLine, Star } from "lucide-react";
import { blogPosts, readingMinutes, formatDate } from "@/data/blog";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 26 },
  },
};

function Meta({ slug }: { slug: string }) {
  const post = blogPosts.find((p) => p.slug === slug)!;
  return (
    <span className="font-bangla flex flex-wrap items-center gap-2 text-xs font-semibold text-white/85">
      <span className="rounded-full bg-white/20 px-2.5 py-1 font-bold text-white backdrop-blur">
        {post.category}
      </span>
      <span>{formatDate(post.date)}</span>
      <span aria-hidden>•</span>
      <span>{readingMinutes(post)} মিনিট পড়া</span>
    </span>
  );
}

export default function BlogIndex() {
  const [featured, ...rest] = blogPosts;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <p className="font-bangla inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
          গাইড, টিপস আর কৌশল <PenLine className="h-4 w-4" aria-hidden />
        </p>
        <h1 className="section-heading text-3xl">
          Blog
        </h1>
        <p className="font-bangla mt-2 text-sm leading-relaxed text-slate-500">
          German শেখার পথে কাজে লাগবে এমন লেখা — বাংলায়, সহজ করে।
        </p>
      </motion.div>

      {/* Featured post */}
      <motion.div variants={item}>
        <Link
          href={`/blog/${featured.slug}`}
          className="group relative block overflow-hidden rounded-3xl bg-navy p-6 shadow-xl sm:p-8"
        >
          <motion.div
            className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-teal/30 blur-2xl"
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
          <div className="relative">
            <span className="font-bangla inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-white backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-sun text-sun" aria-hidden /> Featured
            </span>
            <h2 className="font-bangla mt-3 text-2xl font-extrabold leading-snug text-white sm:text-[28px]">
              {featured.title}
            </h2>
            <p className="font-bangla mt-2 max-w-md text-sm leading-relaxed text-white/85">
              {featured.excerpt}
            </p>
            <div className="mt-4">
              <Meta slug={featured.slug} />
            </div>
            <span className="font-bangla mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-navy transition group-hover:gap-3">
              পড়ো <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </div>
        </Link>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {rest.map((p) => (
          <motion.div key={p.slug} variants={item}>
            <Link
              href={`/blog/${p.slug}`}
              className="card card-hover group flex h-full flex-col overflow-hidden rounded-3xl transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="bg-navy p-5">
                <span className="font-bangla inline-block rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-extrabold text-white backdrop-blur">
                  {p.category}
                </span>
                <h3 className="font-bangla mt-2.5 text-lg font-extrabold leading-snug text-white">
                  {p.title}
                </h3>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <p className="font-bangla flex-1 text-sm leading-relaxed text-slate-500">
                  {p.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bangla text-xs font-semibold text-mist">
                    {formatDate(p.date)} • {readingMinutes(p)} মিনিট
                  </span>
                  <ArrowRight
                    className="h-5 w-5 text-teal transition group-hover:translate-x-1 group-hover:text-teal"
                    aria-hidden
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
