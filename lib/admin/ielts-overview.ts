import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getDescendants } from "@/lib/queries/content";

export type IeltsSectionSummary = {
  nodeId: string;
  title: string;
  slug: string;
  itemCount: number;
};

// Admin hub overview: the 4 IELTS sections (Listening, Reading, Writing,
// Speaking — see supabase/migrations/004_seed_data.sql) with a lesson
// count for each, so every section is one click away instead of
// drilling through the general Content tree each time.
export const getIeltsSectionsOverview = cache(async (): Promise<IeltsSectionSummary[]> => {
  const supabase = await createClient();

  const { data: ieltsNode } = await supabase
    .from("content_nodes")
    .select("id")
    .eq("slug", "ielts")
    .is("parent_id", null)
    .maybeSingle();

  if (!ieltsNode) return [];

  const { data: sections, error } = await supabase
    .from("content_nodes")
    .select("id, title, slug, sort_order")
    .eq("parent_id", ieltsNode.id)
    .order("sort_order");

  if (error) throw error;

  return Promise.all(
    (sections ?? []).map(async (section) => {
      const descendants = await getDescendants(section.id);
      const nodeIds = [section.id, ...descendants.map((d) => d.id)];
      // The Vocabulary section holds vocabulary rows, not lessons (see
      // supabase/migrations/023_ielts_vocabulary_categories.sql) — count
      // from the matching table so its card isn't stuck at 0.
      const table = section.slug === "vocabulary" ? "vocabulary" : "lessons";
      const { count } = await supabase
        .from(table)
        .select("id", { count: "exact", head: true })
        .in("node_id", nodeIds);

      return {
        nodeId: section.id as string,
        title: section.title as string,
        slug: section.slug as string,
        itemCount: count ?? 0,
      };
    }),
  );
});
