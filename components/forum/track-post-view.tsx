"use client";

import { useEffect, useRef } from "react";
import { recordForumPostView } from "@/lib/forum/view-actions";

// Invisible — fires once per mount to mark this post "seen" for the
// signed-in student, clearing its "New" tag in the feed. A Client
// Component so it only runs on an actual browser visit, mirrors
// TrackLessonView.
export function TrackPostView({ postId }: { postId: string }) {
  const firedFor = useRef<string | null>(null);

  useEffect(() => {
    if (firedFor.current === postId) return;
    firedFor.current = postId;
    recordForumPostView(postId).catch(() => {
      // Best-effort — a failed view-tracking call shouldn't surface to the reader.
    });
  }, [postId]);

  return null;
}
