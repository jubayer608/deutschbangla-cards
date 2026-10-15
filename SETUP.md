# ULLUK — Phase 0 Setup (Auth + Database)

Phase 0 adds Google login + a Postgres database. The site works **without**
this setup (login button shows a disabled "setup pending" state, all
learning features keep using browser localStorage), but sign-in needs the
steps below.

## 1. Create the Neon database (free tier)

1. Go to [neon.tech](https://neon.tech) → sign in with GitHub/Google → **New Project**.
2. Project name: `ulluk` (any name works). Region: closest to your users.
3. On the project dashboard → **Connection Details** → copy the connection
   string (it looks like `postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require`).
4. Put it in `.env.local` as `DATABASE_URL` (and the same value as `DIRECT_URL`
   for now — Neon's pooled URL works for both at this scale).

## 2. Create the tables

```bash
npx prisma db push
# — or, once migrations are used in production —
npx prisma migrate deploy
```

This creates the Auth.js tables (`User`, `Account`, `Session`,
`VerificationToken`) + app tables (`UserProgress`, `XpEvent`, `Badge`,
`Follow`, `Notification`, `EmailPreference`). The checked-in migration
`prisma/migrations/0001_init/migration.sql` is the same schema.

## 3. Google OAuth (Google Cloud Console)

1. [console.cloud.google.com](https://console.cloud.google.com) → create/select
   a project → **APIs & Services → OAuth consent screen**:
   - User type: **External**, app name: `Ulluk`, support email: your email.
   - Scopes: the default `openid`, `email`, `profile` (nothing else needed).
   - Test users: add your own Google email while the app is in Testing mode.
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**, name: `Ulluk Web`.
   - **Authorized JavaScript origins**: `https://deutschbangla-cards.vercel.app`
     and `http://localhost:3000`.
   - **Authorized redirect URIs** (exact):
     - `https://deutschbangla-cards.vercel.app/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google`
3. Copy the **Client ID** → `GOOGLE_CLIENT_ID` and **Client secret** →
   `GOOGLE_CLIENT_SECRET` in `.env.local`.

## 4. Auth secret

```bash
npx auth secret
# — or —
openssl rand -base64 32
```

Put the output in `.env.local` as `AUTH_SECRET`.

## 5. Vercel (production)

Vercel → Project Settings → **Environment Variables** → add all five:
`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET` (Environment: Production + Preview). Then redeploy.

## 6. Verify

1. `npm run dev` → open the site → Navbar shows **"Google দিয়ে লগইন"**.
2. Click it → Google consent → back to the site, signed in (avatar + name).
3. First login merges your browser localStorage progress into the DB
   (max-wins/union — no data loss). Check Neon → Table Editor →
   `UserProgress` to see the row.

## Notes

- **No env vars set?** The site builds and runs; the login button is
  disabled ("setup pending") and everything else works from localStorage.
- **Never commit `.env.local`** (it's in `.gitignore`) and never paste real
  keys into chat or the repo.
- Auth.js session strategy is `database` (sessions stored in the `Session`
  table). If the DB is unreachable, sign-in fails gracefully to the Auth.js
  error page — the rest of the site is unaffected.

## Phase 1 — profile (migration 0002)

After Phase 0 is set up, apply the profile migration once:

```bash
npx prisma migrate deploy   # applies prisma/migrations/0002_user_settings/
# ...or: npx prisma db push
```

Then: sign in → Navbar avatar menu → **আমার প্রোফাইল** → pick a username
(`/profile/[username]`). Settings live at `/profile/settings`
(daily XP goal, reminder time, difficulty, privacy: public / friends / private).
