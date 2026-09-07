import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export type PublicSiteStats = {
  categories: number;
  lessons: number;
  vocabulary: number;
  questions: number;
};

// Real, publicly-visible counts for the homepage stats strip — counts
// only published/public rows (never total(); an admin's drafts aren't
// part of what a visitor can actually see) so the numbers shown match
// what a logged-out visitor can click into.
export async function getPublicSiteStats(): Promise<PublicSiteStats> {
  "use cache";
  cacheLife("hours");
  cacheTag("content-nodes", "lessons", "vocabulary", "questions");

  const supabase = createPublicClient();
  const [categories, lessons, vocabulary, questions] = await Promise.all([
    supabase.from("content_nodes").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("lessons").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("vocabulary").select("*", { count: "exact", head: true }),
    supabase.from("questions").select("*", { count: "exact", head: true }),
  ]);

  return {
    categories: categories.count ?? 0,
    lessons: lessons.count ?? 0,
    vocabulary: vocabulary.count ?? 0,
    questions: questions.count ?? 0,
  };
}
