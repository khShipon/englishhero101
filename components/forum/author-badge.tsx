import { formatRelativeTime } from "@/lib/forum/format";
import { avatarColorClass } from "@/lib/avatar-color";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ForumAuthor } from "@/lib/queries/forum";

// Server-safe (renders relative time from the request's clock, see
// formatRelativeTime's own comment) — used from post/reply cards,
// never from a "use client" subtree.
export function AuthorBadge({
  author,
  timestamp,
  size = "md",
}: {
  author: ForumAuthor;
  timestamp?: string;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
          avatarColorClass(author.id),
          size === "sm" ? "size-8 text-xs" : "size-10 text-sm",
        )}
      >
        {author.initials}
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-semibold">{author.name}</span>
          <Badge variant="outline" className="shrink-0 border-brand-orange/30 text-[10px] text-brand-orange">
            {author.tierName}
          </Badge>
        </span>
        {timestamp && <span className="text-xs text-muted-foreground">{formatRelativeTime(timestamp)}</span>}
      </div>
    </div>
  );
}
