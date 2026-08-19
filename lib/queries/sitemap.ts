import "server-only";
import { getPublishedContentTree } from "@/lib/queries/content";
import { createClient } from "@/lib/supabase/server";
import type { ContentTreeNode } from "@/types/content";

export type SitemapPath = { url: string; lastModified: string };

function flattenNodePaths(
  nodes: ContentTreeNode[],
  parentPath: string[] = [],
): Map<string, { path: string[]; updatedAt: string }> {
  const map = new Map<string, { path: string[]; updatedAt: string }>();

  for (const node of nodes) {
    const path = [...parentPath, node.slug];
    map.set(node.id, { path, updatedAt: node.updatedAt });
    for (const [id, entry] of flattenNodePaths(node.children, path)) {
      map.set(id, entry);
    }
  }

  return map;
}

// Every published category/section/topic page, plus every published
// lesson (whose URL is its parent node's path + its own slug) — the
// same resolution logic the public catch-all route uses, just walked
// in bulk instead of per-request.
export async function getSitemapPaths(): Promise<{
  nodePaths: SitemapPath[];
  lessonPaths: SitemapPath[];
}> {
  const tree = await getPublishedContentTree();
  const pathMap = flattenNodePaths(tree);

  const nodePaths: SitemapPath[] = Array.from(pathMap.values()).map((entry) => ({
    url: `/${entry.path.join("/")}`,
    lastModified: entry.updatedAt,
  }));

  const supabase = await createClient();
  const { data: lessons } = await supabase
    .from("lessons")
    .select("slug, node_id, updated_at")
    .eq("status", "published");

  const lessonPaths: SitemapPath[] = (lessons ?? []).flatMap((lesson) => {
    const nodeEntry = pathMap.get(lesson.node_id);
    if (!nodeEntry) return [];
    return [
      {
        url: `/${[...nodeEntry.path, lesson.slug].join("/")}`,
        lastModified: lesson.updated_at,
      },
    ];
  });

  return { nodePaths, lessonPaths };
}
