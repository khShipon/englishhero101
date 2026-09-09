import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { getForumPost } from "@/lib/queries/forum";
import { AuthorBadge } from "@/components/forum/author-badge";
import { ReactionBar } from "@/components/forum/reaction-bar";
import { ReplyComposer } from "@/components/forum/reply-composer";
import { ReplyItem } from "@/components/forum/reply-item";
import { DeletePostButton } from "@/components/forum/delete-post-button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}): Promise<Metadata> {
  const { postId } = await params;
  const post = await getForumPost(postId);
  return {
    title: post ? `${post.author.name}'s post — Forum — EnglishHero101` : "Forum — EnglishHero101",
  };
}

export default async function ForumPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const [user, { postId }] = await Promise.all([requireUser(), params]);
  const post = await getForumPost(postId);
  if (!post) notFound();
  const isManager = user.role === "admin" || user.role === "editor";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:py-10">
      <Link
        href="/forum"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-brand-navy dark:hover:text-white"
      >
        <ArrowLeft className="size-4" /> Back to Forum
      </Link>

      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <AuthorBadge author={post.author} timestamp={post.createdAt} />
            {(post.author.id === user.id || isManager) && <DeletePostButton postId={post.id} />}
          </div>
          <p className="text-sm whitespace-pre-wrap">{post.body}</p>
          <div className="flex items-center gap-3 border-t pt-2.5">
            <ReactionBar
              target={{ kind: "post", postId: post.id }}
              initialLike={post.likeCount}
              initialLove={post.loveCount}
              initialMine={post.myReaction}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {post.replyCount} {post.replyCount === 1 ? "Reply" : "Replies"}
        </h2>

        <ReplyComposer postId={post.id} parentReplyId={null} />

        {post.replies.length > 0 && (
          <div className="flex flex-col gap-4">
            {post.replies.map((reply) => (
              <ReplyItem
                key={reply.id}
                postId={post.id}
                reply={reply}
                currentUserId={user.id}
                isManager={isManager}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
