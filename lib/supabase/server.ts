import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Creates a Supabase client for use in Server Components, Server Actions,
// and Route Handlers. Must be called fresh per request (do not cache the
// instance) since it reads the current cookie store.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore because
            // proxy.ts refreshes the session and rewrites cookies already.
          }
        },
      },
    },
  );
}
