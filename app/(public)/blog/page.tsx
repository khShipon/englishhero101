import type { Metadata } from "next";
import { getPublishedBlogPosts } from "@/lib/queries/blog";
import { BlogPostCard } from "@/components/public/blog-post-card";
import { Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — EnglishHero101",
  description: "Study tips, exam strategies, and English-learning advice from EnglishHero101.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-2">
        <span className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-brand-orange uppercase">
          <Newspaper className="size-3.5" /> Blog
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-navy dark:text-white">
          Tips, strategies &amp; updates
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Study tips, exam strategies, and English-learning advice from the EnglishHero101 team.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No posts yet — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
