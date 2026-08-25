"use client";

import { useEffect, useRef } from "react";
import { recordLessonView } from "@/lib/student/progress-actions";

// Invisible — fires once per mount to record "last opened" for the
// signed-in student. A Client Component so it only runs on an actual
// browser visit, never during server-side prerendering.
export function TrackLessonView({ lessonId }: { lessonId: string }) {
  const firedFor = useRef<string | null>(null);

  useEffect(() => {
    if (firedFor.current === lessonId) return;
    firedFor.current = lessonId;
    recordLessonView(lessonId).catch(() => {
      // Best-effort — a failed view-tracking call shouldn't surface to the reader.
    });
  }, [lessonId]);

  return null;
}
