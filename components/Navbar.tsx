import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-indigo-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            🇩🇪🇧🇩
          </span>
          <span className="text-lg font-extrabold tracking-tight text-indigo-950">
            DeutschBangla <span className="text-indigo-600">Cards</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 text-sm font-semibold">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-indigo-700 transition hover:bg-indigo-50"
          >
            🃏 Cards
          </Link>
          <Link
            href="/quiz"
            className="rounded-full px-4 py-2 text-indigo-700 transition hover:bg-indigo-50"
          >
            ✍️ Quiz
          </Link>
        </div>
      </nav>
    </header>
  );
}
