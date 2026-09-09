"use client";

import { useActionState, useEffect, useRef } from "react";
import { createReply, type ForumFormState } from "@/lib/forum/reply-actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Used both for a top-level reply directly on the post
// (parentReplyId={null}) and for a nested reply-to-a-reply — see
// createReply()'s comment on how nesting flattens to one level.
export function ReplyComposer({
  postId,
  parentReplyId,
  replyingToName,
  onDone,
  autoFocus,
}: {
  postId: string;
  parentReplyId: string | null;
  replyingToName?: string;
  onDone?: () => void;
  autoFocus?: boolean;
}) {
  const boundAction = createReply.bind(null, postId, parentReplyId);
  const [state, formAction, pending] = useActionState<ForumFormState, FormData>(boundAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      formRef.current?.reset();
      onDone?.();
    }
    wasPending.current = pending;
  }, [pending, state, onDone]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-1.5">
      {replyingToName && (
        <p className="text-xs text-muted-foreground">
          Replying to <span className="font-medium text-foreground">{replyingToName}</span>
        </p>
      )}
      <Textarea
        name="body"
        placeholder="Write a reply..."
        rows={2}
        maxLength={2000}
        required
        autoFocus={autoFocus}
        className="rounded-xl bg-muted/50 text-sm"
      />
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      <div className="flex justify-end gap-2">
        {onDone && (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Posting..." : "Reply"}
        </Button>
      </div>
    </form>
  );
}
