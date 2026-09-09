import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { getForumFeed } from "@/lib/queries/forum";
import { initialsFromName } from "@/lib/forum/format";
import { PostComposer } from "@/components/forum/post-composer";
import { PostCard } from "@/components/forum/post-card";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessagesSquare } from "lucide-react";

export const metadata: Metadata = { title: "Forum — EnglishHero101" };

// Members-only and fully per-user (each post's reaction state depends
// on who's viewing), so — like /profile — it opts out of Cache
// Components validation instead of being split for no benefit.
export const instant = false;

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ before?: string }>;
}) {
  const [user, { before }] = await Promise.all([requireUser(), searchParams]);
  const { posts, nextCursor } = await getForumFeed({ before });
  const isManager = user.role === "admin" || user.role === "editor";

  const authorInitials = user.fullName?.trim()
    ? initialsFromName(user.fullName)
    : (user.email[0]?.toUpperCase() ?? "?");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:py-10">
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-brand-orange uppercase">
          <MessagesSquare className="size-3.5" /> Forum
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Ask, answer, and discuss</h1>
        <p className="text-sm text-muted-foreground">
          Post a question or share something with your classmates — anyone can reply.
        </p>
      </div>

      <PostComposer authorId={user.id} authorInitials={authorInitials} />

      <div className="flex flex-col gap-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No posts yet — be the first to ask something!
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={user.id} isManager={isManager} />
          ))
        )}
      </div>

      {nextCursor && (
        <Link
          href={`/forum?before=${encodeURIComponent(nextCursor)}`}
          className={cn(buttonVariants({ variant: "outline" }), "self-center")}
        >
          Show older posts
        </Link>
      )}
    </div>
  );
}
