import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAuthCookieName } from "@/lib/supabase/auth-cookie";

export type ProfileRole = "admin" | "editor" | "student";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: ProfileRole;
};

// Verifies the session against Supabase Auth (not just the cookie) and
// loads the matching profile row. Memoized per request so calling this
// from multiple components/layouts in the same render doesn't re-hit
// the network or the database.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Every public page renders the navbar, which calls this — for the
  // (large) share of anonymous visitors there's no Supabase cookie at
  // all, so there's nothing a network round trip to the auth server
  // could confirm. Same short-circuit as proxy.ts's middleware check.
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.getAll().some((cookie) => isSupabaseAuthCookieName(cookie.name));
  if (!hasAuthCookie) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    role: (profile?.role as ProfileRole | undefined) ?? "student",
  };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(roles: ProfileRole[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/unauthorized");
  }
  return user;
}
