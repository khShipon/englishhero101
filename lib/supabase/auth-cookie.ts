// Supabase's own auth cookies always look like sb-<project-ref>-auth-token
// (sometimes chunked as ...-auth-token.0/.1 for large tokens). Used by both
// proxy.ts (middleware, NextRequest cookies) and lib/auth/dal.ts (RSC,
// next/headers cookies) to skip a network round trip to the auth server
// when a request definitely isn't signed in — there's nothing to verify.
export function isSupabaseAuthCookieName(name: string): boolean {
  return /^sb-.*-auth-token/.test(name);
}
