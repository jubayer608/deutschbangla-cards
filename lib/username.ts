// Phase 1 — username rules shared by the claim API + settings UI.
//
// Format: 3–20 chars, lowercase letters / digits / underscore.
// Reserved names protect the /profile/* static routes and generic words.

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

const RESERVED = new Set([
  "settings",
  "me",
  "api",
  "admin",
  "profile",
  "login",
  "signup",
  "signin",
  "signout",
  "ulluk",
  "support",
  "help",
  "about",
  "blog",
  "quiz",
  "root",
  "system",
  "null",
  "undefined",
]);

/** Normalize raw input (trim + lowercase) and validate. Returns an error message or null. */
export function validateUsername(raw: unknown): string | null {
  if (typeof raw !== "string") return "Username দিতে হবে।";
  const name = raw.trim().toLowerCase();
  if (!USERNAME_RE.test(name)) {
    return "Username ৩–২০ অক্ষরের হতে হবে (a–z, 0–9, _ ব্যবহার করা যাবে)।";
  }
  if (RESERVED.has(name)) return "এই username নেওয়া যাবে না।";
  return null;
}

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}
