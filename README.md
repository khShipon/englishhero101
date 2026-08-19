# EnglishHero101

A database-driven English learning platform for students in Bangladesh — SSC, HSC, University, IELTS, Spoken English, Grammar, and Vocabulary. Admins manage the entire curriculum hierarchy, lessons, question banks, and vocabulary from a CMS — nothing about the subject structure is hard-coded.

**Live:** https://englishhero101.vercel.app

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Base UI, not Radix)
- **Supabase**: PostgreSQL, Auth, Row Level Security
- **Tiptap** rich-text editor for lessons
- Deployed on **Vercel**

## Project structure

```
app/
  (auth)/        login, register, forgot/reset password
  (public)/      home, [...slug] catch-all (categories + lessons), search, vocabulary
  admin/         CMS: content tree, lessons, question banks, vocabulary, users
  auth/          Supabase auth callback routes
components/      admin/, public/, auth/, lessons/, ui/ (shadcn)
lib/
  admin/         Server Actions + validation for CMS mutations
  auth/          DAL (getCurrentUser/requireRole) + auth Server Actions
  queries/       read-only data access (cached with React's cache())
  supabase/      client.ts (browser), server.ts (SSR), proxy.ts (session refresh)
supabase/
  migrations/    schema, RLS policies, indexes, seed data (run in order)
```

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables** — copy `.env.example` to `.env.local` and fill in:

   | Variable | Where to find it | Notes |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | Safe to expose to the browser |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Settings → API | The **publishable** key, not `service_role`/secret |
   | `NEXT_PUBLIC_SITE_URL` | — | `http://localhost:3000` locally; your production URL on Vercel (used for the sitemap and metadata, since those don't have a per-request origin to read) |

   Never commit `.env.local`, and never put the Supabase `service_role`/secret key or DB password anywhere in this app — the browser client only ever needs the publishable key.

3. **Database migrations** — run the files in `supabase/migrations/` **in order** against your Supabase project (via the SQL Editor in the dashboard, or `supabase db push` if you have the CLI linked). They create the schema, RLS policies, indexes, and seed a demo category/lesson/question/vocabulary set.

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Creating your first admin

There's no signup flow for admin/editor roles by design — every new account starts as `student` (enforced by a DB trigger + RLS). To promote one:

1. Register a normal account at `/register` and confirm it via email
2. Supabase Dashboard → Table Editor → `profiles` → find your row → set `role` to `admin` → save
3. Log in — you'll land on `/admin` automatically

## Scripts

```bash
npm run dev       # start dev server
npm run build     # production build
npm run lint       # ESLint
npm run db:link    # link the Supabase CLI to this project
npm run db:push    # push local migrations to the linked project
npm run db:diff    # diff local schema against the linked project
```

## Deployment (Vercel)

1. Import the GitHub repo into Vercel (auto-detects Next.js, no config needed)
2. Add the same three environment variables as above, with `NEXT_PUBLIC_SITE_URL` set to your production domain
3. Deploy
4. In **Supabase Dashboard → Authentication → URL Configuration**, set **Site URL** to your production domain and add `https://<your-domain>/**` to **Redirect URLs** — without this, password-reset and email-confirmation links generated on the live site won't work

### SEO

`app/sitemap.ts` and `app/robots.ts` are generated dynamically from published content — no manual maintenance needed as the catalog grows. After deploying, submit the sitemap (`https://<your-domain>/sitemap.xml`) in [Google Search Console](https://search.google.com/search-console) to speed up indexing; a brand-new site can otherwise take days to weeks to be crawled organically.

## Security notes

- All authorization is enforced by **Row Level Security** in Postgres, not just the UI — verified directly against the live database (anonymous writes to content tables are rejected even with the public API key in hand)
- Lesson content is stored as a whitelisted JSON schema (not raw HTML) and rendered through an explicit node-to-React mapper — there is no `dangerouslySetInnerHTML` anywhere in the renderer, which is what makes it safe from stored-XSS
- CSV bulk-import re-parses and re-validates the uploaded file entirely server-side; client-side parsing is preview-only and never trusted
