"use client";

import { useState, useTransition } from "react";
import { toggleBookmark } from "@/lib/student/bookmark-actions";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export function BookmarkButton({
  lessonId,
  initialBookmarked,
}: {
  lessonId: string;
  initialBookmarked: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const next = !bookmarked;
    setBookmarked(next); // optimistic
    startTransition(async () => {
      try {
        await toggleBookmark(lessonId, bookmarked);
      } catch {
        setBookmarked(!next); // revert on failure
      }
    });
  }

  return (
    <Button type="button" variant="outline" size="sm" disabled={pending} onClick={handleClick}>
      <Bookmark className={cn(bookmarked && "fill-current")} />
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}
