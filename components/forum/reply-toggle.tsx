"use client";

import { useState } from "react";
import { ReplyComposer } from "@/components/forum/reply-composer";

export function ReplyToggle({
  postId,
  parentReplyId,
  replyingToName,
}: {
  postId: string;
  parentReplyId: string;
  replyingToName: string;
}) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="mt-2">
        <ReplyComposer
          postId={postId}
          parentReplyId={parentReplyId}
          replyingToName={replyingToName}
          onDone={() => setOpen(false)}
          autoFocus
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="mt-1 text-xs font-semibold text-muted-foreground hover:text-brand-navy dark:hover:text-white"
    >
      Reply
    </button>
  );
}
