import "server-only";
import { createClient } from "@supabase/supabase-js";

// Anon-key client with no cookie/session plumbing. "use cache" scopes
// can't read cookies()/headers(), and this is what makes public content
// queries cacheable in the first place — the cookie-based client in
// lib/supabase/server.ts forces the whole route dynamic just by being
// constructed, regardless of whether the query itself needs a session.
//
// Only use this for reads that are meant to be identical for every
// anonymous visitor (published content). It authenticates as the same
// "anon" role a logged-out visitor gets, so RLS still applies — it just
// never sees the elevated access an authenticated admin/editor session
// would have. Never use it for per-user data or manager-gated reads.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
