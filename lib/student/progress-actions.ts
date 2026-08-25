"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, requireUser } from "@/lib/auth/dal";

// Fired once per lesson view (see TrackLessonView), which is rendered
// unconditionally on lesson pages. Uses getCurrentUser (never redirects)
// rather than requireUser so anonymous readers are silently skipped.
// Only touches last_opened_at — completed/progress_percent are left
// alone if a row already exists, and default to false/0 on first insert.
export async function recordLessonView(lessonId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = await createClient();

  const { error } = await supabase
    .from("lesson_progress")
    .upsert(
      { user_id: user.id, lesson_id: lessonId, last_opened_at: new Date().toISOString() },
      { onConflict: "user_id,lesson_id" },
    );

  if (error) {
    // Non-critical — don't break the page over a view-tracking write.
    console.error("recordLessonView failed:", error.message);
  }
}

export async function toggleLessonComplete(lessonId: string, currentlyCompleted: boolean) {
  const user = await requireUser();
  const supabase = await createClient();

  const nextCompleted = !currentlyCompleted;
  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      completed: nextCompleted,
      progress_percent: nextCompleted ? 100 : 0,
      completed_at: nextCompleted ? new Date().toISOString() : null,
      last_opened_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );

  if (error) {
    throw new Error("Could not update your progress. Please try again.");
  }

  revalidatePath("/profile");
}
