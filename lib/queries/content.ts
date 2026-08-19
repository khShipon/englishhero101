import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Breadcrumb, ContentDescendant, ContentNode, ContentTreeNode } from "@/types/content";

export type ContentNodeRow = {
  id: string;
  parent_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  node_type: string;
  icon: string | null;
  cover_image_url: string | null;
  sort_order: number;
  is_published: boolean;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

type ContentDescendantRow = {
  id: string;
  parent_id: string | null;
  title: string;
  slug: string;
  node_type: string;
  sort_order: number;
  is_published: boolean;
  depth: number;
};

type BreadcrumbRow = {
  id: string;
  title: string;
  slug: string;
  node_type: string;
};

export const NODE_COLUMNS =
  "id, parent_id, title, slug, description, node_type, icon, cover_image_url, sort_order, is_published, is_featured, seo_title, seo_description, created_at, updated_at, published_at";

export function mapNode(row: ContentNodeRow): ContentNode {
  return {
    id: row.id,
    parentId: row.parent_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    nodeType: row.node_type,
    icon: row.icon,
    coverImageUrl: row.cover_image_url,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    isFeatured: row.is_featured,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

function mapDescendant(row: ContentDescendantRow): ContentDescendant {
  return {
    id: row.id,
    parentId: row.parent_id,
    title: row.title,
    slug: row.slug,
    nodeType: row.node_type,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    depth: row.depth,
  };
}

function mapBreadcrumb(row: BreadcrumbRow): Breadcrumb {
  return { id: row.id, title: row.title, slug: row.slug, nodeType: row.node_type };
}

// Builds a nested tree from a flat, RLS-filtered list of nodes. A node
// whose parent isn't present in the list (e.g. an unpublished parent
// hidden from an anonymous visitor) is promoted to the root level
// rather than silently dropped.
export function buildContentTree(nodes: ContentNode[]): ContentTreeNode[] {
  const byId = new Map<string, ContentTreeNode>();
  for (const node of nodes) {
    byId.set(node.id, { ...node, children: [] });
  }

  const roots: ContentTreeNode[] = [];
  for (const node of byId.values()) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortTree = (list: ContentTreeNode[]) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
    for (const node of list) sortTree(node.children);
  };
  sortTree(roots);

  return roots;
}

// Full hierarchy visible to the current caller — RLS decides what
// that means: everyone sees published nodes, admins/editors see
// everything. Powers both the admin content tree and the public nav.
export const getContentTree = cache(async (): Promise<ContentTreeNode[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_nodes")
    .select(NODE_COLUMNS)
    .order("sort_order");

  if (error) throw error;
  return buildContentTree((data ?? []).map(mapNode));
});

// Direct children of a node, or top-level categories when parentId is null.
export const getChildren = cache(async (parentId: string | null): Promise<ContentNode[]> => {
  const supabase = await createClient();
  const base = supabase.from("content_nodes").select(NODE_COLUMNS);
  const scoped = parentId === null ? base.is("parent_id", null) : base.eq("parent_id", parentId);

  const { data, error } = await scoped.order("sort_order");
  if (error) throw error;
  return (data ?? []).map(mapNode);
});

export const getNodeById = cache(async (id: string): Promise<ContentNode | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_nodes")
    .select(NODE_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapNode(data) : null;
});

// Resolves a URL path like ["grammar", "tense", "present"] to its
// node, walking one level per segment. Returns null if any segment
// doesn't match — including a segment hidden by RLS (e.g. unpublished
// content requested by a guest), which is the correct 404 behavior.
export const getNodeBySlugPath = cache(async (slugPath: string[]): Promise<ContentNode | null> => {
  if (slugPath.length === 0) return null;

  const supabase = await createClient();
  let parentId: string | null = null;
  let node: ContentNode | null = null;

  for (const slug of slugPath) {
    const base = supabase.from("content_nodes").select(NODE_COLUMNS).eq("slug", slug);
    const scoped = parentId === null ? base.is("parent_id", null) : base.eq("parent_id", parentId);

    const { data, error } = await scoped.maybeSingle();
    if (error) throw error;
    if (!data) return null;

    node = mapNode(data);
    parentId = node.id;
  }

  return node;
});

// Root-to-node breadcrumb trail via the get_node_breadcrumbs() DB
// function — one round trip instead of N sequential parent lookups.
export const getBreadcrumbs = cache(async (nodeId: string): Promise<Breadcrumb[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_node_breadcrumbs", { target_id: nodeId });
  if (error) throw error;
  return (data ?? []).map(mapBreadcrumb);
});

// Every descendant of a node, at any depth, via the
// get_node_descendants() DB function.
export const getDescendants = cache(async (nodeId: string): Promise<ContentDescendant[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_node_descendants", { root_id: nodeId });
  if (error) throw error;
  return (data ?? []).map(mapDescendant);
});

// Whether `slug` is already used by a sibling under `parentId`,
// mirroring the DB's own uniqueness scope (content_nodes_parent_slug_key)
// so the CMS can validate before hitting a constraint violation.
export async function isSlugTaken(
  parentId: string | null,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase.from("content_nodes").select("id").eq("slug", slug);
  query = parentId === null ? query.is("parent_id", null) : query.eq("parent_id", parentId);
  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data !== null;
}
