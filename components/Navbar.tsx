"use client";

import AuthButton from "./AuthButton";
import NotificationBell from "./NotificationBell";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Flame,
  Globe,
  Home,
  Library,
  Menu,
  PenLine,
  Puzzle,
  Target,
  TrendingUp,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react";

type NavLink = { href: string; label: string; Icon: LucideIcon; desc?: string };

/** Daily learning loop — always visible */
const coreLinks: NavLink[] = [
  { href: "/", label: "হোম", Icon: Home },
  { href: "/lektionen", label: "পাঠ", Icon: BookOpen },
  { href: "/wortschatz", label: "শব্দ", Icon: Library },
  { href: "/quiz", label: "কুইজ", Icon: Target },
];

/** Reference / periodic pages — live inside the menu */
const menuLinks: NavLink[] = [
  { href: "/grammatik", label: "ব্যাকরণ", Icon: Puzzle, desc: "গ্রামার টপিক" },
  { href: "/fortschritt", label: "অগ্রগতি", Icon: TrendingUp, desc: "তোমার প্রগ্রেস" },
  { href: "/leaderboard", label: "লিডারবোর্ড", Icon: Trophy, desc: "টপ লার্নার" },
  { href: "/opportunities", label: "সুযোগ", Icon: Briefcase, desc: "ক্যারিয়ার গাইড" },
  { href: "/resources", label: "রিসোর্স", Icon: Globe, desc: "বাইরের রিসোর্স" },
  { href: "/blog", label: "ব্লগ", Icon: PenLine, desc: "আর্টিকেল" },
];

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar({ authConfigured }: { authConfigured: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuActive = menuLinks.some((l) => isActiveLink(pathname, l.href));

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 shadow-[0_1px_12px_rgba(11,31,59,0.06)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2.5">
          <Link href="/" className="group flex shrink-0 flex-col items-start gap-0.5">
            <img
              src="/logo.svg"
              alt="Ulluk"
              className="h-9 w-auto transition group-active:scale-95"
            />
            <span className="font-bangla hidden text-[11px] font-semibold text-mist sm:block">
              বাংলায় জার্মান শেখো
            </span>
          </Link>

          {/* Right cluster: streak chip (mobile) + nav (desktop) + auth */}
          <div className="flex items-center gap-2">
            {/* Streak chip (mobile) */}
            <span
              className="rounded-full bg-sun/30 px-3 py-1.5 text-sm font-bold text-navy lg:hidden"
              aria-label="streak"
            >
              <Flame className="h-4 w-4 text-sun" aria-hidden />
            </span>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {coreLinks.map((l) => {
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
                      className="absolute inset-0 rounded-full bg-teal shadow-md shadow-teal/30"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span
                    className={`font-bangla relative z-10 ${active ? "text-white" : "text-navy hover:text-teal"}`}
                  >
                    {l.label}
                  </span>
                </Link>
              );
            })}

            {/* More dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="relative rounded-full px-3 py-2 text-[13px] font-bold transition"
              >
                {menuActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-teal shadow-md shadow-teal/30"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span
                  className={`font-bangla relative z-10 flex items-center gap-1 ${menuActive ? "text-white" : "text-navy hover:text-teal"}`}
                >
                  আরো
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </span>
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    role="menu"
                    aria-label="আরো"
                    className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-navy/10"
                  >
                    {menuLinks.map((l) => {
                      const active = isActiveLink(pathname, l.href);
                      return (
                        <Link
                          key={l.href}
                          href={l.href}
                          role="menuitem"
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center gap-3 px-4 py-3 transition ${
                            active ? "bg-teal/10" : "hover:bg-cream"
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              active ? "bg-teal text-white" : "bg-teal/10 text-teal"
                            }`}
                          >
                            <l.Icon className="h-[18px] w-[18px]" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={`font-bangla block text-sm leading-tight ${
                                active ? "font-extrabold text-navy" : "font-bold text-slate-700"
                              }`}
                            >
                              {l.label}
                            </span>
                            {l.desc && (
                              <span className="font-bangla block text-xs text-mist">{l.desc}</span>
                            )}
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-mist" aria-hidden />
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
          <NotificationBell />
          <AuthButton authConfigured={authConfigured} />
        </div>
        </div>
      </header>

      {/* Click-catcher for the desktop dropdown */}
      {menuOpen && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 hidden cursor-default bg-transparent lg:block"
        />
      )}

      {/* Mobile bottom nav — 4 core tabs + menu */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-4px_24px_rgba(11,31,59,0.08)] backdrop-blur-xl lg:hidden"
        aria-label="Main"
      >
        <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
          {coreLinks.map((l) => {
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
                    className="absolute inset-x-2 inset-y-1 rounded-2xl bg-teal/15"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <l.Icon
                  className={`relative z-10 h-5 w-5 leading-none ${
                    active ? "text-teal" : "text-mist"
                  }`}
                  aria-hidden
                />
                <span
                  className={`font-bangla relative z-10 text-[10px] leading-tight ${
                    active ? "font-extrabold text-navy" : "font-semibold text-mist"
                  }`}
                >
                  {l.label}
                </span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-label="মেনু খুলুন"
            className="relative flex flex-col items-center gap-0.5 px-0.5 py-2 pt-2.5"
          >
            {menuActive && (
              <motion.span
                layoutId="mnav-pill"
                className="absolute inset-x-2 inset-y-1 rounded-2xl bg-teal/15"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <Menu
              className={`relative z-10 h-5 w-5 leading-none ${
                menuActive ? "text-teal" : "text-mist"
              }`}
              aria-hidden
            />
            <span
              className={`font-bangla relative z-10 text-[10px] leading-tight ${
                menuActive ? "font-extrabold text-navy" : "font-semibold text-mist"
              }`}
            >
              মেনু
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile bottom sheet menu */}
      <AnimatePresence>
        {menuOpen && (
          <div key="sheet" className="lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-[2px]"
              aria-hidden
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              role="dialog"
              aria-modal="true"
              aria-label="মেনু"
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-slate-200 bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2 shadow-2xl"
            >
              <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-slate-200" aria-hidden />
              <div className="flex items-center justify-between py-2">
                <span className="font-bangla text-base font-extrabold text-navy">মেনু</span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="মেনু বন্ধ করুন"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-navy transition active:scale-95"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {menuLinks.map((l, i) => {
                  const active = isActiveLink(pathname, l.href);
                  return (
                    <motion.div
                      key={l.href}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04, duration: 0.18 }}
                    >
                      <Link
                        href={l.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition active:scale-[0.99] ${
                          active ? "bg-teal/10" : "hover:bg-cream"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                            active ? "bg-teal text-white" : "bg-teal/10 text-teal"
                          }`}
                        >
                          <l.Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`font-bangla block text-[15px] leading-tight ${
                              active ? "font-extrabold text-navy" : "font-bold text-slate-700"
                            }`}
                          >
                            {l.label}
                          </span>
                          {l.desc && (
                            <span className="font-bangla block text-xs text-mist">{l.desc}</span>
                          )}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-mist" aria-hidden />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
