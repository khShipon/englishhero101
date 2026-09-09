import Link from "next/link";
import { AuthorBadge } from "@/components/forum/author-badge";
import { ReactionBar } from "@/components/forum/reaction-bar";
import { DeleteForm } from "@/components/forum/delete-form";
import { deletePost } from "@/lib/forum/post-actions";
import { Card, CardContent } from "@/components/ui/card";
import type { ForumPostSummary } from "@/lib/queries/forum";
import { MessageCircle } from "lucide-react";

export function PostCard({
  post,
  currentUserId,
  isManager = false,
}: {
  post: ForumPostSummary;
  currentUserId: string;
  isManager?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <AuthorBadge author={post.author} timestamp={post.createdAt} />
          {(post.author.id === currentUserId || isManager) && (
            <DeleteForm action={deletePost} hiddenFields={{ postId: post.id }} label="Delete post" />
          )}
        </div>
        <p className="line-clamp-6 text-sm whitespace-pre-wrap">{post.body}</p>
        <div className="flex items-center justify-between border-t pt-2.5">
          <ReactionBar
            target={{ kind: "post", postId: post.id }}
            initialLike={post.likeCount}
            initialLove={post.loveCount}
            initialMine={post.myReaction}
          />
          <Link
            href={`/forum/${post.id}`}
            className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-brand-navy dark:hover:text-white"
          >
            <MessageCircle className="size-3.5" />
            {post.replyCount} {post.replyCount === 1 ? "reply" : "replies"}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
