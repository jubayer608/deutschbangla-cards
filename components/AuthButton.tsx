"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogIn, LogOut, Settings as SettingsIcon, User } from "lucide-react";

// Phase 0 — auth button for the Navbar.
// - authConfigured=false (env missing): disabled "setup pending" state,
//   never crashes the page.
// - signed out: "Google দিয়ে লগইন" → Google OAuth.
// - signed in: avatar + name + dropdown (Profile, Settings, Sign out).
//   Profile links to /profile, which redirects to the user's own handle.
export default function AuthButton({ authConfigured }: { authConfigured: boolean }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  if (!authConfigured) {
    return (
      <button
        type="button"
        disabled
        title="Login setup baki — SETUP.md dekho (Neon + Google OAuth)"
        className="font-bangla inline-flex min-h-11 shrink-0 cursor-not-allowed items-center gap-1.5 rounded-full bg-cream px-3 py-2 text-[13px] font-bold text-mist ring-1 ring-slate-200"
      >
        <LogIn className="h-4 w-4" aria-hidden />
        লগইন
      </button>
    );
  }

  if (status === "loading") {
    return (
      <span
        aria-hidden
        className="inline-flex h-9 w-24 shrink-0 animate-pulse items-center rounded-full bg-cream"
      />
    );
  }

  if (session?.user) {
    const { name, image } = session.user;
    return (
      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-1 transition hover:bg-cream"
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-teal/40" />
          ) : (
            <span
              aria-hidden
              className="font-bangla flex h-8 w-8 items-center justify-center rounded-full bg-teal text-sm font-extrabold text-white"
            >
              {(name ?? "?").slice(0, 1)}
            </span>
          )}
          {name && (
            <span className="font-bangla hidden max-w-24 truncate text-[13px] font-bold text-navy sm:block">
              {name}
            </span>
          )}
          <ChevronDown
            className={`h-3.5 w-3.5 text-mist transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        {open && (
          <div
            role="menu"
            aria-label="অ্যাকাউন্ট"
            className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-navy/10"
          >
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="font-bangla flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-navy transition hover:bg-cream"
            >
              <User className="h-4 w-4 text-teal" aria-hidden /> আমার প্রোফাইল
            </Link>
            <Link
              href="/profile/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="font-bangla flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-navy transition hover:bg-cream"
            >
              <SettingsIcon className="h-4 w-4 text-teal" aria-hidden /> সেটিংস
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="font-bangla flex w-full items-center gap-2.5 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" aria-hidden /> লগআউট
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className="font-bangla inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-navy px-3 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-navy/90 active:scale-95"
    >
      <LogIn className="h-4 w-4" aria-hidden />
      Google দিয়ে লগইন
    </button>
  );
}
