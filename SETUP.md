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

## Phase 3 — notifications (migration 0003 + VAPID keys)

Apply the push-subscription migration once (creates `PushSubscription`
+ adds `actorId` / `link` / `dedupKey` columns to `Notification`):

```bash
npx prisma migrate deploy   # applies prisma/migrations/0003_push_subscriptions/
# ...or: npx prisma db push
```

Web Push needs VAPID keys. Generate a pair (Node built-in crypto, no dep):

```bash
node -e "const c=require('crypto');const e=c.createECDH('prime256v1');const p=e.generateKeys('base64','uncompressed');const s=e.getPrivateKey('base64');const u=x=>x.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');console.log('PUBLIC='+u(p));console.log('PRIVATE='+u(s))"
```

Add to Vercel env vars (Production + Preview):
`NEXT_PUBLIC_VAPID_PUBLIC_KEY` (the PUBLIC value),
`VAPID_PRIVATE_KEY` (the PRIVATE value). Then redeploy.
Without these keys, push sending is a no-op and the push toggle hides
itself — in-app notifications still work. Never commit the keys.

## Phase 4 — mail via Resend (migration 0004 + API key + cron secret)

Apply the mail-log migration once (creates `MailLog` — send idempotency
+ audit, deduped per user/kind/window):

```bash
npx prisma migrate deploy   # applies prisma/migrations/0004_mail_log/
# ...or: npx prisma db push
```

### 1. Create a Resend account + API key

1. Go to [resend.com](https://resend.com) → sign up (free tier).
2. **API Keys** → Create API Key → copy it (starts with `re_`).
3. Add to Vercel env vars (Production + Preview): `RESEND_API_KEY`.
4. **Without `RESEND_API_KEY`, all mail sending is a no-op** — welcome
   mail, weekly reports, streak nudges, word-of-day: nothing is sent and
   nothing breaks. The cron endpoint still runs and reports `sent: 0`.

### 2. Verified sender domain (for production delivery)

By default the code sends from Resend's test sender
(`onboarding@resend.dev`), which only delivers to the Resend account
owner's own email. For real delivery to all users:

1. Resend → **Domains** → Add Domain → follow the DNS steps.
2. Add to Vercel env vars: `EMAIL_FROM` (e.g. `Ulluk <hello@yourdomain.com>`).

### 3. Cron secret

Generate once and add to Vercel env vars (Production + Preview):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

→ `CRON_SECRET`. Vercel Cron calls `GET /api/mail/cron?kind=…` with
`Authorization: Bearer <CRON_SECRET>`. Without it, the endpoint returns
503 (cron disabled) — the endpoint never runs unauthenticated.

### 4. Cron schedule (vercel.json)

| Kind | Schedule (UTC) | Dhaka time |
|---|---|---|
| `wordofday` — Word of the Day | daily `0 2 * * *` | 08:00 |
| `weekly` — Weekly report | Mondays `0 2 * * 1` | 08:00 |
| `streak` — Streak nudge | daily `0 12 * * *` | 18:00 |

Recipients honour their email-preference toggles (`/profile/settings`):
weekly report / streak nudge default ON, word-of-day default OFF.
Welcome mail sends once ever, on first progress sync. Every mail footer
carries a one-click unsubscribe link (HMAC-signed, no login needed).
