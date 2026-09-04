import "server-only";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getDescendants } from "@/lib/queries/content";
import type { LessonContent } from "@/types/lesson-content";

const LESSONS_TAG = "lessons";

export type LessonStatus = "draft" | "published" | "archived";

export type Lesson = {
  id: string;
  nodeId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: LessonContent;
  status: LessonStatus;
  difficulty: string | null;
  estimatedMinutes: number | null;
  authorId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type LessonRow = {
  id: string;
  node_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: unknown;
  status: string;
  difficulty: string | null;
  estimated_minutes: number | null;
  author_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export const LESSON_COLUMNS =
  "id, node_id, title, slug, excerpt, content, status, difficulty, estimated_minutes, author_id, seo_title, seo_description, created_at, updated_at, published_at";

export function mapLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    nodeId: row.node_id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content as LessonContent,
    status: row.status as LessonStatus,
    difficulty: row.difficulty,
    estimatedMinutes: row.estimated_minutes,
    authorId: row.author_id,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

export const getLessonsByNode = cache(async (nodeId: string): Promise<Lesson[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_COLUMNS)
    .eq("node_id", nodeId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapLesson);
});

// Every lesson under a node's whole subtree, not just its direct
// children — for sections like IELTS Speaking/Writing/Listening where
// lessons attach to nested topic nodes rather than the section node
// itself, so getLessonsByNode alone would report "no lessons" even
// when the section has plenty.
export const getLessonsBySubtree = cache(async (nodeId: string): Promise<Lesson[]> => {
  const supabase = await createClient();
  const descendants = await getDescendants(nodeId);
  const nodeIds = [nodeId, ...descendants.map((d) => d.id)];
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_COLUMNS)
    .in("node_id", nodeIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapLesson);
});

export const getLessonById = cache(async (id: string): Promise<Lesson | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapLesson(data) : null;
});

// --- Public-site queries ---------------------------------------------
// RLS already hides drafts from anonymous visitors, but an admin/editor
// browsing the *public* pages would otherwise see their own drafts mixed
// in thanks to their elevated read access — so these explicitly filter
// on status/is_published too, independent of RLS.

export async function getPublishedLessonBySlugAndNode(
  nodeId: string,
  slug: string,
): Promise<Lesson | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(LESSONS_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_COLUMNS)
    .eq("node_id", nodeId)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return data ? mapLesson(data) : null;
}

export async function getPublishedLessonsByNode(nodeId: string): Promise<Lesson[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(LESSONS_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_COLUMNS)
    .eq("node_id", nodeId)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapLesson);
}

// "Sequence" within a node is approximated by creation order, since
// lessons (unlike content_nodes/questions) have no sort_order column.
export async function getAdjacentLessons(
  nodeId: string,
  currentLessonId: string,
): Promise<{ previous: Lesson | null; next: Lesson | null }> {
  "use cache";
  cacheLife("hours");
  cacheTag(LESSONS_TAG);

  const siblings = await getPublishedLessonsByNode(nodeId);
  const index = siblings.findIndex((lesson) => lesson.id === currentLessonId);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? siblings[index - 1] : null,
    next: index < siblings.length - 1 ? siblings[index + 1] : null,
  };
}

export async function getRelatedLessons(nodeId: string, excludeId: string, limit = 4): Promise<Lesson[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(LESSONS_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_COLUMNS)
    .eq("node_id", nodeId)
    .eq("status", "published")
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapLesson);
}

// Recommendations for a learner's placement-test level. difficulty is
// free-text (see 001_initial_schema.sql) but the seed data and admin
// UI both stick to "beginner" | "intermediate" | "advanced", matching
// the bands the level test itself produces.
export async function getLessonsByDifficulty(difficulty: string, limit = 6): Promise<Lesson[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(LESSONS_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_COLUMNS)
    .eq("status", "published")
    .eq("difficulty", difficulty)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapLesson);
}

export async function getRecentPublishedLessons(limit = 6): Promise<Lesson[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(LESSONS_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapLesson);
}

// Lessons that belong to a category the admin has marked "featured"
// (content_nodes.is_featured) — reuses that existing column rather
// than adding a separate per-lesson flag.
export async function getFeaturedLessons(limit = 6): Promise<Lesson[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(LESSONS_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(`${LESSON_COLUMNS}, content_nodes!inner(is_featured)`)
    .eq("status", "published")
    .eq("content_nodes.is_featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapLesson);
}
