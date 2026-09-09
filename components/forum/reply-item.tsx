import { AuthorBadge } from "@/components/forum/author-badge";
import { ReactionBar } from "@/components/forum/reaction-bar";
import { ReplyToggle } from "@/components/forum/reply-toggle";
import { DeleteForm } from "@/components/forum/delete-form";
import { deleteReply } from "@/lib/forum/reply-actions";
import type { ForumReplyNode } from "@/lib/queries/forum";
import { cn } from "@/lib/utils";

export function ReplyItem({
  postId,
  reply,
  currentUserId,
  isManager = false,
  nested = false,
}: {
  postId: string;
  reply: ForumReplyNode;
  currentUserId: string;
  isManager?: boolean;
  nested?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-2", nested && "ml-8 border-l pl-4")}>
      <div className="flex items-start justify-between gap-3">
        <AuthorBadge author={reply.author} timestamp={reply.createdAt} size="sm" />
        {(reply.author.id === currentUserId || isManager) && (
          <DeleteForm
            action={deleteReply}
            hiddenFields={{ replyId: reply.id, postId }}
            label="Delete reply"
          />
        )}
      </div>
      <div className="ml-1 flex flex-col gap-1.5 pl-[2.625rem]">
        <p className="text-sm whitespace-pre-wrap">
          {reply.replyToName && (
            <span className="mr-1 font-medium text-brand-blue">@{reply.replyToName}</span>
          )}
          {reply.body}
        </p>
        <div className="flex items-center gap-3">
          <ReactionBar
            target={{ kind: "reply", replyId: reply.id, postId }}
            initialLike={reply.likeCount}
            initialLove={reply.loveCount}
            initialMine={reply.myReaction}
          />
          <ReplyToggle postId={postId} parentReplyId={reply.id} replyingToName={reply.author.name} />
        </div>
      </div>

      {reply.children.length > 0 && (
        <div className="flex flex-col gap-3">
          {reply.children.map((child) => (
            <ReplyItem
              key={child.id}
              postId={postId}
              reply={child}
              currentUserId={currentUserId}
              isManager={isManager}
              nested
            />
          ))}
        </div>
      )}
    </div>
  );
}
