import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedNodeBySlugPath, getBreadcrumbs } from "@/lib/queries/content";
import { getPublishedLessonBySlugAndNode } from "@/lib/queries/lessons";
import { CategoryPageView } from "@/components/public/category-page-view";
import { LessonPageView } from "@/components/public/lesson-page-view";

// A URL segment sequence resolves to EITHER a content_node path (a
// category page) OR a parent node path + a trailing lesson slug (a
// lesson page). Both checks explicitly require is_published/status —
// RLS alone would let a logged-in admin/editor see their own drafts
// here too, which would be wrong on the *public* pages specifically.

// `params` is awaited directly (its value decides which of two very
// different views to render), which Cache Components flags as
// runtime data accessed outside Suspense. Same fix as
// app/profile/page.tsx; the underlying content queries still cache
// via cacheLife/cacheTag, so this only opts the route shell itself
// out of the static-prerender path, not the DB reads behind it.
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const node = await getPublishedNodeBySlugPath(slug);
  if (node && node.isPublished) {
    const title = node.seoTitle || `${node.title} — EnglishHero101`;
    const description = node.seoDescription || node.description || undefined;
    const canonical = `/${slug.join("/")}`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical, type: "website" },
      twitter: { title, description },
    };
  }

  if (slug.length >= 2) {
    const nodeSlug = slug.slice(0, -1);
    const lessonSlug = slug[slug.length - 1];
    const parentNode = await getPublishedNodeBySlugPath(nodeSlug);
    if (parentNode) {
      const lesson = await getPublishedLessonBySlugAndNode(parentNode.id, lessonSlug);
      if (lesson) {
        const title = lesson.seoTitle || `${lesson.title} — EnglishHero101`;
        const description = lesson.seoDescription || lesson.excerpt || undefined;
        const canonical = `/${slug.join("/")}`;
        return {
          title,
          description,
          alternates: { canonical },
          openGraph: { title, description, url: canonical, type: "article" },
          twitter: { title, description },
        };
      }
    }
  }

  return { title: "EnglishHero101" };
}

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  const node = await getPublishedNodeBySlugPath(slug);
  if (node && node.isPublished) {
    const breadcrumbs = await getBreadcrumbs(node.id);
    const basePath = `/${slug.join("/")}`;
    return <CategoryPageView node={node} breadcrumbs={breadcrumbs} basePath={basePath} />;
  }

  if (slug.length >= 1) {
    const nodeSlug = slug.slice(0, -1);
    const lessonSlug = slug[slug.length - 1];
    if (nodeSlug.length > 0) {
      const parentNode = await getPublishedNodeBySlugPath(nodeSlug);
      if (parentNode && parentNode.isPublished) {
        const lesson = await getPublishedLessonBySlugAndNode(parentNode.id, lessonSlug);
        if (lesson) {
          const breadcrumbs = await getBreadcrumbs(parentNode.id);
          const basePath = `/${nodeSlug.join("/")}`;
          return (
            <LessonPageView
              lesson={lesson}
              node={parentNode}
              breadcrumbs={breadcrumbs}
              basePath={basePath}
            />
          );
        }
      }
    }
  }

  notFound();
}
