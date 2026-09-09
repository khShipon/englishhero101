import Link from "next/link";
import { formatRelativeTime } from "@/lib/forum/format";
import { avatarColorClass } from "@/lib/avatar-color";
import type { ForumNotification } from "@/lib/queries/forum-notifications";
import { cn } from "@/lib/utils";
import { MessageCircle, ThumbsUp, Heart } from "lucide-react";

function messageFor(notification: ForumNotification): string {
  switch (notification.type) {
    case "reply_to_post":
      return `${notification.actorName} replied to your post`;
    case "reply_to_reply":
      return `${notification.actorName} replied to your reply`;
    case "reaction_post":
    case "reaction_reply": {
      const verb = notification.reactionType === "love" ? "loved" : "liked";
      const target = notification.type === "reaction_post" ? "post" : "reply";
      return `${notification.actorName} ${verb} your ${target}`;
    }
  }
}

export function NotificationItem({ notification }: { notification: ForumNotification }) {
  const isReply = notification.type === "reply_to_post" || notification.type === "reply_to_reply";
  const Icon = isReply ? MessageCircle : notification.reactionType === "love" ? Heart : ThumbsUp;

  return (
    <Link
      href={`/forum/${notification.postId}`}
      className={cn(
        "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
        !notification.isRead && "border-brand-orange/30 bg-brand-orange/5",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
          avatarColorClass(notification.actorId),
        )}
      >
        {notification.actorInitials}
      </span>
      <span className="flex min-w-0 flex-1 items-start gap-2">
        <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1">
          <span className="block">{messageFor(notification)}</span>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt)}</span>
        </span>
      </span>
      {!notification.isRead && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-orange" />}
    </Link>
  );
}
