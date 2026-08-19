// node_type is deliberately a loose string, not a union of literals —
// admins can introduce new kinds of content nodes from the CMS without
// a code change. The literals here are just the seeded starting set.
export type NodeType =
  | "category"
  | "section"
  | "topic"
  | "subtopic"
  | "lesson"
  | "question_bank"
  | "quiz"
  | "resource"
  | (string & {});

export type ContentNode = {
  id: string;
  parentId: string | null;
  title: string;
  slug: string;
  description: string | null;
  nodeType: NodeType;
  icon: string | null;
  coverImageUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type ContentTreeNode = ContentNode & { children: ContentTreeNode[] };

// Lighter shape returned by the get_node_descendants() DB function —
// intentionally not a full ContentNode, since that RPC doesn't select
// every column (see 005_content_hierarchy_functions.sql).
export type ContentDescendant = {
  id: string;
  parentId: string | null;
  title: string;
  slug: string;
  nodeType: NodeType;
  sortOrder: number;
  isPublished: boolean;
  depth: number;
};

export type Breadcrumb = {
  id: string;
  title: string;
  slug: string;
  nodeType: NodeType;
};
