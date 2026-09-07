import Link from "next/link";
import type { BlogPost } from "@/lib/queries/blog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Newspaper, Calendar } from "lucide-react";

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-brand-navy/20">
        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- admin-supplied external URL, no fixed domain to whitelist for next/image
          <img
            src={post.coverImageUrl}
            alt=""
            className="aspect-video w-full object-cover"
          />
        )}
        <CardHeader>
          <CardTitle className="flex items-start gap-2 line-clamp-2">
            <Newspaper className="mt-0.5 size-4 shrink-0 text-brand-orange" />
            {post.title}
          </CardTitle>
          {post.excerpt && <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>}
        </CardHeader>
        {post.publishedAt && (
          <CardContent className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            {new Date(post.publishedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
