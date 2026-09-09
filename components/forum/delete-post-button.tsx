"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/lib/forum/post-actions";
import { Trash2 } from "lucide-react";

// Only used on the post detail page, for the post's own author —
// unlike DeleteForm (feed card, replies, admin page), deleting the
// post you're currently viewing needs a redirect back to the feed
// afterward instead of just refreshing the current page in place.
export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.append("postId", postId);
      await deletePost(formData);
      router.push("/forum");
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label="Delete post"
      className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}
