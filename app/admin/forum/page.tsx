import type { Metadata } from "next";
import { getForumFeed } from "@/lib/queries/forum";
import { deletePost } from "@/lib/forum/post-actions";
import { AuthorBadge } from "@/components/forum/author-badge";
import { DeleteForm } from "@/components/forum/delete-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Forum — Admin — EnglishHero101" };

export default async function AdminForumPage() {
  const { posts } = await getForumFeed({ limit: 200 });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Forum</h1>
        <p className="text-sm text-muted-foreground">
          {posts.length > 0
            ? `${posts.length} recent post${posts.length === 1 ? "" : "s"}. Deleting a post removes its replies too.`
            : "No posts yet."}
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3">
          {posts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                <div className="flex min-w-0 flex-col gap-2">
                  <AuthorBadge author={post.author} timestamp={post.createdAt} size="sm" />
                  <p className="line-clamp-3 text-sm whitespace-pre-wrap text-muted-foreground">{post.body}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.likeCount} like{post.likeCount === 1 ? "" : "s"} · {post.loveCount} love
                    {post.loveCount === 1 ? "" : "s"} · {post.replyCount} repl{post.replyCount === 1 ? "y" : "ies"}
                  </p>
                </div>
                <DeleteForm action={deletePost} hiddenFields={{ postId: post.id }} label="Delete post" />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
