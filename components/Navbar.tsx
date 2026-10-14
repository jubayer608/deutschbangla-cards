"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Flame,
  Home,
  BookOpen,
  Briefcase,
  Library,
  Puzzle,
  Target,
  Globe,
  PenLine,
  TrendingUp,
} from "lucide-react";

const links = [
  { href: "/", label: "হোম", short: "হোম", Icon: Home },
  { href: "/lektionen", label: "পাঠ", short: "পাঠ", Icon: BookOpen },
  { href: "/wortschatz", label: "শব্দ", short: "শব্দ", Icon: Library },
  { href: "/grammatik", label: "ব্যাকরণ", short: "ব্যাকরণ", Icon: Puzzle },
  { href: "/quiz", label: "কুইজ", short: "কুইজ", Icon: Target },
  { href: "/resources", label: "রিসোর্স", short: "রিসোর্স", Icon: Globe },
  { href: "/opportunities", label: "সুযোগ", short: "সুযোগ", Icon: Briefcase },
  { href: "/blog", label: "ব্লগ", short: "ব্লগ", Icon: PenLine },
  { href: "/fortschritt", label: "অগ্রগতি", short: "অগ্রগতি", Icon: TrendingUp },
];

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/90 shadow-[0_1px_12px_rgba(6,95,70,0.06)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2.5">
          <Link href="/" className="group flex shrink-0 flex-col items-start gap-0.5">
            <img
              src="/logo.svg"
              alt="Ulluk"
              className="h-9 w-auto transition group-active:scale-95"
            />
            <span className="font-bangla hidden text-[11px] font-semibold text-slate-400 sm:block">
              বাংলায় জার্মান শেখো
            </span>
          </Link>

          {/* Streak chip (mobile) */}
          <span
            className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-700 lg:hidden"
            aria-label="streak"
          >
            <Flame className="h-4 w-4 text-amber-600" aria-hidden />
          </span>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {links.map((l) => {
              const active = isActiveLink(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="relative rounded-full px-3 py-2 text-[13px] font-bold transition"
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="bg-brand-gradient absolute inset-0 rounded-full shadow-md shadow-emerald-200"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span
                    className={`font-bangla relative z-10 ${active ? "text-white" : "text-emerald-800 hover:text-emerald-600"}`}
                  >
                    {l.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-emerald-100 bg-white/95 shadow-[0_-4px_24px_rgba(6,95,70,0.08)] backdrop-blur-xl lg:hidden"
        aria-label="Main"
      >
        <div className="grid grid-cols-9 pb-[env(safe-area-inset-bottom)]">
          {links.map((l) => {
            const active = isActiveLink(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className="relative flex flex-col items-center gap-0.5 px-0.5 py-2 pt-2.5"
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="mnav-pill"
                    className="absolute inset-x-1 inset-y-1 rounded-2xl bg-emerald-100"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <l.Icon
                  className={`relative z-10 h-[18px] w-[18px] leading-none ${
                    active ? "text-emerald-700" : "text-slate-400"
                  }`}
                  aria-hidden
                />
                <span
                  className={`font-bangla relative z-10 text-[9px] leading-tight ${
                    active ? "font-extrabold text-emerald-800" : "font-semibold text-slate-400"
                  }`}
                >
                  {l.short}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
