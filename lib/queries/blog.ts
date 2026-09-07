import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { LessonContent } from "@/types/lesson-content";

const BLOG_TAG = "blog-posts";

export type BlogStatus = "draft" | "published";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: LessonContent;
  coverImageUrl: string | null;
  status: BlogStatus;
  authorId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: unknown;
  cover_image_url: string | null;
  status: string;
  author_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

const BLOG_COLUMNS =
  "id, title, slug, excerpt, content, cover_image_url, status, author_id, seo_title, seo_description, created_at, updated_at, published_at";

function mapBlogPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content as LessonContent,
    coverImageUrl: row.cover_image_url,
    status: row.status as BlogStatus,
    authorId: row.author_id,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

// --- Admin (CMS) queries — cookie-based client so an admin/editor's
// own RLS-elevated access includes drafts. ---------------------------

const ADMIN_PAGE_SIZE = 20;

export async function getBlogPostsAdmin(
  search: string,
  page: number,
): Promise<{ items: BlogPost[]; totalCount: number; pageSize: number }> {
  const supabase = await createClient();
  const from = (page - 1) * ADMIN_PAGE_SIZE;
  const to = from + ADMIN_PAGE_SIZE - 1;

  let query = supabase
    .from("blog_posts")
    .select(BLOG_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false });

  if (search.trim()) {
    query = query.ilike("title", `%${search.trim()}%`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return {
    items: (data ?? []).map(mapBlogPost),
    totalCount: count ?? 0,
    pageSize: ADMIN_PAGE_SIZE,
  };
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapBlogPost(data) : null;
}

// --- Public-site queries — RLS already hides drafts from anonymous
// visitors, but explicitly filtered too so an admin/editor browsing
// the public site doesn't see their own drafts mixed in. -------------

export async function getPublishedBlogPosts(limit?: number): Promise<BlogPost[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);

  const supabase = createPublicClient();
  let query = supabase
    .from("blog_posts")
    .select(BLOG_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapBlogPost);
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return data ? mapBlogPost(data) : null;
}
