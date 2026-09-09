"use client";

import { useActionState, useEffect, useRef } from "react";
import { createPost, type ForumFormState } from "@/lib/forum/post-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Facebook's "What's on your mind?" composer, at the top of the feed.
export function PostComposer({ authorInitials }: { authorInitials: string }) {
  const [state, formAction, pending] = useActionState<ForumFormState, FormData>(createPost, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <Card>
      <CardContent>
        <form ref={formRef} action={formAction} className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-semibold text-white">
            {authorInitials}
          </span>
          <div className="flex flex-1 flex-col gap-2">
            <Textarea
              name="body"
              placeholder="Ask a question or share something with your classmates..."
              rows={2}
              maxLength={5000}
              required
              className="rounded-2xl bg-muted/50"
            />
            {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={pending}
                className={cn("rounded-full bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange/90")}
              >
                {pending ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
