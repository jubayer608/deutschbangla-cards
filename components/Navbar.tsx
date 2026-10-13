"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const links = [
  { href: "/", label: "হোম", icon: "🏠" },
  { href: "/lektionen", label: "পাঠ", icon: "📖" },
  { href: "/wortschatz", label: "শব্দ", icon: "📚" },
  { href: "/grammatik", label: "ব্যাকরণ", icon: "🧩" },
  { href: "/quiz", label: "কুইজ", icon: "🎯" },
  { href: "/fortschritt", label: "অগ্রগতি", icon: "📈" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-indigo-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              🇩🇪🇧🇩
            </span>
            <span className="text-lg font-extrabold tracking-tight text-indigo-950">
              DeutschBangla <span className="text-indigo-600">Cards</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Streak placeholder (presentational only) */}
            <span
              className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700 md:hidden"
              aria-label="streak"
            >
              🔥
            </span>
            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="relative rounded-full px-4 py-2 text-sm font-bold"
                    aria-current={active ? "page" : undefined}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-200"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className={`font-bangla relative z-10 ${active ? "text-white" : "text-indigo-700"}`}>
                      {l.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-indigo-100 bg-white/95 backdrop-blur md:hidden"
        aria-label="Main"
      >
        <div className="grid grid-cols-6 pb-[env(safe-area-inset-bottom)]">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex flex-col items-center gap-0.5 py-2 pt-2.5 transition ${
                  active ? "text-indigo-600" : "text-slate-400"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={`h-1 w-8 rounded-full ${active ? "bg-indigo-600" : "bg-transparent"}`}
                  aria-hidden
                />
                <span className="text-lg" aria-hidden>
                  {l.icon}
                </span>
                <span className={`font-bangla text-[10px] ${active ? "font-extrabold" : "font-semibold"}`}>
                  {l.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
