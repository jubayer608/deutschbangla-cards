"use client";

import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  type BlogPost,
  readingMinutes,
  formatDate,
} from "@/data/blog";
import { ArrowLeft, ArrowRight } from "lucide-react";
import BlogRenderer from "@/components/BlogRenderer";

interface Props {
  post: BlogPost;
  prev: BlogPost | null;
  next: BlogPost | null;
}

export default function BlogPostClient({ post, prev, next }: Props) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <div className="flex flex-col gap-6">
      {/* Reading progress */}
      <motion.div
        className="bg-brand-gradient fixed inset-x-0 top-0 z-50 h-1 origin-left"
        style={{ scaleX: progress }}
        aria-hidden
      />

      {/* Back */}
      <Link
        href="/blog"
        className="font-bangla inline-flex w-fit items-center gap-1.5 text-sm font-bold text-teal transition hover:gap-2.5 hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> সব পোস্ট
      </Link>

      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-3xl bg-navy p-6 shadow-xl sm:p-8"
      >
        <span className="font-bangla inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold text-white backdrop-blur">
          {post.category}
        </span>
        <h1 className="font-bangla mt-3 text-2xl font-extrabold leading-snug text-white sm:text-3xl">
          {post.title}
        </h1>
        <p className="font-bangla mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-white/85">
          <span>{formatDate(post.date)}</span>
          <span aria-hidden>•</span>
          <span>{readingMinutes(post)} মিনিট পড়া</span>
        </p>
      </motion.header>

      {/* Body */}
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card rounded-3xl p-6 sm:p-8"
      >
        <BlogRenderer blocks={post.blocks} />
      </motion.article>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {post.tags.map((t) => (
          <span
            key={t}
            className="badge rounded-full bg-teal/10 px-3 py-1 text-xs text-teal"
          >
            #{t}
          </span>
        ))}
      </div>

      {/* Prev / Next */}
      <nav className="grid grid-cols-2 gap-3" aria-label="More posts">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="card card-hover rounded-3xl p-4 transition active:scale-[0.98]"
          >
            <p className="font-bangla inline-flex items-center gap-1 text-xs font-bold text-mist">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> আগের পোস্ট
            </p>
            <p className="font-bangla mt-1 text-sm font-extrabold leading-snug text-navy">
              {prev.title}
            </p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="card card-hover rounded-3xl p-4 text-right transition active:scale-[0.98]"
          >
            <p className="font-bangla inline-flex items-center justify-end gap-1 text-xs font-bold text-mist">
              পরের পোস্ট <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </p>
            <p className="font-bangla mt-1 text-sm font-extrabold leading-snug text-navy">
              {next.title}
            </p>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
