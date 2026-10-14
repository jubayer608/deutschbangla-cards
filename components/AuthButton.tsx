"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn, LogOut } from "lucide-react";

// Phase 0 — auth button for the Navbar.
// - authConfigured=false (env missing): disabled "setup pending" state,
//   never crashes the page.
// - signed out: "Google দিয়ে লগইন" → Google OAuth.
// - signed in: avatar + name + sign-out.
export default function AuthButton({ authConfigured }: { authConfigured: boolean }) {
  const { data: session, status } = useSession();

  if (!authConfigured) {
    return (
      <button
        type="button"
        disabled
        title="Login setup baki — SETUP.md dekho (Neon + Google OAuth)"
        className="font-bangla inline-flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-full bg-cream px-3 py-2 text-[13px] font-bold text-mist ring-1 ring-slate-200"
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
      <span className="inline-flex shrink-0 items-center gap-1.5">
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
        <button
          type="button"
          onClick={() => signOut()}
          aria-label="লগআউট"
          title="লগআউট"
          className="flex h-8 w-8 items-center justify-center rounded-full text-mist transition hover:bg-cream hover:text-navy active:scale-95"
        >
          <LogOut className="h-4 w-4" aria-hidden />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className="font-bangla inline-flex shrink-0 items-center gap-1.5 rounded-full bg-navy px-3 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-navy/90 active:scale-95"
    >
      <LogIn className="h-4 w-4" aria-hidden />
      Google দিয়ে লগইন
    </button>
  );
}
