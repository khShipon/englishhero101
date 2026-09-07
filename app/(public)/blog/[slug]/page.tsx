import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedBlogPostBySlug } from "@/lib/queries/blog";
import { LessonRenderer } from "@/components/lessons/lesson-renderer";
import { ShareButton } from "@/components/public/share-button";
import { ArrowLeft, Calendar } from "lucide-react";

// `params` is awaited directly (the slug decides which post to fetch),
// which Cache Components flags as runtime data accessed outside
// Suspense — same fix as app/(public)/[...slug]/page.tsx. The content
// query itself still caches via cacheLife/cacheTag.
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.seoTitle || post.title} — EnglishHero101 Blog`,
    description: post.seoDescription || post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
  };

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/blog"
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to Blog
      </Link>

      {post.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- admin-supplied external URL
        <img
          src={post.coverImageUrl}
          alt=""
          className="mb-6 aspect-video w-full rounded-xl object-cover"
        />
      )}

      <h1 className="text-3xl font-extrabold tracking-tight text-balance text-brand-navy dark:text-white">
        {post.title}
      </h1>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-b pb-4 text-sm text-muted-foreground">
        {post.publishedAt && (
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {new Date(post.publishedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        )}
        <ShareButton title={post.title} />
      </div>

      <div className="mt-8">
        <LessonRenderer content={post.content} />
      </div>
    </article>
  );
}

