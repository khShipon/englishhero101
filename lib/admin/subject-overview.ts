import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getDescendants } from "@/lib/queries/content";

export type SubjectTopicSummary = {
  nodeId: string;
  title: string;
  slug: string;
  itemCount: number;
};

export type SubjectSectionSummary = {
  nodeId: string;
  title: string;
  slug: string;
  itemCount: number;
  topics: SubjectTopicSummary[];
};

const TOPIC_PARENT_SLUGS = new Set(["1st-paper", "2nd-paper"]);

// Counts lessons AND question sets under a set of node ids — unlike
// getIeltsSectionsOverview (which only ever counts lessons, since
// every IELTS section holds lessons), SSC/HSC sections like "Board
// Questions" hold question sets instead, so both tables need summing
// for the count to mean anything there.
async function countItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  nodeIds: string[],
): Promise<number> {
  const [lessons, questionSets] = await Promise.all([
    supabase.from("lessons").select("id", { count: "exact", head: true }).in("node_id", nodeIds),
    supabase.from("question_sets").select("id", { count: "exact", head: true }).in("node_id", nodeIds),
  ]);
  return (lessons.count ?? 0) + (questionSets.count ?? 0);
}

// Admin hub overview for a subject category (SSC English, HSC
// English, ...): every section with an item count, and — for the
// 1st-paper/2nd-paper sections specifically — their own topic children
// too, one level deeper than the IELTS hub needs, since those two
// sections are where the wide English 1st/2nd Paper topic list lives
// (see supabase/migrations/036_ssc_hsc_topics.sql).
export const getSubjectOverview = cache(
  async (rootSlug: string): Promise<SubjectSectionSummary[]> => {
    const supabase = await createClient();

    const { data: rootNode } = await supabase
      .from("content_nodes")
      .select("id")
      .eq("slug", rootSlug)
      .is("parent_id", null)
      .maybeSingle();

    if (!rootNode) return [];

    const { data: sections, error } = await supabase
      .from("content_nodes")
      .select("id, title, slug, sort_order")
      .eq("parent_id", rootNode.id)
      .order("sort_order");

    if (error) throw error;

    return Promise.all(
      (sections ?? []).map(async (section) => {
        const descendants = await getDescendants(section.id);
        const nodeIds = [section.id, ...descendants.map((d) => d.id)];
        const itemCount = await countItems(supabase, nodeIds);

        let topics: SubjectTopicSummary[] = [];
        if (TOPIC_PARENT_SLUGS.has(section.slug as string)) {
          const { data: topicRows, error: topicError } = await supabase
            .from("content_nodes")
            .select("id, title, slug, sort_order")
            .eq("parent_id", section.id)
            .order("sort_order");
          if (topicError) throw topicError;

          topics = await Promise.all(
            (topicRows ?? []).map(async (topic) => {
              const topicDescendants = await getDescendants(topic.id);
              const topicNodeIds = [topic.id, ...topicDescendants.map((d) => d.id)];
              return {
                nodeId: topic.id as string,
                title: topic.title as string,
                slug: topic.slug as string,
                itemCount: await countItems(supabase, topicNodeIds),
              };
            }),
          );
        }

        return {
          nodeId: section.id as string,
          title: section.title as string,
          slug: section.slug as string,
          itemCount,
          topics,
        };
      }),
    );
  },
);
