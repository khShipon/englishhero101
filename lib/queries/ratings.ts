import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

const RATINGS_TAG = "site-ratings";

export type RatingSummary = { average: number; count: number };

export type SiteRating = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

// Ratings/comments are public read (see the site_ratings_select_all
// RLS policy) but reviewer names aren't — a public anon client can't
// join profiles for arbitrary users, and showing full names next to
// free-text comments isn't something a student agreed to when they
// left a star rating. So reviews render anonymously.
export async function getRatingSummary(): Promise<RatingSummary> {
  "use cache";
  cacheLife("hours");
  cacheTag(RATINGS_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase.from("site_ratings").select("rating");
  if (error) throw error;

  const ratings = data ?? [];
  const count = ratings.length;
  const average = count === 0 ? 0 : ratings.reduce((sum, r) => sum + r.rating, 0) / count;

  return { average: Math.round(average * 10) / 10, count };
}

export async function getRecentRatings(limit = 20): Promise<SiteRating[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(RATINGS_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_ratings")
    .select("id, rating, comment, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  }));
}

// The signed-in visitor's own rating, to prefill the review form —
// reads via the cookie-scoped client and isn't cached, same reasoning
// as getCurrentUser() itself (per-visitor, not shared across requests).
export async function getMyRating(userId: string): Promise<SiteRating | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_ratings")
    .select("id, rating, comment, created_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data
    ? { id: data.id, rating: data.rating, comment: data.comment, createdAt: data.created_at }
    : null;
}
